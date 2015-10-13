
/**************************************************************************************
    Requires:
        jQuery		      >= 1.6.0
        SharePoint JS   >= 15 (SharePoint 2013)
        Browser         > IE9

    Notes and Warrenty:
        This is a small library access SharePoint in a very easy way. There is
        only base functionality implemented. Please do not copy without credit the
        developers.
        There is no warrenty of data loss, security or something else. You can use
        as it is.
***************************************************************************************/

(function (parent, factory) {

    parent.$sspjs = parent.sspjs = factory();
    parent.$sspjs.setJQuery = function($jQueryObject){
      window.$jq = $jQueryObject;
      $jq = $jQueryObject;
    };
    return $sspjs;

})(window, function () {
    var $jq = window.$jq || $ || jQuery;
    var sspjs = {
        contructor: sspjs,
        /// <summary>Do not call any method outside of the 'run' method</summary>
        user: null,
        run: function (func, $jQueryObject) {
            /// <summary>Single point of start. Creates a SharePoint scope to ensure SP access. </summary>
            /// <param name="func" type="Function">
            /// <param name="$jqueryObject" type="Object">
            /// <para> f.e. function( $sp, $user) { /* do something with current user and SharePoint */ }); </para>
            /// <para></para>
            /// <para> $user: the current logged in user. </para>
            /// <para> $config: current configuration. </para>
            /// <para> $resources: implementation of a resource manager. </para>
            /// <para> $logger: logging class to do logging in browser window. </para>
            /// <para> $sp: handles and provides SharePoint access. </para>
            /// <para> $cache: caching instance. </para>
            /// </param>
            /// <param name="context" type="object">Create a remote SharePoint context</param>
            var sspjs = this;
            if($jQueryObject !== undefined && $jQueryObject !== null){
              window.$jq = $jQueryObject;
              $jq = $jQueryObject;
            }
            $jq(document).ready(function () {

                var spHostUrl = decodeURIComponent(sspjs.url.getParameter('SPHostUrl'));
                var appWebUrl = decodeURIComponent(sspjs.url.getParameter('SPAppWebUrl'));
                var appLanguage = decodeURIComponent(sspjs.url.getParameter('SPLanguage'));
                var layoutsRoot = spHostUrl + '/_layouts/15/';
                var isApp = false;

                if(typeof ExecuteOrDelayUntilScriptLoaded !== 'function' || $jq.isFunction(ExecuteOrDelayUntilScriptLoaded) === false){
                  isApp = true;
                  window.ExecuteOrDelayUntilScriptLoaded = function(func){
                    $jq.getScript(layoutsRoot + "SP.Runtime.js", function(){
                      $jq.getScript(layoutsRoot + 'SP.js', func);
                    });
                  };
                };

                ExecuteOrDelayUntilScriptLoaded(function () {

                    if(!isApp){

                      if (!_spPageContextInfo)
                          throw "No SharePoint context available!";
                      // context informations
                      sspjs.config.cachePrefix = sspjs._hash(_spPageContextInfo.webAbsoluteUrl);
                      sspjs.config.webAbsoluteUrl = _spPageContextInfo.webAbsoluteUrl + '/';
                      sspjs.config.siteRelativeUrl = _spPageContextInfo.siteServerRelativeUrl + (_spPageContextInfo.siteServerRelativeUrl !== '/' ? '/' : '');
                      sspjs.config.layoutsUrl = _spPageContextInfo.layoutsUrl + '/';
                      sspjs.config.imagesPath = sspjs.config.webAbsoluteUrl + sspjs.config.layoutsUrl + 'images/';
                      sspjs.config.language = _spPageContextInfo.currentCultureName;
                      sspjs.config.languageUI = _spPageContextInfo.currentUICultureName;

                      if(JSRequest){
                          JSRequest.EnsureSetup();
                          sspjs.config.fileName = JSRequest.FileName;
                          sspjs.config.pathName = JSRequest.PathName;
                          sspjs.config.isDialog = (JSRequest.QueryString["isDlg"] === "1");
                      }

                    }else{
                      sspjs.config.cachePrefix = sspjs._hash(appWebUrl);
                      sspjs.config.spHostUrl = spHostUrl;
                      sspjs.config.appWebUrl = appWebUrl;
                      sspjs.config.webAbsoluteUrl = appWebUrl + '/';
                      sspjs.isApp = true;
                      sspjs.config.layoutsUrl = layoutsRoot;
                      sspjs.config.language = appLanguage;
                      sspjs.config.languageUI = appLanguage;
                      sspjs.config.imagesPath = sspjs.config.layoutsUrl + 'images/';
                      sspjs.config.isDialog = false;
                    }

                    var url = sspjs.config.webAbsoluteUrl + "/";
                    var prom = sspjs.sp.user();
                    prom.done(function (user) {
                        sspjs.user = user;
                        sspjs.logger.log('user: ' + user.Title);
                        sspjs._injectAndExecute(func);
                    });
                    prom.fail(function (sender, message) {
                        sspjs.logger.log(message);
                    });
                }, "sp.js");
            });
        },
        sp : {
    $d: { created: new Date() },
    $global: {
    /* global scope */
      getApiUrl: function () { return sspjs.config.webAbsoluteUrl + '_api/' },
      ajax: function (url, success, error, type, data, etag) {
          if (!type)
              type = 'get';
          switch (type) {
              case ('upload'):
                  return $jq.ajax({
                      url: url,
                      method: 'POST',
                      data: data,
                      processData: false,
                      headers: {
                          "Accept": "application/json; odata=verbose",
                          "X-RequestDigest": $jq("#__REQUESTDIGEST").val()
                      }, success: success, error: error
                  });
              case ('add'):
                  return $jq.ajax({
                      url: url,
                      method: 'POST',
                      contentType: 'application/json;odata=verbose',
                      data: JSON.stringify(data),
                      headers: {
                          "Accept": "application/json; odata=verbose",
                          "X-RequestDigest": $jq("#__REQUESTDIGEST").val()
                      }, success: success, error: error
                  });
              case ('update'):
                  return $jq.ajax({
                      url: url,
                      method: 'POST',
                      contentType: 'application/json;odata=verbose',
                      data: JSON.stringify(data),
                      headers: {
                          "Accept": "application/json; odata=verbose",
                          "X-RequestDigest": $jq("#__REQUESTDIGEST").val(),
                          "X-HTTP-Method": "MERGE",
                          "If-Match": etag
                      }, success: success, error: error
                  });
              case ('delete'):
                  return $jq.ajax({
                      url: url,
                      method: 'POST',
                      headers: {
                          "Accept": "application/json; odata=verbose",
                          "X-RequestDigest": $jq("#__REQUESTDIGEST").val(),
                          "X-HTTP-Method": "DELETE",
                          "If-Match": etag
                      }, success: success, error: error
                  });
              case ('get'):
              default:
                  return $jq.ajax({
                      url: url,
                      method: 'GET',
                      headers: {
                          "Accept": "application/json; odata=verbose"
                      }, success: success, error: error
                  });
          }
      },
      defaultOptions: {
        plain: false,
        query: ''
      },
      resolve: function(data, dfd, plain){
        if (plain === false) {
            if (data.d.results && $jq.isArray(data.d.results) === true) {
                dfd.resolve(data.d.results);
            } else {
                dfd.resolve(data.d);
            }
        } else {
            dfd.resolve(data);
        }
        return dfd;
      },
    },
    $private:{
      /* private scope */
      _addFileToFolderAsync: function (filename, path, arrayBuffer) {
          return (function (context, $sp) {
              var dfd = new $jq.Deferred();
              var parts = filename.split('\\');
              var fileName = parts[parts.length - 1];
              var url =
                  context.getApiUrl() + "web/getfolderbyserverrelativeurl('" + path + "')/files" +
                  "/add(overwrite=true, url='" + fileName + "')";
              context.ajax(url, dfd.resolve, dfd.reject, 'upload', arrayBuffer);

              return dfd.promise();
          })(sspjs.sp.$global, sspjs.sp);
      },
      _getFileBufferAsync: function (filename) {
          var dfd = $jq.Deferred();
          var reader = new FileReader();
          reader.onloadend = function (e) {
              dfd.resolve(e.target.result);
          }
          reader.onerror = function (e) {
              dfd.reject(e.target.error);
          }
          reader.readAsArrayBuffer(filename);
          return dfd.promise();
      },

    },

    /* public
     * Use these methods to access SharePoint!
     * With SP 2013 odata API
     */
    lists: (function(){
      return (function (context, $sp) {
        var $scope = {
          get: function (options) {
            var dfd = new $jq.Deferred();
            options = $jq.extend(context.defaultOptions, options);
            var url = context.getApiUrl() + "web/lists?" + options.query;
            context.ajax(url, function (data) { context.resolve(data, dfd, options.plain); }, dfd.reject);
            return dfd.promise();
          },
          add: function(options){
            // tbd.
            throw "Not implemented yet"
          },
          delete: function(options){
            // tbd.
            throw "Not implemented yet"
          }
        };
        return $scope.get();
      })(sspjs.sp.$global, sspjs.sp);
    }),
    list: function (listname) {
      return (function (context, $sp) {
        var $scope = {
          listname: listname,
          itemtype: null,
          add: (function(item){
            var dfd = new $jq.Deferred();

            function _add(item, type){
              item = $jq.extend({"__metadata": { "type": type }}, item);
              var url = context.getApiUrl() + "web/lists/getbytitle('" + $scope.listname + "')/items";
              context.ajax(url, dfd.resolve, dfd.reject, 'add', item);
              return dfd.promise();
            };

            if($scope.itemtype){
              return _add(item, $scope.itemtype);
            }else{
              $scope.item(null).type().done(function(){
                return _add(item, $scope.itemtype);
              });
            };
          }),
          fields: (function(options) {
            var $fields_scope = {
              get: function(){
                var dfd = new $jq.Deferred();
                options = $jq.extend(context.defaultOptions, options);
                var url = context.getApiUrl() + "web/lists/getbytitle('" + $scope.listname + "')/fields?" + options.query;
                context.ajax(url, function (data) { context.resolve(data, dfd, options.plain) }, dfd.reject);
                return dfd.promise();
              }
            };
            return $fields_scope.get();
          }),
          field: (function(id, options) { }),
          items: (function(options) {
            var $items_scope = {
              get: function(){
                var dfd = new $jq.Deferred();
                options = $jq.extend(context.defaultOptions, options);
                var url = context.getApiUrl() + "web/lists/getbytitle('" + $scope.listname + "')/items?" + options.query;
                context.ajax(url, function (data) { context.resolve(data, dfd, options.plain); }, dfd.reject);
                return dfd.promise();
              }
            };
            return $items_scope.get();
          }),
          item: (function (id, options) {
            var $item_scope = {
              id: id,
              type: function(){
                var dfd = new $jq.Deferred();
                var url = context.getApiUrl() + "web/lists/getbytitle('" + $scope.listname + "')?$select=ListItemEntityTypeFullName";
                context.ajax(url, function (data) {
                    $scope.itemtype = data.d.ListItemEntityTypeFullName;
                }, dfd.reject);
                return dfd.promise();
              },
              get: function(options){
                var dfd = new $jq.Deferred();
                options = $jq.extend(context.defaultOptions, options);
                var url = context.getApiUrl() + "web/lists/getbytitle('" + $scope.listname + "')/items(" + $item_scope.id + ")";
                context.ajax(url, function (data) { context.resolve(data, dfd, options.plain); }, dfd.reject);
                return dfd.promise();
              },
              update: function(options){
                var dfd = new $jq.Deferred();

                function _update(item, type){
                  item = $jq.extend({"__metadata": { "type": type }}, item);
                  var getItemAsync = $item_scope.get({plain: true});
                  getItemAsync.done(function (data) {
                    var url = data.__metadata.uri;
                    var etag = data.__metadata.etag;
                    context.ajax(url, dfd.resolve, dfd.reject, 'update', item, etag);
                  });
                  getItemAsync.fail(dfd.reject);
                  return dfd.promise();
                };

                if($scope.itemtype){
                    return _update(item, $scope.itemtype);
                }else{
                  $scope.item(null).type().done(function(){
                    return _update(item, $scope.itemtype);
                  });
                };
              },
              delete: function(){
                var dfd = new $jq.Deferred();
                var getItemAsync = $item_scope.get({plain: true});
                getItemAsync.done(function (data) {
                  var url = data.__metadata.uri;
                  var etag = data.__metadata.etag;
                  context.ajax(url, dfd.resolve, dfd.reject, 'delete', data, etag);
                });
                getItemAsync.fail(dfd.reject);
                return dfd.promise();
              }
            };
            return $item_scope;
          })
        };
        return $scope;
      })(sspjs.sp.$global, sspjs.sp);
    },
    user: (function(id){
      return (function (context, $cache) {
        var $scope = {
          id: id,
          get: function (options) {
              var dfd = new $jq.Deferred();
              options = $jq.extend(context.defaultOptions, options);

              var CACHE_KEY = '_ODATA_USER_' + $scope.id + options.query;
              var userFromCache = $cache.get(CACHE_KEY);
              if (userFromCache) {
                dfd.resolve(userFromCache);
                return dfd.promise();
              }

              var url = context.getApiUrl() + 'web/GetUserById(' + $scope.id + ')?' + options.query;
              if (!$scope.id)
                url = context.getApiUrl() + 'web/currentUser?' + options.query;
              context.ajax(url, function (data) {
                context.resolve(data, dfd, options.plain);
              }, dfd.reject);
              return dfd.promise();
          }
        };
        return $scope.get();
      })(sspjs.sp.$global, sspjs.cache);
    }),
    users: (function () {
      return (function (context, $cache) {
        var $scope = {
          get: function (options) {
            var dfd = new $jq.Deferred();
            options = $jq.extend(context.defaultOptions, options);

            var CACHE_KEY = '_ODATA_USERS_' + options.query;
            var usersFromCache = $cache.get(CACHE_KEY);
            if (usersFromCache) {
                dfd.resolve(usersFromCache);
                return dfd.promise();
            }

            var url = context.getApiUrl() + 'web/SiteUsers?' + options.query;
            context.ajax(url, function (data) {
                context.resolve(data, dfd, options.plain);
            }, dfd.reject);
            return dfd.promise();
          }
        };
        return $scope.get();
        })(sspjs.sp.$global, sspjs.cache);
    })
}
,
        resources : {
    default: {},
    init: function (defaultResources) {
        /// <summary>Initialize resource dictionary with default language key value pairs object.</summary>
        /// <param name="defaultResources" type="Dictionary">Key value pairs object.</param>
        sspjs.resources.default = defaultResources;
    },
    add: function (language, key, value) {
        /// <summary>Add a key value pair to the specified language dictionary.</summary>
        /// <param name="language" type="string">Language identifier (f.e. 'de-DE', 'en-US', ...).</param>
        /// <param name="key" type="string">Access key of the translation.</param>
        /// <param name="value" type="string">Text value.</param>
        if (!sspjs.resources[language])
            sspjs.resources[language] = {};
        sspjs.resources[language][key] = value;
    },
    text: function (key, language) {
        /// <summary>Get the translated text in the current language or a specified language.</summary>
        /// <param name="key" type="string">Text identifier key.</param>
        /// <param name="language" type="string">(OPTIONAL) Language identifier (f.e. 'de-DE', 'en-US', ...).</param>
        /// <returns type="string">The text.</returns>
        var dict, result = key;
        if (!language)
            language = sspjs.config.language;
        dict = sspjs.resources[language];
        if (!dict)
            dict = sspjs.resources.default;
        if (dict[key] !== undefined && dict[key] !== null)
            result = dict[key];
        return result;
    }
},
        logger : {
    log: function (message) {
        /// <summary>Log to browsers console object</summary>
        /// <param name="message" type="String">Log message.</param>
        try {
            if (console && console.log && sspjs.config.doLogging === true)
                console.log(message);
        } catch (err) { }
    }
},
        config : {
    doCache: true,
    cacheExpires: 5,
    doLogging: false,
    cachePrefix: '0',
    webAbsoluteUrl: '',
    siteRelativeUrl: '/',
    layoutsUrl: '_layouts/15/',
    imagesPath: '',
    language: 'en-US',
    languageUI: 'en-US',
    fileName: '',
    pathName: '',
    isDialog: false,
    spHostUrl: '',
    appHostUrl: '',
    isApp: false
}
,
        cache : {
    _setCookie: function (key, value) {
        var expires = new Date();
        var val = JSON.stringify(value);
        expires.setTime(expires.getTime() + (1 * 60 * 60 * 1000));
        document.cookie = key + '=' + val + ';expires=' + expires.toUTCString();
    },
    _getCookie: function (key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        var value = keyValue ? keyValue[2] : null;
        if (!value)
            return null;
        return JSON.parse(value);
    },
    _setSessionCache: function (key, value) {
        var val = JSON.stringify(value);
        sessionStorage.setItem(key, val);
    },
    _getSessionCache: function (key) {
        var value = sessionStorage.getItem(key);
        if (!value)
            return null;
        return JSON.parse(value);
    },
    _clearSessionCache: function () {
        sessionStorage.clear();
    },
    set: function (key, value) {
        /// <summary>Use session storage or cookie on legacy browsers to store object by key.</summary>
        /// <param name="key" type="String">Key to access the stored value.</param>
        /// <param name="value" type="Object">Obect which should be stored.</param>
        key = sspjs.config.cachePrefix + '_' + key;

        value = {
            val: value,
            created: Date.now()
        };

        if (!sessionStorage || !sessionStorage.setItem) {
            sspjs.cache._setCookie(key, value);
        } else {
            sspjs.cache._setSessionCache(key, value);
        }
    },
    get: function (key) {
        /// <summary>Use session storage or cookie on legacy browsers to get object by key.</summary>
        /// <param name="key" type="String">Key to access the stored value.</param>
        /// <returns type="Object">The object.</returns>

        var value = null, data = null, created, now = Date.now();

        if (!sspjs.config.doCache)
            return null;
        key = sspjs.config.cachePrefix + '_' + key;
        if (!sessionStorage || !sessionStorage.getItem)
            value = sspjs.cache._getCookie(key);
        else {
            value = sspjs.cache._getSessionCache(key);
        }

        if (!value || !value.val)
            return null;

        created = value.created;
        data = value.val;

        // check expiration after 5 Minutes (per default)
        if (now - created > 1000 * 60 * sspjs.config.cacheExpires) {
            return null;
        }
        return data;
    },
    clear: function () {
        if (sessionStorage && sessionStorage.setItem)
            sspjs.cache._clearSessionCache();
    }
},
        notify : {
    show: function (message) {
        if (!SP || !SP.UI || !SP.UI.Status)
            throw new Exception('SP (SP.UI.Status) object not defined');

        SP.UI.Notify.addNotification(message, false);
    },
    addStatus: function (options) {
        if (!SP || !SP.UI || !SP.UI.Status)
            throw new Exception('SP (SP.UI.Status) object not defined');

        if (!options.color) {
            options.color = 'yellow';
        }
        var statusID = SP.UI.Status.addStatus(options.title, options.message);
        SP.UI.Status.setStatusPriColor(statusID, options.color);
        return statusID;
    },
    removeStatus: function (id) {
        if (!SP || !SP.UI || !SP.UI.Status)
            throw new Exception('SP (SP.UI.Status) object not defined');

        if (id) {
            SP.UI.Status.removeStatus(id);
        }
    },
    removeAllStatus: function () {
        if (!SP || !SP.UI || !SP.UI.Status)
            throw new Exception('SP (SP.UI.Status) object not defined');

        SP.UI.Status.removeAllStatus(true);
    }
}
,
        dialog : {
    open: function (url) {

        if (!SP || !SP.UI || !SP.UI.DialogResult)
            throw new Exception('SP (SP.UI.DialogResult) object not defined');

        var dfd = new $.Deferred();
        var options = SP.UI.$create_DialogOptions();
        options.url = url;
        options.dialogReturnValueCallback = Function.createDelegate(sspjs.sp, function (dialogResult, returnValue) {
            if (dialogResult == SP.UI.DialogResult.OK)
                dfd.resolve(returnValue);
            else
                dfd.reject(returnValue);
        });
        SP.UI.ModalDialog.showModalDialog(options);
        return dfd.promise();
    },
    close: function (returnValue) {
        window.frameElement.commitPopup(returnValue);
    }
}
,
        url : {
    queryString: function (key) {
        if (!JSRequest)
            throw new Exception("JSRequest object was not found.")

        JSRequest.EnsureSetup();
        return JSRequest.QueryString[key];
    },
    getParameter: function (key) {
      var sPageURL = decodeURIComponent(window.location.search.substring(1)),sURLVariables = sPageURL.split('&'),sParameterName,i;
      for (i = 0; i < sURLVariables.length; i++) {
          sParameterName = sURLVariables[i].split('=');

          if (sParameterName[0] === key) {
              return sParameterName[1] === undefined ? true : sParameterName[1];
          }
      }
    },
    escape: function (text) {
        if (!escapeProperly)
            return text;
        return escapeProperly(text);
    },
    unescape: function (text) {
        if (!unescapeProperly)
            return text;
        return unescapeProperly(text);
    }
}
,
        common : {
    loginAsAnotherUser: function () {
        LoginAsAnother('\u002f_layouts\u002fAccessDenied.aspx?loginasanotheruser=true', 0);
    },
    encodeHtml: function (html) {
        if (!STSHtmlEncode)
            return html;
        return STSHtmlEncode(html);
    },
    decodeHtml: function (text) {
        if (!STSHtmlDecode)
            return text;
        return STSHtmlDecode(text);
    },
    createGUID: function () {
        if (SP && SP.Guid && SP.Guid.newGuid)
            return SP.Guid.newGuid().toString();

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
},
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
            var i, arguments = [], params = sspjs._getFunctionParameters(f);
            arguments = sspjs._getParameterMapping(params);
            return f.apply(null, arguments);
        },
        _getParameterMapping: function (params) {
            var pName, args = [];
            for (i = 0; i < params.length; i++) {
                if (params[i] && params[i].length > 0) {
                    pName = params[i].substring(1);
                    args.push(sspjs[pName]);
                } else {
                    args.push(null);
                }
            };
            return args;
        }
    };

    return function (func, $jQueryObject) {
        sspjs.run(func, $jQueryObject);
    };
});

