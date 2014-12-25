var dialog = new Dialog();

//chrome.storage.local.clear(function(){});

//chrome.storage.local.get(null, function(result){
//  console.dir(result);
//});

var elementExist = function (element) {
  element.getBoundingClientRect().height === 0
}

var formValid = function (form) {
  var result = false;
  if (!form.action.match(/http|https/) || (form.action.match(/http|https/) && form.action.match(location.host))) {
    result = true;
  }
  return result;
}

var forms = [];
var formDoms = document.getElementsByTagName('form');
for (var i=0,len=formDoms.length; i<len; i++) {
  var formDom = formDoms[i];
  if (elementExist(formDom)) continue;
  if (!formValid(formDom)) continue;
  var form = new Form(formDom);
  form.setInitValue();
  forms.push(form);
  console.log(form);
  if (form.type === "signUp") setRandomPassword(form);
}

var observer = new MutationObserver(function (mutations) {
  for (var i=0, len=mutations.length; i < len; i++) {
    if (mutations[i].addedNodes.length > 0) {
      var node = mutations[i].addedNodes[0];
      var formDom = node.querySelector('form');
      if (formDom) {
        var form = new Form(formDom);
        form.setInitValue();
        forms.push(form);
        if (form.type === "signUp") setRandomPassword(form);
        if (form.type === "signIn") {
          chrome.runtime.sendMessage({ action: "fillAccountCheck" });
        }
      }
    }
  }
});
observer.observe(document.body, { childList: true });

var openDialogBoxFunc = function (account, groups) {
  if (account.domain && account.loginId && account.password) {
    dialog.setForSave(account, groups);
    document.addEventListener('click', function (e) {
      if (e.target.className ==='cushy-ext-submit-js') {
        var teamOptions = document.getElementById('forDialog').options;
        account.groupId = teamOptions[teamOptions.selectedIndex].getAttribute('group-id');
        dialog.submit(account, 'save');
      } else if (e.target.className ==='cushy-ext-never-disp-js') {
        // 別途検討
        dialog.registerNgUrl(account.domain);
      }
    });
  }
}

var confirmChangePasswordBoxFunc = function () {
  dialog.setForChangePw(account);
  document.addEventListener('click', function (e) {
    if (e.target.className ==='cushy-ext-submit-js') {
      dialog.submit(account, 'changePassword');
    }
  });
}

var fillAccountFunc = function (accounts) {
  var submitBtn, loginIdElementName, passWordElementName;
  dialog.setForFill(accounts);
  for (var i = 0, len = forms.length; i < len; i++) {
    if (forms[i].type === "signIn") {
      loginIdElementName = forms[i].loginIdElementName;
      passWordElementName = forms[i].passwordElementName;
      submitBtn = forms[i].submitBtn;
      break;
    }
  }
  if (passWordElementName) {
    dialog.setForLogin();
    document.addEventListener('click', function (e) {
      if (e.target.className ==='cushy-ext-submit-js') {
        var teamOptions = document.getElementById('forDialog').options;
        var loginId = teamOptions[teamOptions.selectedIndex].getAttribute('login-id');
        var account =  accounts[loginId];
        document.querySelector('input[name="'+loginIdElementName+'"]').value = account.loginId;
        document.querySelector('input[name="'+passWordElementName+'"]').value = account.password;
        if (submitBtn) {
          submitBtn.click();
        } else {
          forms[i].formData.submit();
        }
      }
    });
  }
}

var autoLoginFunc = function (account) {
  for (var i=0, len = forms.length; i < len; i++) {
    if (forms[i].type === "signIn") {
      document.querySelector('input[name="'+forms[i].loginIdElementName+'"]').value = account.loginId;
      document.querySelector('input[name="'+forms[i].passwordElementName+'"]').value = account.password;
      if (forms[i].submitBtn) {
        forms[i].submitBtn.click();
      } else {
        forms[i].formData.submit();
      }
    }
  }

}

var dialogFunction = function (msg, sender, sendResponse) {
  var account = msg.account;
  var groups = msg.groups;
  switch (msg.action) {
    case "openDialogBox":
      openDialogBoxFunc(account, groups);
      break;
    case "confirmChangePasswordBox":
      confirmChangePasswordBoxFunc();
      break;
    case "noLoginNotification":
      dialog.setForNoLogin();
      break;
    case "fillAccount":
      fillAccountFunc(msg.accountData);
      break;
    case "autoLogin":
      autoLoginFunc(msg.accountData);
      break;
    case "analogLogin":
      autoLoginFunc(msg.accountData);
      break;
    default:
      break;
  }

  document.addEventListener('click', function (e) {
    if (e.target.className ==='cushy-ext-close-js') {
      dialog.close();
    }
  });
}

chrome.extension.onMessage.addListener(dialogFunction);

document.addEventListener('submit', function (e) {
  if (e.target.tagName ==='FORM') {
    var index = indexInElements(e.target);
    chrome.runtime.sendMessage({
      action: forms[index].type,
      passwordElementName: forms[index].passwordElementName,
      loginIdElementName: forms[index].loginIdElementName,
      url: forms[index].url
    });
  }
});

function setRandomPassword (form) {
  if (document.querySelector('input[name="'+form.passwordElementName+'"]')) {
    var passwordGenerator = new PasswordGenerator();
    passwordGenerator.generate();
    var rect = document.querySelector('input[name="'+ form.passwordElementName +'"]').getBoundingClientRect();
    var top = (rect.top + rect.height/2) - 8;
    var left = (rect.left + rect.width) - 15;

    var element = document.createElement('div');
    element.id = "cushy_password_form";

    document.body.appendChild(element);
    document.getElementById('cushy_password_form').setAttribute('style', 'cursor: auto; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAYmwAAGJsBSXWDlAAAActpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+d3d3Lmlua3NjYXBlLm9yZzwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KGMtVWAAAAYhJREFUOBGNkr1KA1EQhfcvaATBv07QGBQL0ULwHWwCEqwsgz6BtS9g6zto4ROICHYKWgkWVqJio5VFVHCz1+/szpVN2IADJ3Nm5szcu3cSBNUWkQ5LJXHl/mVl4eCgcq1ymD91gepESVGDN0txJU0suxLHcS+KolfiWVAjvgUO7JhGA3OLzevkTJzGdhiGLTBOg4Y24LuqYXXn3DFeWn2Ok0DNDui00SzLLmmEknRug+apPCjia+P6xEeg3sJougG65ha3OBDH71NdtvwVfJXcC3EXPl90Fr/TJD8kRPBshUXiDtgjXlMOfiSNYdt0xX5JnllB0/WQ5xar4Z2cbnJquZS4AXLzu53j9DtwiOjEhN/4L3HyD/i2bojvWK9fQt+/bAbBJ0jBD+iBLnBJkmxao1z+gP50rSXfLaIleB1ourYkzRgI2FD+FtARoM31ndxTIk3TJ5ze4Q3oyuv4CxCw0nt5TG9QaX6vWtHkgKI5EA8N/RAJ9Al/DzW0o6Kg7y4PksS/V5/8Fz9VUkPgHytLAAAAAElFTkSuQmCC) !important; background-attachment: scroll !important;background-position: 100% 50%;background-repeat: no-repeat !important; vertical-align: top; position: absolute; top: '+top+'px; left: '+left+'px; z-index: 13; width: 16px; height: 16px;');
    var passwordIconHandler = function() {
      document.querySelector('input[name="'+ form.passwordElementName +'"]').value = passwordGenerator.randomPassword;
      if (form.passwordConfirmElementName) {
        document.querySelector('input[name="'+ form.passwordConfirmElementName +'"]').value = passwordGenerator.randomPassword;
      }
      alert('password generated!');
    };
    document.getElementById('cushy_password_form').addEventListener('click', passwordIconHandler, false);
  }
}


function dialogClose () {
  chrome.runtime.sendMessage({ action: "dialogClose" });
}

var Closest = function (element, tagname) {
  tagname = tagname.toLowerCase();
  do {
    if (element.nodeName.toLowerCase() === tagname) {
      return element;
    }
  }while(element = element.parentNode)
  return null;
};

var ClosestId = function (element, id) {
  do {
    if (element.id === id) {
      return element;
    }
  }while(element = element.parentNode)
  return null;
};

function indexInElements (element) {
  var elements = document.getElementsByTagName(element.tagName.toLowerCase());
  var num = 0;
  for (var i=0, len=elements.length; i<len; i++) {
    if (elements[i]===element) {
      return num;
    } else {
      num++;
    }
  }
  return -1;
}
