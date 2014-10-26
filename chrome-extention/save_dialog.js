var saveDialog = function(message, button, select_options){
  this.message = message;
  this.select_options = select_options;
  this.button = button;
}

saveDialog.prototype = {
  insert: function(){
    $('body').append('<div id="cushy-ext-dialog" style="width: 100%; position: fixed; top: 0px; height: 0px; background-color: #fdf0bc;"><p style="float: left;">'+ this.message + '</p><div class="cushy-ext-dialog-js">'+ this.button +'<button class="cushy-ext-close-js">×</button></div></div>');
    $('#cushy-ext-dialog').animate({
      height: '30px'
    }, 500, function() {
    });
  },
  close: function(){
    $('#cushy-ext-dialog').animate({
      height: '0px',
      opacity: 0
    }, 1000, function() {
    });
  },
  submit: function(tempData){
    //localへの保存 + サーバへの保存
    var url = tempData.url;
    var loginElementName = tempData.loginElementName;
    var loginId = tempData.loginId[0];
    var passwordElementName = tempData.passwordElementName;
    var password = tempData.password[0];

    storageData = {}
    storageData[url] = { 'loginElementName': loginElementName,
                  'loginId': loginId,
                  'passwordElementName': passwordElementName,
                  'password': password
                }
    chrome.storage.local.set(storageData, function() {
          // Notify that we saved.
      if(chrome.extension.lastError !== undefined) {
        console.log('failed');
      }else{
        console.log('ok!save');
      }
    });

    $.ajax({
      method: "post",
      url : "http://133.242.16.11:3000/apis/accounts",
      data: {
              userId: '2', //認証方法は別途検討
              loginId: loginId,
              loginElementName: loginElementName,
              password: password,
              passwordElementName: passwordElementName,
              url: url
            },
      beforesend: function(){
      }
    }).done(function(data ,status){
      //成功のアニメーション

    }).fail(function(state){
      //失敗のアニメーション
    });
  }
}

