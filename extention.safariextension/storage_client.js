var StorageClient = function(){}

StorageClient.prototype = {

  save: function(data){
    safari.extension.secureSettings.accounts = data;
  },
  updateUrl: function(domain, url){
    var storageData = {};
    var _self = this;
    var accounts = safari.extension.secureSettings.accounts;
    var accountInfos = accounts[domain];
    accountInfos = (accountInfos === undefined || accountInfos === null)? [] : accountInfos
    for(var i=0, len=accountInfos.length; i < len; i++){
      accountInfos[i].url = url;
    }
    storageData[domain] = accountInfos;
    _self.save(storageData);
  }
}
