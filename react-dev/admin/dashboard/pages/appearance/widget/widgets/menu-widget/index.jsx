import React from "react";

import {Placeholder, NrNavMenu} from 'nodereactor/react';

const ProcessMenuInput=(props)=>
{
    let menu_widget=props.ResponseData;

    let {ul_class='', li_class='', li_active_class='', anchor_class='', menu_names=[]}=props;

    return <div>
        <small>Menu Name</small>
        
        {
            Object.keys(menu_widget).map(menu_name=>
            {
                return <div key={menu_name}><input type="checkbox" name="menu_names" value={menu_name} defaultChecked={menu_names.indexOf(menu_name)>-1}/> {menu_name}</div>
            })
        }

        <small>UL Class</small>
        <input type="text" name="ul_class" className="form-control" defaultValue={ul_class}/>

        <small>LI Class</small>
        <input type="text" name="li_class" className="form-control" defaultValue={li_class}/>

        <small>LI Active Class</small>
        <input type="text" name="li_active_class" className="form-control" defaultValue={li_active_class}/>

        <small>Anchor Class</small>
        <input type="text" name="anchor_class" className="form-control" defaultValue={anchor_class}/>
    </div>
}

const MenuWidgetInput=(props)=>
{
    let {properties={}}=props;

    return <Placeholder Data={{'action':'nr_get_menu_for_visitor'}} Component={ProcessMenuInput} {...properties}/>
}

const MenuWidgetOutput=(props)=>
{
    let {properties={}}=props;
    let {menu_names=[]}=properties;
    
    return menu_names.map(item=>
    {
        return <NrNavMenu key={item} menu_name={item} {...properties}/>
    });
}

export {MenuWidgetInput, MenuWidgetOutput}