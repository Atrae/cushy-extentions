chrome.browserAction.onClicked.addListener(function(tab){
  popUploginCheck();
});

var tempData = new TempStorageData();
var client = new Client();

var updateClientFunc = function(tabId, changeInfo, tab){
  client.tabId = tabId;
  client.url = String(tab.url).replace(/http(s)?:\/\//, "").split('/')[0];
}
chrome.tabs.onUpdated.addListener(updateClientFunc);

var requestTypeMessage = function(request,sender,sendResponse){
  if(request.action === 'signIn'){
    tempData.setSignInData(request.loginIdElementName, request.passwordElementName, request.url)
  }else if(request.action === 'signUp'){
    tempData.type = 'signUp';
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
      if(tempData.type === 'signIn'){
        if(tempData.loginElementName){
          tempData.loginId = details.requestBody['formData'][tempData.loginElementName];
        }
        if(tempData.passwordElementName){
          tempData.password = details.requestBody['formData'][tempData.passwordElementName];
        }
      }
      if(tempData.type === 'signUp' || (tempData.type != 'signIn' && formData.match(/password/i))) {
        split_form_data = formData.split(",");
        for(i in split_form_data){
          if(!password && split_form_data[i].match(/"(.+)?password(.)?"/)){ //pull out a password
            passwordFormId = replaceSymbol(String(split_form_data[i].match(/"(.+)?password(.)?":/)));
            password = details.requestBody['formData'][passwordFormId];
          }else if(split_form_data[i].match(/"(.+)?mail(.)?"/)){ //pull out a email
            mailId = replaceSymbol(String(split_form_data[i].match(/"(.+)?mail(.)?":/)));
          }else if(split_form_data[i].match(/"(.+)?user(.+)?id(.)?"/)){ //pull out a userName
            userId = replaceSymbol(String(split_form_data[i].match(/"(.+)?user(.+)?id(.)?":/)));
          }else if(split_form_data[i].match(/"(.+)?name(.+)?"/)){ //pull out a userName
            nameId = replaceSymbol(String(split_form_data[i].match(/"(.+)?name(.+)?":/)));
          }else if(split_form_data[i].match(/"(.+)?login(.+)?"/)){
            loginId = replaceSymbol(String(split_form_data[i].match(/"(.+)?login(.+)?":/)));
          }
        }
        //set password
        if(password){
          tempData.password = password;
          tempData.passwordElementName = passwordFormId;
        }
        if(mailId){
          tempData.loginId = details.requestBody['formData'][mailId];
          tempData.loginElementName = mailId;
        }else if(userId){
          tempData.loginId = details.requestBody['formData'][userId];
          tempData.loginElementName = userId;
        }else if(nameId){
          tempData.loginId = details.requestBody['formData'][nameId];
          tempData.loginElementName = nameId;
        }else if(loginId){
          tempData.loginId = details.requestBody['formData'][loginId];
          tempData.loginElementName = loginId;
        }
      }
      if((tempData.type === 'signIn' || tempData.type === 'signUp') && tempData.password){
        tempData.url = client.url;
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
  if(tab.status === "complete"){
    if(client.checkRegisterDialog(tempData)){
      var url = tempData.url;
      chrome.storage.local.get(['userInfo'], function (result) {
        var userInfo = result['userInfo'];
        if(userInfo && userInfo.userId && userInfo.password){
          // already logined
          chrome.storage.local.get([url], function (result) {
            var accounts = result[url];
            if(accounts){
              var type = 'openDialogBox'; // 1 is openDialogBox, 2 is confirmChangePasswordBox, 3 is nothing
              for(i in accounts){
                if(accounts[i] && accounts[i].loginId === tempData.loginId[0]){
                  type = (accounts[i].password === tempData.password[0])? 'nothing' : 'confirmChangePasswordBox';
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
        var url = String(client.url).replace(/http(s)?:\/\//, "").split('/')[0];
        chrome.storage.local.get([url], function (result) {
          if(result[url]){
            client.sendMsg({ action: "fillAccount", accountData: result[url] });
          }
        });
      }
    }
  }
}
chrome.tabs.onUpdated.addListener(sendMessageFunc);

var autoLoginFunc = function(request,sender,sendResponse){
  if(request.action === 'autoLogin'){
    client.msg = {action: "autoLogin", accountData: request.loginData};
  }
}
chrome.runtime.onMessage.addListener(autoLoginFunc);

var changeClientData = function(request,sender,sendResponse){
  if(request.action === "dialogClose"){
    client.toCloseDialog();
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
