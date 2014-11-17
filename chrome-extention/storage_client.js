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
  updateUrl: function(url, newUrl){
    var storageData = {};
    chrome.storage.local.get([url], function(result){
      var accountInfos = result[url];
      accountInfos = (accountInfos === undefined || accountInfos === null)? [] : accountInfos
      for(var i=0; i < accountInfos.length; i++){
        accountInfos[i].loginUrl = newUrl;
      }
      storageData[url] = accountInfos;
      this.save(storageData);
    });
  }
}
