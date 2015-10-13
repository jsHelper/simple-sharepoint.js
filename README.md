# $sspjs - simple SharePoint JavaScript #
JavaScript Library to access SharePoint 2013 (and maybe above) data in a very easy way.

## Overview ###
In this documentation you can read how to read lists, get, create, edit and delete items from SharePoint lists. This library provides very simple and base function with no use of professional knowledge of the [SharePoint jsom (JavaScript Object Model)](https://msdn.microsoft.com/en-us/library/office/jj246996.aspx)

### Preconditions
1. jQuery (> 1.6.0)
2. SharePoint 2013

### Example
```javascript
$sspjs(function($sp, $logger){
  // builds a SharePoint context
  // to ensure access

  $sp.list('Tasks').getItemsAsync().done(function (items) {
    // get items asynchronous from the list called 'Tasks'
    // logs the result count to the browser console window
    $logger.log(items.length);
  });
});
```
### The `$sspjs(func)` Method
By calling the `$sspjs(func)` method a context will be created to ensure the accessability to the SharePoint JavaScript Context.
The inner `func` will be called after `.ready()` and after the `SP.js` have been loaded. The function parameters will be incjected by name, means you can call it with
```javascript
$sspjs(function($sp, $cache, $logger){
  /* do something with $sp, $cache, $logger ... */
});
```
but also in another order
```javascript
$sspjs(function($cache, $sp, $logger){
  /* do something with $sp, $cache, $logger ... */
});
```

#### `$sp`
Provides the base SharePoint access methods. Every method is returning [a promise](https://api.jquery.com/deferred.promise/)

##### Item operations
###### Get fields
```javascript
$sspjs(function($sp){
  $sp.list('Tasks').fields().done(function(fields){
    /*  returns all visible fields from the list called 'Tasks' */

    var internalName = fields[0].InternalName;
    var title = fields[0].Title;
  });
});
```

###### Get items
```javascript
$sspjs(function($sp){
  $sp.list('Tasks').items().done(function(items){
    /* returns all list items from the list called 'Tasks' */

    // f.e. data of the first item
    var id = items[0].Id;
  });
});
```
###### Additional fields
```javascript
$sspjs(function($sp){
  $sp.list('Tasks').items({
    query: '$select=Title,Description'
  }).done(function(items){
    /* returns all list items from the list called 'Tasks' */

    // f.e. data of the first item
    var title = items[0].Title;
    var desc = items[0].Description;
  });
});
```

###### Get item by id
```javascript
$sspjs(function($sp){
  $sp('Tasks').item(1).done(function(item){
    /* returns the item with id: 1 from the list called 'Tasks'  */

    // data of the item
    var id = item.Id
    var title = item.Title;
    var desc = item.Description;
  });
});
```
###### Create item
```javascript
$sspjs(function($sp){
  $sp.list('Tasks').add({
      Title: 'My new Item',
      Description: 'some text to describe the item'
    }).done(function(item){
    /* returns the new item from the list called 'Tasks'  */
  });
});
```
###### Update item
```javascript
$sspjs(function($sp){
  $sp.list('Tasks').item(1).update({
      Description: 'some text to describe the updated item'
    }).done(function(item){
    /* updates the item with the id: 1 with a new Description */
    /* returns the updated item from the list called 'Tasks'  */
  });
});
```
###### Delete item by id
```javascript
$sspjs(function($sp){
  $sp.list('Tasks').item(1).delete().done(function(id){
    /* deleted the item with the id: 1 */
    /* returns the id of the deleted item from the list called 'Tasks'  */
  });
});
```
##### List operations
###### Get Lists
```javascript
$sspjs(function($sp){
  $sp.lists().get({query: '$orderby=Title'}).done(function(lists){
    /* returns all lists of this web ordered by 'Title' */
  });
});
```
##### User operations
###### Current user
```javascript
$sspjs(function($sp){
  $sp.user().done(function(user){
    /* returns the current user object */
  });
});
```
###### User by id
```javascript
$sspjs(function($sp){
  $sp.user(1).done(function(user){
    /* returns the user with the Id=1 */
  });
});
```
###### Return site users
```javascript
$sspjs(function($sp){
  $sp.users().get({ query: '$orderby=Name' }).done(function(users){
    /* returns all site users ordered by 'Name' */
  });
});
```

#### `$resources`
There is also a basic implementation of a resource manager. This resources manager has been implemented to suppert
localization of SharePoint list names. If you create a site collection or site in another language SharePoint spells your lists depending on this language. For example the default 'Tasks' list will be 'Aufgaben' if German will be selected.
```javascript
$sspjs(function($resources, $sp){
  // first you have to fill the resource manager with the localized strings
  // $resources.add([language code], [access key], [localized string])
  $resources.add('de-DE', 'LISTNAME', 'Aufgaben');
  $resources.add('en-US', 'LISTNAME', 'Tasks');

  // now you can use the localized string everywhere in your .run-Context
  // $resources.text([access key], optional:[language code = default site language])
  var listname = $resources.text('LISTNAME');
  var listnameInGerman = $resources.text('LISTNAME', 'de-DE');
});
```

#### `$logger`
This object provides a simple log method. Messages will be logged to the browsers' default console. If the browser does not have a console nothing will be logged.
```javascript
$sspjs(function($logger){
  // $logger.log([message])
  $logger.log('Hi this is my new log message');
});
```
#### `$cache`
The cache object provides a mechnism to store strings or objects to the browser cache. The [sessionStorage](https://developer.mozilla.org/de/docs/Web/API/Window/sessionStorage) will be used by default. If your browser does not support the sessionStorage all values will be stored as cookies.
```javascript
$sspjs(function($cache){
  // $cache.set([access key], [value])
  $cache.set('FIRST_VALUE_KEY','Value to store');
  // $cache.get([access key])
  var value = $cache.get('FIRST_VALUE_KEY');
  // returns 'Value to store'
});
```
#### `$config`
The config object provides different configuration flags and attributes.
```javascript
$sspjs(function($config){
  // library configuration values
  $config.doCache = true;     // default: true
  $config.cacheExpires = 5;   // default: 5 minutes
  $config.doLogging = false;  // default: false

  // SharePoint configuration values (READONLY)
  $config.imagesPath          // returns the relative URL to '_layouts/images/'
  $config.language            // returns the language of the sitetemplate (used by $resources)
  $config.languageUI          // returns the language set by the browsers local
});
```

#### `$notify`
The notification object provides functionality to display standard SharePoint notifications and status.
```javascript
$sspjs(function($notify){
  $notify.show('Some text to display');

  var id = $notify.addStatus({
    title: 'Some title',
    message: 'some text to display',
    color: '[OPTIONAL] color: red, yellow, green'
  });

  // delete a status by id
  $notify.removeStatus(id);

  // delete all added status
  $notify.removeAllStatus();
});
```

#### `$dialog`
The dialog object provides functionality to display a SharePoint Dialog by URL.
```javascript
$sspjs(function($dialog){

  // open by url
  var openDialog = $dialog.open('/sites/0001/Shared%20Documents/Forms/EditForm.aspx?id=1');
  openDialog.done(function(result){
    /* ok clicked */
  });
  openDialog.fail(function(result){
    /* cancel clicked */
  });

  // if you are in a Dialog you can close it with return parameter
  $dialog.close({ value: 'some result value'});
});
```
