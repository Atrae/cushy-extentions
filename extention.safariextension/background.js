safari.application.addEventListener("command", function (evt) {
  if(evt.command === "cyshyToolbarItem"){
    popUploginCheck();
  }
}, true);

var tempData = new TempStorageData();
var client = new Client();
var storageClient = new StorageClient();

var openLoginFormLogic = function(url){
  var userInfo = safari.extension.secureSettings.userInfo;
  if(!userInfo && !url.match(/login\.html/)){
    showPopover("loginPopup");
  }
}

var updateClientFunc = function(url){
  client.updateUrl(url);
  client.updateStorageData();
}

var respondToMessage = function(theMessageEvent) {
  if(theMessageEvent.name === "signIn" || theMessageEvent.name === 'signUp') {
    tempData.setFromRequest(theMessageEvent);
    var sendData = theMessageEvent.message;
  }else{
    tempData.type = null;
  }
}

safari.application.addEventListener("message",respondToMessage,false);

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

// safari用のpostを抜き出すメソッドをここにかく

var sendMessageFunc = function(){
  // cushyのurlは弾くように設定
  if(!client.url.match(/cushy/)){
    if(client.checkRegisterDialog(tempData)){
      var domain = tempData.domain;
      var userInfo = safari.extension.secureSettings.userInfo;
      if(userInfo && userInfo.userId && userInfo.apiKey){
        var accounts = safari.extension.secureSettings.accounts[domain];
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
            client.sendMsg(type, tempData);
          }
        }else{
          client.sendMsg("openDialogBox", tempData);
        }
      }else{
        client.sendMsg("noLoginNotification", tempData);
      }
    }else{
      if(client.msg){
        client.sendMsg();
      }else{
        var domain = client.domain;
        var accounts = safari.extension.secureSettings.accounts;
        if(accounts && accounts[domain]){
          client.sendMsg("fillAccount", accounts[domain]);
        }
      }
    }
  }
}

safari.application.addEventListener("navigate", function (event) {
  console.log('//-- Event Data -------------------------------------');
  console.log(event);
  console.log(event['target']);
  console.log('Url: ' + event['target']['url']);
  console.log('Title: ' + event['target']['title']);

  openLoginFormLogic(event['target']['url']);
  updateClientFunc(event['target']['url']);
  sendMessageFunc();

  console.log('//-- Tab Data -------------------------------------');
  console.log('Url: ' + safari.application.activeBrowserWindow.activeTab.url);
  console.log('Title: ' + safari.application.activeBrowserWindow.activeTab.title);
}, true);

var autoLoginFunc = function(theMessageEvent) {
  if(theMessageEvent.name === 'autoLogin'){
    client.msg = { action: 'autoLogin', accountData: theMessageEvent.message};
  }else if(theMessageEvent.name === 'fillAccountCheck'){
    var accounts = localStorage.accounts;
    var domain = client.domain;
    if(accounts && accounts[domain]){
      client.sendMsg("fillAccount", accounts[domain]);
    }
  }
}
safari.application.addEventListener("message",respondToMessage,false);

var analogLoginFunc = function(theMessageEvent) {
  if(theMessageEvent.name === 'analogLogin'){
    client.msg = { action: 'analogLogin', accountData: request.message};
  }
}
safari.application.addEventListener("message",respondToMessage,false);

var changeClientData = function(theMessageEvent) {
  if(theMessageEvent.name === "dialogClose"){
    client.toCloseDialog();
    tempData.clear();
  }else if(theMessageEvent.name === "storageRefresh"){
    alert("storage");
    client.updateStorageData(true);
  }
}
safari.application.addEventListener("message", changeClientData, false);

function handleMessage(theMessageEvent) {
  if (theMessageEvent.name == 'openUrlInNewTab') {
    safari.application.activeBrowserWindow.openTab().url = msgEvent.message;
  }
}

safari.application.addEventListener('message', handleMessage, false);

function popUploginCheck(){
  var userInfo = safari.extension.secureSettings.userInfo;
  if(userInfo && userInfo.userId && userInfo.password){
    showPopover("accountPopup");
  }else{
    showPopover("loginPopup");
  }
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

function showPopover(popoverId) {
  var popover = safari.extension.popovers.filter(function (po) {
    return po.identifier == popoverId;
  })[0];
  safari.extension.toolbarItems[0].popover = popover;
  safari.extension.toolbarItems[0].showPopover();
}
