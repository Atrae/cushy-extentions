var button = '<input type="submit" class="cushy-ext-submit-js" style="width: 70px; height: 25px; margin: 0;" value="登録する">';
var saveDialog = new saveDialog('登録しますか？', button);
var localData = new localData();

localData.insert('www.green-japan.com');

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  if(msg.action === "open_dialog_box"){
    var tempData = msg.tempData;
    saveDialog.insert();

    $('button.cushy-ext-close-js').click(function(){
      saveDialog.close();
      chrome.runtime.sendMessage({action: "dialog_close"}, function(){});
    });

    $('input.cushy-ext-submit-js').click(function(){
      saveDialog.submit(msg.tempData);
    });
  }
});


//$(document).on('submit', 'form', function(){
//  if($(this).find('input[type="password"]').length >= 1){
//    chrome.runtime.sendMessage({action: "login", formData: $(this)}, function(){});
//  }
//});
