chrome.browserAction.onClicked.addListener(function(tab){
  popUploginCheck();
});

var tempData = new TempStorageData();
var client = new Client();
var storageClient = new StorageClient();

var updateClientFunc = function(tabId, changeInfo, tab){
  if(changeInfo.status === "complete"){
    client.tabId = tabId;
    client.updateUrl(tab.url);
    client.updateStorageData();
  }
}
chrome.tabs.onUpdated.addListener(updateClientFunc);

var requestTypeMessage = function(request,sender,sendResponse){
  if(request.action === 'signIn' || request.action === 'signUp'){
    tempData.setFromRequest(request);
  }else{
    tempData.type = null;
  }
}
chrome.runtime.onMessage.addListener(requestTypeMessage);

var callBackFunc = function(details) {
  if(details.tabId === client.tabId && checkFormPostData(details)){
    var formData = details.requestBody['formData'];
    var JformData = JSON.stringify(formData);
    re = new RegExp(client.domain, "i");
    if(details.url.match(re)){
      var password, userId, passwordFormId, mailId, nameId, loginId;

      if(tempData.loginElementName){
        tempData.loginId = formData[tempData.loginElementName];
      }
      if(tempData.passwordElementName){
        tempData.password = formData[tempData.passwordElementName];
      }

      if(!tempData.password && JformData.match(/password/i)) {
        splitData = JformData.split(",");
        for(var i=0, len=splitData.length; i < len; i++){
          if(!password && splitData[i].match(/"(.+)?password(.)?"/)){
            passwordFormId = replaceSymbol(String(splitData[i].match(/"(.+)?password(.)?":/)));
            password = formData[passwordFormId];
          }else if(splitData[i].match(/"(.+)?mail(.)?"/)){
            mailId = replaceSymbol(String(splitData[i].match(/"(.+)?mail(.)?":/)));
          }else if(splitData[i].match(/"(.+)?user(.+)?id(.)?"/)){
            userId = replaceSymbol(String(splitData[i].match(/"(.+)?user(.+)?id(.)?":/)));
          }else if(splitData[i].match(/"(.+)?name(.+)?"/)){
            nameId = replaceSymbol(String(splitData[i].match(/"(.+)?name(.+)?":/)));
          }else if(splitData[i].match(/"(.+)?login(.+)?"/)){
            loginId = replaceSymbol(String(splitData[i].match(/"(.+)?login(.+)?":/)));
          }
        }
        //set password
        if(password){
          tempData.password = password;
          tempData.passwordElementName = passwordFormId;
        }
        if(mailId){
          tempData.loginId = formData[mailId];
        }else if(userId){
          tempData.loginId = formData[userId];
        }else if(nameId){
          tempData.loginId = formData[nameId];
        }else if(loginId){
          tempData.loginId = formData[loginId];
        }
      }

      if(tempData.password){
        tempData.setUrl(client);
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
      var domain = tempData.domain;
      chrome.storage.local.get(['userInfo'], function (result) {
        var userInfo = result['userInfo'];
        if(userInfo && userInfo.userId && userInfo.apiKey){
          chrome.storage.local.get(["accounts"], function (result) {
            var accounts = result["accounts"][domain];
            if(accounts){
              var type = 'openDialogBox'; // 1 is openDialogBox, 2 is confirmChangePasswordBox, 3 is nothing
              for(var i=0, len=accounts.length; i < len; i++){
                if(accounts[i].loginId === tempData.loginId[0]){
                  if(accounts[i].password === tempData.password[0]){
                    tempData.clear();
                  }else{
                    type = 'confirmChangePasswordBox';
                  }
                  if(accounts[i].url != tempData.url){
                    storageClient.updateUrl(domain, tempData.url);
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
        var domain = client.domain;
        chrome.storage.local.get(["accounts"], function(result){
          if(result["accounts"] && result["accounts"][domain]){
            client.sendMsg({ action: "fillAccount", accountData: result["accounts"][domain] });
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

function checkFormPostData(details){
  var result = false;
  if(details.method === "POST" && details.type === "main_frame"
    && details.requestBody && details.requestBody['formData']){
    result = true;
  }
  return result;
}
