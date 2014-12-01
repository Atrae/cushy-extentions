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
        if(result['userInfo']){
          var request = new XMLHttpRequest();
          var params = "user_id="+result['userInfo'].userId+"&api_key="+result['userInfo'].apiKey
          request.open("GET", "https://cushy-staging.herokuapp.com/api/v1/items?"+params, true);
          request.onreadystatechange = function () {
            if(request.readyState != 4 || request.status != 200){
              // fail function
            }else{
              var data = JSON.parse(request.responseText);
              importAccountsFromServer(data['accounts']);
              importGroupsFromServer(data['groups']);
              _self.lastUpdatedAt = new Date();
            }
          };
          request.send();
        }
      });
    }
  }
}

function importAccountsFromServer(accounts){
  var storageData = {};
  var storageAccountData = {};
  accounts.forEach(function(account){
    var name = account.name;
    storageData[name] = (storageData[name])? storageData[name] : [];
    storageData[name].push({
      'loginId': account.login_id,
      'password': account.login_password,
      'loginUrl': account.url
    });
  });
  storageAccountData['accounts'] = storageData;
  setStorageData(storageAccountData);
}

function importGroupsFromServer(groups){
  var storageData = {};
  var storageGroupData = {};
  groups.forEach(function(group){
    var name = group.name;
    storageData[name] = (storageData[name])? storageData[name] : [];
    storageData[name].push({
      'id': group.id,
      'company_id': group.company_id,
      'company_name': (group.company_name)? group.company_name : 'Private'
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
