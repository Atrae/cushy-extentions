var Form = function(form){
  this.formData = form;
  this.submitBtn;
  this.elementStr = '';
  this.type;
  this.actionUrl;
  this.url;
  this.loginIdElementName;
  this.passwordElementName;
  this.passwordConfirmElementName;
  this.loginIdElementDom;
  this.passwordElementDom;
}

Form.prototype = {
  setInitValue: function(){
    this.actionUrl = this.formData.getAttribute('action');
    this.setSubmitBtn();
    this.setElementStr();
    this.checkType();

    if(this.type === "signIn" || this.type === "signUp"){
      this.setPasswordField();
      this.setLoginIdField();
    }
    if(this.type === "signIn"){
      this.setUrl();
    }
  },
  setUrl: function(){
    this.url = location.href;
  },
  setSubmitBtn: function(){
    if(this.formData.querySelector('[type="submit"]')){
      this.submitBtn = this.formData.querySelector('[type="submit"]');
    }
    if(!this.submitBtn){
      if(this.formData.getElementsByTagName('button')){
        this.submitBtn = this.formData.getElementsByTagName('button');
      }
    }
    if(!this.submitBtn){
      if(this.formData.querySelector('input[type="button"]')){
        this.submitBtn = this.formData.getElementsByTagName('button');
      }
    }
  },
  setElementStr: function(){
    if(this.submitBtn){
      if(this.submitBtn.value){
        this.elementStr += this.submitBtn.value;
      }
      if(this.submitBtn.text != undefined){
        this.elementStr += this.submitBtn.text;
      }
      if(this.submitBtn.textContent != undefined ){
        this.elementStr += this.submitBtn.textContent;
      }
      if(this.submitBtn.id != undefined){
        this.elementStr += this.submitBtn.id;
      }
      if(this.submitBtn.className != undefined){
        this.elementStr += this.submitBtn.className;
      }
      if(this.submitBtn.name != undefined){
        this.elementStr += this.submitBtn.name;
      }
    }
  },
  checkType: function(){

    if(this.actionUrl){
      if(this.actionUrl.indexOf('login') != -1 || this.actionUrl.indexOf('signin') != -1){
        this.type = 'signIn';
      }
    }

    if(!this.type){
      var singUpTextArray = [
        "sign up",
        "signup",
        "Create a new account",
        "登録",
        "作成",
        "registration",
        "entry",
        "register"
      ];
      for(var i=0, len=singUpTextArray.length; i < len; i++){
        re = new RegExp(singUpTextArray[i], "i");
        if(this.elementStr.match(re)){
          this.type = 'signUp';
          break;
        }
      }
      if(!this.type){
        var signInTextArray = ["sign in", "signin", "login", "log in", "ログイン"];
        for(var i=0, len=signInTextArray.length; i < len; i++){
          re = new RegExp(signInTextArray[i], "i");
          if(this.elementStr.match(re)){
            this.type = 'signIn';
            break;
          }
        }
      }
    }
  },
  setPasswordField: function(){
    var passwordFields = this.formData.querySelectorAll('[type="password"]');
    if(passwordFields.length > 0){
      if(passwordFields.length > 1){ //confirm_form input
        this.passwordConfirmElementName = passwordFields[1].name;
      }
      this.passwordElementName = passwordFields[0].name;
      this.passwordElementDom = passwordFields[0];
    }else{
      var textFields = this.formData.querySelectorAll('input[type="text"]');
      if(textFields.length > 0){
        for(var i=0, len = textFields.length; i < len; i++){
          if(judgingPasswordForm(textFields[i])){
            this.passwordElementName = textFields[i].name;
            this.passwordElementDom = textFields[i];
            continue;
          }
          if(this.passwordElementName && judgingPasswordForm(textFields[i])){
            form.passwordConfirmElementName = textFields[i].name;
            break;
          }
        }
      }
    }
  },
  setLoginIdField: function(){
    var mailField = this.formData.querySelector('[type="email"]');
    var textFields = this.formData.querySelectorAll('[type="text"]');

    //loginIdElementNameに関しては少しロジックを入れる予定
    if(mailField){
      this.loginIdElementName = mailField.name;
      this.loginIdElementDom = mailField;

    }else if(textFields.length > 0){
      var mailDom, userDom, nameDom, loginIdDom;
      for(var i=0, len=textFields.length; i < len; i++){
        var elementStr = "";
        elementStr += textFields[i].name;
        elementStr += textFields[i].id;
        elementStr += textFields[i].className;

        if(elementStr.match(/(.+)?mail(.)?/)){
          mailDom = textFields[i];
        }else if(elementStr.match(/(.+)?user(.+)?id(.)?/)){
          userDom = textFields[i];
        }else if(elementStr.match(/(.+)?name(.+)?/)){
          nameDom = textFields[i];
        }else if(elementStr.match(/(.+)?login(.+)?/)){
          loginIdDom = textFields[i];
        }
      }
      var correctDom;
      if(mailDom){
        correctDom = mailDom;
      }else if(userDom){
        correctDom = userDom;
      }else if(nameDom){
        correctDom = nameDom;
      }else if(loginIdDom){
        correctDom = loginIdDom;
      }

      this.loginIdElementName = correctDom.name;
      this.loginIdElementDom = correctDom;

    }
  }
}


function judgingPasswordForm(element){
  var elementStr = '';
  var result;
  if(element.name != undefined){
    elementStr = element.name;
  }
  if(element.className != undefined){
    elementStr = element.className;
  }
  if(element.id != undefined){
    elementStr = element.id;
  }
  if(elementStr.match(/password/)){
    result = true;
  }else{
    result = false;
  }
  return result;
}
