var ChromeProxy = function() {}

// 开启代理模式
ChromeProxy.prototype.set = function(url) {
  /*
  外遇    ->  https://cdn.lubotv.com/list.js
  超级VPN ->  http://api.chrome.shicishe.com/vspn/vspn_get_list
  穹顶穿越 -> https://www.tianyantong.xyz/tyt/plug/plugUser/getUserLine
   */
  $.get('../js/rules.json', function(res) {
    var localRules = JSON.parse(res);
    var customRules = getStorage('customRules');
    var pacScriptStr = "var FindProxyForURL = function(url, host) {\
          var D = 'DIRECT';\
          var P = '" + url + "';\
          if (shExpMatch(host, '10.[0-9]+.[0-9]+.[0-9]+')) return D;\
          if (shExpMatch(host, '172.[0-9]+.[0-9]+.[0-9]+')) return D;\
          if (shExpMatch(host, '192.168.[0-9]+.[0-9]+')) return D;\
          if (shExpMatch(host, '127.[0-9]+.[0-9]+.[0-9]+')) return D;\
          if (dnsDomainIs(host, 'localhost')) return D;\
          if (dnsDomainIs(host, 'lubotv.com')) return D;\
          if (dnsDomainIs(host, 'shicishe.com')) return D;\
          if (dnsDomainIs(host, 'tianyantong.xyz')) return D;";
    for (var i = 0; i < localRules.length; i++) {
      pacScriptStr += "if (dnsDomainIs(host, '" + localRules[i] + "')) return P;";
    }

    log(customRules);
    // customer
    if (customRules && customRules.length > 0) {
      for (var i = 0; i < customRules.length; i++) {
        pacScriptStr += "if (dnsDomainIs(host, '" + customRules[i] + "')) return P;";
      }
    }

    pacScriptStr += 'return D;';
    pacScriptStr += '}';

    log(pacScriptStr)
    chrome.proxy.settings.set({
      value: {
        mode: "pac_script",
        pacScript: {
          data: pacScriptStr
        }
      },
      scope: "regular"
    }, function() {
      activeIcon();
      log('ok')
    })
  })




};

// 关闭代理
ChromeProxy.prototype.close = function(callback) {
  chrome.proxy.settings.set({
    value: {
      mode: "pac_script",
      pacScript: {
        data: 'function FindProxyForURL(url, host){ return "DIRECT";}'
      }
    },
    scope: 'regular'
  }, function() {
    grayIcon();
    log('closed');
    if ((typeof callback) === 'function') {
      callback();
    }
  });
};
