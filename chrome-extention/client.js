var Client = function(){
  this.tabId;
  this.url;
  this.openDialogFlg = false;
}

Client.prototype = {
  toOpenDialog: function(){
    this.openDialogFlg = true;
  },
  toCloseDialog: function(){
    this.openDialogFlg = false;
  }
}
