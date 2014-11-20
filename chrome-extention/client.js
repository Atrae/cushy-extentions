var Client = function(){
  this.tabId;
  this.domain;
  this.url;
  this.beforeUrl; //for_signup
  this.openDialogFlg = false;
  this.msg;
  this.lastUpdatedAt;
}

Client.prototype = {
  updateUrl: function(url){
    this.beforeUrl = this.url;
    this.url = String(url).replace(/\?(.+)/, "");
    this.domain = String(url).replace(/http(s)?:\/\//, "").split('/')[0];
  },
  toOpenDialog: function(){
    this.openDialogFlg = true;
  },
  toCloseDialog: function(){
    this.openDialogFlg = false;
  },
  sendMsg: function(msg, callbackFunc){
    var _msg = (msg)? msg : this.msg;
    chrome.tabs.sendMessage(this.tabId, _msg, callbackFunc);
    this.msg = null;
  },
  checkRegisterDialog: function(tempData){
    return (tempData.tabId === this.tabId && tempData.password != '' && tempData.password != null && this.openDialogFlg === true && tempData.url != undefined )? true : false;
  },
  updateStorageData: function(analogFlg){
    var tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes()-10);
    var _self = this;
    if(_self.lastUpdatedAt === undefined || _self.lastUpdatedAt < tenMinutesAgo || analogFlg === true){
      chrome.storage.local.get(['userInfo'], function(result){
        $.ajax({
          method: "GET",
          url : "http://localhost:3000/apis/items",
          data: {
                  userId: result['userInfo'].userId, //認証方法は別途検討
                  apiKey: result['userInfo'].apiKey
                },
          beforesend: function(){ /* do nothing */ }
        }).done(function(data ,status){
          importAccountsFromServer(data['accounts']);
          importGroupsFromServer(data['groups']);
          _self.lastUpdatedAt = new Date();
        }).fail(function(state){
          // do nothing
        });
      });
    }
  }
}

function importAccountsFromServer(accounts){
  var storageData = {};
  accounts.forEach(function(account){
    var name = account.name;
    storageData[name] = (storageData[name])? storageData[name] : [];
    storageData[name].push({
      'loginId': account.login_id,
      'password': account.login_password,
      'loginUrl': account.url
    });
  });
  setStorageData(storageData);
}

function importGroupsFromServer(groups){
  var storageData = {};
  var storageGroupData = {};
  groups.forEach(function(group){
    var name = group.name;
    storageData[name] = (storageData[name])? storageData[name] : [];
    storageData[name].push({
      'id': group.id
    });
  });
  storageGroupData['groups'] = storageData;
  setStorageData(storageGroupData);
}

function setStorageData(storageData){
  chrome.storage.local.set(storageData, function(result){
    if(chrome.extension.lastError !== undefined) {
      console.log('failed');
    }else{
      console.log('ok!save');
    }
  });
}
