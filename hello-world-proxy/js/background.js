(function() {
    chrome.webRequest.onAuthRequired.addListener(
        function(details, callbackFn) {
            callbackFn({
                authCredentials: {
                    username: 'jerlala@163.com',
                    password: 'Yy123457'
                }
            })
        }, {
            urls: ['<all_urls>']
        }, ['asyncBlocking']);

    chrome.management.onInstalled.addListener(showConflicNumbers)
    chrome.management.onEnabled.addListener(showConflicNumbers)
    chrome.management.onDisabled.addListener(showConflicNumbers)
    chrome.management.onUninstalled.addListener(showConflicNumbers)
    showConflicNumbers();
})()