var Account = function(){}

Account.prototype = {
  save: function (data, requestType) {
    var request = new XMLHttpRequest();
    request.open(requestType, 'http://localhost:3000/api/v1/accounts', true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(EncodeHTMLForm(data));
  },
  updateUrl: function (domain, url) {
    var storageData = {};
    var _self = this;
    var accounts = safari.extension.secureSettings.accounts;
    var accountInfos = accounts[domain];
    accountInfos = (accountInfos === undefined || accountInfos === null)? [] : accountInfos
    for (var i=0, len=accountInfos.length; i < len; i++) {
      accountInfos[i].url = url;
    }
    storageData[domain] = accountInfos;
    _self.save(storageData);
  }
}

function EncodeHTMLForm(data){
  var params = [];
  for(var name in data){
    var value = data[name];
    var param = encodeURIComponent(name).replace(/%20/g, '+')
    + '=' + encodeURIComponent(value).replace(/%20/g, '+');
    params.push(param);
  }
  return params.join('&');
}
