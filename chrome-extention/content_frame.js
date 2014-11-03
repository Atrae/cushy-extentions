var saveDialog = new saveDialog();
var localData = new localData();

//chrome.storage.local.clear(function(){ });
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  var tempData = msg.tempData;
  if(msg.action === "openDialogBox"){
    // open dialog box
    saveDialog.button = '<input type="submit" class="cushy-ext-submit-js" style="width: 70px; height: 25px; margin: 0;" value="登録する">';
    saveDialog.message = tempData.url +"での"+ tempData.loginId +"のアカウントを登録しますか？"
    saveDialog.insert();
    $('input.cushy-ext-submit-js').click(function(){
      saveDialog.submit(msg.tempData);
      chrome.runtime.sendMessage({action: "dialog_close"}, function(){});
    });
  }else if(msg.action === "noLoginNotification"){
    // prompt login
    saveDialog.message = "現在未ログインのようです。ログインしていただかないとアカウントは登録されません。";
    saveDialog.button = '';
    saveDialog.insert();
  }else if(msg.action === "fillAccount" ){
    // fill account
    var loginElementName = 'input[name="'+ msg.accountData.loginElementName + '"]';
    var passwordElementName = 'input[name="'+ msg.accountData.passwordElementName + '"]';
    if($(document).find(passwordElementName).length > 0){
      saveDialog.message = "以前登録したアカウントでloginしますか？";
      saveDialog.button = '<input type="submit" class="cushy_ext_login-js" style="width: 70px; height: 25px; margin: 0;" value="ログインする">';
      saveDialog.insert();
      $('input.cushy_ext_login-js').click(function(){
        $(document).find(passwordElementName).val(msg.accountData.password);
        $(document).find(loginElementName).val(msg.accountData.loginId);
        $(document).find(loginElementName).closest('form').find('input[type="submit"]').click();
      });
    }
  }

  $('button.cushy-ext-close-js').click(function(){
    saveDialog.close();
    chrome.runtime.sendMessage({action: "dialog_close"}, function(){});
  });
});

$(function(){
  var forms = [];
  $(document).find('form').each(function(){
    var form = new Form($(this));
    form.setInitValue();
    forms.push(form);
    if(form.type === "signUp"){
      setRandomPassword(form);
    }
  });

  $(document).on('submit', 'form', function(){
    var index = $('form').index($(this));
    chrome.runtime.sendMessage({ action: forms[index].type }, function(){ });
  });

  $('a').on('click', function(){
    if($(this).closest('form').length > 0){
      var index = $('form').index($(this).closest('form'));
      chrome.runtime.sendMessage({ action: forms[index].type }, function(){ });
    }
  });
});


function setRandomPassword(form){
  var passwordGenerator = new PasswordGenerator();
  passwordGenerator.generate();
  $('input[name="'+form.passwordElementName+'"]').val(passwordGenerator.randomPassword);
  $('input[name="'+form.passwordElementName+'"]').attr('style', 'cursor: auto; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAYmwAAGJsBSXWDlAAAActpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+d3d3Lmlua3NjYXBlLm9yZzwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KGMtVWAAAAYhJREFUOBGNkr1KA1EQhfcvaATBv07QGBQL0ULwHWwCEqwsgz6BtS9g6zto4ROICHYKWgkWVqJio5VFVHCz1+/szpVN2IADJ3Nm5szcu3cSBNUWkQ5LJXHl/mVl4eCgcq1ymD91gepESVGDN0txJU0suxLHcS+KolfiWVAjvgUO7JhGA3OLzevkTJzGdhiGLTBOg4Y24LuqYXXn3DFeWn2Ok0DNDui00SzLLmmEknRug+apPCjia+P6xEeg3sJougG65ha3OBDH71NdtvwVfJXcC3EXPl90Fr/TJD8kRPBshUXiDtgjXlMOfiSNYdt0xX5JnllB0/WQ5xar4Z2cbnJquZS4AXLzu53j9DtwiOjEhN/4L3HyD/i2bojvWK9fQt+/bAbBJ0jBD+iBLnBJkmxao1z+gP50rSXfLaIleB1ourYkzRgI2FD+FtARoM31ndxTIk3TJ5ze4Q3oyuv4CxCw0nt5TG9QaX6vWtHkgKI5EA8N/RAJ9Al/DzW0o6Kg7y4PksS/V5/8Fz9VUkPgHytLAAAAAElFTkSuQmCC) !important; background-attachment: scroll !important;background-position: 100% 50%;background-repeat: no-repeat !important;');
}
