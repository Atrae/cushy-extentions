window.addEventListener('load', function(evt) {
  if(document.getElementById('loginSubmit')){
    document.getElementById('loginSubmit')
      .addEventListener('click', function(){loginBtnSubmit()}, false);
  }

  if(document.getElementById('forgetPassword')){
    document.getElementById('forgetPassword').addEventListener('click', function(){
      safari.application.activeBrowserWindow.openTab().url = "https://cushy-staging.herokuapp.com/user/reset_token";
    }, false);
  }

  if(document.getElementById('joinCushy')){
    document.getElementById('joinCushy').addEventListener('click', function(){
      safari.application.activeBrowserWindow.openTab().url = "https://cushy-staging.herokuapp.com/sign_up";
    }, false);
  }

});

function loginBtnSubmit() {
  //loginの処理を記入
  var user = new User();
  var mail = document.getElementById('mail').value;
  var password = document.getElementById('password').value;
  user.login(mail, password);
}
