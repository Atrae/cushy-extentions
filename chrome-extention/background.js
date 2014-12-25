chrome.browserAction.onClicked.addListener(function (tab) {
  popUploginCheck();
});

var client = new Client();
var account = new Account();

var openLoginFormLogic = function (tabId, changeInfo, tab) {
  chrome.storage.local.get(['userInfo'], function (result) {
    if (!result['userInfo'] && !tab.url.match(/login\.html/)) {
      openLoginForm();
    }
  });
}

var updateClient = function (tabId, changeInfo, tab) {
  client.tabId = tabId;
  client.updateUrl(tab.url);
  client.updateStorageData();
}

var loginCheck = function (userInfo) {
  (userInfo && userInfo.userId && userInfo.apiKey);
}

var sendMessageForHavingAccounts = function (accounts) {
  var type = 'openDialogBox';
  for (var i=0, len=accounts.length; i < len; i++) {
    if (accounts[i].loginId === account.loginId[0]) {
      if (accounts[i].password === account.password[0]) {
        account.clear();
      } else {
        type = 'confirmChangePasswordBox';
      }
      if (accounts[i].url != account.url) account.updateUrl(domain, account.url);
      break;
    }
  }
  if (type === 'openDialogBox' || type === 'confirmChangePasswordBox') {
    client.sendMsg({action: type, account: account});
  }
}

var createMessageForAccount = function (accounts) {
  if (accounts) {
    sendMessageForHavingAccounts(accounts);
  } else {
    client.sendMsg({action: "openDialogBox", account: account});
  }
}

var messageLogicForAccount = function () {
  chrome.storage.local.get(["accounts"], function (result) {
    var domain = account.domain;
    var accounts = result["accounts"][domain];
    var ngflg = false;
    chrome.storage.local.get(["ngUrls"], function (result) {
      var ngUrls = result["ngUrls"];
      var len = ngUrls.length;
      for (var i = 0; i < len; i++ ) {
        if (ngUrls[i] === domain) ngflg = true;
        if (i === len-1) {
          (!ngflg)? createMessageForAccount(accounts) : account.clear();
        }
      }
    });
  });
}

var sendMessage = function(tabId, changeInfo, tab){
  // cushyのurlは弾くように設定
  if (!client.url.match(/cushy/)) {
    if (client.checkRegisterDialog(account)) {
      var domain = account.domain;
      chrome.storage.local.get(['userInfo'], function (result) {
        var userInfo = result['userInfo'];
        if (loginCheck) {
          messageLogicForAccount();
        } else {
          client.sendMsg({action: "noLoginNotification", account: account});
        }
      });
    } else {
      if (client.msg) {
        client.sendMsg();
      } else {
        var domain = client.domain;
        chrome.storage.local.get(["accounts"], function (result) {
          if (result["accounts"] && result["accounts"][domain]) {
            client.sendMsg({ action: "fillAccount", accountData: result["accounts"][domain] });
          }
        });
      }
    }
  }
}

// tab update function
var tabUpdateFunctions = function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    updateClient(tabId, changeInfo, tab);
    openLoginFormLogic(tabId, changeInfo, tab);
    sendMessage(tabId, changeInfo, tab);
  }
}

chrome.tabs.onUpdated.addListener(tabUpdateFunctions);

var requestTypeMessage = function (request,sender,sendResponse) {
  if (request.action === 'signIn' || request.action === 'signUp') {
    account.setFromRequest(request);
  } else {
    account.type = null;
  }
}

var autoLogin = function(request,sender,sendResponse){
  if (request.action === 'fillAccountCheck') {
    chrome.storage.local.get(["accounts"], function(result){
      var domain = client.domain;
      if (result["accounts"] && result["accounts"][domain]) {
        client.sendMsg({ action: "fillAccount", accountData: result["accounts"][domain] });
      }
    });
  } else if (request.action === 'autoLogin') {
    client.msg = { action: 'autoLogin', accountData: request.loginData};
  }
}

var changeClientData = function(request,sender,sendResponse) {
  if (request.action === "dialogClose") {
    client.toCloseDialog();
    account.clear();
  } else if (request.action === "storageRefresh") {
    client.updateStorageData(true);
  }
}

var analogLogin = function(request,sender,sendResponse) {
  if (request.action === 'analogLogin') {
    client.sendMsg({ action: "analogLogin", accountData: request.loginData });
  }
}

var registerNgUrl = function(request,sender,sendResponse) {
  if (request.action === 'registerNgUrl') {
    var url = request.url;
    chrome.storage.local.get(['ngUrls'], function (result) {
      var urls = (result['ngUrls'])? result['ngUrls'] : [];
      urls.push(url);
      chrome.storage.local.set({ 'ngUrls': urls } , function (result) {
        if (chrome.extension.lastError !== undefined) {
          console.log('failed');
        } else {
          console.log('ok!save');
        }
      });
    });
  }
}

// 可能であればpostした後のdataとしてアカウント情報を取得したい
var saveAccount = function(request,sender,sendResponse) {
  if (request.action === 'saveAccount') {
    var account = request.account;
    var groupId = account.groupId;
    var requestType = request.requestType;
    chrome.storage.local.get(['userInfo'], function (result) {
      var request = new XMLHttpRequest();
      var data = {
        user_id: result['userInfo'].userId, //認証方法は別途検討
        login_id: account.loginId[0],
        password: account.password[0],
        url: account.url,
        name: account.domain,
        group_id: groupId,
        api_key: result['userInfo'].apiKey,
        default_flag: (groupId === '')? true : false
      }
      request.open(requestType, 'https://cushy-staging.herokuapp.com/api/v1/accounts', true);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      request.send(EncodeHTMLForm(data));
    });
  }
}

var messageListenerFunctions = function (request,sender,sendResponse) {
  requestTypeMessage(request,sender,sendResponse);
  changeClientData(request,sender,sendResponse);
  autoLogin(request,sender,sendResponse);
  analogLogin(request,sender,sendResponse);
  saveAccount(request,sender,sendResponse);
  registerNgUrl(request,sender,sendResponse);
}
chrome.runtime.onMessage.addListener(messageListenerFunctions);

var createAccountDatum = function (details) {
  if (details.tabId === client.tabId && checkFormPostData(details)) {
    var formData = details.requestBody['formData'];
    var JformData = JSON.stringify(formData);
    re = new RegExp(client.domain, "i");
    if (account.domain !== client.domain) account.clear();
    if (details.url.match(re)) {
      var password, userId, passwordFormId, mailId, nameId, loginId;
      if (account.loginElementName) {
        account.loginId = formData[account.loginElementName];
      }
      if (account.passwordElementName) {
        account.password = formData[account.passwordElementName];
      }
      if (!account.password && JformData.match(/password/i)) {
        splitData = JformData.split(",");
        for (var i=0, len=splitData.length; i < len; i++) {
          if (!password && splitData[i].match(/"(.+)?password(.)?"/)) {
            passwordFormId = replaceSymbol(String(splitData[i].match(/"(.+)?password(.)?":/)));
            password = formData[passwordFormId];
          } else if (splitData[i].match(/"(.+)?mail(.)?"/)) {
            mailId = replaceSymbol(String(splitData[i].match(/"(.+)?mail(.)?":/)));
          } else if (splitData[i].match(/"(.+)?user(.+)?id(.)?"/)) {
            userId = replaceSymbol(String(splitData[i].match(/"(.+)?user(.+)?id(.)?":/)));
          } else if (splitData[i].match(/"(.+)?name(.+)?"/)) {
            nameId = replaceSymbol(String(splitData[i].match(/"(.+)?name(.+)?":/)));
          } else if (splitData[i].match(/"(.+)?login(.+)?"/)) {
            loginId = replaceSymbol(String(splitData[i].match(/"(.+)?login(.+)?":/)));
          }
        }
        //set password
        if (password) {
          account.password = password;
          account.passwordElementName = passwordFormId;
        }
        if (mailId) {
          account.loginId = formData[mailId];
        } else if (userId) {
          account.loginId = formData[userId];
        } else if (nameId) {
          account.loginId = formData[nameId];
        } else if (loginId) {
          account.loginId = formData[loginId];
        }
      }

      if (account.password) {
        account.setUrl(client);
        account.tabId = client.tabId;
        client.toOpenDialog();
      }
      console.dir(account);
    }
  }
}


chrome.webRequest.onBeforeRequest.addListener(
  createAccountDatum,
  {
    urls: ["<all_urls>"]
  },
  ['requestBody']
);

function popUploginCheck(){
  chrome.storage.local.get(['userInfo'], function (result) {
    if (result['userInfo'] && result['userInfo'].userId && result['userInfo'].password) {
      chrome.browserAction.setPopup({
        popup: 'popup.html'
      });
    } else {
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
