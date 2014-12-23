safari.application.addEventListener("command", function (evt) {
  if (evt.command === "cyshyToolbarItem") {
    popUploginCheck();
  }
}, true);

var tempData = new TempStorageData();
var client = new Client();
var account = new Account();

var openLoginFormLogic = function (url) {
  var userInfo = safari.extension.secureSettings.userInfo;
  if (!userInfo && !url.match(/login\.html/)) {
    showPopover("loginPopup");
  }
}

// safari ver.
var respondToMessage = function(theMessageEvent) {
  if(theMessageEvent.name === "formSubmit") {
    var sendData = theMessageEvent.message;
    if(sendData.password){
      tempData.setFromRequest(sendData);
      client.toOpenDialog();
    }
  }
}
safari.application.addEventListener("message",respondToMessage,false);

// submit save dialog
var submitSaveDialog = function(theMessageEvent) {
  if(theMessageEvent.name === "SubmitSaveDialog") {
    var tempData = theMessageEvent.message["tempData"];
    var userInfo = safari.extension.secureSettings.userInfo;
    var data = {
      user_id: userInfo.userId, //認証方法は別途検討
      login_id: tempData.loginId,
      password: tempData.password,
      url: tempData.url,
      name: tempData.domain,
      group_id: tempData.groupId,
      api_key: userInfo.apiKey,
      default_flag: (tempData.groupId === '')? true : false
    }
    var requestType = (theMessageEvent.message["requestType"] === 'changePassword')? 'PUT' : 'POST';
    account.save(data, requestType);
  }
}
safari.application.addEventListener("message", submitSaveDialog, false);

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
            if(accounts[i].loginId === tempData.loginId){
              if(accounts[i].password === tempData.password){
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

// tabupdate event
safari.application.addEventListener("navigate", function (event) {
  openLoginFormLogic(event['target']['url']);
  client.updateUrl(event['target']['url']);
  client.updateStorageData();
  sendMessageFunc();
}, true);

var autoLoginFunc = function(theMessageEvent) {
  if(theMessageEvent.name === 'autoLogin'){
    client.msg = { action: 'autoLogin', accountData: theMessageEvent.message};
  }else if(theMessageEvent.name === 'fillAccountCheck'){
    var accounts = safari.extension.secureSettings.accounts;
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

function showPopover(popoverId) {
  var popover = safari.extension.popovers.filter(function (po) {
    return po.identifier == popoverId;
  })[0];
  safari.extension.toolbarItems[0].popover = popover;
  safari.extension.toolbarItems[0].showPopover();
}
