dialog = {
    open: function (url) {

        if (!SP || !SP.UI || !SP.UI.DialogResult)
            throw "No SP dialog objects found";

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
    close: function (returnValue) {
        window.frameElement.commitPopup(returnValue);
    }
}