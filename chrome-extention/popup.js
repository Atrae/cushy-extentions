$(function(){

  var client = new popupClient();
  var accountLists = [];

  var updateAccountLists = function(){
    for(var i=0; i < $('tr.account').length; i++){
      var accountList = new AccountList();
      accountList.url = 'http://aipo.ig-partners.com/aipo/portal';
      accountLists.push(accountList);
    }
  }

  $.when(client.refresh()).done(setTimeout(updateAccountLists, 100));

  $(document).on('click', 'button.removeBtn', function(){
    // ここは気持ち悪いがclassが何故か使えないので、一旦直書きで対応
    var index = $('button.removeBtn').index($(this));
    accountLists[index].remove();
  });

  $(document).on('click', 'button.editBtn', function(){
  });

  $(document).on('click', 'button.loginBtn', function(){
    var index = $('button.loginBtn').index($(this));
    chrome.tabs.create({ 'url': accountLists[index].url }, function(tab){});
  });

});
