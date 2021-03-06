import React, {Component} from "react";
import axios from 'axios';
import Spinner from "react-svg-spinner";
import Swal from 'sweetalert2';

import {
        ajax_url,
        Placeholder, 
        parse_form, 
        get_url_parameter, 
        Pagination,
        get_hierarchy
    } from 'nodereactor/react';

import './style.scss';

class PostProcess extends Component
{
    constructor(props)
    {
        super(props);

        
        let resp=this.props.ResponseData;
        
        if(!resp.posts || typeof resp.posts!=='object')
        {
            resp.posts={};
        }
        
        for(let k in resp.posts)
        {
            resp.posts[k].checked_input=false;
        }

        this.state=
        {
            'posts':resp.posts, 
            'pagination':resp.pagination,
            'taxonomies':resp.taxonomies || [],
            'loading_icon':false, 
            'checked_posts':[]
        }

        this.deletePost=this.deletePost.bind(this);
        this.toggleCheck=this.toggleCheck.bind(this);
        this.filterPost=this.filterPost.bind(this);
    }

    toggleCheck(e, post_id)
    {
        let el=e.currentTarget;

        let checked=this.state.checked_posts;

        if(el.checked)
        {
            if(checked.indexOf(post_id)==-1)
            {
                checked.push(post_id);
            }
        }
        else if(checked.indexOf(post_id)>-1)
        {
            checked.splice(checked.indexOf(post_id), 1);
        }

        this.setState({'checked_posts':checked});
    }
    
    deletePost(e)
    {
        let el=e.currentTarget;
        let action=el.previousElementSibling.value;

        if(action!=='delete'){return;}
        
        let to_delete=this.state.checked_posts;
        
        if(to_delete.length==0){return;}

        /* Ask confirmation */
        Swal.fire
        ({
            title: 'Sure to delete permanently?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true
        }).then((result) => 
        {
            if(!result.value){return;}

            /* Request delete action */
            this.setState({loading_icon:true});
            axios
            ({
                method:'post',
                url:ajax_url ,
                data:{'action':'nr_delete_posts', 'post_id':to_delete}
            }).then(r=>
            {
                if(r.data && r.data.status=='done')
                {
                    let ob={'to_delete':[]};

                    let {posts=[]}=this.state;
                    ob.posts = posts.filter(p=>to_delete.indexOf(p.post_id)==-1);

                    this.setState(ob);   
                }
                else
                {
                    Swal.fire('Error', 'Something went wrong.', 'error');
                }

                this.setState({'loading_icon':false});   
            }).catch(e=>
            {
                this.setState({loading_icon:false});
                Swal.fire('Error', 'Request Error', 'error');
            })
        })
    }

    filterPost(e, page_num)
    {
        if(!this.filter_container)
        {
            Swal.fire('Something is not working.');
            return;
        }

        let el=this.filter_container;
        let form=parse_form(el);
        
        form.post_type=this.props.post_type;

        if(page_num)
        {
            /* This block will be called when user click pagination buttons */
            e.preventDefault();

            let el=this.page_number;
            
            el.value=page_num;

            form.page=page_num;
        }

        this.setState({loading_icon:true});
        axios({
            method:'post',
            data:{'action':'nr_get_post_list', 'query':JSON.stringify(form)},
            url:ajax_url 
        }).then(r=>
        {
            if(r.data && typeof r.data.posts=='object')
            {
                this.setState({'posts':r.data.posts, 'pagination':r.data.pagination, 'taxonomies':r.data.taxonomies});
            }
            this.setState({loading_icon:false});
        }).catch(r=>
        {        
            this.setState({loading_icon:false});
            Swal.fire('Request Error');
        })
    }

    render()
    {
        let {post_type}=this.props;
        
        let st_posts=this.state.posts;
        st_posts=get_hierarchy(st_posts, 'post_parent', 'post_id');

        return(
            <div id="post_list_container">
                <h4>All Posts {this.state.loading_icon ? <Spinner size="15px"/> : null}</h4>
                <div>
                    <div className="d-inline-block form-group form-inline mr-2 mb-1">
                        <select className="form-control form-control-sm float-left">
                            <option value="">Bulk Action</option>
                            <option value="delete">Delete Permanently</option>
                        </select>
                        <button className="btn btn-sm btn-outline-secondary" onClick={this.deletePost} title="Click to apply action">Apply</button>
                    </div>
                    <div className="d-inline-block form-group form-inline mb-1" ref={(el)=>this.filter_container=el}>
                        <input type="hidden" name="post_type" defaultValue={post_type}/>
                        <select className="form-control form-control-sm float-left" name="post_status" defaultValue="publish" title="Post Status">
                            <option value="publish">Publish</option>
                            <option value="draft">Draft</option>
                        </select>
                        <input name="keyword" type="text" placeholder="Search" className="form-control form-control-sm float-left" title="Search by keyword"/>
                        <input name="page" type="number" min="1" defaultValue={1} placeholder="Page Number" className="form-control form-control-sm float-left" title="Enter specific page number" ref={el=>this.page_number=el}/>
                        <input name="posts_per_page" type="number" min="1" defaultValue={30} placeholder="Posts Per Page" className="form-control form-control-sm float-left" title="How many posts you'd like to see in a single page"/>
                        <button className="btn btn-sm btn-outline-secondary" onClick={this.filterPost} title="Press to filter">Filter</button>
                    </div>
                </div>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Status</th>
                            {
                                this.state.taxonomies.map(t=><th key={t}>{t}</th>)
                            }
                            <th>Posted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            st_posts.map(item=>
                            {
                                return(
                                    <tr key={item.post_id}>
                                        <td><input type="checkbox" defaultChecked={item.checked_input} onChange={(e)=>this.toggleCheck(e, item.post_id)}/></td>
                                        <td>
                                            <p>{'-'.repeat(item.nest_level)}{item.post_title}</p>
                                            <a href={item.post_url} className="text-info">View</a> - <a className="text-info" href={item.post_edit_link}>Edit</a>
                                        </td>
                                        <td>{item.display_name}</td>
                                        <td>{item.post_status}</td>
                                        {
                                            this.state.taxonomies.map(t=><td key={t}>{(item.terms && item.terms[t]) ? item.terms[t].join(', ') : null}</td>)
                                        }
                                        <td>{item.post_date}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                {
                    Object.keys(this.state.posts).length==0 ? <span>No Post Found</span> : null
                }

                <div className="text-center">
                    <Pagination pgn={this.state.pagination} activeClass="btn btn-outline-secondary btn-sm ml-1 mr-1" clickEvent={this.filterPost} inactiveClass="btn btn-secondary btn-sm ml-1 mr-1"/>
                </div>
            </div>
        )
    }
}

const PostList=()=>
{
    let pt=window.location.pathname;
    pt=pt.slice(1);
    pt=pt.split('/');

    let type=pt[1];
    type=type.slice('post_type_'.length);


    let pg=get_url_parameter('page');
    let page=pg ? pg : 1;

    var w={'post_type':type, 'page':page};
    w=JSON.stringify(w);

    return <Placeholder Data={{'action':'nr_get_post_list', 'query':w}} Component={PostProcess} post_type={type}/>
}

export {PostList}