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

##### Get Fields
```javascript
$sspjs.run(function($sp){ 
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
$sspjs.run(function($sp){ 
  $sp.getListItemsAsync('Tasks').done(function(items){
    /* returns all list items from the list called 'Tasks' */
  });
  
  // f.e. data of the first item
  var id = items[0].get_id();
});
```
###### Additional fields
```javascript
$sspjs.run(function($sp){ 
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
$sspjs.run(function($sp){ 
  var viewXML = '<View><Query><OrderBy><FieldRef Name="Modified" Ascending="FALSE"/></OrderBy></Query></View>';
  $sp.getListItemsAsync('Tasks', ['Title', 'Description'], viewXML).done(function(items){
    /* returns all list items from the list called 'Tasks' ordered by Modified date */
  });
});
```
###### Limit the results
```javascript
$sspjs.run(function($sp){ 
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
$sspjs.run(function($sp){ 
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
$sspjs.run(function($sp){ 
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
$sspjs.run(function($sp){ 
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
$sspjs.run(function($sp){ 
  $sp.deleteListItemAsync('Tasks', 1).done(function(item){
    /* deleted the item with the id: 1 */
    /* returns the id of the deleted item from the list called 'Tasks'  */
  });
});
```
#### `$resources`
tbd.
#### `$logger`
tbd.
#### `$cache`
tbd.
#### `$config`
tbd.
