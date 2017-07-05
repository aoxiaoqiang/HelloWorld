chrome.webRequest.onAuthRequired.addListener(
  function(details, callbackFn) {
    console.log(details)
    callbackFn({
      authCredentials: {
        username: 'jerlala@163.com',
        password: 'Yy123457'
      }
    })
  }, {
    urls: ['<all_urls>']
  }, ['asyncBlocking'])