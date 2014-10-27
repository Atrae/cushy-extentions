var saveDialog = new saveDialog();
var localData = new localData();

//chrome.storage.local.clear(function(){ });

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  var tempData = msg.tempData;
  if(msg.action === "openDialogBox"){
    // open dialog box
    var button = '<input type="submit" class="cushy-ext-submit-js" style="width: 70px; height: 25px; margin: 0;" value="登録する">';
    saveDialog.button = button;
    saveDialog.message = "登録しますか？"
    saveDialog.insert();
    $('input.cushy-ext-submit-js').click(function(){
      saveDialog.submit(msg.tempData);
    });
  }else if(msg.action === "noLoginNotification"){
    // prompt login
    saveDialog.message = "現在未ログインのようです。ログインしていただかないとアカウントは登録されません。";
    saveDialog.button = '';
    saveDialog.insert();
  }else if(msg.action === "fillAccount" ){
    // fill account
    var loginElementName = 'input[name="'+ msg.accountData.loginElementName + '"]';
    var passwordElementName = 'input[name="'+ msg.accountData.passwordElementName + '"]';
    if($(document).find(passwordElementName).length > 0){
      saveDialog.message = "以前登録したアカウントでloginしますか？";
      saveDialog.button = '<input type="submit" class="cushy_ext_login-js" style="width: 70px; height: 25px; margin: 0;" value="ログインする">';
      saveDialog.insert();
      $('input.cushy_ext_login-js').click(function(){
        $(document).find(passwordElementName).val(msg.accountData.password);
        $(document).find(loginElementName).val(msg.accountData.loginId);
        $(document).find(loginElementName).closest('form').find('input[type="submit"]').click();
      });
    }
  }

  $('button.cushy-ext-close-js').click(function(){
    saveDialog.close();
    chrome.runtime.sendMessage({action: "dialog_close"}, function(){});
  });
});

//$(document).on('submit', 'form', function(){
//  if($(this).find('input[type="password"]').length >= 1){
//    chrome.runtime.sendMessage({action: "login", formData: $(this)}, function(){});
//  }
//});
