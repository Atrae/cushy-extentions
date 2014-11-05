var Form = function(form){
  this.formData = form;
  this.submitBtn;
  this.submitBtnText;
  this.elementStr = '';
  this.type;
  this.setUrl;
  this.loginIdElementName;
  this.passwordElementName;
  this.passwordConfirmElementName;
}

Form.prototype = {
  setInitValue: function(){
    this.setUrl();
    this.setSubmitBtn();
    if(this.submitBtn){
      this.setElementStr();
      this.checkType();
    }
    if(this.type === "signIn" || this.type === "signUp"){
      this.setPasswordField();
      this.setLoginIdField();
    }
  },
  setUrl: function(){
    this.setUrl = this.formData.attr('action');
  },
  setSubmitBtn: function(){
    if(this.formData.find('[type="submit"]').length > 0){
      this.submitBtn = this.formData.find('[type="submit"]')[0];
    }
    if(!this.submitBtn){
      if(this.formData.find('button').length > 0){
        this.submitBtn = this.formData.find('button')[this.formData.find('button').length-1];
      }
    }
    if(!this.submitBtn){
      if(this.formData.find('input[type="button"]').length > 0){
        this.submitBtn = this.formData.find('button')[this.formData.find('input[type="button"]').length-1];
      }
    }
  },
  setElementStr: function(){
    if(this.submitBtn.value){
      this.elementStr += this.submitBtn.value;
    }else{
      if(this.submitBtn.text != undefined){
        this.elementStr += this.submitBtn.text;
      }else if(this.submitBtn.textContent != undefined ){
        this.elementStr += this.submitBtn.textContent;
      }
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
  },
  setSubmitBtnText: function(){
    this.submitBtnText = this.submitBtn.value;
    if(!this.submitBtnText){
      this.submitBtnText = this.submitBtn.text;
    }
    if(!this.submitBtnText){
      //this.submitBtnText = this.submitBtn.html();
    }
  },
  checkType: function(){
    var singUpTextArray = ["sign up", "signup", "Create a new account", "登録", "作成", "registration", "entry", "register"];
    for(var i=0; i < singUpTextArray.length; i++){
      re = new RegExp(singUpTextArray[i], "i");
      if(this.elementStr.match(re)){
        this.type = 'signUp';
        break;
      }
    }
    if(!this.type){
      var signInTextArray = ["sign in", "signin", "login", "log in", "ログイン"];
      for(var i=0; i < signInTextArray.length; i++){
        re = new RegExp(signInTextArray[i], "i");
        if(this.elementStr.match(re)){
          this.type = 'signIn';
          break;
        }
      }
    }
  },
  setPasswordField: function(){
    var passwordField = this.formData.find('[type="password"]');
    if(passwordField.length > 0){
      if(passwordField.length > 1){ //confirm_form input
        this.passwordConfirmElementName = passwordField[1].name;
      }
      this.passwordElementName = passwordField.attr('name');
    }else{
      var textField = this.formData.find('input[type="text"]');
      if(textField.length > 0){
        for(var i=0; i < textField.length; i++){
          if(judgingPasswordForm(textField[i])){
            this.passwordElementName = textField[i].name;
            continue;
          }
          if(this.passwordElementName && judgingPasswordForm(textField[i])){
            form.passwordConfirmElementName = textField[i].name;
            break;
          }
        }
      }
    }
  },
  setLoginIdField: function(){
    var mailField = this.formData.find('[type="email"]');
    var textField = this.formData.find('[type="text"]');

    //loginIdElementNameに関しては少しロジックを入れる予定
    if(mailField.length > 0){
      this.loginIdElementName = mailField.attr('name');
    }else if(textField.length > 0){
      var mailId, userId, nameId, loginId;
      for(var i=0; i < textField.length; i++){
        var elementStr = "";
        elementStr += textField[i].name;
        elementStr += textField[i].id;
        elementStr += textField[i].className;

        if(elementStr.match(/(.+)?mail(.)?/)){
          mailId = textField[i].name;
        }else if(elementStr.match(/(.+)?user(.+)?id(.)?/)){
          userId = textField[i].name;
        }else if(elementStr.match(/(.+)?name(.+)?/)){
          nameId = textField[i].name;
        }else if(elementStr.match(/(.+)?login(.+)?/)){
          loginId = textField[i].name;
        }
      }
      if(mailId){
        this.loginIdElementName = mailId;
      }else if(userId){
        this.loginIdElementName = userId;
      }else if(nameId){
        this.loginIdElementName = nameId;
      }else if(loginId){
        this.loginIdElementName = loginId;
      }
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
