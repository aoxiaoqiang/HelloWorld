var config_parm = {
  icon_active_url: '../images/logo.png',
  icon_gray_url: '../images/logo_gray.png'
};

/*
 * 控制台输出日志
 * @param {object} obj 输出对象
 */
function log(obj) {
  if (getStorage('debug') && getStorage('debug') == true) {
    console.log(obj);
  }
}

/*
 * 本地存储相关数据
 * @param {string} string 字段名
 * @param {object} value  值
 */
function setStorage(key, value) {
  window.localStorage[key] = JSON.stringify(value);
}

/*
 * 根据key值获取本地存储信息
 * @param {string} key 存储字段名
 */
function getStorage(key) {
  var json = null;
  if ("undefined" !== typeof window.localStorage[key]) {
    json = JSON.parse(window.localStorage[key]);
  }
  return json;
}

/*
 * 根据key值，清除本地存储信息
 * @param {string} key 存储字段名
 */
function clearStorage(key) {
  window.localStorage.removeItem(key);
}

/**
 * 调用chrome.notifications进行消息提示
 * @param {Object} msg
 * @param {function}    callback 回调方法
 */
function showChromeNotifications(msg, callback) {
  msg = msg || {
    id: 'checkUserToken',
    title: 'Notice',
    message: 'notice info.',
  };
  var creationCallback = callback || function() {};
  var options = {
    type: 'basic', //Property 'type': Value must be one of: [basic, image, list, progress]
    title: msg.title,
    iconUrl: config_parm.icon_active_url,
    message: msg.message
  };
  chrome.notifications.create(msg.id, options, creationCallback);
}

/*
 * 打开页面
 * @param {string} url
 * @param {boolean} selected    是否切换到新开的选项卡
 */
function openTab(url, selected) {
  chrome.tabs.create({
    url: url,
    selected: selected
  })
}

// 链接开启新Tab
$('.openTabLink').click(function(e) {
  e.preventDefault();
  openTab($(this).attr('href'), true);
})

// get domain
function getDomain(url) {
  if (url.indexOf('chrome-extension://') != -1 || url.indexOf('chrome://') != -1) {
    return false
  } else {
    url = url.indexOf('://') > -1 ? url.split('/')[2] : url.split('/')[0];
    url = url.split(':')[0];
    url = url.split('.');
    var len = url.length;
    if (len === 2) {
      return url.join('.');
    } else {
      return url[len - 2] + '.' + url[len - 1];
    }
  }
}

/*
 * 置灰图标
 */
function grayIcon() {
  chrome.browserAction.setIcon({
    path: config_parm.icon_gray_url
  })
}

/*
 * 激活图标
 */
function activeIcon() {
  chrome.browserAction.setIcon({
    path: config_parm.icon_active_url
  });
}
