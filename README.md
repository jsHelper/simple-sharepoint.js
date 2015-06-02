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

#### `$resources`
tbd.
#### `$logger`
tbd.
#### `$cache`
tbd.
#### `$config`
tbd.
