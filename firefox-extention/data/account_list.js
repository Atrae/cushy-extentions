var AccountList = function(){
  this.url;
  this.loginId;
  this.password;
}

AccountList.prototype = {
  login: function(){
    var loginData = {
      url: this.url,
      loginId: this.loginId,
      password: this.password
    }
    self.port.emit("autoLogin", loginData);
  },
  input: function(){
    var loginData = {
      url: this.url,
      loginId: this.loginId,
      password: this.password
    }
    self.port.emit("analogLogin", loginData);
  }
}
