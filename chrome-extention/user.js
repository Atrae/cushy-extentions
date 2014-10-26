var User = function(){
  return {
    login: function(mail, password, funcOption){
      var loginId = mail;
      var password = password;
      $.ajax({
        method: "POST",
        url : "http://localhost:3000/apis/login",
        data: { mail: mail, password: password },
        beforeSend: function(){
          if(funcOption && funcOption.beforeSendFunc()){
            $(funcOption.beforeSendFunc());
          }else{
            $('#loginBlock').hide();
            $('#loadingImage').show();
            //ログイン用のモーダル表示
          }
        }
      }).done(function(data ,status){
        if(funcOption && funcOption.doneFunc()){
          $(funcOption.doneFunc());
        }else{
          $('#loadingImage').hide();
          $('#errorNotification').hide();

          if(data['result'] === true){
            // login success
            $('#completeImage').show();
            // set local storage
            chrome.storage.local.set({'mail': mail, 'password': password});
          }else{
            // login failed
            $('#errorNotification').show();
            $('#errorNotification').text('mail or password is wrong!');
            $('#loginBlock').show();
          }
          //ログイン完了のアニメーション
        }
      }).fail(function(state){
        $('#loadingImage').hide();
        if(funcOption && funcOption.failFunc()){
          $(funcOption.failFunc());
        }else{
          $('#errorNotification').show();
          $('#errorNotification').text('network error!');
          $('#loginBlock').show();
        }
      });
    }
  };
};


