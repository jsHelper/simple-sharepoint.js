
/**************************************************************************************
    Requires: 
        jQuery		    >= 1.0.0
        SharePoint JS   >= 15 (SharePoint 2013)
        Browser         > IE9

    Notes and Warrenty:
        This is a small library access SharePoint in a very easy way. There is 
        only base functionality implemented. Please do not copy without credit the
        developers. 
        There is no warrenty of data loss, security or something else. You can use 
        as it is.
***************************************************************************************/


var $sspjs = {
    /// <summary>Do not call any method outside of the 'run' method</summary>
    user: null,
    run: function (func, remoteUrl) {
        /// <summary>Single point of start. Creates a SharePoint scope to ensure SP access. </summary>
        /// <param name="func" type="Function">
        /// <para> f.e. function( $sp, $user) { /* do something with current user and SharePoint */ }); </para>
        /// <para></para>
        /// <para> $user: the current logged in user. </para>
        /// <para> $config: current configuration. </para>
        /// <para> $resources: implementation of a resource manager. </para>
        /// <para> $logger: logging class to do logging in browser window. </para>
        /// <para> $sp: handles and provides SharePoint access. </para>
        /// <para> $cache: caching instance. </para>
        /// </param>
        /// <param name="remoteUrl" type="string">Create a remote SharePoint context</param>
        $(document).ready(function () {
            ExecuteOrDelayUntilScriptLoaded(function () {
                if (!_spPageContextInfo)
                    throw "No SharePoint context available!";

                $sspjs.sp.initContext(remoteUrl);

                // context informations
                $sspjs.config.cachePrefix = $sspjs._hash(_spPageContextInfo.webAbsoluteUrl);
                $sspjs.config.webAbsoluteUrl = _spPageContextInfo.webAbsoluteUrl + '/';
                $sspjs.config.layoutsUrl = _spPageContextInfo.layoutsUrl + '/';
                $sspjs.config.imagesPath = $sspjs.config.webAbsoluteUrl + $sspjs.config.layoutsUrl + 'images/';
                $sspjs.config.language = _spPageContextInfo.currentCultureName;
                $sspjs.config.languageUI = _spPageContextInfo.currentUICultureName;

                var url = _spPageContextInfo.webServerRelativeUrl + "/";
                var prom = $sspjs.sp.getCurrentUserAsync();
                var user = null;
                prom.done(function (user) {
                    $sspjs.user = user;
                    $sspjs.logger.log('user: ' + user.name);
                    $sspjs._injectAndExecute(func);
                });
                prom.fail(function (sender, message) {
                    $sspjs.logger.log(message);
                });
            }, "sp.js");
        });
    },
    ///include(sp)
    ///include(resources)
    ///include(logger)
    ///include(config)
    ///include(cache)
    _hash: function (value) {
        var hash = 0;
        if (value.length == 0) return hash;
        for (i = 0; i < value.length; i++) {
            char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },
    _getFunctionParameters: function (f) {
        return f.toString()
                .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '')
                .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
                .split(/,/);
    },
    _injectAndExecute: function (f) {
        var i, arguments = [], params = $sspjs._getFunctionParameters(f);
        arguments = $sspjs._getParameterMapping(params);
        return f.apply(null, arguments);
    },
    _getParameterMapping: function (params) {
        var pName, args = [];
        for (i = 0; i < params.length; i++) {
            if (params[i] && params[i].length > 0) {
                pName = params[i].substring(1);
                args.push($sspjs[pName]);
            } else {
                args.push(null);
            }
        };
        return args;
    }
};