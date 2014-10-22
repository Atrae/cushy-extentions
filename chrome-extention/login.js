window.addEventListener('load', function(evt) {
  $('#submit').click(function(){
    loginBtnSubmit();
  });
});

function loginBtnSubmit() {
  //loginの処理を記入
  var user = new User();
  user.login($('input#mail').val(), $('input#password').val());
}


