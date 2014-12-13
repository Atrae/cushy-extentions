var AccountList = function(){
  this.url;
  this.loginId;
  this.password;
}

AccountList.prototype = {
  login: function(){
    var _self = this;
    safari.application.activeBrowserWindow.openTab().url = _self.url;
    safari.extension.globalPage.contentWindow.dispatchMessage("autoLogin", _self);
  },
  input: function(){
    safari.extension.globalPage.contentWindow.dispatchMessage("analogLogin", this);
  }
}
