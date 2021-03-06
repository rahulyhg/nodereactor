global.register_taxonomy=function($, ob)
{
    if(ob.taxonomy && ob.title)
    {
        $.nr_registered_taxonomies[ob.taxonomy]=ob;
    }
    
    return $;
}

global.use_taxonomy=function($, ob)
{
    if(!ob.post_type || !ob.taxonomies){return $;}

	var tx=get_array(ob.taxonomies);
	var pt=get_array(ob.post_type); 

	/* Loop through all provided post types */
	for(var n=0; n<pt.length; n++)
	{
		/* Create array in register list if not exist already. */
		if(!$.registered_taxonomies_to_post[pt[n]])
		{
			$.registered_taxonomies_to_post[pt[n]]=[];
		}

		/* Loop through all meta box id */
		for(var i=0; i<tx.length; i++)
		{
			var a=tx[i];

			/* Insert the meta box id if already not inserted by other plugin or theme. */
			if($.registered_taxonomies_to_post[pt[n]].indexOf(a)==-1)
			{
				$.registered_taxonomies_to_post[pt[n]].push(a);
			}
		}
    }
	return $;
}

global.nr_delete_term=function($, term_ids, next)
{
	do_action($, 'pre_delete_term', term_ids, function($)
	{
		term_ids=term_ids.join(',');

		var delete_meta=($, next)=>
		{
			var q='DELETE FROM '+nr_db_config.tb_prefix+'termmeta WHERE owner_term_id IN ('+term_ids+')';

			$.nr_db.query(q, e=>{next($)});
		}

		var delete_rel=($, next)=>
		{
			var q='DELETE FROM '+nr_db_config.tb_prefix+'term_relationships WHERE owner_term_id IN ('+term_ids+')';

			$.nr_db.query(q, e=>{next($)});
		}

		var set_parent=($, next)=>
		{
			var q='UPDATE '+nr_db_config.tb_prefix+'terms SET parent=0 WHERE parent IN ('+term_ids+')';

			$.nr_db.query(q, e=>{next($)});
		}

		var delete_term=($, next)=>
		{
			var q='DELETE FROM '+nr_db_config.tb_prefix+'terms WHERE term_id IN ('+term_ids+')';

			$.nr_db.query(q, e=>{next($)});
		}

		series_fire($, [delete_meta, delete_rel, set_parent, delete_term, next]);
	})
}

global.nr_set_post_terms=function($, post_id, term_id, taxonomy, append, next)
{
	term_id=get_array(term_id);
	term_id.push(0); // zero to avoid error if no term id assigned.

	var maiden=term_id;

    var rel=nr_db_config.tb_prefix+'term_relationships';
    var terms=nr_db_config.tb_prefix+'terms';

	/* Fetch terms except currently selected in editor */
	var exist_in='term_id NOT IN ('+term_id.join(',')+') AND';

    var common='owner_post_id='+post_id+' AND owner_term_id IN (SELECT term_id FROM '+terms+' WHERE '+exist_in+' taxonomy="'+taxonomy+'")';
    var common_ex='owner_post_id='+post_id+' AND owner_term_id IN (SELECT term_id FROM '+terms+' WHERE taxonomy="'+taxonomy+'")';

    var del_abandoned=($, next)=>
    {
		/* Delete those term relationships that are not currently selected in editor but exist in relation */
		var q='DELETE FROM '+rel+' WHERE '+common;
        $.nr_db.query(q, function(e,r)
        {
            next($);
        });
    }

    var get_existing=($, next)=>
    {
		/* Fetch those terms that are selected in editor and already exist in relationship */
        var q='SELECT owner_term_id FROM '+rel+' WHERE '+common_ex;
        $.nr_db.query(q, (e,r)=>
        {
            if(!e)
            {
				/* Now filter out those already exist terms. */
                r=r.map(item=>item.owner_term_id.toString());
                maiden=term_id.filter(item=>r.indexOf(item.toString())==-1);
			}
			
            next($);
        })
    }

    var add_maiden=($, next)=>
    {
		/* Now add maiden relation ships */
		maiden=maiden.filter(item=>item!==0);

        if(maiden.length>0)
        {
			var v=maiden.map(term_id_num=>'('+post_id+','+term_id_num+')');

			var q='INSERT INTO '+rel+' (owner_post_id, owner_term_id) VALUES '+v.join(',');
			
			$.nr_db.query(q, function(e)
			{
				next($);
			});
        }
		else
		{
			next($);
		}
    }

	var funcs=[get_existing, add_maiden, next];

	append!==true ? funcs.unshift(del_abandoned) : null;

	series_fire($, funcs);
}

global.nr_insert_term=function($, term, taxonomy, args, next)
{
	/* Store values firstly */
	var slug		= args.slug || term;
	slug			= slug.trim().toLowerCase().replace(/\s/g, '-');

	var term_id		= args.term_id || false;
	var parent		= args.parent || 0;
	var description	= args.description || '';

    var term_tbl=nr_db_config.tb_prefix+'terms';

	var slug_exist=false;

	var check_slug=($, next)=>
	{
		var t_id=(term_id && term_id>0) ? 'term_id!='+term_id+' AND ' : '';

		var q='SELECT term_id FROM '+term_tbl+' WHERE '+t_id+' parent='+parent+' AND taxonomy="'+taxonomy+'" AND slug="'+slug+'"';

		$.nr_db.query(q, function(e,r)
		{
			slug_exist=(!e && r.length>0);
			next($);
		});
	}

	var insert_term=($, next)=>
	{
		if(slug_exist)
		{
			next($, false);
			return;
		}

		var q='INSERT INTO '+term_tbl+' (name, slug , description, parent, taxonomy) values ("'+term+'", "'+slug+'", "'+description+'", "'+parent+'", "'+taxonomy+'")';

		$.nr_db.query(q, (e,r)=>
		{
			next($, !e);
		});
	}

	var update_term=($, next)=>
	{
		if(slug_exist)
		{
			next($, false);
			return;
		}

		var q='UPDATE '+term_tbl+' SET name="'+term+'", slug="'+slug+'", description="'+description+'", parent="'+parent+'" WHERE term_id='+term_id;
		
		$.nr_db.query(q, (e,r)=>
		{
			next($, !e);
		});
	}

	var funcs=[check_slug];

	funcs.push(!term_id ? insert_term : update_term);
	funcs.push(next);

	series_fire($, funcs);
}

global.get_term_link=function($, by, arg, taxonomy, t_next)
{
	var perm_urls={};
	var url_base='';

	var ob={'intersect':{[by]:arg}};

	var term_structure=bloginfo($, 'term_permalink', 'tt');
	
	if(term_structure=='tt' && taxonomy)
	{
		url_base='/'+taxonomy;
		ob.intersect.taxonomy=taxonomy;
	}
	
	/* Firstly get the term that should pass url */
	get_terms($, ob, function($, terms)
	{
		var all_tax=get_taxonomies($);
		
		!Array.isArray(terms) ? terms=[] : 0;
		
		var funcs=[];

		terms.forEach(term=>
		{
			/* Loop through all terms to get parent. 
			I don't know how to fetch recursive data using core MySQL query. 
			Perhaps this block will be refactored in future. 
			But I don't think it's a big deal for node as usually people don't use too deep taxonomy or post hierarchy. */
			var fnc=($, term, next)=>
			{
				/* If taxonomy registrar plugin/theme get deactivated than those will be moved to non hierarchical url. Cause then it's not possible identify whether hierarchy or not. */
				var hierarchical=(all_tax[term.taxonomy] && all_tax[term.taxonomy].hierarchical==true)
				
				if(!hierarchical || term.parent==0)
				{
					perm_urls[term[by]]=url_base+'/'+term.slug;
				
					next($);

					return;
				}
				
				var hierarchy=[term.slug];

				/* Get ancestors post names through hierarchy function */
				var get_nest=(term_item)=>
				{
					get_term_by($, 'term_id', term_item.parent, function($, r)
					{
						if(Array.isArray(r) && r.length>0)
						{
							var pst=r[0];

							hierarchy.unshift(pst.slug);
							
							if(pst.parent>0)
							{
								get_nest(pst);
								return;
							}
						}
						
						/* If no mote parent found, end here */
						perm_urls[term[by]]=url_base+'/'+hierarchy.join('/');	
						
						next($);
					});
				}
				
				get_nest(term);
			}

			funcs.push([fnc, term]);
		});

		funcs.push(($, next)=>
		{
			t_next($, perm_urls);
		});

		series_fire($, funcs);
	});
}

global.get_term_by=function($, by, arg, next)
{
	get_terms($, {'intersect':{[by]:arg}}, next);
}

global.get_term_meta=function($, term_id, meta_k, meta_v, next)
{
	term_id			= get_array(term_id);

	var meta_key 	= meta_k 	? " AND meta_key="+$.nr_db.escape(meta_k) : '';
	var meta_value	= meta_v	? " AND meta_value="+$.nr_db.escape(meta_v) : "";
	
	var q="SELECT * FROM "+nr_db_config.tb_prefix+"termmeta WHERE owner_term_id IN ("+term_id.join(',')+")" + meta_key + meta_value;
	
	$.nr_db.query(q, function(e,r)
	{
		e ? r=[] : null;
		
		next($, r);
	});
}

const meta_processor=function ($, mets, result, next)
{
	/* This function simply assign meta to post using post id. */
	for(var i=0; i<mets.length; i++)
	{
		for(var n=0; n<result.length; n++)
		{
			(mets[i].owner_term_id==result[n].term_id) ? result[n].termmeta[mets[i].meta_key]=mets[i].meta_value : 0;
		}
	}
	
	next($, result);
}

global.get_terms=function($, nr_condition, get_p_n)
{
	/* Get query object, that will come through registered hooks too. [Oh god! what a complicated function. Need refactoring.] */
	pre_get_terms($, function($)
	{
		typeof nr_condition!=='object' ? nr_condition={} : 0;

		nr_condition			= nr_fill_term_cond(nr_condition, $.query);
		
		var processed_condition	= nr_term_condition_processor($.query,nr_condition);
		var args				= processed_condition.args;
		var where_clause		= processed_condition.clause;
		
		var orderby				= ' ORDER BY '+args.orderby;
		var order				= ' '+args.order+' ';
		
		
		/* ~~~~~~~~~~~~~~~~~~~Now create sql from args~~~~~~~~~~~~~~~~~~~ */

		/* Define table name using prefix */
		var terms=nr_db_config.tb_prefix+'terms';
		var meta=nr_db_config.tb_prefix+'termmeta';
		var posts=nr_db_config.tb_prefix+'posts';
		var rel=nr_db_config.tb_prefix+'term_relationships';

		var sql='SELECT DISTINCT '+terms+'.* FROM '+terms+' \
					LEFT JOIN '+meta+' ON '+terms+'.term_id='+meta+'.owner_term_id \
					LEFT JOIN '+rel+' ON '+terms+'.term_id='+rel+'.owner_term_id \
					LEFT JOIN '+posts+' ON '+rel+'.owner_post_id='+posts+'.post_id ';
		
		/* Step 3: Add WHERE clause. */
		var clause_parent=[];
		where_clause.intersect.length>0 	? clause_parent.push('('+where_clause.intersect.join(' AND ')+')')	: 0;
		where_clause.exclude.length>0 		? clause_parent.push('('+where_clause.exclude.join(' AND ')+')')	: 0;
		where_clause.unite.length>0 		? clause_parent.push('('+where_clause.unite.join(' OR ')+')') 		: 0;
		
		/* Step 4: Determine if where clause need. */
		var where_word=clause_parent.length>0 ? ' WHERE ' : '';
		
		/* Step 6: Create final SQL command */
		sql = sql + where_word + clause_parent.join(' AND ') + orderby + order;
		
		
		$.nr_db.query(sql,function(e,result)
		{
			if(e)
			{
				get_p_n($, result);
				return;
			}

			var all_term_id=[];
			
			/* Loop through all */
			for(var i=0; i<result.length; i++)
			{
				/* Gather all post id to get meta by IDs */
				all_term_id.push(result[i].term_id);
				
				result[i].termmeta={};
			}
			
			/* Now run multiple helper functions to process other things one after another through series function */
			var stack=	
			[
				[get_term_meta, all_term_id, false, false], 
				[($, r, res,nxt)=>{meta_processor($, r, res, nxt);}, result], 
				($,content,next)=>{get_p_n($, content)}
			];
			
			series_fire($, stack);
		});
	});
}
