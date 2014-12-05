var User = function(){
}
User.prototype = {
  login: function(mail, password, successFunc){
    var loginId = mail;
    var password = password;
    var request = new XMLHttpRequest();
    request.open("POST", "https://cushy-staging.herokuapp.com/api/v1/users/login", true);
    request.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" ); // only for POST requests
    request.onreadystatechange = function () {
      if(request.readyState != 4 || request.status != 201){
        document.getElementById('errorNotification').style.display='block';
        document.getElementById('errorNotification').text = 'network error!';
      }else{
        var data = JSON.parse(request.responseText);
        document.getElementById('errorNotification').style.display='none';
        if(data['result'] === true){
          document.getElementById('loginBlock').style.display='none';
          document.getElementById('loginComplete').style.display='block';
          var userInfo = {
            'userId': data.user_data.user_id,
            'mail': mail,
            'password': password,
            'apiKey': data.user_data.api_key
          }
          chrome.storage.local.set( { 'userInfo': userInfo } );
        }else{
          document.getElementById('errorNotification').style.display='block';
          document.getElementById('errorNotification').text = 'mail or password is wrong!';
        }
      }
    };
    request.send("mail="+mail+"&password="+password);
  }
};
