var Form = function(form){
  this.formData = form;
  this.type;
  this.loginIdElementName;
  this.passwordElementName;
}

Form.prototype = {
  setInitValue: function(){
    //if(this.submitBtn){
    //  this.setSubmitBtnText();
    //}
    this.checkType();
    if(this.type === "signIn" || this.type === "signUp"){
      this.setPasswordField();
      //this.setFormValue();
    }
  },
  setSubmitBtnText: function(){
    this.submitBtnText = this.submitBtn.value;
    if(!this.submitBtnText){
      this.submitBtnText = this.submitBtn.text;
    }
  },
  checkType: function(){
    var formDataHtml = this.formData.html();
    var singUpTextArray = ["sign up", "signup", "Create a new account", "登録", "作成", "registration", "entry"];
    for(var i=0; i < singUpTextArray.length; i++){
      re = new RegExp(singUpTextArray[i], "i");
      if(formDataHtml.match(re)){
        this.type = 'signUp';
        break;
      }
    }

    if(!this.type){
      var signInTextArray = ["sign in", "signin", "login", "log in", "ログイン"];
      for(var i=0; i < signInTextArray.length; i++){
        re = new RegExp(signInTextArray[i], "i");
        if(formDataHtml.match(re)){
          this.type = 'signIn';
          break;
        }
      }
    }
  },
  setPasswordField: function(){
    var passwordField = this.formData.find('[type="password"]');
    if(passwordField.length > 0){
      this.passwordElementName = passwordField.attr('name');
    }else{
      var textField = this.formData.find('input[type="text"]');
      if(textField.length > 0){
        for(var i=0; i < textField.length; i++){
          if(textField[i].name.match(/password/)){
            this.passwordElementName = textField[i].name;
            break;
          }
        }
      }
    }
  },
  setFormValue: function(){
    var forecastNames = ["mail", "user", "login"];
    var passwordField = this.formData.find('[type="password"]');
    var mailField = this.formData.find('[type="email"]');
    var textField = this.formData.find('input[type="text"]');

    if(passwordField.length > 0){
      this.passwordElementName = passwordField.attr('name');
    }

    //loginIdElementNameに関しては少しロジックを入れる予定
    if(mailField.length > 0){
      this.loginIdElementName = mailField.attr('name');
    }else if(textField.length > 0){
      for(var i=0; i < forecastNames.length; i++){
        re = new RegExp("(.+)?"+forecastNames[i]+"(.)?", "i");
        for(var i=0; i < textField.length; i++){
          if(textField[i].name.match(re)){
            this.loginIdElementName = textField[i].name;
            break;
          }
        }
        if(this.loginIdElementName){
          break;
        }
      }
    }
  }
}
