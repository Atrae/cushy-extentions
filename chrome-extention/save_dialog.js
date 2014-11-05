var saveDialog = function(message, button, select_options){
  this.message = message;
  this.select_options = select_options;
  this.button = button;
}

saveDialog.prototype = {
  insert: function(){
    var html = '<div id="cushy-ext-dialog" style="width: 100%; position: fixed; top: 0px; height: 0px; background-color: #fdf0bc;">';
    html += '<p style="float: left;">'+ this.message + '</p>';
    if(this.select_options){
      html += '<select id="loginIdSelect">' + this.select_options +'</select>';
    }
    html += '<div class="cushy-ext-dialog-js">'+ this.button +'<button class="cushy-ext-close-js">close</button></div>';
    html += '</div>';
    $('body').append(html);
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
  submit: function(tempData, submitType){
    //localへの保存 + サーバへの保存
    var url = tempData.url;
    var loginElementName = tempData.loginElementName;
    var loginId = tempData.loginId[0];
    var passwordElementName = tempData.passwordElementName;
    var password = tempData.password[0];
    var storageData = {};
    chrome.storage.local.get([url], function (result){
      var accountInfos = result[url];
      if(accountInfos === undefined || accountInfos === null){
        accountInfos = [];
      }
      if(submitType === 'save'){ //save ver.
        accountInfos.push({
                            'loginElementName': loginElementName,
                            'loginId': loginId,
                            'passwordElementName': passwordElementName,
                            'password': password
                         })
      }else if(submitType === 'changePassword'){
        for(i in accountInfos){
          if(loginId === accountInfos[i].loginId){
            accountInfos[i].password = password;
            accountInfos[i].passwordElementName = passwordElementName;
          }
        }
      }
      storageData[url] = accountInfos;
      chrome.storage.local.set(storageData, function(result){
        // Notify that we saved.
        if(chrome.extension.lastError !== undefined) {
          console.log('failed');
        }else{
          console.log('ok!save');
        }
      });
    });

    chrome.storage.local.get(['userInfo'], function(result){
      $.ajax({
        method: "post",
        url : "http://localhost:3000/apis/accounts",
        data: {
                userId: result['userInfo'].userId, //認証方法は別途検討
                loginId: loginId,
                loginElementName: loginElementName,
                password: password,
                passwordElementName: passwordElementName,
                url: url,
                api_key: result['userInfo'].apiKey
              },
        beforesend: function(){
        }
      }).done(function(data ,status){
        //成功のアニメーション

      }).fail(function(state){
        //失敗のアニメーション
      });
    });
    this.close();
  }
}

