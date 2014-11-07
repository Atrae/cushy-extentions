var AccountList = function(){
  this.url;
  this.loginId;
  this.password;
}

AccountList.prototype = {
  remove: function(){
    chrome.storage.local.get(['userInfo'], function(result){
      $.ajax({
        method: "delete",
        url : "http://localhost:3000/apis/accounts",
        data: {
                userId: result['userInfo'].userId, //認証方法は別途検討
                apiKey: result['userInfo'].apiKey,
                accountId: 3 //アカウントid
              },
        beforesend: function(){
          // loading
        }
      }).done(function(data ,status){
      //成功のアニメーション
      }).fail(function(state){
      //失敗のアニメーション
      });
    });
  }
}
