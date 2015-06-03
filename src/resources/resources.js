resources = {
    default: {},
    init: function (defaultResources) {
        /// <summary>Initialize resource dictionary with default language key value pairs object.</summary>
        /// <param name="defaultResources" type="Dictionary">Key value pairs object.</param>
        $sspjs.resources.default = defaultResources;
    },
    add: function (language, key, value) {
        /// <summary>Add a key value pair to the specified language dictionary.</summary>
        /// <param name="language" type="string">Language identifier (f.e. 'de-DE', 'en-US', ...).</param>
        /// <param name="key" type="string">Access key of the translation.</param>
        /// <param name="value" type="string">Text value.</param>
        if (!$sspjs.resources[language])
            $sspjs.resources[language] = {};
        $sspjs.resources[language][key] = value;
    },
    getText: function (key, language) {
        /// <summary>Get the translated text in the current language or a specified language.</summary>
        /// <param name="key" type="string">Text identifier key.</param>
        /// <param name="language" type="string">(OPTIONAL) Language identifier (f.e. 'de-DE', 'en-US', ...).</param>
        /// <returns type="string">The text.</returns>
        var dict, result = key;
        if (!language)
            language = $sspjs.config.language;
        dict = $sspjs.resources[language];
        if (!dict)
            dict = $sspjs.resources.default;
        if (dict[key] !== undefined && dict[key] !== null)
            result = dict[key];
        return result;
    }
}