window.addEventListener('load', function(evt) {
  if(document.getElementById('loginSubmit')){
    document.getElementById('loginSubmit')
      .addEventListener('click', function(){loginBtnSubmit()}, false);
  }
});

function loginBtnSubmit() {
  //loginの処理を記入
  var user = new User();
  var mail = document.getElementById('mail').value;
  var password = document.getElementById('password').value;
  user.login(mail, password);
}
