url = {
    queryString: function (key) {
        if (!JSRequest)
            return null;

        JSRequest.EnsureSetup();
        return JSRequest.QueryString[key];
    },
    getParameter: function (key, url) {
        if (!GetUrlKeyValue)
            return null;
        if (!url)
            return GetUrlKeyValue(key);
        return GetUrlKeyValue(key, false, url);
    },
    escape: function (text) {
        if (!escapeProperly)
            return text;
        return escapeProperly(text);
    },
    unescape: function (text) {
        if (!unescapeProperly)
            return text;
        return unescapeProperly(text);
    }
}