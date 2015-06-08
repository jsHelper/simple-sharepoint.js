
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
                $sspjs.config.siteRelativeUrl = _spPageContextInfo.siteServerRelativeUrl + (_spPageContextInfo.siteServerRelativeUrl !== '/' ? '/' : '');
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
    sp : {
    _context: null,
    _getSpContext: function (url, createNew) {
        if ($sspjs.sp._context === null || createNew === true) {
            if (!url) {
                $sspjs.sp._context = SP.ClientContext.get_current();
            }
            $sspjs.sp._context = new SP.ClientContext(url);
        }
        return $sspjs.sp._context;
    },
    _getWeb: function (params) {
        var ctx = $sspjs.sp._getSpContext(params);
        return ctx.get_web();
    },
    _getList: function (params) {
        var web = $sspjs.sp._getWeb(params);
        return web.get_lists().getByTitle(params.listname);
    },
    _getItem: function (params) {
        var list = $sspjs.sp._getList(params);
        return list.getItemById(params.id);
    },
    _executeAsync: function (loadArr, success, error) {
        var ctx = $sspjs.sp._getSpContext();

        if (loadArr) {
            for (var i = 0; i < loadArr.length; i++) {
                ctx.load(loadArr[i]);
            }
        }
        ctx.executeQueryAsync(success, error);
    },
    _getFileBufferAsync: function (filename) {
        var dfd = $.Deferred();
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
    _addFileToFolderAsync: function (filename, path, arrayBuffer) {
        var dfd = new $.Deferred();
        var parts = filename.split('\\');
        var fileName = parts[parts.length - 1];
        var fileCollectionEndpoint =
            $sspjs.config.siteRelativeUrl + "_api/web/getfolderbyserverrelativeurl('" + path + "')/files" +
            "/add(overwrite=true, url='" + fileName + "')";

        $.ajax({
            url: fileCollectionEndpoint,
            type: "POST",
            data: arrayBuffer,
            processData: false,
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                // "content-length": arrayBuffer.byteLength
            },
            success: function (data, status, xhr) {
                dfd.resolve(data.d, status, xhr);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                dfd.reject(xhr, ajaxOptions, thrownError);
            }
        });

        return dfd.promise();
    },
    initContext: function (url) {
        /// <summary>Creates a new SharePoint Client Context.</summary>
        /// <returns type="SP.Context">The Context.</returns>
        var ctx = $sspjs.sp._getSpContext(url);
        return ctx;
    },
    getCurrentUserAsync: function () {
        /// <summary>Request the current user accessing SharePoint.</summary>
        /// <returns type="User">The User (id, name, email, login)</returns>

        var CACHE_KEY = 'CURRENT_USER';

        var dfd = new $.Deferred();
        var userFromCache = $sspjs.cache.get(CACHE_KEY);
        if (userFromCache && userFromCache.login) {
            $sspjs.logger.log('Current user from cache: ' + userFromCache.login)
            dfd.resolve(userFromCache);
            return dfd.promise();
        }

        var ctx = $sspjs.sp._getSpContext();
        var oWeb = ctx.get_web();
        var usr = oWeb.get_currentUser();
        ctx.load(usr);
        ctx.load(oWeb, 'EffectiveBasePermissions');
        ctx.executeQueryAsync(Function.createDelegate(this, function (sender, args) {
            currentUser = {
                id: usr.get_id(),
                name: usr.get_title(),
                email: usr.get_email(),
                login: usr.get_loginName()
            };
            if (oWeb.get_effectiveBasePermissions().has(SP.PermissionKind.editListItems)) {
                currentUser.readonly = false;
            } else {
                currentUser.readonly = true;
            }
            $sspjs.cache.set(CACHE_KEY, currentUser);
            dfd.resolve(currentUser);
        }), Function.createDelegate(this, function (sender, args) {
            currentUser = null;
            dfd.reject(sender, args.get_message(), args);
        }));

        return dfd.promise();
    },
    hasPermissionAsync: function (permission) {
        var dfd = new $.Deferred();
        var ctx = $sspjs.sp._getSpContext();
        var oWeb = ctx.get_web();
        var usr = oWeb.get_currentUser();
        ctx.load(usr);
        ctx.load(oWeb, 'EffectiveBasePermissions');
        ctx.executeQueryAsync(Function.createDelegate(this, function (sender, args) {
            if (oWeb.get_effectiveBasePermissions().has(permission)) {
                dfd.resolve(true);
            } else {
                dfd.resolve(false);
            }
        }), Function.createDelegate(this, function (sender, args) {
            dfd.reject(sender, args.get_message(), args);
        }));

        return dfd.promise();
    },
    setWebPropertyAsync: function (key, value) {
        /// <summary>Save a value to the WebSite's Property Bag.</summary>
        /// <param name="key" type="String">Key to access the Property Bag value.</param>
        /// <param name="value" type="String">Value which should be stored to the Propery Bag.</param>
        var dfd = new $.Deferred();
        var web = $sspjs.sp._getWeb();
        var props = web.get_allProperties();

        props.set_item(key, value + '');
        web.update();

        $sspjs.sp._executeAsync([web], function (sender, args) {
            dfd.resolve(args);
        }, function (sender, args) {
            dfd.reject(sender, args.get_message(), args);
        });

        return dfd.promise();
    },
    getWebPropertyAsync: function (key) {
        /// <summary>Get a value from the WebSite's Property Bag.</summary>
        /// <param name="key" type="String">Key to access the stored value.</param>
        /// <returns type="String">The value from the Property Bag.</returns>
        var dfd = new $.Deferred();
        var web = $sspjs.sp._getWeb();
        var props = web.get_allProperties();

        $sspjs.sp._executeAsync([web, props], function (sender, args) {
            var value = props.get_item(key);
            dfd.resolve(value);
        }, function (sender, args) {
            dfd.reject(sender, args);
        });

        return dfd.promise();
    },
    getWebPropertiesAsync: function (keysArray) {
        /// <summary>Get values from the WebSite's Property Bag.</summary>
        /// <param name="keys" type="String[]">Keys to access the stored values.</param>
        /// <returns type="String[]">The values from the Property Bag.</returns>
        var dfd = new $.Deferred();
        var web = $sspjs.sp._getWeb();
        var props = web.get_allProperties();

        $sspjs.sp._executeAsync([web, props], function (sender, args) {
            var result = {};
            for (var i = 0; i < keysArray.length; i++) {
                try {
                    var val = props.get_item(keysArray[i]);
                    if (val !== undefined && val !== null) {
                        result[keysArray[i]] = val;
                    }
                } catch (err) {
                    $sspjs.logger.log(err);
                }
            }
            dfd.resolve(result);
        }, function (sender, args) {
            dfd.reject(sender, args);
        });

        return dfd.promise();
    },
    getListFieldsAsync: function (listname) {
        /// <summary>Get all VISIBLE fields from the specified list.</summary>
        /// <param name="listname" type="String">The listname.</param>
        /// <returns type="SP.Field[]">The list fields.</returns>
        var dfd = new $.Deferred();

        var CACHE_KEY = 'LIST_FIELDS_' + listname;
        var fieldsFromCache = $sspjs.cache.get(CACHE_KEY);
        if (fieldsFromCache && fieldsFromCache.length) {
            $sspjs.logger.log('Fields from cache: ' + fieldsFromCache.length)
            dfd.resolve(fieldsFromCache);
            return dfd.promise();
        }

        var list = $sspjs.sp._getList({ listname: listname });
        var fields = list.get_fields();

        $sspjs.sp._executeAsync([fields], function (sender, args) {
            var fieldEnumerator = fields.getEnumerator();
            var result = [];
            while (fieldEnumerator.moveNext()) {
                var field = fieldEnumerator.get_current();

                if (field.get_hidden() != true) {
                    result.push({
                        internalName: field.get_internalName(),
                        title: field.get_title(),
                        type: (field.get_fieldTypeKind() == 0 && field.get_typeAsString() === 'TaxonomyFieldType' ? 1000 : field.get_fieldTypeKind())
                    });
                }
            }
            $sspjs.logger.log(result.length + ' fields received.');
            $sspjs.cache.set(CACHE_KEY, result);
            dfd.resolve(result);
        }, function (sender, args) {
            dfd.reject(sender, args.get_message(), args);
        });

        return dfd.promise();
    },
    getListItemsAsync: function (listname, fields, viewXml, rowlimit) {
        /// <summary>Get fields from the specified list.</summary>
        /// <param name="listname" type="String">The listname.</param>
        /// <param name="fields" type="String[]">Which fields should be requested.</param>
        /// <param name="viewXml" type="String">(OPTIONAL) The view xml.</param>
        /// <param name="rowlimit" type="Number">(OPTIONAL) The rowlimit. Only works if 'viewXml' is null.</param>
        /// <returns type="SP.ListItem[]">The list items.</returns>
        if (!rowlimit)
            rowlimit = 100;
        var dfd = new $.Deferred();
        var ctx = new $sspjs.sp._getSpContext();
        var list = ctx.get_web().get_lists().getByTitle(listname);
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><RowLimit>' + rowlimit + '</RowLimit></View>');
        if (viewXml)
            camlQuery.set_viewXml(viewXml);
        var collListItem = list.getItems(camlQuery);

        if (fields !== undefined && fields !== null) {
            $sspjs.logger.log('requested fields: ' + fields.join(', '));
            ctx.load(collListItem, 'Include(' + fields.join(', ') + ')');
        } else {
            ctx.load(collListItem);
        }
        ctx.executeQueryAsync(Function.createDelegate(this, function (sender, args) {
            var result = [];
            var listItemEnumerator = collListItem.getEnumerator();
            while (listItemEnumerator.moveNext()) {
                var items = listItemEnumerator.get_current();
                result.push(items);
            }
            $sspjs.logger.log(result.length + ' items received.');
            dfd.resolve(result);
        }), Function.createDelegate(this, function (sender, args) {
            dfd.reject(sender, args.get_message(), args);
        }));

        return dfd.promise();
    },
    getListItemByIdAsync: function (listname, id) {
        var dfd = new $.Deferred();
        var list = $sspjs.sp._getList({ listname: listname });
        var item = list.getItemById(id);

        $sspjs.sp._executeAsync([item], function (sender, args) {
            dfd.resolve(item);
        }, function (sender, args) {
            dfd.reject(sender, args.get_message(), args);
        });

        return dfd.promise();
    },
    getListItemByFileUrlAsync: function (url) {
        var dfd = new $.Deferred();
        $.ajax({
            url: url,
            type: "GET",
            headers: { "accept": "application/json;odata=verbose" },
            success: function (data) {
                dfd.resolve(data.d);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                dfd.reject(this, 'no item found.', { xhr: xhr, ajax: ajaxOptions, error: thrownError });
            }
        });
        return dfd.promise();
    },
    addListItemAsync: function (listname, item, setPropertiesFunc) {
        var dfd = new $.Deferred();
        var list = $sspjs.sp._getList({ listname: listname });

        var itemCreateInfo = new SP.ListItemCreationInformation();
        var newItem = list.addItem(itemCreateInfo);

        for (var property in item) {
            if (item[property] !== undefined && item[property] !== null)
                newItem.set_item(property, item[property]);
        }

        if (setPropertiesFunc && $.isFunction(setPropertiesFunc)) {
            setPropertiesFunc(newItem);
        }

        newItem.update();

        $sspjs.sp._executeAsync([newItem], function (sender, args) {
            dfd.resolve(newItem);
        }, function (sender, args) {
            dfd.reject(sender, args.get_message(), args);
        });

        return dfd.promise();
    },
    updateListItemAsync: function (listname, id, item, setPropertiesFunc) {
        var dfd = new $.Deferred();
        var list = $sspjs.sp._getList({ listname: listname });
        var uItem = list.getItemById(id);

        for (var property in item) {
            if (item[property] !== undefined && item[property] !== null && property !== 'Id') {
                uItem.set_item(property, item[property]);
            }
        }

        if (setPropertiesFunc && $.isFunction(setPropertiesFunc)) {
            setPropertiesFunc(uItem);
        }

        uItem.update();

        $sspjs.sp._executeAsync([uItem], function (sender, args) {
            dfd.resolve(uItem);
        }, function (sender, args) {
            dfd.reject(sender, args.get_message(), args);
        });

        return dfd.promise();
    },
    deleteListItemByIdAsync: function (listname, id) {
        var dfd = new $.Deferred();
        var list = new $sspjs.sp._getList({ listname: listname });
        var item = list.getItemById(id);
        item.deleteObject();

        $sspjs.sp._executeAsync(null, function (sender, args) {
            dfd.resolve(id);
        }, function (sender, args) {
            dfd.reject(sender, args.get_message(), args);
        });

        return dfd.promise();
    },
    getUserByIdAsync: function (userId) {
        /// <summary>Get user data by ID depending on the current SPSite.</summary>
        /// <param name="userId" type="Number">The user id of the current SPSite.</param>
        /// <returns type="User">The user.</returns>

        var dfd = new $.Deferred();

        var CACHE_KEY = 'USER' + userId;
        var userFromCache = $sspjs.cache.get(CACHE_KEY);
        if (userFromCache && userFromCache.login) {
            $sspjs.logger.log('User from cache: ' + userFromCache.login)
            dfd.resolve(userFromCache);
            return dfd.promise();
        }

        var web = $sspjs.sp._getWeb();
        var user = web.getUserById(userId);
        $sspjs.sp._executeAsync([user], function (sender, args) {
            var result = {
                id: user.get_id(),
                name: user.get_title(),
                email: user.get_email(),
                login: user.get_loginName()
            };
            $sspjs.cache.set(CACHE_KEY, result);
            dfd.resolve(result);
        }, function (sender, args) {
            dfd.reject(sender, args.get_message(), args);
        });

        return dfd.promise();
    },
    getUserLink: function (userId) {
        /// <summary>Get user details link by ID.</summary>
        /// <param name="userId" type="Number">The user id of the current SPSite.</param>
        /// <returns type="String">The link.</returns>

        return $sspjs.config.webAbsoluteUrl + $sspjs.config.layoutsUrl + 'userdisp.aspx?ID=' + userId;
    },
    loadUserDataAsync: function (accountName, properties) {
        /// <summary>Get user data by account name. Attention: Does only works with 'User Profile Service' running!</summary>
        /// <param name="accountName" type="String">The accountName.</param>
        /// <param name="properties" type="String[]">(OPTIONAL) Which properties should be requested.</param>
        /// <returns type="User">The user object with the selected properties .</returns>
        var dfd = new $.Deferred();

        var CACHE_KEY = 'USER' + accountName;
        var userDataFromCache = $sspjs.cache.get(CACHE_KEY);
        if (userDataFromCache && userDataFromCache.LargeImage) {
            $sspjs.logger.log('UserData from cache: ' + accountName)
            dfd.resolve(userDataFromCache);
            return dfd.promise();
        }


        if (!properties)
            properties = ["PreferredName", "PictureURL"];

        //Get Current Context	
        var clientContext = $sspjs.sp._getSpContext();
        //Get Instance of People Manager Class
        var peopleManager = new SP.UserProfiles.PeopleManager(clientContext);
        //Properties to fetch from the User Profile
        var profilePropertyNames = properties;

        //Create new instance of UserProfilePropertiesForUser
        var userProfilePropertiesForUser = new SP.UserProfiles.UserProfilePropertiesForUser(clientContext, accountName, profilePropertyNames);
        userProfileProperties = peopleManager.getUserProfilePropertiesFor(userProfilePropertiesForUser);

        //Execute the Query.
        clientContext.load(userProfilePropertiesForUser);
        clientContext.executeQueryAsync(Function.createDelegate(this, function (sender, args) {
            var userData = {};
            for (var i = 0; i < properties.length; i++) {
                userData[properties[i]] = userProfileProperties[i];
            }
            $sspjs.cache.set(CACHE_KEY, userData);
            dfd.resolve(userData);
        }), Function.createDelegate(this, function (sender, args) {
            dfd.reject(sender, 'can not load user data', args);
        }));
        return dfd.promise();
    },
    uploadFileAsync: function (libraryName, name, fileInput, path) {
        var dfd = new $.Deferred();

        var that = this;
        var folder = '' + libraryName + (!path ? '' : '/' + path);
        var getBufferAsync = $sspjs.sp._getFileBufferAsync(fileInput.files[0]);
        getBufferAsync.done(function (arrayBuffer) {
            var addFile = $sspjs.sp._addFileToFolderAsync(fileInput.value, folder, arrayBuffer);
            addFile.done(function (item, status, xhr) {
                var uri = item.ListItemAllFields.__deferred.uri + '';
                var getItem = $sspjs.sp.getListItemByFileUrlAsync(uri);
                getItem.done(function (item) {
                    dfd.resolve(item, uri);
                });
                getItem.fail(function (sender, message, args) {
                    dfd.reject(sender, message, args);
                });
            });
            addFile.fail(function (xhr, ajaxOptions, thrownError) {
                dfd.reject(that, "file can not be uploaded", { xhr: xhr, ajax: ajaxOptions, error: thrownError });
            });
        });
        getBufferAsync.fail(function (error) {
            dfd.reject(that, "file can not be converted", error);
        });

        return dfd.promise();
    },
    openModalDialogAsync: function (url) {
        var dfd = new $.Deferred();
        var options = SP.UI.$create_DialogOptions();
        options.url = url;
        options.dialogReturnValueCallback = Function.createDelegate(this, function (dialogResult, returnValue) {
            if (dialogResult == SP.UI.DialogResult.OK)
                dfd.resolve(returnValue);
            else
                dfd.reject(returnValue);
        });
        SP.UI.ModalDialog.showModalDialog(options);
        return dfd.promise();
    },
    closeModalDialog: function (returnValue) {
        window.frameElement.commitPopup('Hello from custom dialog page!');
    }
},
    resources : {
    default: {},
    init: function (defaultResources) {
        /// <summary>Initialize resource dictionary with default language key value pairs object.</summary>
        /// <param name="defaultResources" type="Dictionary">Key value pairs object.</param>
        $sspjs.resources.default = defaultResources;
    },
    add: function (language, key, value) {
        /// <summary>Add a key value pair to the specified language dictionary.</summary>
        /// <param name="language" type="string">Language identifier (f.e. 'de-DE', 'en-US', ...).</param>
        /// <param name="key" type="string">Access key of the translation.</param>
        /// <param name="value" type="string">Text value.</param>
        if (!$sspjs.resources[language])
            $sspjs.resources[language] = {};
        $sspjs.resources[language][key] = value;
    },
    getText: function (key, language) {
        /// <summary>Get the translated text in the current language or a specified language.</summary>
        /// <param name="key" type="string">Text identifier key.</param>
        /// <param name="language" type="string">(OPTIONAL) Language identifier (f.e. 'de-DE', 'en-US', ...).</param>
        /// <returns type="string">The text.</returns>
        var dict, result = key;
        if (!language)
            language = $sspjs.config.language;
        dict = $sspjs.resources[language];
        if (!dict)
            dict = $sspjs.resources.default;
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
            if (console && console.log && $sspjs.config.doLogging === true)
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
    languageUI: 'en-US'
},
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
        key = $sspjs.config.cachePrefix + '_' + key;

        value = {
            val: value,
            created: Date.now()
        };

        if (!sessionStorage || !sessionStorage.setItem) {
            $sspjs.cache._setCookie(key, value);
        } else {
            $sspjs.cache._setSessionCache(key, value);
        }
    },
    get: function (key) {
        /// <summary>Use session storage or cookie on legacy browsers to get object by key.</summary>
        /// <param name="key" type="String">Key to access the stored value.</param>
        /// <returns type="Object">The object.</returns>

        var value = null, data = null, created, now = Date.now();

        if (!$sspjs.config.doCache)
            return null;
        key = $sspjs.config.cachePrefix + '_' + key;
        if (!sessionStorage || !sessionStorage.getItem)
            value = $sspjs.cache._getCookie(key);
        else {
            value = $sspjs.cache._getSessionCache(key);
        }

        if (!value || !value.val)
            return null;

        created = value.created;
        data = value.val;

        // check expiration after 5 Minutes (per default)
        if (now - created > 1000 * 60 * $sspjs.config.cacheExpires) {
            return null;
        }
        return data;
    },
    clear: function () {
        if (sessionStorage && sessionStorage.setItem)
            $sspjs.cache._clearSessionCache();
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
