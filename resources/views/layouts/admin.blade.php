<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>{{ config('app.name', 'Pterodactyl') }} - @yield('title')</title>
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <meta name="_token" content="{{ csrf_token() }}">

        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
        <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
        <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
        <link rel="manifest" href="/favicons/manifest.json">
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
        <link rel="shortcut icon" href="/favicons/favicon.ico">
        <meta name="msapplication-config" content="/favicons/browserconfig.xml">
        <meta name="theme-color" content="#0e4688">

        @include('layouts.scripts')

        @section('scripts')
            {!! Theme::css('vendor/select2/select2.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/bootstrap/bootstrap.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/adminlte/admin.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/adminlte/colors/skin-blue.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/sweetalert/sweetalert.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/animate/animate.min.css?t={cache-version}') !!}
            {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">

            <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
            <![endif]-->

            <style>
                :root {
                    --bg-gradient: radial-gradient(circle at 50% -20%, #ffffff 0%, #e5e3e3 100%);
                    --color-neutral-50: #201d1d;
                    --color-neutral-100: #201d1d;
                    --color-neutral-200: #201d1d;
                    --color-neutral-300: #424245;
                    --color-neutral-400: #9a9898;
                    --color-neutral-500: #646262;
                    --color-neutral-600: #f1eeee;
                    --color-neutral-700: #f8f7f7;
                    --color-neutral-800: #fdfcfc;
                    --color-neutral-900: #fdfcfc;
                }
                html.dark-theme {
                    --bg-gradient: radial-gradient(circle at 50% -20%, #222225 0%, #050505 100%);
                    --color-neutral-50: #fdfcfc;
                    --color-neutral-100: #fdfcfc;
                    --color-neutral-200: #fdfcfc;
                    --color-neutral-300: #d4d4d8;
                    --color-neutral-400: #a1a1aa;
                    --color-neutral-500: #71717a;
                    --color-neutral-600: #3f3f46;
                    --color-neutral-700: #27272a;
                    --color-neutral-800: #18181b;
                    --color-neutral-900: #0f0000;
                }

                body, .wrapper, .content-wrapper, .right-side, .main-footer, .main-sidebar, .left-side, .sidebar {
                    background: var(--bg-gradient) !important;
                    background-attachment: fixed !important;
                    color: var(--color-neutral-200) !important;
                    font-family: "Berkeley Mono", "JetBrains Mono", "IBM Plex Mono", monospace !important;
                }
                .main-header {
                    height: 50px !important;
                    min-height: 50px !important;
                    max-height: 50px !important;
                    border-bottom: 1px solid var(--color-neutral-600) !important;
                    background: transparent !important;
                }
                .main-header .navbar, .main-header .logo {
                    height: 50px !important;
                    min-height: 50px !important;
                    max-height: 50px !important;
                    line-height: 50px !important;
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .main-header .logo, .main-header .logo:hover, .main-header .logo * {
                    color: var(--color-neutral-100) !important;
                    font-weight: 700 !important;
                    font-family: "Berkeley Mono", "JetBrains Mono", "IBM Plex Mono", monospace !important;
                }
                .main-sidebar {
                    border-right: 1px solid var(--color-neutral-600) !important;
                    padding-top: 50px !important;
                }
                .main-header .navbar .sidebar-toggle, .main-header .navbar .nav>li>a {
                    color: var(--color-neutral-200) !important;
                }
                .main-header .navbar .nav>li>a:hover, .main-header .navbar .sidebar-toggle:hover {
                    background: var(--color-neutral-800) !important;
                }
                .sidebar-menu>li.header {
                    background: transparent !important;
                    color: var(--color-neutral-100) !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    border: none !important;
                }
                .sidebar-menu>li {
                    border: none !important;
                    margin: 0 !important;
                }
                .sidebar-menu>li>a, .sidebar-menu .treeview-menu>li>a, .sidebar a, .sidebar span, .sidebar i {
                    color: var(--color-neutral-100) !important;
                    border: none !important;
                }
                .sidebar-menu>li:hover>a, .sidebar-menu>li.active>a,
                .sidebar-menu .treeview-menu>li:hover>a, .sidebar-menu .treeview-menu>li.active>a {
                    background: var(--color-neutral-800) !important;
                    color: var(--color-neutral-50) !important;
                    border-left-color: var(--color-neutral-200) !important;
                }
                .box, .info-box, .callout, .small-box, .panel, .modal-content {
                    background: var(--color-neutral-900) !important;
                    border: 1px solid var(--color-neutral-600) !important;
                    color: var(--color-neutral-200) !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                }
                .box-header, .box-body, .box-footer, .panel-heading, .panel-footer {
                    background: transparent !important;
                    color: var(--color-neutral-200) !important;
                    border-color: var(--color-neutral-600) !important;
                }
                .table>tbody>tr>td, .table>thead>tr>th, .table-bordered, .table-bordered>tbody>tr>td, .table-bordered>thead>tr>th {
                    border-color: var(--color-neutral-600) !important;
                    color: var(--color-neutral-200) !important;
                    background: transparent !important;
                }
                .form-control {
                    background: var(--color-neutral-900) !important;
                    color: var(--color-neutral-200) !important;
                    border: 1px solid var(--color-neutral-700) !important;
                    border-radius: 4px !important;
                    box-shadow: none !important;
                }
                .form-control:focus {
                    border-color: var(--color-neutral-400) !important;
                }
                .btn-default, .btn-primary, .btn-success, .btn-danger, .btn-warning, .btn-info {
                    background: var(--color-neutral-50) !important;
                    color: var(--color-neutral-900) !important;
                    border: 1px solid transparent !important;
                    border-radius: 4px !important;
                    box-shadow: none !important;
                    font-weight: 700 !important;
                }
                .btn-default:hover, .btn-primary:hover, .btn-success:hover, .btn-danger:hover, .btn-warning:hover, .btn-info:hover {
                    background: var(--color-neutral-300) !important;
                }
                .text-muted, .help-block {
                    color: var(--color-neutral-400) !important;
                }
                h1, h2, h3, h4, h5, h6, label {
                    color: var(--color-neutral-100) !important;
                    font-family: "Berkeley Mono", "JetBrains Mono", "IBM Plex Mono", monospace !important;
                }
                .nav-tabs-custom {
                    background: transparent !important;
                    box-shadow: none !important;
                }
                .nav-tabs-custom>.nav-tabs {
                    border-bottom-color: var(--color-neutral-600) !important;
                }
                .nav-tabs-custom>.nav-tabs>li.active>a {
                    background: var(--color-neutral-900) !important;
                    color: var(--color-neutral-200) !important;
                    border-color: var(--color-neutral-600) !important;
                    border-bottom-color: transparent !important;
                }
                .nav-tabs-custom>.tab-content {
                    background: var(--color-neutral-900) !important;
                    border: 1px solid var(--color-neutral-600) !important;
                    border-top: none !important;
                    color: var(--color-neutral-200) !important;
                }
            </style>
            <script>
                function applyAdminTheme() {
                    if (localStorage.getItem('theme') === 'dark') {
                        document.documentElement.classList.add('dark-theme');
                    } else {
                        document.documentElement.classList.remove('dark-theme');
                    }
                }
                applyAdminTheme();
                window.addEventListener('storage', applyAdminTheme);
            </script>
        @show
    </head>
    <body class="hold-transition skin-blue fixed sidebar-mini">
        <div class="wrapper">
            <header class="main-header">
                <a href="{{ route('index') }}" class="logo">
                    <span>{{ config('app.name', 'Pterodactyl') }}</span>
                </a>
                <nav class="navbar navbar-static-top">
                    <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </a>
                    <div class="navbar-custom-menu">
                        <ul class="nav navbar-nav">
                            <li class="user-menu">
                                <a href="{{ route('account') }}">
                                    <img src="https://www.gravatar.com/avatar/{{ md5(strtolower(Auth::user()->email)) }}?s=160" class="user-image" alt="User Image">
                                    <span class="hidden-xs">{{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" id="adminThemeToggle" data-toggle="tooltip" data-placement="bottom" title="Toggle Theme"><i class="fa fa-moon-o"></i></a>
                            </li>
                            <li>
                                <a href="{{ route('index') }}" data-toggle="tooltip" data-placement="bottom" title="Exit Admin Control"><i class="fa fa-server"></i></a>
                            </li>
                            <li>
                                <li><a href="{{ route('auth.logout') }}" id="logoutButton" data-toggle="tooltip" data-placement="bottom" title="Logout"><i class="fa fa-sign-out"></i></a></li>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
            <aside class="main-sidebar">
                <section class="sidebar">
                    <ul class="sidebar-menu">
                        <li class="header">BASIC ADMINISTRATION</li>
                        <li class="{{ Route::currentRouteName() !== 'admin.index' ?: 'active' }}">
                            <a href="{{ route('admin.index') }}">
                                <i class="fa fa-home"></i> <span>Overview</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}">
                            <a href="{{ route('admin.settings')}}">
                                <i class="fa fa-wrench"></i> <span>Settings</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.api') ?: 'active' }}">
                            <a href="{{ route('admin.api.index')}}">
                                <i class="fa fa-gamepad"></i> <span>Application API</span>
                            </a>
                        </li>
                        <li class="header">MANAGEMENT</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.databases') ?: 'active' }}">
                            <a href="{{ route('admin.databases') }}">
                                <i class="fa fa-database"></i> <span>Databases</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.locations') ?: 'active' }}">
                            <a href="{{ route('admin.locations') }}">
                                <i class="fa fa-globe"></i> <span>Locations</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nodes') ?: 'active' }}">
                            <a href="{{ route('admin.nodes') }}">
                                <i class="fa fa-sitemap"></i> <span>Nodes</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.servers') ?: 'active' }}">
                            <a href="{{ route('admin.servers') }}">
                                <i class="fa fa-server"></i> <span>Servers</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.users') ?: 'active' }}">
                            <a href="{{ route('admin.users') }}">
                                <i class="fa fa-users"></i> <span>Users</span>
                            </a>
                        </li>
                        <li class="header">SERVICE MANAGEMENT</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.mounts') ?: 'active' }}">
                            <a href="{{ route('admin.mounts') }}">
                                <i class="fa fa-magic"></i> <span>Mounts</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nests') ?: 'active' }}">
                            <a href="{{ route('admin.nests') }}">
                                <i class="fa fa-th-large"></i> <span>Nests</span>
                            </a>
                        </li>
                    </ul>
                </section>
            </aside>
            <div class="content-wrapper">
                <section class="content-header">
                    @yield('content-header')
                </section>
                <section class="content">
                    <div class="row">
                        <div class="col-xs-12">
                            @if (count($errors) > 0)
                                <div class="alert alert-danger">
                                    There was an error validating the data provided.<br><br>
                                    <ul>
                                        @foreach ($errors->all() as $error)
                                            <li>{{ $error }}</li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif
                            @foreach (Alert::getMessages() as $type => $messages)
                                @foreach ($messages as $message)
                                    <div class="alert alert-{{ $type }} alert-dismissable" role="alert">
                                        {{ $message }}
                                    </div>
                                @endforeach
                            @endforeach
                        </div>
                    </div>
                    @yield('content')
                </section>
            </div>
            <footer class="main-footer">
                <div class="pull-right small text-gray" style="margin-right:10px;margin-top:-7px;">
                    <strong><i class="fa fa-fw {{ $appIsGit ? 'fa-git-square' : 'fa-code-fork' }}"></i></strong> {{ $appVersion }}<br />
                    <strong><i class="fa fa-fw fa-clock-o"></i></strong> {{ round(microtime(true) - LARAVEL_START, 3) }}s
                </div>
                Copyright &copy; 2015 - {{ date('Y') }} <a href="https://pterodactyl.io/">Pterodactyl Software</a>.
            </footer>
        </div>
        @section('footer-scripts')
            <script src="/js/keyboard.polyfill.js" type="application/javascript"></script>
            <script>keyboardeventKeyPolyfill.polyfill();</script>

            {!! Theme::js('vendor/jquery/jquery.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/sweetalert/sweetalert.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap/bootstrap.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/slimscroll/jquery.slimscroll.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/adminlte/app.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap-notify/bootstrap-notify.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/select2/select2.full.min.js?t={cache-version}') !!}
            {!! Theme::js('js/admin/functions.js?t={cache-version}') !!}
            <script src="/js/autocomplete.js" type="application/javascript"></script>

            @if(Auth::user()->root_admin)
                <script>
                    $('#logoutButton').on('click', function (event) {
                        event.preventDefault();

                        var that = this;
                        swal({
                            title: 'Do you want to log out?',
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d9534f',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Log out'
                        }, function () {
                             $.ajax({
                                type: 'POST',
                                url: '{{ route('auth.logout') }}',
                                data: {
                                    _token: '{{ csrf_token() }}'
                                },complete: function () {
                                    window.location.href = '{{route('auth.login')}}';
                                }
                        });
                    });
                });
                </script>
            @endif

            <script>
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                    
                    $('#adminThemeToggle').on('click', function (e) {
                        e.preventDefault();
                        var isDark = document.documentElement.classList.contains('dark-theme');
                        if (isDark) {
                            localStorage.setItem('theme', 'light');
                            document.documentElement.classList.remove('dark-theme');
                        } else {
                            localStorage.setItem('theme', 'dark');
                            document.documentElement.classList.add('dark-theme');
                        }
                        // Dispatch storage event to sync with other tabs
                        window.dispatchEvent(new Event('storage'));
                    });
                })
            </script>
        @show
    </body>
</html>
