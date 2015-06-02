# sspjs (Simple SharePoint with JavaScript) #
JavaScript Library to access SharePoint (2013 and above) data in a very easy way.

### Preconditions
jQuery (> 1.0), SharePoint (> 2013)
### Example
```javascript
$sspjs.run(function($sp, $logger){
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
$sspjs.run(function($sp, $cache, $logger){ 
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

##### Get List Fields
```javascript
$sspjs.run(function($sp){ 
  $sp.getListFieldsAsync('Tasks').done(function(fields){
    /*  returns all visible fields from the List called 'Tasks' */
    
    var internalName = fields[0].internalName;
    var title = fields[0].title;
    var type = fields[0].type; // SP.FieldType enumeration number
  });
});
```
If you have a Taxonomy Field the `.type` attribute will be `1000`.

##### Get List Items
```javascript
$sspjs.run(function($sp){ 
  $sp.getListItemsAsync('Tasks').done(function(items){
    /* returns all list items from the List called 'Tasks' */
  });
  
  // f.e. data of the first item
  var id = items[0].get_id();
});
```
Request additional fields
```javascript
$sspjs.run(function($sp){ 
  $sp.getListItemsAsync('Tasks', ['Title', 'Description']).done(function(items){
    /* returns all list items from the List called 'Tasks' */
    
    // f.e. data of the first item
    var id = items[0].get_id();
    var title = items[0].get_item('Title');
    var desc = items[0].get_item('Description');
  });
});
```
Request with a view XML
```javascript
$sspjs.run(function($sp){ 
  var viewXML = '<View><Query><OrderBy><FieldRef Name="Modified" Ascending="FALSE"/></OrderBy></Query></View>';
  $sp.getListItemsAsync('Tasks', ['Title', 'Description'], viewXML).done(function(items){
    /* returns all list items from the List called 'Tasks' ordered by Modified date */
  });
});
```
Limit the result
```javascript
$sspjs.run(function($sp){ 
  $sp.getListItemsAsync('Tasks', ['Title', 'Description'], null, 2).done(function(items){
    /* 
      returns all list items from the List called 'Tasks' limited by 2.
      Be careful: This option only works if you do not provide a viewXML. If you do need a viewXML you can limit 
      your result by adding a rowlimit node to the view XML.
    */
  });
});
```
##### Get List Item by Id
##### Create List Item
##### Update List Item
##### Delete List Item by Id


#### `$resources`
tbd.
#### `$logger`
tbd.
#### `$cache`
tbd.
#### `$config`
tbd.
