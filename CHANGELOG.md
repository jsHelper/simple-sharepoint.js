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