var tempStorageData = function(formData, loginElementName, loginId, passwordElementName, password, url){
  this.loginId = loginId;
  this.loginElementName = loginElementName;
  this.password = password;
  this.passwordElementName = passwordElementName;
  this.url = url;
  this.userName = null;
  this.formData = formData;
  this.confirmFlg = false;
};

tempStorageData.prototype = {
  save: function(){
    chrome.storage.local.set({ 'loginElementName': this.loginElementName, 'loginId': this.loginId, 'passwordElementName': this.passwordElementName, 'password': this.password, 'url': this.url }, function() {
          // Notify that we saved.
      console.log('save');
    });
  }
}
