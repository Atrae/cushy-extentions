var PasswordGenerator = function(){
  this.randomPassword;
}

PasswordGenerator.prototype = {
  generate: function(){
    var n = 62;
    var num = 12; //文字数
    var randomPassword = '';
    var baseString ='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for(var i=0; i<num; i++) {
      randomPassword += baseString.charAt( Math.floor( Math.random() * n));
    }
    this.randomPassword = randomPassword;
  }
}
