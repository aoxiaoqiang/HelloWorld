var extensionId = chrome.runtime.id; // extension id
var proxy = new ChromeProxy();

var customRules = getStorage('customRules') || [];

// 初始化数据
$('#lineInfo').val(getStorage('lineInfo') || '')
$("[name='my-checkbox']").bootstrapSwitch('state', getStorage('state') || false);
if (getStorage('state')) {
  activeIcon();
} else {
  grayIcon()
}

// debug mode
if(getStorage('debug') && getStorage('debug') == true){
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
      .text('Save the Line Info');

    // 开启连接
    handleConnect(false);
  } else {
    $('#lineInfo').prop('disabled', true);
    $(this).removeClass('btn-danger').addClass('btn-primary')
      .text('Edit the Line Info');
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
      .text('Edit the Line Info');
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
  chrome.tabs.query({ 'active': true }, function(tabs) {
    var domain = getDomain(tabs[0].url);
    if (domain == false) {
      $this.text('Not support operations.');
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
        $this.text('System proxy URL');
        $('.icon-box .glyphicon-ban-circle').parent().show();
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
            $('#btnHandleURL').click(function(e){
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
            $('#btnHandleURL').click(function(e){
              e.preventDefault();
              cusFav.push(domain);
              setStorage('customRules', cusFav);
              handleConnect(true);
              location.reload();
            })
            // cusFav.push(domain);
            // setStorage('customRules', cusFav);
          }
        }else{
          // add
          $('.icon-box .glyphicon-plus-sign').parent().show();
          $('#btnHandleURL').click(function(e){
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
// 获取当前线路信息
$('#getInfo').click(function(e) {
  e.preventDefault();
  if (getStorage('lineInfo')) {
    var line = parseLineInfo(getStorage('lineInfo'));
    if (line != 'error') {
      var strHtml = '';
      strHtml += '<p class="field"><span>Status: </span>' + (line.state == true ? 'Connected' : 'Disconnected') + '</p>';
      strHtml += '<p class="field"><span>Protocal: </span>' + line.protocal + '</p>';
      strHtml += '<p class="field"><span>URL: </span>' + line.ip + '</p>';
      strHtml += '<p class="field"><span>Port: </span>' + line.port + '</p>';

      $('#myModal .modal-body').html(strHtml)
    } else {
      $('#myModal .modal-body').html('Line analytical failure information, please check the line format is correct.The correct line format: <b>HTTP 127.0.0.1:80</b>, pay attention to check whether contains does not conform to the requirements of space.')
    }
  } else {
    $('#myModal .modal-body').html('No agent line information!')
  }
  $('#myModal').modal();
})

// 打开调试窗口
$('#newTab').click(function() {
  if (getStorage('debug')) {
    openTab(location.href, true);
  } else {
    $('#myModal .modal-body').html('Please open the debug mode, then use this function!Open the debug mode method: about -> debug mode.');
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
    $('#myModal .modal-body').html('Failed to get the information!')
  }
  $('#myModal').modal();
})

// 重置插件线路信息
$('#btnResetPlugin').click(function(e) {
  e.preventDefault();
  window.localStorage.clear();
  proxy.close(function() {
    $('#myModal .modal-body').html('Reset data success!');
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

  $('#myModal .modal-body').html('The program for the exchange of learning how to use only, not for commercial use!<br/><br/>Contact:<br/>QQ: <a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin=2310005831&site=qq&menu=yes">2310005831</a><br/>Email: <a href="mailto:aoxiaoqiang@163.com?subject=The%20extension%20of%20the%20feedback&body=The%20body%20of%20the%20email" id="openEmail">aoxiaoqiang@163.com</a><br/><br/><div class="debugger"><label><input type="checkbox" ' + (getStorage('debug') ? 'checked="checked"' : '') + 'id="debugMode"> Debug mode</label></div>');
  // open email tab
  $('#openEmail').click(function(e) {
    e.preventDefault();
    openTab($(this).attr('href'), true);
  })

  // toggle debug mode
  $('#debugMode').change(function(e) {
    setStorage('debug', $(this).prop('checked'))
    if($(this).prop('checked')){
      $('.debug-line').show();
    }else{
      $('.debug-line').hide();
    }
  })
  $('#myModal').modal();
})
