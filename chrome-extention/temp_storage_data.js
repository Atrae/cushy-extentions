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
  this.confirmFlg = false;
  this.tabId;
  this.type;
};

TempStorageData.prototype = {
  save: function(){
    chrome.storage.local.set({ 'loginElementName': this.loginElementName, 'loginId': this.loginId, 'passwordElementName': this.passwordElementName, 'password': this.password, 'url': this.url }, function() {
          // Notify that we saved.
      console.log('save');
    });
  }
}
