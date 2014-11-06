$(function(){
  var client = new popupClient();
  client.refresh();

  $(document).on('click', 'button.removeBtn', function(){
    // ここは気持ち悪いがclassが何故か使えないので、一旦直書きで対応
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
  });

  $(document).on('click', 'button.editBtn', function(){
  });

  $(document).on('click', 'button.loginBtn', function(){
    var url = $(this).attr('url');
    chrome.tabs.create({ 'url': 'http://' + url }, function(tab){});
  });

  //var account = new accountList(url, accounts[i].loginId, accounts[i].password);
  // accountLists.push(account);
});

