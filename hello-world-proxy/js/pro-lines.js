// 穹顶穿越
var tjp = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ  ;/:'\"!@#$%^&*()1234567890-=+_\\][{}|<>?,./`~";
var linesUrl = 'https://cdn.lubotv.com/list.js'
var proQiong = {
  get: function() {
    var lines = {};
    $.ajax({
      url: linesUrl,
      method: 'get',
      async: false,
      data: {},
      success: function(res) {
        // console.log(res)
        lines = JSON.parse(res).serverList
      },
      error: function(res) {
        // lines = JSON.parse(res.serverList).serverList
      }
    })
    return this.handleResponse(lines)
  },
  tom: function(str) {
    if ((!str) || str == "undefined") {
      return false
    }
    var rt = "";
    for (var i = 0; i < str.length; i++) {
      for (var j = 0; j < tjp.length; j++) {
        if (str[i] == tjp[j]) { rt += j + "|" }
      }
    }
    return rt
  },
  jerry: function(str) {
    if ((!str) || str == "undefined") {
      return false
    }
    var rt = "";
    var art = str.split("|");
    if ((!art) || art == "undefined") {
      return false
    }
    art.forEach(function(e) {
      if (e && e !== "undefined") {
        var j = e;
        rt += tjp[j]
      }
    });
    return rt
  },
  handleResponse: function(ls) {
    var pLine = []
    var that = this
    $.each(ls, function(index, item) {
        item.position = that.jerry(item.position)
        pLine.push(item)
      })
      // console.log(pLine)
    return pLine
  }
}

// 超级VPN
var superLinesUrl = 'http://api.chrome.shicishe.com/vspn/vspn_get_list'
var proSuperVPN = {
  get: function() {
    var lines = {};
    $.ajax({
      url: superLinesUrl,
      method: 'get',
      async: false,
      data: {},
      success: function(res) {
        lines = (JSON.parse(res)).list
      },
      error: function(res) { log(res) }
    })
    return this.handleResponse(lines)
  },
  handleResponse: function(ls) {
    var pLine = []
    var that = this
    var pacReg = /\"(.*?)\"/g
    $.each(ls, function(index, item) {
        item.position = (item.pacScript.match(pacReg)).toString().replace(/"/g, '')
        pLine.push(item)
      })
      // console.log(pLine)
    return pLine
  }
}
