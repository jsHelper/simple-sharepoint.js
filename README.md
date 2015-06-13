# $sspjs - simple SharePoint JavaScript #
JavaScript Library to access SharePoint (2013 and above) data in a very easy way.

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
  
  $sp.getListItemsAsync('Tasks', null, null, 2).done(function (items) {
    // get items asynchronous from the list called 'Tasks' limit by 2 items
    // logs the result count to the browser console window
    
    $logger.log(items.length);
  });
});
```
### The `.run(func)` Method
By calling the `.run(func)` method a context will be created to ensure the accessability to the SharePoint JavaScript Context.
The inner `func` will be called after `.ready()` and after the `SP.js` have been loaded. The function parameters will be incjected by name, means you can call it with 
```javascript
$sspjs(function($sp, $cache, $logger){ 
  /* do something with $sp, $cache, $logger ... */ 
});
```
but also in another order 
```javascript
$sspjs.run(function($cache, $sp, $logger){ 
  /* do something with $sp, $cache, $logger ... */ 
});
```

#### `$sp`
Provides the base SharePoint access methods. Every method with the suffix 'Async' returns [a promise](https://api.jquery.com/deferred.promise/)

##### Get Fields
```javascript
$sspjs(function($sp){ 
  $sp.getListFieldsAsync('Tasks').done(function(fields){
    /*  returns all visible fields from the list called 'Tasks' */
    
    var internalName = fields[0].internalName;
    var title = fields[0].title;
    var type = fields[0].type; // SP.FieldType enumeration number
  });
});
```
If you have a Taxonomy Field the `.type` attribute will be `1000`.

##### Get Items
```javascript
$sspjs(function($sp){ 
  $sp.getListItemsAsync('Tasks').done(function(items){
    /* returns all list items from the list called 'Tasks' */
  });
  
  // f.e. data of the first item
  var id = items[0].get_id();
});
```
###### Additional fields
```javascript
$sspjs(function($sp){ 
  $sp.getListItemsAsync('Tasks', ['Title', 'Description']).done(function(items){
    /* returns all list items from the list called 'Tasks' */
    
    // f.e. data of the first item
    var id = items[0].get_id();
    var title = items[0].get_item('Title');
    var desc = items[0].get_item('Description');
  });
});
```
###### View XML
```javascript
$sspjs(function($sp){ 
  var viewXML = '<View><Query><OrderBy><FieldRef Name="Modified" Ascending="FALSE"/></OrderBy></Query></View>';
  $sp.getListItemsAsync('Tasks', ['Title', 'Description'], viewXML).done(function(items){
    /* returns all list items from the list called 'Tasks' ordered by Modified date */
  });
});
```
###### Limit the results
```javascript
$sspjs(function($sp){ 
  $sp.getListItemsAsync('Tasks', ['Title', 'Description'], null, 2).done(function(items){
    /* 
      returns all list items from the list called 'Tasks' limited by 2.
      Be careful: This option only works if you do not provide a viewXML. If you do need a viewXML you can limit 
      your result by adding a rowlimit node to the view XML.
    */
  });
});
```
##### Get Item by Id
```javascript
$sspjs(function($sp){ 
  $sp.getListItemByIdAsync('Tasks', 1).done(function(item){
    /* returns the item with id: 1 from the list called 'Tasks'  */
    
    // data of the item
    var id = item.get_id();
    var title = item.get_item('Title');
    var desc = item.get_item('Description');
  });
});
```
##### Create Item
```javascript
$sspjs(function($sp){ 
  $sp.addListItemAsync('Tasks', {
      Title: 'My new Item',
      Description: 'some text to describe the item'
    }).done(function(item){
    /* returns the new item from the list called 'Tasks'  */
  });
});
```
##### Update Item
```javascript
$sspjs(function($sp){ 
  $sp.updateListItemAsync('Tasks', 1, {
      Description: 'some text to describe the updated item'
    }).done(function(item){
    /* updates the item with the id: 1 with a new Description */
    /* returns the updated item from the list called 'Tasks'  */
  });
});
```
##### Delete Item by Id
```javascript
$sspjs(function($sp){ 
  $sp.deleteListItemAsync('Tasks', 1).done(function(id){
    /* deleted the item with the id: 1 */
    /* returns the id of the deleted item from the list called 'Tasks'  */
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
  // $resources.getText([access key], optional:[language code = default site language])
  var listname = $resources.getText('LISTNAME');
  var listnameInGerman = $resources.getText('LISTNAME', 'de-DE');
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
