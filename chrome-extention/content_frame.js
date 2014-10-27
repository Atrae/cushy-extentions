var button = '<input type="submit" class="cushy-ext-submit-js" style="width: 70px; height: 25px; margin: 0;" value="登録する">';
var saveDialog = new saveDialog();
var localData = new localData();

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  var tempData = msg.tempData;
  console.dir(tempData);

  if(msg.action === "open_dialog_box"){
    var button = '<input type="submit" class="cushy-ext-submit-js" style="width: 70px; height: 25px; margin: 0;" value="登録する">';
    saveDialog.button = button;
    saveDialog.message = "登録しますか？"
    saveDialog.insert();

    $('input.cushy-ext-submit-js').click(function(){
      saveDialog.submit(msg.tempData);
    });
  }else if(msg.action === "open_dialog_box_for_no_login"){
    saveDialog.message = "現在未ログインのようです。ログインしていただかないとアカウントは登録されません。";
    saveDialog.button = '';
    saveDialog.insert();
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
