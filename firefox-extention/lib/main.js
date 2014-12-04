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

//var storageClient = stc.StorageClient;

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
    workers.push(worker);

    worker.on("detach", function(){
      var index = workers.indexOf(worker);
      if (index >= 0){
        workers.splice(index, 1);
      }
    });

    var domain = client.domain;

    worker.port.on("fillAccountCheck", function(elementContent) {
      var domain = client.domain;
      if(storage["accounts"] && storage["accounts"][domain]){
        worker.port.emit("fillAccount", storage["accounts"][domain]);
      }
    });

    if(autoLoginAccount){
      worker.port.emit("autoLogin", autoLoginAccount);
      autoLoginAccount = null;
    }

    worker.port.on("signIn", function(elementContent) {
      tempData.setFromRequest("signIn", elementContent);
    });

    worker.port.on("signUp", function(elementContent) {
      tempData.setFromRequest("signUp", elementContent);
    });

    worker.port.on("etc", function(elementContent) {
      tempData.type = null;
    });

    worker.port.on("dialogClose", function(elementContent){
      client.toCloseDialog();
      tempData.clear();
    });

    worker.port.on("saveAccount", function(elementContent){
      var data = elementContent.data;
      var submitType = elementContent.submitType;
      var accounts = storage["accounts"]? storage["accounts"] : [];
      var accountInfos = accounts[domain]? accounts[domain] : [];

      if(submitType === 'save'){ //save ver.
        accountInfos.push({
          'loginId': data.loginId,
          'password': data.password,
          'url': data.url
        })
      }else if(submitType === 'changePassword'){
        for(var i=0; i < accountInfos.length; i++){
          if(loginId === accountInfos[i].loginId){
            accountInfos[i].password = password;
            accountInfos[i].passwordElementName = passwordElementName;
            accountInfos[i].url = url;
          }
        }
      }

      accounts[domain] = accountInfos;

      var requestType = (submitType === 'changePassword')? 'PUT' : 'POST';
      var userInfo = storage['userInfo'];
      var account = {
        user_id: userInfo.userId, //認証方法は別途検討
        login_id: data.loginId,
        password: data.password,
        url: data.url,
        name: data.domain,
        group_id: data.groupId,
        api_key: userInfo.apiKey
      }

      Request({
        url: "https://cushy-staging.herokuapp.com/api/v1/accounts",
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        content: account,
        onComplete: function (response) {
          if(response.json["result"] === true){
            //var data = response.json;
            //importAccountsFromServer(data['accounts'], storage);
            //importGroupsFromServer(data['groups'], storage);
            client.lastUpdatedAt = new Date();
          }
        }
      }).post();
    });

      //console.log(domain);
    if(tempData.password && tempData.loginId){
      var accounts = storage["accounts"][domain];
      if(accounts){
        var type = 'openDialogBox'; // 1 is openDialogBox, 2 is confirmChangePasswordBox, 3 is nothing
        for(var i=0, len=accounts.length; i < len; i++){
          if(accounts[i].loginId === tempData.loginId){
            if(accounts[i].password === tempData.password){
              tempData.clear();
            }else{
              type = 'confirmChangePasswordBox';
            }
            //if(accounts[i].url != tempData.url) storageClient.updateUrl(domain, tempData.url);
            break;
          }
        }
        if(type === 'openDialogBox' || type === 'confirmChangePasswordBox'){
          worker.port.emit(type, {
            tempData: {
              loginId: tempData.loginId,
              password: tempData.password,
              domain: tempData.domain,
              type: tempData.type,
              url: tempData.url
            },
            groups: storage["groups"]
          });
        }
      }else{
        worker.port.emit("openDialogBox", {
          tempData: {
            loginId: tempData.loginId,
            password: tempData.password,
            domain: tempData.domain,
            type: tempData.type,
            url: tempData.url
          },
          groups: storage["groups"]
        });
      }
    }else{
      if(storage["accounts"] && storage["accounts"][domain]){
        worker.port.emit("fillAccount", storage["accounts"][domain]);
      }
    }
  }
});

var autoLoginAccount;

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

  accountLists.port.on("autoLogin", function(elementContent) {
    tabs.open(elementContent.url);
    autoLoginAccount = elementContent;
  });

　accountLists.port.on("analogLogin", function(elementContent) {
    console.log("autoLogin");
    for(var i = 0, len = workers.length; i < len; i++){
      if (workers[i].tab == tabs.activeTab){
        console.log("finish");
        workers[i].port.emit("analogLogin", elementContent);
      }
    }
  });

  accountLists.show();
}

tab.on('ready', function(){
  if(!storage["userInfo"]) openLoginForm();
  client.updateUrl(tab.url);
  client.updateStorageData();
});

var responseGetObserver =
{
 observe: function(subject, topic, data) {
    if (topic == 'http-on-examine-response') {
      if(tempData.postData && tempData.domain === client.domain){
        var password, userId, passwordFormId, mailId, nameId, loginId;
        var postDataHash = tempData.postData;
        if(tempData.loginElementName){
          tempData.loginId = postDataHash[tempData.loginElementName];

        }
        if(tempData.passwordElementName){
          tempData.password = postDataHash[tempData.passwordElementName];
        }

        if(!tempData.password && tempData.postRawData.match(/password/i)) {
          for(var key in postDataHash){
            if(!password && key.match(/"(.+)?password(.)?"/)){
              passwordFormId = key;
              password = postDataHash[key];
            }else if(key.match(/"(.+)?mail(.)?"/)){
              mailId = key;
            }else if(key.match(/"(.+)?user(.+)?id(.)?"/)){
              userId = key;
            }else if(key.match(/"(.+)?name(.+)?"/)){
              nameId = key;
            }else if(key.match(/"(.+)?login(.+)?"/)){
              loginId = key;
            }
          }
          if(password){
            tempData.password = password;
            tempData.passwordElementName = passwordFormId;
          }
          if(mailId){
            tempData.loginId = formData[mailId];
          }else if(userId){
            tempData.loginId = formData[userId];
          }else if(nameId){
            tempData.loginId = formData[nameId];
          }else if(loginId){
            tempData.loginId = formData[loginId];

          }
        }
        if(tempData.password){
          tempData.setUrl(client);
          tempData.tabId = client.tabId;
          client.toOpenDialog();
        }
      }
    }
  },
  register: function()
  {
    var observerService = Cc["@mozilla.org/observer-service;1"]
            .getService(Ci.nsIObserverService);
    observerService.addObserver(this, "http-on-examine-response", false);
  }
};
responseGetObserver.register();

var httpRequestObserver =
{
 observe: function(subject, topic, data) {
    if (topic == 'http-on-modify-request') {
      var postData = observeRequest(subject, topic, data);
      if(postData && postData != "[]"){
        var re = new RegExp(client.domain, "i");
        if(subject.originalURI.asciiSpec.match(re)){
          tempData.postData = postDateToHash(postData);
          tempData.domain = client.domain;
          tempData.postRawData = postData;
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

function postDateToHash(postData){
  var hash = {};
  var postDateArr = postData.split("&");
  for(var i = 0, len = postDateArr.length; i < len; i++){
    var keyValueArr = postDateArr[i].split("=");
    hash[keyValueArr[0]] = keyValueArr[1];
  }
  return hash;
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
