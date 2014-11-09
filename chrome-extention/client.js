var Client = function(){
  this.tabId;
  this.url;
  this.openDialogFlg = false;
  this.msg;
}

Client.prototype = {
  toOpenDialog: function(){
    this.openDialogFlg = true;
  },
  toCloseDialog: function(){
    this.openDialogFlg = false;
  },
  sendMsg: function(callbackFunc){
    if(this.msg){
      chrome.tabs.sendMessage(this.tabId, this.msg, callbackFunc);
      this.msg = null;
    }
  },
  checkRegisterDialog: function(tempData){
    return (tempData.tabId === this.tabId && tempData.password != '' && tempData.password != null && this.openDialogFlg === true )? true : false;
  }
}
