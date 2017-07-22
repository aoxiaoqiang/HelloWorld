var extensionId = chrome.runtime.id; // extension id
var proxy = new ChromeProxy();

var customRules = getStorage('customRules') || [];

$('#textVersion').text(' v' + chrome.runtime.getManifest().version)

// 初始化数据
$('#lineInfo').val(getStorage('lineInfo') || '')
$("[name='my-checkbox']").bootstrapSwitch('state', getStorage('state') || false);
if (getStorage('state')) {
    activeIcon();
} else {
    grayIcon()
}

// debug mode
if (getStorage('debug') && getStorage('debug') == true) {
    $('.debug-line').show();
}

// 输入存储,每次修改时关闭连接
$('#lineInfo').change(function() {
    setStorage('lineInfo', $(this).val())
})

// 加速开关
$('input[name="my-checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
    setStorage('state', state);
    log(state)
    handleConnect(state)
});

// 编辑线路信息
$('#editLine').click(function() {
    var isDisabled = $('#lineInfo').prop('disabled');
    log(isDisabled)
    if (isDisabled) {
        $('#lineInfo').prop('disabled', false).focus();
        $(this).removeClass('btn-primary').addClass('btn-danger')
            .text('保存线路信息');

        // 开启连接
        handleConnect(false);
    } else {
        $('#lineInfo').prop('disabled', true);
        $(this).removeClass('btn-danger').addClass('btn-primary')
            .text('编辑线路信息');
        // 开启连接
        handleConnect(true);
    }
})

// 处理连接控制
function handleConnect(state) {
    if (state) {
        if ($('#lineInfo').val().trim()) {
            setStorage('lineInfo', $('#lineInfo').val())
            proxy.set(getStorage('lineInfo'))
        } else {
            if (getStorage('lineInfo')) {
                $('#lineInfo').val(getStorage('lineInfo'))
                proxy.set(getStorage('lineInfo'))
            } else {
                log('error')
            }
        }
        setStorage('state', state)
        $("[name='my-checkbox']").bootstrapSwitch('state', state);

        $('#lineInfo').prop('disabled', true);
        $('#editLine').removeClass('btn-danger').addClass('btn-primary')
            .text('编辑线路信息');
    } else {
        proxy.close();
        setStorage('state', false)
        $("[name='my-checkbox']").bootstrapSwitch('state', false);
    }
}

// 解析线路信息
function parseLineInfo(str) {
    var line = {};
    try {
        var tpmData = str.split(' ');
        line.protocal = tpmData[0];
        line.ip = tpmData[1].split(':')[0];
        line.port = tpmData[1].split(':')[1];
        line.state = (getStorage('state') || false);
        return line;
    } catch (e) {
        return 'error'
    }
}

initURLstatus();

// 处理线路URL添加
function initURLstatus() {
    var $this = $('#btnHandleURL');
    chrome.tabs.query({
        currentWindow: true,
        'active': true
    }, function(tabs) {
        var domain = getDomain(tabs[0].url);
        if (domain == false) {
            $this.text('当前地址不可添加');
            $('.icon-box .glyphicon-ban-circle').parent().show();
            $this.button('reset');
        } else {
            //URL parse correctly
            isInFav(domain);
        }
    });

    // 是否在当前列表
    function isInFav(domain) {
        $this.text(domain);
        var isIn = '';
        $.get('../js/rules.json', function(res) {
            // is in system
            var localRules = JSON.parse(res);
            for (var i = 0; i < localRules.length; i++) {
                if (localRules[i] == domain) {
                    isIn = 'sys';
                    break;
                }
            }

            // glyphicon-minus-sign
            // glyphicon-ban-circle
            // glyphicon-plus-sign
            log('----' + isIn)
            if (isIn == 'sys') {
                // sys not
                $this.text('系统URL无法删除');
                $('.icon-box .glyphicon-ban-circle').parent().show();
                $this.css('cursor', 'not-allowed');
            } else {
                if (getStorage('customRules') && getStorage('customRules').length > 0) {
                    var cusFav = getStorage('customRules');
                    var indexURL = 0;
                    for (var i = 0; i < cusFav.length; i++) {
                        indexURL = i;
                        if (cusFav[i] == domain) {
                            isIn = 'cus';
                            break;
                        }
                    }

                    // 方法处理
                    if (isIn == 'cus') {
                        // del
                        $('.icon-box .glyphicon-minus-sign').parent().show();
                        $('#btnHandleURL').click(function(e) {
                            e.preventDefault();
                            cusFav.splice(indexURL, 1);
                            setStorage('customRules', cusFav);
                            handleConnect(true);
                            location.reload();
                        })
                        // cusFav.splice(indexURL, 1);
                        // setStorage('customRules', cusFav);
                    } else {
                        // add
                        $('.icon-box .glyphicon-plus-sign').parent().show();
                        $('#btnHandleURL').click(function(e) {
                            e.preventDefault();
                            cusFav.push(domain);
                            setStorage('customRules', cusFav);
                            handleConnect(true);
                            location.reload();
                        })
                        // cusFav.push(domain);
                        // setStorage('customRules', cusFav);
                    }
                } else {
                    // add
                    $('.icon-box .glyphicon-plus-sign').parent().show();
                    $('#btnHandleURL').click(function(e) {
                        e.preventDefault();
                        var tmpArr = [];
                        tmpArr.push(domain);
                        log(tmpArr);
                        setStorage('customRules', tmpArr);
                        handleConnect(true);
                        location.reload();
                    })
                    // setStorage('customRules', domain);
                }
            }
        });
    }
}

/**
 * ======辅助按钮组功能========*
 */

 // 打开 Chrome 扩展程序中心
 $('#btnOpenChromeExtensionDev').click(function() {
     openTab('chrome://extensions/', true);
 });

// 获取当前线路信息
$('#getInfo').click(function(e) {
    e.preventDefault();
    if (getStorage('lineInfo')) {
        var line = parseLineInfo(getStorage('lineInfo'));
        if (line != 'error') {
            var strHtml = '';
            strHtml += '<p class="field"><span>连接状态: </span>' + (line.state == true ? 'Connected' : 'Disconnected') + '</p>';
            strHtml += '<p class="field"><span>协议: </span>' + line.protocal + '</p>';
            strHtml += '<p class="field"><span>主机地址: </span>' + line.ip + '</p>';
            strHtml += '<p class="field"><span>端口号: </span>' + line.port + '</p>';

            $('#myModal .modal-body').html(strHtml)
        } else {
            $('#myModal .modal-body').html('线路信息有误，请检查线路格式是否正确。正确的行格式:<b> HTTP 127.0.0.1:80 </b>，注意检查是否包含不符合要求的空格。')
        }
    } else {
        $('#myModal .modal-body').html('暂无线路信息!')
    }
    $('#myModal').modal();
})

// 打开调试窗口
$('#newTab').click(function() {
    if (getStorage('debug')) {
        openTab(location.href, true);
    } else {
        $('#myModal .modal-body').html('请打开调试模式，然后使用这个函数!打开调试模式方法:“关于” -> “调试模式”。');
        $('#myModal').modal();
    }
});

// 获取更多线路信息
$('#getMoreLine').click(function(e) {
    e.preventDefault();
    try {
        log(proQiong.get())
        var lines = proQiong.get();
        var strHtml = '';
        for (var i = 0; i < lines.length; i++) {
            strHtml += '<div class="line-box">';
            strHtml += '<p><span>' + lines[i]['name'] + ': </span><br/>' + lines[i]['position'] + '</p>';
            strHtml += '</div>';
        }
        $('#myModal .modal-body').html(strHtml);
    } catch (e) {
        $('#myModal .modal-body').html('获取线路信息失败，请联系开发者!')
    }
    $('#myModal').modal();
})

// 获取更多线路信息2
$('#getMoreLine2').click(function(e) {
    e.preventDefault();
    try {
        log(proSuperVPN.get())
        var lines = proSuperVPN.get();
        var strHtml = '';
        for (var i = 0; i < lines.length; i++) {
            strHtml += '<div class="line-box">';
            strHtml += '<p><span>' + lines[i]['name'] + ': </span><br/>' + lines[i]['position'] + '</p>';
            strHtml += '</div>';
        }
        $('#myModal .modal-body').html(strHtml);
    } catch (e) {
        $('#myModal .modal-body').html('获取线路信息失败，请联系开发者!')
    }
    $('#myModal').modal();
})

// 重置插件线路信息
$('#btnResetPlugin').click(function(e) {
    e.preventDefault();
    window.localStorage.clear();
    proxy.close(function() {
        $('#myModal .modal-body').html('插件数据重置成功，请重新输服务器信息！');
        $('#myModal').modal();
        $('#myModal').on('hidden.bs.modal', function(e) {
            location.reload();
        })
    });
})

// 禁用插件
$('#btnDisabledPlugin').click(function(e) {
    e.preventDefault();
    chrome.management.setEnabled(extensionId, false, function() {
        // disabled extension
    })
})

// 关于
$('#btnAbout').click(function(e) {
    e.preventDefault();

    $('#myModal .modal-body').html('&nbsp;&nbsp;&nbsp;&nbsp;此插件仅供交流学习使用，如果您在使用过程中有问题或更好地建议可以及时联系我们。知识无国界，希望大家能共同成长、共同进步。<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;如果您觉得我们做的不错可以小小的<u class="about-pay">支持一下</u>，有了您的支持我们会走的更远！<br/><br/>联系我们<br/>QQ: <a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin=2310005831&site=qq&menu=yes">2310005831</a><br/>Email: <a href="mailto:aoxiaoqiang@163.com?subject=The%20extension%20of%20the%20feedback&body=The%20body%20of%20the%20email" id="openEmail">aoxiaoqiang@163.com</a><br/><br/><div class="debugger"><label><input type="checkbox" ' + (getStorage('debug') ? 'checked="checked"' : '') + 'id="debugMode"> 调试模式</label></div>');
    // open email tab
    $('#openEmail').click(function(e) {
        e.preventDefault();
        openTab($(this).attr('href'), true);
    })

    // pay
    $('.about-pay').click(function() {
        $('#myModal').modal('hide');
        setTimeout(function() {
            payModel('alipay');
        }, 400)
    })

    // toggle debug mode
    $('#debugMode').change(function(e) {
        setStorage('debug', $(this).prop('checked'))
        if ($(this).prop('checked')) {
            $('.debug-line').show();
        } else {
            $('.debug-line').hide();
        }
    })
    $('#myModal').modal();
})

// alipay pay
$('#btnSupport-alipay').click(function(e) {
    e.preventDefault();
    payModel('alipay');
})


// wechat payge
$('#btnSupport-wechat').click(function(e) {
    e.preventDefault();
    payModel('wechat');
})

// pay ways
function payModel(type) {
    $('#myModal .modal-body').html('<img class="pay-img" src="../images/pay/' + type + '.jpg" alt="" />');

    $('#myModal').modal();
}

// 冲突插件检测
Conflictor.getConflict(function(extensions) {
    if (extensions.length === 0) {
        // 没有冲突插件
        log('success');
    } else {
        // 有冲突插件
        // console.log(extensions)
        var conflicStr = '';
        conflicStr += '<div class="modal-conflict"><h3 class="conflict-title text-center text-danger">冲突列表</h3>';
        conflicStr += '<div class="conflict-cont">';
        conflicStr += '<div class="conflict-info text-danger">说明：冲突插件会导致当前插件无法使用, 请及时处理！</div>';

        for (var i = 0; i < extensions.length; i++) {
            var item = extensions[i];
            conflicStr += '<div class="conflict-item hint--top  hint--medium hint--bounce" data-hint="'+ item.name +'">';
            // conflicStr += '<span>"'+ item.name +'"</span>'
            conflicStr += '<span class="main-info"><img src="'+ item.icons[item.icons.length - 1].url +'" alt="'+ item.name + '"/></span>';
            conflicStr += '<div class="btns-box">';
            conflicStr += '<button class="btn btn-sm btn-primary btn-disabled-extension" data-id="'+ item.id +'" data-name="'+ item.name +'">禁用</button>';
            conflicStr += '<button class="btn btn-sm btn-danger btn-uninstall-extension" data-id="'+ item.id +'" data-name="'+ item.name +'">卸载</button>';
            conflicStr += '</box>'
            conflicStr += '</div>';
            conflicStr += '</div>';
        }
        conflicStr += '</div>';
        conflicStr += '</div>';
        $('#myModal .modal-body').html(conflicStr);

        // 禁用事件
        $('.btn-disabled-extension').on('click', function(){
          var data = $(this).data();
          Conflictor.disabled(data.id, data.name);
          $(this).parents('.conflict-item').remove();
          showConflicNumbers();
          if($('.conflict-item').length === 0){
            $('#myModal').modal('hide');
          }
        })

        // 卸载事件
        $('.btn-uninstall-extension').on('click', function(){
          var data = $(this).data();
          Conflictor.uninstall(data.id, data.name);
          $(this).parents('.conflict-item').remove();
          showConflicNumbers();
          if($('.conflict-item').length === 0){
            $('#myModal').modal('hide');
          }
        })

        $('#myModal').modal({
          backdrop: 'static',
          keyboard: false
        });
    }
})