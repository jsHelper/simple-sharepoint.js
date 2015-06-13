cache = {
    _setCookie: function (key, value) {
        var expires = new Date();
        var val = JSON.stringify(value);
        expires.setTime(expires.getTime() + (1 * 60 * 60 * 1000));
        document.cookie = key + '=' + val + ';expires=' + expires.toUTCString();
    },
    _getCookie: function (key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        var value = keyValue ? keyValue[2] : null;
        if (!value)
            return null;
        return JSON.parse(value);
    },
    _setSessionCache: function (key, value) {
        var val = JSON.stringify(value);
        sessionStorage.setItem(key, val);
    },
    _getSessionCache: function (key) {
        var value = sessionStorage.getItem(key);
        if (!value)
            return null;
        return JSON.parse(value);
    },
    _clearSessionCache: function () {
        sessionStorage.clear();
    },
    set: function (key, value) {
        /// <summary>Use session storage or cookie on legacy browsers to store object by key.</summary>
        /// <param name="key" type="String">Key to access the stored value.</param>
        /// <param name="value" type="Object">Obect which should be stored.</param>
        key = sspjs.config.cachePrefix + '_' + key;

        value = {
            val: value,
            created: Date.now()
        };

        if (!sessionStorage || !sessionStorage.setItem) {
            sspjs.cache._setCookie(key, value);
        } else {
            sspjs.cache._setSessionCache(key, value);
        }
    },
    get: function (key) {
        /// <summary>Use session storage or cookie on legacy browsers to get object by key.</summary>
        /// <param name="key" type="String">Key to access the stored value.</param>
        /// <returns type="Object">The object.</returns>

        var value = null, data = null, created, now = Date.now();

        if (!sspjs.config.doCache)
            return null;
        key = sspjs.config.cachePrefix + '_' + key;
        if (!sessionStorage || !sessionStorage.getItem)
            value = sspjs.cache._getCookie(key);
        else {
            value = sspjs.cache._getSessionCache(key);
        }

        if (!value || !value.val)
            return null;

        created = value.created;
        data = value.val;

        // check expiration after 5 Minutes (per default)
        if (now - created > 1000 * 60 * sspjs.config.cacheExpires) {
            return null;
        }
        return data;
    },
    clear: function () {
        if (sessionStorage && sessionStorage.setItem)
            sspjs.cache._clearSessionCache();
    }
}