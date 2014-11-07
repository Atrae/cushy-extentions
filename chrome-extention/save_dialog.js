var saveDialog = function(message, button, select_options){
  this.message = message;
  this.select_options = select_options;
  this.button = button;
}

saveDialog.prototype = {
  insert: function(){
    var html = '<div id="cushy-ext-dialog" style="width: 380px; position: fixed; top: 10px; z-index: 99999; background-color: rgba(17, 31, 52, 0.4); border-radius: 4px; right: 10px;box-shadow: 0 0 5px rgba(55,55,55,0.2);">';
    html += '<div style="margin: 0; padding: 5px; background-color: #667894; border-radius: 2px;">';
    html += '<div style="color: #fff; text-align: center;font-size: 18px; padding-bottom: 5px; position: relative;">';
    html += 'Cushy';
    html += '<div style="color: #D6D6D6; font-size: 18px; padding-bottom: 5px; position: absolute; top: -3px; right: 5px;">';
    html += '<div class="cushy-ext-dialog-js"><button class="cushy-ext-close-js" style="background: transparent; color: #fff; font-size: 18px; padding: 0; margin: 0; line-height: 1; border: 0;">×</button></div>';
    html += '</div>';
    html += '</div>';
    html += '<div style="background: #F9F9F9; padding: 5px 15px 15px;">';
    html += '<p style="margin: 10px 0 5px; font-size: 13px;">'+ this.message + '</p>';
    if(this.select_options){
      html += '<select id="loginIdSelect" style="font-size: 16px; padding: 10px; margin: 0 0 5px; width: 100%; height: 2em; border: 2px solid #f9f9f9; background: #fff;">' + this.select_options +'</select>';
    }
    html += '<div class="cushy-ext-dialog-js">'+ this.button +'</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    $('body').append(html);
    $('#cushy-ext-dialog').animate({
      // height: '30px'
    }, 130, function() {
    });
  },
  close: function(){
    $('#cushy-ext-dialog').animate({
      height: '0px',
      opacity: 0
    }, 130, function() {
    });
  },
  submit: function(tempData, submitType){
    //localへの保存 + サーバへの保存
    var url = tempData.url;
    var loginElementName = tempData.loginElementName;
    var loginId = tempData.loginId[0];
    var passwordElementName = tempData.passwordElementName;
    var password = tempData.password[0];
    var loginUrl = tempData.loginUrl;
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
                            'password': password,
                            'loginUrl': loginUrl
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

