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
    chrome.storage.local.get([domain], function(result){
      var accountInfos = result[domain];
      accountInfos = (accountInfos === undefined || accountInfos === null)? [] : accountInfos
      for(var i=0; i < accountInfos.length; i++){
        accountInfos[i].url = url;
      }
      storageData[domain] = accountInfos;
      _self.save(storageData);
    });
  }
}
