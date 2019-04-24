import React, {Component} from "react";
import axios from 'axios';
import Spinner from "react-svg-spinner";

import {ajax_url , Placeholder} from 'nodereactor/react';

const InputFields=(props)=>
{
    let {title, name, default_value, val_colletor, disabled=false, children=null}=props;

    return <div className="row mb-4">
                <div className="col-12 col-sm-4 col-md-3 col-lg-2">{title}</div>
                <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                    <input name={name} type="text" className="form-control" defaultValue={default_value} onChange={val_colletor} disabled={disabled}/>
                    {children}
                </div>
            </div>
}

class ProcessUser extends Component
{
    constructor(props)
    {
        super(props);

        let ob={};

        if(this.props.ResponseData.user)
        {
            ob=this.props.ResponseData.user
        }

        this.state=
        {
            user_id:ob.user_id || 0,
            display_name:ob.display_name,
            user_username:ob.user_login,
            user_email:ob.user_email,
			user_password:ob.user_password,
			'message':null,
            loading:false,
            change_pass:false
		}
		
		this.storeVal=this.storeVal.bind(this);
        this.updateUser=this.updateUser.bind(this);
        this.togglePass=this.togglePass.bind(this);
    }

    togglePass(bool)
    {
        this.setState({change_pass:bool});
    }

	storeVal(e)
	{
		let el=e.currentTarget;
		this.setState({[el.name]:el.value});
	}

	updateUser()
	{
		this.setState({'message' : null, 'loading':true});

        let vals=this.state;
        
		delete vals.submitable;
        delete vals.user_username;
        
		let send_data={'action':'nr_update_user', 'values':vals}

		axios({
			method:'post',
			url:ajax_url ,
			data:send_data
		}).then(r=>
		{
			this.setState({'message' : (r.data.message ? r.data.message : 'No response'), 'loading':false });
		}).catch(r=>
		{
			this.setState({'message' : 'Request Error', 'loading':false});
		})
	}

    render()
    {
        return((!this.state.user_id || this.state.user_id==0) ? <small>User Not Found</small> : 
			<div>
                <div className="row mb-4">
                    <div className="col-12">
                        <h3>Add New User</h3>
						<small>
							Only administrator user role available for now.
							<br/>More user roles and role based capabilities will be added in future versions.
						</small>
                    </div>
                </div>

                <InputFields title="Display Name" name="display_name" default_value={this.state.display_name} val_colletor={this.storeVal}>
                    <small>Visible everywhere</small>
                </InputFields>

                <InputFields title="Username" name="user_username" default_value={this.state.user_username} disabled={true}/>

                <InputFields title="Email Address" name="user_email" default_value={this.state.user_email} val_colletor={this.storeVal}/>

                {
                    this.state.change_pass ?    
                    <InputFields title="Password" name="user_password" val_colletor={this.storeVal}>
                        <small>Min. 8, Max. 20 characters.</small><br/>
                        <a className="text-info" onClick={()=>this.togglePass(false)}>Don't Change Password</a>
                    </InputFields> : <p><a className="text-info" onClick={()=>this.togglePass(true)}>Change Password</a></p>
                }
                
                <div className="row mb-4">
                    <div className="col-12 col-sm-4 col-md-3 col-lg-2">User Role</div>
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
						<select className="form-control" disabled="disabled">
							<option selected="selected">administrator</option>
						</select>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12 col-sm-4 col-md-3 col-lg-2"></div>
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <button className="btn btn-secondary btn-sm" onClick={this.updateUser}>Update</button> &nbsp;&nbsp; 
                        {this.state.loading ? <Spinner size="15px"/> : null}
                    </div>
                </div>
				<div>
					{
						this.state.message
					}
				</div>
			</div>
        )
    }
}

const EditUser=(props)=>
{
    let user_id=true;

    if(props.user_id!==true)
    {
        user_id=window.location.pathname;
        user_id=user_id.split('/').filter(item=>{return /\S+/.test(item)==true});
        user_id=user_id[user_id.length-1];
    }
    
    return <Placeholder Data={{'action':'nr_get_edit_user', 'user_id':user_id}} Component={ProcessUser}/>
}

export {EditUser}