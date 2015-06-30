notify = {
    show: function (message) {
        if (!SP || !SP.UI || !SP.UI.Status)
            return;

        SP.UI.Notify.addNotification(message, false);
    },
    addStatus: function (options) {
        if (!SP || !SP.UI || !SP.UI.Status)
            return;

        if (!options.color) {
            options.color = 'yellow';
        }
        var statusID = SP.UI.Status.addStatus(options.title, options.message);
        SP.UI.Status.setStatusPriColor(statusID, options.color);
        return statusID;
    },
    removeStatus: function (id) {
        if (!SP || !SP.UI || !SP.UI.Status)
            return;

        if (id) {
            SP.UI.Status.removeStatus(id);
        }
    },
    removeAllStatus: function () {
        if (!SP || !SP.UI || !SP.UI.Status)
            return;

        SP.UI.Status.removeAllStatus(true);
    }
}