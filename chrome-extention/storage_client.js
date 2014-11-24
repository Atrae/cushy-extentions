var StorageClient = function(){}
StorageClient.prototype = {
  save: function(data){
    chrome.storage.local.set(data, function(result){
      if(chrome.extension.lastError !== undefined) {
        console.log('failed');
      }else{
        console.log('ok!save');
      }
    });
  },
  updateUrl: function(domain, url){
    var storageData = {};
    var _self = this;
    chrome.storage.local.get(["accounts"], function(result){
      var accountInfos = result["accounts"][domain];
      accountInfos = (accountInfos === undefined || accountInfos === null)? [] : accountInfos
      for(var i=0, len=accountInfos.length; i < len; i++){
        accountInfos[i].url = url;
      }
      storageData[domain] = accountInfos;
      _self.save(storageData);
    });
  }
}
