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
