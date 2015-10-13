url = {
    queryString: function (key) {
        if (!JSRequest)
            throw new Exception("JSRequest object was not found.")

        JSRequest.EnsureSetup();
        return JSRequest.QueryString[key];
    },
    getParameter: function (key) {
      var sPageURL = decodeURIComponent(window.location.search.substring(1)),sURLVariables = sPageURL.split('&'),sParameterName,i;
      for (i = 0; i < sURLVariables.length; i++) {
          sParameterName = sURLVariables[i].split('=');

          if (sParameterName[0] === key) {
              return sParameterName[1] === undefined ? true : sParameterName[1];
          }
      }
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
