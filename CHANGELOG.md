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
