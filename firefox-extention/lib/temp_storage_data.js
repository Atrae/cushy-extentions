var TempStorageData = ( function(){

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

  this.setFromRequest = function(request){
    this.type = request.action;
    this.loginElementName = request.loginIdElementName;
    this.passwordElementName = request.passwordElementName;
    this.url = request.url;
  }
  this.clear = function(){
    this.loginId = null;
    this.password = null;
    this.domain = null;
    this.formData = null;
    this.tabId = null;
    this.type = null;
    this.url = null;
    this.groupId = null;
  }
  this.checkUseElementName = function(){
    var result = false;
    if(this.type === 'signIn' || (tempData.type === 'signUp' && this.passwordElementName )){
      result = true;
    }
    return result;
  }
  this.setLoginId = function(loginId){
    if(this.loginElementName){
      this.loginId = loginId;
    }
  }
  this.setPassword = function(password){
    if(this.passwordElementName){
      this.password = password;
    }
  }
  this.setUrl = function(client){
    url = (this.type === "signUp")? client.beforeUrl : client.url;
    this.domain = client.domain;
    this.url = url;
  }
  this.checkOpenDialogBox = function(){
    var result = false;
    if(this.domain && this.loginId && this.password){
      result = true;
    }
    return result;
  }

  return this;
}());

exports.TempStorageData = TempStorageData;
