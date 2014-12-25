var Account = function () {
  this.loginId;
  this.loginElementName;
  this.password;
  this.passwordElementName;
  this.domain;
  this.formData;
  this.tabId;
  this.type;
  this.url;
  this.groupId;
}

Account.prototype = {
  setFromRequest: function (request) {
    this.type = request.action;
    this.loginElementName = request.loginIdElementName;
    this.passwordElementName = request.passwordElementName;
    this.url = request.url;
  },
  clear: function () {
    this.loginId = null;
    this.password = null;
    this.domain = null;
    this.formData = null;
    this.tabId = null;
    this.type = null;
    this.url = null;
    this.groupId = null;
  },
  checkUseElementName: function () {
    var result = false;
    if (this.type === 'signIn' || (tempData.type === 'signUp' && this.passwordElementName )) {
      result = true;
    }
    return result
  },
  setLoginId: function (loginId) {
    if (this.loginElementName) {
      this.loginId = loginId;
    }
  },
  setPassword: function (password) {
    if (this.passwordElementName) {
      this.password = password;
    }
  },
  setUrl: function (client) {
    url = (this.type === "signUp")? client.beforeUrl : client.url;
    this.domain = client.domain;
    this.url = url;
  },
  checkOpenDialogBox: function () {
    var result = false;
    if (this.domain && this.loginId && this.password) {
      result = true;
    }
    return result;
  },
  save: function (data) {
    var storageAccounts = {};
    storageAccounts['accounts'] = data;
    chrome.storage.local.set(storageAccounts, function (result) {
      if(chrome.extension.lastError !== undefined) {
        console.log('failed');
      }else{
        console.log('ok!save');
      }
    });
  },
  updateUrl: function (domain, url) {
    var storageData = {};
    var _self = this;
    chrome.storage.local.get(["accounts"], function (result) {
      var accountInfos = result["accounts"][domain];
      accountInfos = (accountInfos === undefined || accountInfos === null)? [] : accountInfos
      for (var i=0, len=accountInfos.length; i < len; i++) {
        accountInfos[i].url = url;
      }
      storageData[domain] = accountInfos;
      _self.save(storageData);
    });
  }
}
