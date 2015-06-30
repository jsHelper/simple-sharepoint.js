common = {
    loginAsAnotherUser: function () {
        LoginAsAnother('\u002f_layouts\u002fAccessDenied.aspx?loginasanotheruser=true', 0);
    },
    encodeHtml: function (html) {
        if (!STSHtmlEncode)
            return html;
        return STSHtmlEncode(html);
    },
    decodeHtml: function (text) {
        if (!STSHtmlDecode)
            return text;
        return STSHtmlDecode(text);
    },
    createGUID: function () {
        if (SP && SP.Guid && SP.Guid.newGuid)
            return SP.Guid.newGuid().toString();

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
}