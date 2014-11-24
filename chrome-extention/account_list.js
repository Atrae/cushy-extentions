var AccountList = function(){
  this.url;
  this.loginId;
  this.password;
}

AccountList.prototype = {
  login: function(){
    var _self = this;
    chrome.tabs.create({ 'url': _self.url }, function(tab){
      chrome.runtime.sendMessage({ action: "autoLogin", loginData: _self });
    });
  },
  input: function(){
    chrome.runtime.sendMessage({ action: "analogLogin", loginData: this });
  }
}
