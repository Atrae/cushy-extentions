chrome.browserAction.onClicked.addListener(function(tab){
  popUploginCheck();
});

var tempData = new TempStorageData();

var requestTypeMessage = function(request,sender,sendResponse){
  if(request.action === 'signIn'){
    tempData.type = 'signIn';
  }else if(request.action === 'signUp'){
    tempData.type = 'signUp';
  }else{
    tempData.type = null;
  }
}
chrome.runtime.onMessage.addListener(requestTypeMessage);

var callBackFunc = function(details) {
  if (details.method === "POST") {
    var formData = JSON.stringify(details.requestBody['formData']);
    //if formData have a password, it is regarded as a sing in or sing up function.
    if(formData){
      var mail, password, userName, domain, userId, passwordFormId, mailId, nameId, loginId;
      if(tempData.type === 'signIn' || tempData.type === 'signUp' || formData.match(/password/i)) {
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
          //loginidは以下のロジックで決定する
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
        tempData.url = String(details.url).replace(/http(s)?:\/\//, "").split('/')[0];
        tempData.confirmFlg = true;
        chrome.tabs.query({ active:true,windowType:"normal", currentWindow: true},
          function(d){ if(d[0]){ tempData.tabId= d[0].id; } }
        );
        console.dir(tempData);
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

// open dialog logic
var openDialogFunc = function(tabId, changeInfo, tab){
  if(tab.status === "complete"){
    if(tempData && tempData.confirmFlg === true && tempData.tabId === tabId && (tempData.password != '' && tempData.password != null)){
      var url = tempData.url;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.storage.local.get(['userInfo'], function (result) {
          // already logined? or no login?
          var userInfo = result['userInfo'];
          if(userInfo && userInfo.userId && userInfo.password){
            // already logined
            chrome.storage.local.get([url], function (result) {
              var accountInfos = result[url];
              if(accountInfos){
                var dialogType = 'openDialogBox'; // 1 is openDialogBox, 2 is confirmChangePasswordBox, 3 is nothing
                for(i in accountInfos){
                  if(accountInfos[i] && accountInfos[i].loginId === tempData.loginId[0]){
                    if(accountInfos[i].password === tempData.password[0]){
                      dialogType = 'nothing';
                    }else{
                      dialogType = 'confirmChangePasswordBox';
                    }
                    break;
                  }
                }
                if(dialogType === 'openDialogBox'){
                  chrome.tabs.sendMessage(tabs[0].id, {action: "openDialogBox", tempData: tempData}, function(response){});
                }else if(dialogType === 'confirmChangePasswordBox'){
                  chrome.tabs.sendMessage(tabs[0].id, {action: "confirmChangePasswordBox", tempData: tempData}, function(response){});
                }
              }else{
                chrome.tabs.sendMessage(tabs[0].id, {action: "openDialogBox", tempData: tempData}, function(response){});
              }
            });
          }else{
            chrome.tabs.sendMessage(tabs[0].id, {action: "noLoginNotification", tempData: tempData}, function(response){});
          }
        });
      });
    }
  }
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

var dialogMessage = function(request,sender,sendResponse){
  if(request.action === "dialog_close"){
    tempData.confirmFlg = false;
  }
}
chrome.runtime.onMessage.addListener(dialogMessage);

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
