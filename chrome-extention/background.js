chrome.browserAction.onClicked.addListener(function(tab){
  loginCheck(openAccountRegisterForm(), openLoginForm());
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
            var passwordFormId = String(split_form_data[i].match(/"(.+)?password(.)?":/)).replace(/:(.+)/, '').replace(/"/g, '');
            password = details.requestBody['formData'][passwordFormId];
          }else if(!mail && split_form_data[i].match(/"(.+)?mail(.)?"/)){ //pull out a email
            var mailId = String(split_form_data[i].match(/"(.+)?mail(.)?":/)).replace(/:(.+)/, '').replace(/"/g, '');
            mail = details.requestBody['formData'][mailId];
          }else if(!userName && split_form_data[i].match(/"(.+)?user(.+)?"/)){ //pull out a userName
            var userNameId = String(split_form_data[i].match(/"(.+)?user(.+)?":/)).replace(/:(.+)/, '').replace(/"/g, '');
            userName = details.requestBody['formData'][userNameId];
          }else if(!userName && split_form_data[i].match(/"(.+)?login(.+)?"/)){
            var loginId = String(split_form_data[i].match(/"(.+)?login(.+)?":/)).replace(/:(.+)/, '').replace(/"/g, '');
            if(userName === null || userName === ""){
              userName = details.requestBody['formData'][loginId];
            }
          }
        }
        // create_url
        var domain = String(details.url).replace(/http(s)?:\/\//, "").split('/')[0];
      }
      if(password){
        tempData.password = password;
        tempData.passwordelementname = passwordFormId;
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
        tempData.url = domain;
        tempData.confirmFlg = true;
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

var sendMessage = function(tabId, changeInfo, tab){
  if(tab.status === "complete"){
    console.log(tempData.url);
    console.log(tab.url);
    console.log(tempData.confirmFlg);
    if(tab.url.match(tempData.url) && tempData.confirmFlg === true){
      console.log('open_dialog');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {action: "open_dialog_box", tempData: tempData}, function(response) {});
      });
    }
  };
}
chrome.tabs.onUpdated.addListener(sendMessage);

var receiveMessage = function(request,sender,sendResponse){
  if(request.action === "dialog_close"){
    tempData.confirmFlg = false;
  }else if(request.action === "login"){
    console.dir(request.formData);
  }
}
chrome.runtime.onMessage.addListener(receiveMessage);

function loginCheck(afterLoginFunc, beforeLoginFunc){
  //this is witten login judge logic.
  //you can deal with storage data only in the callback.
  chrome.storage.local.get(null, function (result) {
    if(result.user_id){
      openAccountRegisterForm();
      //$(afterLoginFunc);
    }else{
      //$(beforeLoginFunc);
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

