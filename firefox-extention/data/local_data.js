var localData = function(loginElementName, loginId, passwordElementName, password, url){
  this.loginElementName = loginElementName;
  this.loginId = loginId;
  this.passwordElementName = passwordElementName;
  this.password = password;
  this.url = url;
}

localData.prototype = {
  sync: function(){
    //browserのlocaldataと同期させる
  },
  save: function(){
    //localdataに保存
  },
  insert: function(url){
    //アカウント登録がされている場合に、そのアカウントをformに代入する
    chrome.storage.local.get([url], function(values){
      if(chrome.extension.lastError !== undefined) {
        // failure
        console.log('error');
      }else {
        // success
        var data = values[url];
        console.dir(data);
        console.dir('input[name="'+ data.loginElementName +'"]');
        //$('document').find('input[name="user[mail]"]').val('cuuuuuushy');
        //$('document').find('input#user_mail').val('cuuuuuushy');
      }
    });
  }
}
