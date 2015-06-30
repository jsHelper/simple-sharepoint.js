dialog = {
    openModalDialogAsync: function (url) {
        var dfd = new $.Deferred();
        var options = SP.UI.$create_DialogOptions();
        options.url = url;
        options.dialogReturnValueCallback = Function.createDelegate(sspjs.sp, function (dialogResult, returnValue) {
            if (dialogResult == SP.UI.DialogResult.OK)
                dfd.resolve(returnValue);
            else
                dfd.reject(returnValue);
        });
        SP.UI.ModalDialog.showModalDialog(options);
        return dfd.promise();
    },
    closeModalDialog: function (returnValue) {
        window.frameElement.commitPopup(returnValue);
    }
}