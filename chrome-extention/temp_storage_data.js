var TempStorageData = function(){
  this.loginId;
  this.loginElementName;
  this.password;
  this.passwordElementName;
  this.url;
  this.mail;
  this.userName;
  this.userNameElementName;
  this.formData;
  this.tabId;
  this.type;
  this.loginUrl;
};

TempStorageData.prototype = {
  setSignInData: function(loginElementName, passwordElementName, loginUrl){
    this.type = 'signIn';
    this.loginElementName = loginElementName;
    this.passwordElementName = passwordElementName;
    this.loginUrl = loginUrl;
  },
  save: function(){
    chrome.storage.local.set({ 'loginElementName': this.loginElementName, 'loginId': this.loginId, 'passwordElementName': this.passwordElementName, 'password': this.password, 'url': this.url }, function() {
          // Notify that we saved.
      console.log('save');
    });
  }
}
