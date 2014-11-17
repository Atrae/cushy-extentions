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
  this.groupId;
};

TempStorageData.prototype = {
  setData: function(type, loginElementName, passwordElementName, loginUrl){
    this.type = type;
    this.loginElementName = loginElementName;
    this.passwordElementName = passwordElementName;
    this.loginUrl = loginUrl;
  },
  save: function(){
    chrome.storage.local.set({ 'loginElementName': this.loginElementName, 'loginId': this.loginId, 'passwordElementName': this.passwordElementName, 'password': this.password, 'url': this.url }, function() {
          // Notify that we saved.
      console.log('save');
    });
  },
  clear: function(){
    this.loginId = null;
    this.password = null;
    this.url = null;
    this.mail = null;
    this.userName = null;
    this.userNameElementName = null;
    this.formData = null;
    this.tabId = null;
    this.type = null;
    this.loginUrl = null;
    this.groupId = null;
  },
  checkUseElementName: function(){
    var result = false;
    if(this.type === 'signIn' || (tempData.type === 'signUp' && this.passwordElementName )){
      result = true;
    }
    return result
  },
  setLoginId: function(loginId){
    if(!this.loginId){
      this.loginId = loginId;
    }
  },
  setPassword: function(password){
    if(!this.password){
      this.password = password;
    }
  },
  setUrl: function(url){
    if(this.type === "signUp"){
      this.url = String(url).replace(/http(s)?:\/\//, "").split('/')[0];;
    }else if(this.type === "signIn"){
      this.url = url;
    }
  }
}
