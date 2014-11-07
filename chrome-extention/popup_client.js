var popupClient = function(){
}

popupClient.prototype = {
  refresh: function(){
    chrome.storage.local.get(null, function(result){
      var html = '';
      for(url in result){
        var accounts = result[url];
        for(var i = 0; i < accounts.length; i++){
          html += '<tr class="account">'
          html += '<td>P:</td>'
          html += '<td class="url">' + url + '</td>'
          html += '<td class="loginId">' + accounts[i].loginId + '</td>'
          //html += '<td><button service-id="3" class="removeBtn">remove</button></td>'
          html += '<td><button class="loginBtn" url="'+ accounts[i].loginUrl +'" >login</button></td>'
          //html += '<td><button service-id="'+ accounts[i].id +'" class="removebtn">remove</button></td>'
          //html += '<td><button service-id="'+ accounts[i].id +'" class="editBtn">edit</button></td>'
          //html += '<td><button service-id="'+ accounts[i].id +'" class="loginBtn">login</button></td>'
          html += '</tr>'
        }
      }
      $('table#registedAccountList').append(html);
    });
  },
  refresh_cp: function(){
    $('table#registedAccountList').append('test');
    chrome.storage.local.get(['userInfo'], function(result){
      $.ajax({
        method: "get",
        url : "http://localhost:3000/apis/accounts",
        data: {
                userId: result['userInfo'].userId, // 認証方法は別途検討
                api_key: result['userInfo'].apiKey
              },
        beforesend: function(){
          // loading
        }
      }).done(function(data ,status){
      // 成功のアニメーション
        var html = '';
        alert(data);
        for(var i=0; i < data[accounts].length; i++){
          html += '<tr class="">'
          html += '<td>画像</td>'
          html += '<td>' + data[accounts][i].user_id + '</td>'
          html += '<td>' + data[accounts][i].password + '</td>'
          html += '<td><button service-id="'+ data[accounts][i].id +'" class="removeBtn">remove</button></td>'
          html += '<td><button service-id="'+ data[accounts][i].id +'" class="editBtn">edit</button></td>'
          html += '<td><button service-id="'+ data[accounts][i].id +'" class="loginBtn">login</button></td>'
          html += '</tr>'
        }
        $('table#registedAccountList').append('test');
      }).fail(function(state){
      // 失敗のアニメーション
      });
    });
  }
}

