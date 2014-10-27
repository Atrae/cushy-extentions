var User = function(){
}
User.prototype = {
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
          //ログイン用のモーダル表示
          $('#loginBlock').hide();
          $('#loadingImage').show();
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
          var userInfo = {
                           'userId': data['user_id'],
                           'mail': mail,
                           'password': password,
                           'apiKey': data['api_key']
                         }
          chrome.storage.local.set( { 'userInfo': userInfo } );
          // i wanna close popup here.
        }else{
          // login failed
          $('#errorNotification').show();
          $('#errorNotification').text('mail or password is wrong!');
          $('#loginBlock').show();
        }
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
