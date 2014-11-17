chrome.browserAction.onClicked.addListener(function(tab){
  popUploginCheck();
});

var tempData = new TempStorageData();
var client = new Client();
var storage_client = new StorageClient();

var updateClientFunc = function(tabId, changeInfo, tab){
  client.tabId = tabId;
  client.url = String(tab.url).replace(/http(s)?:\/\//, "").split('/')[0];
  client.updateStorageData();
}
chrome.tabs.onUpdated.addListener(updateClientFunc);

var requestTypeMessage = function(request,sender,sendResponse){
  if(request.action === 'signIn' || request.action === 'signUp'){
    tempData.setData(request.action, request.loginIdElementName, request.passwordElementName, request.url)
  }else{
    tempData.type = null;
  }
}
chrome.runtime.onMessage.addListener(requestTypeMessage);

var callBackFunc = function(details) {
  if(details.method === "POST" && details.requestBody && details.requestBody['formData']){
    var formData = JSON.stringify(details.requestBody['formData']);
    re = new RegExp(client.url, "i");
    if(details.url.match(re)){
      var mail, password, userName, domain, userId, passwordFormId, mailId, nameId, loginId;
      if(tempData.loginElementName){
        tempData.setLoginId(details.requestBody['formData'][tempData.loginElementName]);
      }
      if(tempData.passwordElementName){
        tempData.setPassword(details.requestBody['formData'][tempData.passwordElementName]);
      }
      if(tempData.password){
        tempData.setUrl(client.url);
        tempData.tabId = client.tabId;
        client.toOpenDialog();
      }
      console.dir(tempData);
    }
  }
}


chrome.webRequest.onBeforeRequest.addListener(
  callBackFunc,
  {
    urls: ["<all_urls>"]
  },
  ['requestBody']
);

var sendMessageFunc = function(tabId, changeInfo, tab){
  if(changeInfo.status === "complete"){
    if(client.checkRegisterDialog(tempData)){
      var url = tempData.url;
      chrome.storage.local.get(['userInfo'], function (result) {
        var userInfo = result['userInfo'];
        if(userInfo && userInfo.userId && userInfo.apiKey){
          chrome.storage.local.get([url], function (result) {
            var accounts = result[url];
            if(accounts){
              var type = 'openDialogBox'; // 1 is openDialogBox, 2 is confirmChangePasswordBox, 3 is nothing
              for(i in accounts){
                if(accounts[i] && accounts[i].loginId === tempData.loginId[0]){
                  type = (accounts[i].password === tempData.password[0])? 'nothing' : 'confirmChangePasswordBox';
                  if(accounts[i].loginUrl != tempData.loginUrl){
                    storage_client.updateUrl(url, tempData.loginUrl);
                  }
                  break;
                }
              }
              if(type === 'openDialogBox' || type === 'confirmChangePasswordBox'){
                client.sendMsg({action: type, tempData: tempData});
              }
            }else{
              client.sendMsg({action: "openDialogBox", tempData: tempData});
            }
          });
        }else{
          client.sendMsg({action: "noLoginNotification", tempData: tempData});
        }
      });
    }else{
      if(client.msg){
        client.sendMsg();
      }else{
        var name = String(client.url).replace(/http(s)?:\/\//, "").split('/')[0];
        chrome.storage.local.get([name], function (result) {
          if(result[name]){
            client.sendMsg({ action: "fillAccount", accountData: result[name] });
          }
        });
      }
    }
  }
}
chrome.tabs.onUpdated.addListener(sendMessageFunc);

var autoLoginFunc = function(request,sender,sendResponse){
  if(request.action === 'autoLogin'){
    client.msg = { action: "autoLogin", accountData: request.loginData};
  }
}
chrome.runtime.onMessage.addListener(autoLoginFunc);

var analogLoginFunc = function(request,sender,sendResponse){
  if(request.action === 'analogLogin'){
    client.sendMsg({ action: "analogLogin", accountData: request.loginData });
  }
}
chrome.runtime.onMessage.addListener(analogLoginFunc);

var changeClientData = function(request,sender,sendResponse){
  if(request.action === "dialogClose"){
    client.toCloseDialog();
    tempData.clear();
  }else if(request.action === "storageRefresh"){
    client.updateStorageData(true);
  }
}
chrome.runtime.onMessage.addListener(changeClientData);

function popUploginCheck(){
  // this is witten login judge logic.
  // you can deal with storage data only in the callback.
  // i wanna gather into the login logic.
  chrome.storage.local.get(['userInfo'], function (result) {
    if(result['userInfo'] && result['userInfo'].userId && result['userInfo'].password){
      chrome.browserAction.setPopup({
        popup: 'popup.html'
      });
    }else{
      openLoginForm();
    }
  });
}

function openLoginForm(){
  var windowParmas = {
    width: 300,
    height: 300,
    left: 500,
    top: 300,
    focused: true,
    url: chrome.extension.getURL("login.html"),
    type: "popup"
  }
  chrome.windows.create(windowParmas, function(){});
}

function openAccountRegisterForm(){
  var windowParmas = {
    width: 300,
    height: 300,
    left: 900,
    top: 300,
    focused: true,
    url: chrome.extension.getURL("account_register.html"),
    type: "detached_panel"
  }
  chrome.windows.create(windowParmas, function(){});
}

function replaceSymbol(str){
  return str.replace(/:(.+)/, '').replace(/"/g, '');
}

