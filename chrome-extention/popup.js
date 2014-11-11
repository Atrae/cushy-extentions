$(function(){


  var client = new popupClient();
  var accountLists = [];

  var updateAccountLists = function(){
    $('tr.account').each(function(){
      var accountList = new AccountList();
      var _self = $(this);
      accountList.url = _self.find('input.loginUrl').val();
      accountList.loginId = _self.find('input.loginId').val();
      accountList.password = _self.find('input.password').val();
      accountLists.push(accountList);
    });
  }

  $.when(client.refresh()).done(setTimeout(updateAccountLists, 100));

  $(document).on('click', 'button.removeBtn', function(){
    var index = $('button.removeBtn').index($(this));
    accountLists[index].remove();
  });

  $(document).on('click', 'button.editBtn', function(){
  });

  $(document).on('click', 'button.loginBtn', function(){
    var index = $('button.loginBtn').index($(this));
    var account = accountLists[index];
    chrome.tabs.create({ 'url': account.url }, function(tab){
      chrome.runtime.sendMessage({action: "autoLogin", loginData: account}, function(){});
    });
  });


  $('button#storageRefresh').click(function(){
    chrome.runtime.sendMessage({ action: "storageRefresh" }, function(){});
  });

});
