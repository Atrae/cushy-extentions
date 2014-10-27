chrome.browserAction.onClicked.addListener(function(tab){
  popUploginCheck();
});

var tempData = new tempStorageData();

var callBackFunc = function(details) {
  if (details.method === "POST") {
    var mail, password, userName, domain;
    var formData = JSON.stringify(details.requestBody['formData']);
    //if formData have a password, it is regarded as a sing in or sing up function.
    if(formData){
      if(formData.match(/password/i)){
        split_form_data = formData.split(",");
        for(i in split_form_data){
          if(!password && split_form_data[i].match(/"(.+)?password(.)?"/)){ //pull out a password
            var passwordFormId = replaceSymbol(String(split_form_data[i].match(/"(.+)?password(.)?":/)));
            password = details.requestBody['formData'][passwordFormId];
          }else if(!mail && split_form_data[i].match(/"(.+)?mail(.)?"/)){ //pull out a email
            var mailId = replaceSymbol(String(split_form_data[i].match(/"(.+)?mail(.)?":/)));
            mail = details.requestBody['formData'][mailId];
          }else if(!userName && split_form_data[i].match(/"(.+)?user(.+)?"/)){ //pull out a userName
            var userNameId = replaceSymbol(String(split_form_data[i].match(/"(.+)?user(.+)?":/)));
            userName = details.requestBody['formData'][userNameId];
          }else if(!userName && split_form_data[i].match(/"(.+)?login(.+)?"/)){
            var loginId = replaceSymbol(String(split_form_data[i].match(/"(.+)?login(.+)?":/)));
            if(userName === null || userName === ""){
              userName = details.requestBody['formData'][loginId];
            }
          }
        }
        // create_url
      }
      if(password){
        tempData.password = password;
        tempData.passwordElementName = passwordFormId;
        //loginidは以下のロジックで決定する
        if(mail){
          tempData.loginId = mail;
          tempData.loginElementName = mailId;
        }else if(userNameId){
          tempData.loginId= userName;
          tempData.loginElementName = userNameId;
        }else if(loginId){
          tempData.loginId = userName;
          tempData.loginElementName = loginId;
        }
        tempData.url = String(details.url).replace(/http(s)?:\/\//, "").split('/')[0];
        tempData.confirmFlg = true;
      }
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

var openDialogFunc = function(tabId, changeInfo, tab){
  if(tab.status === "complete"){
    var url = tempData.url;
    if(tempData.confirmFlg === true){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.storage.local.get(['userInfo'], function (result) {
          // already logined? or no login?
          if(result['userInfo'] && result['userInfo'].userId && result['userInfo'].password){
            chrome.storage.local.get([url], function (result) {
              if(result[url] && result[url].loginId === tempData.loginId[0]){
                // nothing
              }else{
                chrome.tabs.sendMessage(tabs[0].id, {action: "openDialogBox", tempData: tempData}, function(response) {});
              }
            });
          }else{
            chrome.tabs.sendMessage(tabs[0].id, {action: "noLoginNotification", tempData: tempData}, function(response) {});
          }
        });
      });
    }
  };
}
chrome.tabs.onUpdated.addListener(openDialogFunc);

var fillAccountFunc = function(tabId, changeInfo, tab){
  if(tab.status === "complete"){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      var url = String(tab.url).replace(/http(s)?:\/\//, "").split('/')[0];
      chrome.storage.local.get([url], function (result) {
        if(result[url]){
          chrome.tabs.sendMessage(tabs[0].id, {action: "fillAccount", accountData: result[url]}, function(response) {});
        }
      });
    });
  };
}
chrome.tabs.onUpdated.addListener(fillAccountFunc);


var receiveMessage = function(request,sender,sendResponse){
  if(request.action === "dialog_close"){
    tempData.confirmFlg = false;
  }else if(request.action === "login"){
  }
}
chrome.runtime.onMessage.addListener(receiveMessage);

function popUploginCheck(){
  // this is witten login judge logic.
  // you can deal with storage data only in the callback.
  // i wanna gather into the login logic.
  chrome.storage.local.get(['userInfo'], function (result) {
    if(result['userInfo'] && result['userInfo'].userId && result['userInfo'].password){
      openAccountRegisterForm();
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
