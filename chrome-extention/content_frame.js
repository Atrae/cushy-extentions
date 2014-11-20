var saveDialog = new saveDialog();

//chrome.storage.local.clear(function(){ });

var dialogFunction = function(msg, sender, sendResponse) {
  var tempData = msg.tempData;
  if(msg.action === "openDialogBox"){
    if(tempData.checkOpenDialogBox()){
      saveDialog.setSubmitMsg("登録する");
      saveDialog.message = tempData.domain +"での"+ tempData.loginId +"のアカウントを登録しますか？";

      chrome.storage.local.get(['groups'], function(result){
        saveDialog.select_options += "<option group-id='0'>For Me</option>";
        for(key in result['groups']){
          saveDialog.select_options += "<option group-id='"+result['groups'][key][0].id+"'>For "+ key +"</option>";
        }
        saveDialog.insert();
      });

      $(document).on('click', 'input.cushy-ext-submit-js', function(){
        tempData.groupId = $(this).closest('#cushy-ext-dialog').find('#forDialog option:selected').attr('group-id');
        saveDialog.submit(tempData, 'save');
      });
    }
  }else if(msg.action === "confirmChangePasswordBox"){
    saveDialog.setSubmitMsg("変更する");
    saveDialog.message = tempData.domain +"での"+ tempData.loginId +"のアカウントのPWを変更しますか？";
    saveDialog.insert();

    $(document).on('click', 'input.cushy-ext-submit-js', function(){
      saveDialog.submit(msg.tempData, 'changePassword');
    });

  }else if(msg.action === "noLoginNotification"){
    saveDialog.message = "現在未ログインのようです。ログインしていただかないとアカウントは登録されません。";
    saveDialog.insert();
  }else if(msg.action === "fillAccount"){
    var submitBtn, loginIdElementName, passWordElementName;
    for(var i=0, len=msg.accountData.length; i < len; i++){
      saveDialog.select_options += "<option login-id='"+i+"'>"+ msg.accountData[i].loginId +"</option>"
    }
    for(var i=0, len=forms.length; i < len; i++){
      if(forms[i].type === "signIn"){
        loginIdElementName = forms[i].loginIdElementName;
        passWordElementName = forms[i].passwordElementName;
        submitBtn = forms[i].submitBtn;
        break;
      }
    }
    if(passWordElementName){
      saveDialog.message = "以前登録したアカウントでloginしますか？";
      saveDialog.setSubmitMsg("login");
      saveDialog.insert();
      $(document).on('click', '.cushy-ext-submit-js', function(){
        var account =  msg.accountData[$(this).closest('#cushy-ext-dialog').find('select#forDialog option:selected').attr('login-id')];
        $(document).find('input[name="'+loginIdElementName+'"]').val(account.loginId);
        $(document).find('input[name="'+passWordElementName+'"]').val(account.password);
        if(submitBtn){
          $(document).find(submitBtn).click();
        }else{
          forms[i].formData.submit();
        }
      });
    }
  }else if(msg.action === "autoLogin" || msg.action === "analogLogin"){
    var account = msg.accountData;
    for(var i=0, len = forms.length; i < len; i++){
      if(forms[i].type === "signIn"){
        $(document).find('input[name="'+forms[i].loginIdElementName+'"]').val(account.loginId);
        $(document).find('input[name="'+forms[i].passwordElementName+'"]').val(account.password);
        if(forms[i].submitBtn){
          $(document).find('[name="'+forms[i].submitBtn.name+'"]').click();
        }else{
          forms[i].formData.submit();
        }
      }
    }
  }

  $(document).on('click', '.cushy-ext-close-js', function(){
    saveDialog.close();
  });
}

chrome.extension.onMessage.addListener(dialogFunction);

var forms = [];
$(document).find('form').each(function(){
  var form = new Form($(this));
  form.setInitValue();
  forms.push(form);
  console.dir(form);
  if(form.type === "signUp"){
    setRandomPassword(form);
  }
});

$(document).on('submit', 'form', function(){
  var index = $('form').index($(this));
  chrome.runtime.sendMessage({ action: forms[index].type, passwordElementName: forms[index].passwordElementName, loginIdElementName: forms[index].loginIdElementName, url: forms[index].url }, function(){ });
});

$('a').on('click', function(){
  if($(this).closest('form').length > 0){
    var index = $('form').index($(this).closest('form'));
    chrome.runtime.sendMessage({
      action: forms[index].type,
      passwordElementName: forms[index].passwordElementName,
      loginIdElementName: forms[index].loginIdElementName,
      url: forms[index].url
    }, function(){});
  }
});

function setRandomPassword(form){
  if($('input[name="'+form.passwordElementName+'"]')[0]){
    var passwordGenerator = new PasswordGenerator();
    passwordGenerator.generate();
    var rect = $('input[name="'+form.passwordElementName+'"]')[0].getBoundingClientRect();
    var top = (rect.top + rect.height/2) - 8;
    var left = (rect.left + rect.width) - 15;

    $('body').append('<div id="cushy_password_form"></div>');
    $('div#cushy_password_form').attr('style', 'cursor: auto; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAYmwAAGJsBSXWDlAAAActpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+d3d3Lmlua3NjYXBlLm9yZzwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KGMtVWAAAAYhJREFUOBGNkr1KA1EQhfcvaATBv07QGBQL0ULwHWwCEqwsgz6BtS9g6zto4ROICHYKWgkWVqJio5VFVHCz1+/szpVN2IADJ3Nm5szcu3cSBNUWkQ5LJXHl/mVl4eCgcq1ymD91gepESVGDN0txJU0suxLHcS+KolfiWVAjvgUO7JhGA3OLzevkTJzGdhiGLTBOg4Y24LuqYXXn3DFeWn2Ok0DNDui00SzLLmmEknRug+apPCjia+P6xEeg3sJougG65ha3OBDH71NdtvwVfJXcC3EXPl90Fr/TJD8kRPBshUXiDtgjXlMOfiSNYdt0xX5JnllB0/WQ5xar4Z2cbnJquZS4AXLzu53j9DtwiOjEhN/4L3HyD/i2bojvWK9fQt+/bAbBJ0jBD+iBLnBJkmxao1z+gP50rSXfLaIleB1ourYkzRgI2FD+FtARoM31ndxTIk3TJ5ze4Q3oyuv4CxCw0nt5TG9QaX6vWtHkgKI5EA8N/RAJ9Al/DzW0o6Kg7y4PksS/V5/8Fz9VUkPgHytLAAAAAElFTkSuQmCC) !important; background-attachment: scroll !important;background-position: 100% 50%;background-repeat: no-repeat !important; vertical-align: top; position: absolute; top: '+top+'px; left: '+left+'px; z-index: 13; width: 16px; height: 16px;');

    $('#cushy_password_form').click(function(){
      $('input[name="'+form.passwordElementName+'"]').val(passwordGenerator.randomPassword);
      if(form.passwordConfirmElementName){
        $('input[name="'+form.passwordConfirmElementName+'"]').val(passwordGenerator.randomPassword);
      }
      alert('password generated!');
    });
  }
}


function dialogClose(){
  chrome.runtime.sendMessage({action: "dialogClose"}, function(){});
}
