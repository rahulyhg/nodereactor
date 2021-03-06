const get_nodes_path=function(nodes)
{
	var path=require('path');

	var n_paths=nodes.map(item=>
	{
		try
		{
			var pt=require.resolve(item+'/package.json'); 

			var pk=require(item+'/package.json');

			var resp=
			{
				[item]:
				{
					'dir':path.dirname(pt), 
					'package':pk
				}
			}

			return resp;
		}
		catch(e)
		{

		}
		return false;
		
	}).filter(item=>
	{
		return item!==false;
	});

	return Object.assign({}, ...n_paths);
}

module.exports=function(project_root)
{
	console.log('');
	console.log('https://github.com/noder-jk/nodereactor');
	console.log('https://www.npmjs.com/package/nodereactor');
	console.log('');
	console.log('https://NodeReactor.com');
	console.log('https://facebook.com/NodeReactorCMS');
	console.log('https://facebook.com/groups/NodeReactorDevs');
	console.log('');
	console.log('');

	var ini_errors=[];

	/* Parse required configs from package file */
	var pack=require(project_root+'/package.json');
	
	pack.homepage!=='/nr-react' ? ini_errors.push('You must add homepage:"/nr-react" in package.json') : null;
	!pack.nr_configs 			? ini_errors.push('Configs for NodeReactor not found in package.json') : null;

	!pack.nr_configs 			? pack.nr_configs={} : null;

	!pack.nr_configs.port 		? ini_errors.push('Port is required.') : null;
	!pack.nr_configs.url 		? ini_errors.push('Home URL is required.') : null;

	if(ini_errors.length>0)
	{
		ini_errors.forEach(item=>console.log(item+'\n'));

		console.log('\x1b[41m', '-> NodeReactor has been terminated', '\x1b[0m');
		
		process.exit(1);
	}

	/* Init configs of theme, plugins etc */
	var data_ob=
	{
		nr_port			: pack.nr_configs.port,
		nr_home_url		: pack.nr_configs.url,
		nr_project_root	: project_root,
		nr_plugins		: Array.isArray(pack.plugins)? pack.plugins.filter(item=>typeof item=='string') : [],
		nr_themes		: Array.isArray(pack.themes) ? pack.themes.filter(item=>typeof item=='string') 	: []
	}

	/* Set default themes and plugins */
	data_ob.nr_themes.indexOf('semplicemente')==-1 	 ? 	data_ob.nr_themes.push('semplicemente') : null;

	global.nr_port					= data_ob.nr_port;

	global.nr_home_url				= data_ob.nr_home_url; // including trailing slash

	global.nr_use_file_hook			= true;

	// cookie name of session id
	global.nr_session_cookie_name	= data_ob.nr_session_cookie_name ? data_ob.nr_session_cookie_name : 'sess_code';
	// cookie name of session 
	global.nr_session_cookie_pass	= data_ob.nr_session_cookie_pass ? data_ob.nr_session_cookie_pass : 'sess_pass';


	global.nr_session_expiry		= data_ob.nr_session_expiry ? data_ob.nr_session_expiry : 3600; // Second
	global.nr_cookie_expiry			= data_ob.nr_cookie_expiry ? data_ob.nr_cookie_expiry : (60*60*24); // Second
	global.nr_login_expiry			= data_ob.nr_login_expiry ? data_ob.nr_login_expiry : (60*60*24); // Second

	global.nr_formidable			= data_ob.nr_formidable ? data_ob.nr_formidable : {maxFileSize:((1024*10) * 1024 * 1024)}; // Byte. 10GB default.
	
	global.default_gallery_limit	= 25;
	global.default_pagination		= 7;
	
	global.node_modules				= {path:require('path')};

	global.nr_project_root			= data_ob.nr_project_root;
	global.nr_package_root			= __dirname;


	/* Define some necessary directories */
	global.nr_admin			= nr_package_root+'/nr-admin/';
	global.nr_controllers	= nr_package_root+'/nr-admin/controllers/';
	global.nr_models		= nr_package_root+'/nr-admin/models/';
	global.nr_modules		= nr_package_root+'/nr-admin/modules/';

	global.nr_configs		= data_ob.nr_project_root+'/nr-content/configs/';
	
	global.nr_themes		= get_nodes_path(data_ob.nr_themes);
	global.nr_plugins		= get_nodes_path(data_ob.nr_plugins);

	global.nr_contents		= data_ob.nr_project_root+'/nr-content/';
	global.nr_uploads		= data_ob.nr_project_root+'/nr-content/uploads/';
	
	global.nr_includes		= nr_package_root+'/nr-includes/';

	global.nr_uploads_url	= nr_home_url+'nr-content/uploads/';
	global.nr_includes_url	= nr_home_url+'nr-includes/';

	/* Process dependencies */
	var deps=require(node_modules.path.normalize(nr_models+'nr/dependencies.njs'));
	deps.deploy_vendor_scripts();
	deps.deploy_custom_scripts();
	deps.deploy_src(data_ob);
	deps.deploy_db();

	/* Load server modules and initialize */
	var nr_app				= node_modules.express();
	var nr_server 			= node_modules.http.Server(nr_app);

	global.nr_socket 		= node_modules['socket.io']();

	nr_socket.attach(nr_server);

	global.nr_pool			= get_pool();

	nr_app.all('/*', function(request, response) 
	{
		var $=get_nr_blueprint(request, response, nr_formidable.maxFileSize);
		
		deps.handle_route($);
	});

	/* Set router for all the socket activity.  */
	nr_socket.on('connection', function(socket)
	{
		var $=get_socket_blueprint(socket.request, socket);

		$.socket_event='connected';
		
		$=set_cookie($, 'socketCookie', 'socket cookie value', 3600);

		deps.handle_route($);

		socket.on('nr-socket-io-core-channel', function(data)
		{

			$.socket_event=false;
			
			$._IO=data;

			deps.handle_route($);
		}).on('disconnect', function()
		{
			$.socket_event='disconnected';

			deps.handle_route($);
		});
	});
	

	/* Now finally start listening. */
	nr_server.listen(nr_port,function()
	{
		console.log('');
		console.log('-> NodeReactor listening '+nr_server.address().port);
		console.log('-> Defined home url is '+nr_home_url);
		console.log('');
	});

	
	/* Watch file change in theme and plugin directory, un-require modified files to be required again updated file. */
	var theme_dirs	= Object.keys(nr_themes).map(item=>nr_themes[item].dir);

	var plugin_dirs	= Object.keys(nr_plugins).map(item=>nr_plugins[item].dir);

	var watch_dirs	= theme_dirs.concat(plugin_dirs);

	var watch_config= {ignored: /(^|[\/\\])\../, persistent:true};

	node_modules.chokidar.watch(watch_dirs, watch_config).on('all', function(event, path)
	{
		if(node_modules.path.extname(path)=='.njs')
		{
			uninclude(path);
		}
	});
}