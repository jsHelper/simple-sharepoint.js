notify = {
    show: function (message) {
        SP.UI.Notify.addNotification(message, false);
    },
    addStatus: function (options) {
        if (!options.color) {
            options.color = 'yellow';
        }
        var statusID = SP.UI.Status.addStatus(options.title, options.message);
        SP.UI.Status.setStatusPriColor(statusID, options.color);
        return statusID;
    },
    removeStatus: function (id) {
        if (id) {
            SP.UI.Status.removeStatus(id);
        }
    },
    removeAllStatus: function () {
        SP.UI.Status.removeAllStatus(true);
    }
}