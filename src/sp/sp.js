sp = {
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
