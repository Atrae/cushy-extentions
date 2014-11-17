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
          html += '<td>'+ url +'</td>'
          html += '<td>'+ accounts[i].loginId +'</td>'
          html += '<td><button class="loginBtn">login</button></td>'
          html += '<td><button class="inputBtn">input</button></td>'
          html += '<td class="hiddenParams">'
          html += '<input type="hidden" class="loginId" value="'+accounts[i].loginId+'">'
          html += '<input type="hidden" class="loginUrl" value="'+accounts[i].loginUrl+'">'
          html += '<input type="hidden" class="password" value="'+accounts[i].password+'">'
          html += '</tr>'
        }
      }
      $('table#registedAccountList').append(html);
    });
  }
}

