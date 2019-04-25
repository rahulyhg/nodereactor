module.exports.dispatch=function($)
{
    console.log('re q come here');

    var usr={};

    var user=nr_get_current_user($) || {};

    usr.display_name=user.display_name;

    usr.gravatar=get_avatar_url(user.user_email, {s: '32', r: 'g', d: 'mm'});

	var z=get_option($, 'time_zone', 0);
    var zz=z || 'UTC';

    var resp=
    {
        'nr_configs':
        {
            'active_nodes'              :   $.nr_active_nodes, 
            'max_upload_size_byte'      :   nr_formidable.maxFileSize,
            'max_upload_size_readable'  :   node_modules.filesize(nr_formidable.maxFileSize),
            'nr_includes_url'           :   nr_includes_url,
            'nr_home_url'               :   nr_home_url,
            'nr_installed'              :   nr_db_config,
            'component'                 :   'NodeReactorInstaller',
            'nr_installed'              :   nr_db_config ? true : false,
            'current_user'              :   usr,
            'time_zone'                 :   zz
        }
    }
    
    if(nr_db_config)
    {
        var pth=$._POST['pathname'] || '';

        if(pth.indexOf('/nr-admin')===0)
        {
            resp.nr_configs.component= is_user_logged_in($) ? 'InitAdmin' : 'LoginRegistration';
        }
        else
        {
            resp.nr_configs.component='InitFrontend';
        }
    }
    
    console.log('should end resp');
    
    exit($, resp);
}