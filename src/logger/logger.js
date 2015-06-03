logger = {
    log: function (message) {
        /// <summary>Log to browsers console object</summary>
        /// <param name="message" type="String">Log message.</param>
        try {
            if (console && console.log && $sspjs.config.doLogging === true)
                console.log(message);
        } catch (err) { }
    }
}