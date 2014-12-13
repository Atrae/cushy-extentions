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
  sendMsg: function(msg, data, callbackFunc){
    var _msg = (msg)? msg : this.msg;
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(_msg, data);
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
      var userInfo = safari.extension.secureSettings.userInfo;
      if(userInfo && userInfo.userId && userInfo.apiKey){
        var request = new XMLHttpRequest();
        var params = "user_id="+userInfo.userId+"&api_key="+userInfo.apiKey;
        request.open("GET", "http://localhost:3000/api/v1/items?"+params, true);
        request.onreadystatechange = function () {
          if(request.readyState != 4 || request.status != 200){
            // fail function
          }else{
            var data = JSON.parse(request.responseText);
            importAccountsFromServer(data['accounts']);
            importGroupsFromServer(data['groups']);
            _self.lastUpdatedAt = new Date();
          }
        }
        request.send();
      }
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
  safari.extension.secureSettings.accounts = storageData;
}

function importGroupsFromServer(groups){
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
  safari.extension.secureSettings.groups = storageData;
}
