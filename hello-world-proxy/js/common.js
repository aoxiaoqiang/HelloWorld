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
        title: 'Notice title',
        message: 'Notice info.',
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
$('.openTabLink').on('click', function(e) {
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


// 屏蔽鼠标右键
document.oncontextmenu = function() {
    return false;
}

// 冲突插件检测
var Conflictor = {
    // 获取所有冲突插件
    getConflict: function(cb) {
        var selfId = chrome.runtime.id;
        var extensions = [];
        // 获取所有浏览器安装程序
        chrome.management.getAll(function(apps) {
            $.each(apps, function(index, item) {
                if (item.enabled && item.type == 'extension') {
                    $.each(item.permissions, function(i, t) {
                        if (t == 'proxy' && item.id != selfId) {
                            console.log(item)
                            extensions.push(item);
                        }
                    })
                }
            })
            cb(extensions);
        });
    },
    // 根据id禁用插件
    disabled: function(id, name) {
        chrome.management.setEnabled(id, false, function() {
            showChromeNotifications({
                title: 'Chrome插件禁用提醒',
                message: '"' + name + '" 插件禁用成功!',
            });
        })
    },
    // 根据id卸载插件
    uninstall: function(id, name) {
        chrome.management.uninstall(id, function() {
            showChromeNotifications({
                title: 'Chrome插件卸载提醒',
                message: '"' + name + '" 插件卸载成功!',
            });
        })
    }
}

// 冲突插件个数提示
function showConflictTips(number) {
    chrome.browserAction.setBadgeText({
        text: number.toString()
    })
    chrome.browserAction.setBadgeBackgroundColor({
        color: [250, 46, 0, 200]
    })
}

// 检测展示冲突数量
function showConflicNumbers() {
    Conflictor.getConflict(function(extensions) {
        console.log(extensions)
        var num = extensions.length;
        if (num === 0) {
            num = '';
        }
        showConflictTips(num);
    })
}