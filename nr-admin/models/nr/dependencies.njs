global.normalize_path=function(p)
{
	return node_modules.path.normalize(p);
}

module.exports.deploy_src=function(data_ob)
{
    /* 
        Some sync methods is used in this function. 
        Hopefully it's not a threat to performance.
        After all these will be called only once at the first launching of NodeReactor. 
    */
    
    var fs=node_modules.fs;

    var root=data_ob.nr_project_root+'/';
    var src=data_ob.nr_project_root+'/src/';

    /* Deploy nr-content package, if already not done. */
    var nr_content=root+'nr-content';
	if(!fs.existsSync(nr_content))
	{
		try
		{
            /* Copy from node reactor package to project root */
			node_modules['fs-extra'].copySync(nr_package_root+'/nr-content', nr_content);
        } 
		catch (err) 
		{
			console.error('');
			console.error('-> Fatal Error. nr-content folder could not deployed.');
			console.log('\x1b[41m', '-> NodeReactor has been terminated.', '\x1b[0m');
            console.error('');
            
			process.exit(1);
		}
	}
	else
	{
        console.error('');
		console.log('-> nr-content folder already exists.');
		console.log('-> Make sure it follows NodeReactor rules if you created it manually.');
        console.error('');
    }

    /* ~~~~~~~~~Now deploy dynamic vendor importer scripts.~~~~~~~~~ */
    var vendor_import='';
    get_vendor_comps=(node_package)=>
    {
        var csv='nr_package,component\n';
        
        var last=Object.keys(node_package);
        last=last[last.length-1];

        for(var k in node_package)
        {
            var comp=k+'/react';
            var comp_file=normalize_path(node_package[k].dir+'/react/index.js');
            
            var as='Pkg'+fl_up(k.replace(/\-/g, '_'));

            if(fs.existsSync(comp_file))
            {
                vendor_import+='import * as '+as+' from "'+comp+'";\n';
                
                var new_line=k!==last ? '\n' : '';

                csv+=k+',*'+as+'*'+new_line;
            }
        }

        return csv_to_array(csv);
    }

    /* Generate json of vendor modules */
    var mods={};
    mods.plugins=get_vendor_comps(nr_plugins);
    mods.themes=get_vendor_comps(nr_themes);
    mods_str=JSON.stringify(mods);
    mods_str=mods_str.replace(/\"\*/g,'').replace(/\*\"/g,'');
    mods_str='const vendor_components='+mods_str;

    /* Now add generated script into app file */
    var react_app_source=nr_package_root+'/NodeReactorApp.jsx';
    var react_app_dest=src+'/NodeReactorApp.jsx';

    /* No problem in sync mode, cause it's only first time when node run. */
    var existing_str=file_get_contents_sync(react_app_source);
    
    existing_str=existing_str.split('//do_not_delete_or_modify_this_comment');

    var final_str=existing_str[0]+vendor_import+'\n'+mods_str+'\n'+existing_str[1];
    

    fs.writeFile(react_app_dest, final_str, (err)=>{err ? console.log('Fatal Error. Could not copy app file to src.') : 0});
    
    /* Copy react index and app test. */
    fs.copyFile(nr_package_root+'/index.jsx', src+'/index.js', (err) => {err ? console.log('Fatal Error. Could not copy react index file.') : 0;});
    fs.copyFile(nr_package_root+'/index.jsx', src+'/index.jsx', (err) => {err ? console.log('Fatal Error. Could not copy react index file.') : 0;});
    fs.copyFile(nr_package_root+'/NodeReactorApp.test.jsx', src+'/NodeReactorApp.test.jsx', (err) => {err ? console.log('Fatal Error. Could not copy Node Reactor core App file to react src.') : 0;});
}

module.exports.deploy_db=function()
{    
    global.nr_db_config		= require(normalize_path(nr_configs+'database.njs'));
    
    var required    = ['db_host', 'db_user', 'db_name', 'db_pass', 'tb_prefix'];
    var installed   = (typeof nr_db_config=='object' && required.filter(item=>(nr_db_config[item]!==undefined && typeof nr_db_config[item]=='string')).length==required.length);
    
    !installed      ? nr_db_config=false : null;

	if(nr_db_config)
	{
        var nr_pool=get_pool();

        nr_pool.getConnection(function(err)
        {
            if(err)
            {
                console.log('');
                console.log('-> Database configs found but could not connect.');
                console.log('-> Make sure MySQL database is running and configs are correct.');
                console.log('-> Or if you want to re install, then simply change the database config object to \'false\' and launch again.');
                console.log('\x1b[41m', '-> NodeReactor has been terminated.', '\x1b[0m');
                console.log('');

                process.exit(1);
            }
            else
            {
                console.log('');
                console.log('\x1b[42m', '-> NodeReactor is installed already, and it has been launched successfully.', '\x1b[0m');
                console.log('');
            }
        });
	}
	else
	{
		console.log('');
		console.log('-> Database configs not found.');
		console.log('-> It means NodeReactor is not installed yet.');
		console.log('\x1b[46m', '-> Visit your specified url to get installation page.', '\x1b[0m');
        console.log('');
	}
}

module.exports.deploy_custom_scripts=function()
{
    var models= 
    [
        'nr/helper.njs',
        'nr/blueprint.njs',
        'nr/node.njs',
        'nr/timezones.njs',
        'nr/wpdb.njs',

        'php/string.njs',
        'php/file.njs',
        'php/array.njs',
        'php/cookie.njs',
        'php/session.njs',
        'php/encryption.njs',
        'php/response.njs',
        'php/loader.njs',

        'wp/dashboard.njs',
        'wp/hook.njs',
        'wp/option.njs',
        'wp/plugin.njs',
        'wp/menu.njs',

        'wp/post/media.njs',
        'wp/post/helper.njs',
        'wp/post/meta.njs',
        'wp/post/pagination.njs',
        'wp/post/post.njs',
        'wp/post/permalink.njs',

        'wp/taxonomy/helper.njs',
        'wp/taxonomy/terms.njs',

        'wp/sidebar.njs',
        'wp/theme.njs',
        'wp/user.njs'
    ];
    
    models.forEach(element => require(normalize_path(nr_models+element)));
}

module.exports.deploy_vendor_scripts=function()
{
    var mods=
    [
        'jsdom',
        'html-entities',
        'chokidar',
        'express',
        'http',
        'socket.io',
        'resolve',
        'jquery',
        'url',
        'path',
        'cookie',
        'mysql2',
        'bcryptjs',
        'fs',
        'fs-extra',
        'formidable',
        'html-to-text',
        'gravatar',
        'randomstring',
        'filesize',
        'deepcopy',
        'mime-types',
        'moment-timezone'
    ];

    mods.forEach(element=>
    {
        switch(element)
        {
            case 'jsdom'        :   const jsdom 		  = require('jsdom');
                                    const { JSDOM } 	  = jsdom;
                                    node_modules['jsdom'] = JSDOM;
                                    break;

            case 'html-entities':   node_modules['html-entities']= new require('html-entities').XmlEntities();
                                    break;

            default             :   node_modules[element]=require(element);
        }
    });
}


const nr_router	= require(normalize_path(nr_controllers+'router.njs'));

module.exports.handle_route=function($)
{
    nr_pool.getConnection(function(err, connection) 
    {
        /* Exit if NR installed but could not connected. It means DB limit may be reached. */
        if(err && nr_db_config)
        {
            exit($, 'Please try again. Database connection limit may be reached.');
            return;
        }
        
        $.nr_db=connection;

        if($._SERVER['REQUEST_METHOD']=='IO')
        {
            nr_router.run($);
            return;
        }
            
        /* Initiate formiddable  */
        var nr_form = new node_modules.formidable.IncomingForm();
        for(var k in nr_formidable)
        {
            nr_form[k]=nr_formidable[k];
        }

        nr_form.parse($.nr_request, function (err, fields, files) 
        {
            $._POST=fields;
            $._FILES=files;
            
            nr_router.run($);
        });
    });
}
