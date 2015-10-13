# 1.0.0 #
- Base functions

# 1.0.1 #
- Library support (document upload)
```javascript
    $sp.uploadFileAsync(libraryName, name, fileInput).done(function (item) {});
```

# 1.0.2 #
- Modal Dialog support (open / close)
```javascript
    // to call on parent page
    $sp.openModalDialogAsync(url)
        .done(function (returnValue) { /* on ok clicked */ });
        .fail(function (returnValue) { /* on cancel clicked */ });

    // to call on dialog page
    $sp.closeModalDialog(returnValue);
```

# 1.0.4 #
- Notification support (Notification / Status)
```javascript

    // simple notification (disappearing after few seconds)
    $sp.notify(message);

    // to add status to the SP status bar
    var id = $sp.addStatus({
        title: 'whatever',
        message: 'some text',
        color: 'red' / * Optional: default is green */
    });

    // to remove status
    $sp.removeStatus(id);

    // to remove all status
    $sp.removeAllStatus();
```

# 1.1.4 #
- Changed creation of the $sspjs object
- $sspjs now creates the context, no need to call .run(func)
```javascript
 $sspjs(function($sp){
    /* do something with $sp */
 });
```

# 1.1.6 #
- Some bugfixes
- Decoupled notification functions to own object

```javascript
 $sspjs(function($notify){
   var id = $notify.addStatus({
     title: 'whatever',
     message: 'some text',
     color: 'red' / * Optional: default is green */
   });
 });
```

- Decoupled dialog functions to own object

```javascript
 $sspjs(function($dialog){
   // opens a dialog with the content of the URL
   $dialog.open(url);
 });
 $sspjs(function($dialog){
   // closes the current dialog (must be called in the dialog window)
   $dialog.close();
 });
```

- Last stable version supporting SharePoint 2010

# 2.0.0 beta #
- ! Only for preview. Do not use in production environments !
- Added support to use a different jQuery object

```javascript
  // with $your_jQuery_object is the jQuery object
  $sspjs.setJQuery($your_jQuery_object);
```
or
```javascript
  // with $your_jQuery_object is the jQuery object
  $sspjs(function($sp) { } , $your_jQuery_object);
```

- Removed SharePoint 2010 support
- Removed ClientContext object relations
- Library does only use odata REST Services (SharePoint 2013)
