var Client = ( function(){

  this.tabId;
  this.domain;
  this.url;
  this.beforeUrl; //for_signup
  this.openDialogFlg = false;
  this.msg;
  this.lastUpdatedAt;

  var storage = require("sdk/simple-storage").storage;

  var Request = require("sdk/request").Request;

  this.updateUrl = function(url){
    this.beforeUrl = this.url;
    this.url = String(url).replace(/\?(.+)/, "");
    this.domain = String(url).replace(/http(s)?:\/\//, "").split('/')[0];
  }
  this.toOpenDialog = function(){
    this.openDialogFlg = true;
  }
  this.toCloseDialog = function(){
    this.openDialogFlg = false;
  }
  this.sendMsg = function(msg, callbackFunc){
    var _msg = (msg)? msg : this.msg;
    chrome.tabs.sendMessage(this.tabId, _msg, callbackFunc);
    this.msg = null;
  }
  this.checkRegisterDialog = function(tempData){
    return (tempData.tabId === this.tabId && tempData.password != '' && tempData.password != null && this.openDialogFlg === true && tempData.url != undefined )? true : false;
  }
  this.updateStorageData = function(analogFlg){
    var tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes()-10);
    var _self = this;
    if(_self.lastUpdatedAt === undefined || _self.lastUpdatedAt < tenMinutesAgo || analogFlg === true){
      if(storage["userInfo"]){
        var result = storage;
        var params = "user_id="+result['userInfo'].userId+"&api_key="+result['userInfo'].apiKey
        Request({
          url: "https://cushy-staging.herokuapp.com/api/v1/items?"+params,
          onComplete: function (response) {
            if(response.json["result"] === true){
              var data = response.json;
              importAccountsFromServer(data['accounts'], storage);
              importGroupsFromServer(data['groups'], storage);
              _self.lastUpdatedAt = new Date();
            }
          }
        }).get();
      }
    }
  }
  return this;
}());

exports.Client = Client;

function importAccountsFromServer(accounts, storage){
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
  storage['accounts'] = storageData;
}

function importGroupsFromServer(groups, storage){
  var storageData = {};
  groups.forEach(function(group){
    var name = group.name;
    storageData[name] = (storageData[name])? storageData[name] : [];
    storageData[name].push({
      'id': group.id,
      'company_id': group.company_id,
      'company_name': (group.company_name)? group.company_name : 'Private'
    });
  });
  storage['groups'] = storageData;
}
