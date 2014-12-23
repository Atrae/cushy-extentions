var popupClient = function(){
}

popupClient.prototype = {
  refresh: function(accountLists, callback){
    var accounts = safari.extension.secureSettings.accounts;
    var fragment = document.createDocumentFragment();

    for(url in accounts){
      var targetAccounts = accounts[url];
      for(var i=0, len=targetAccounts.length; i < len; i++){
        var childFragment = document.createDocumentFragment();
        var accountList = document.createElement("tr");
        accountList.className = "account";

        var accountUrl = document.createElement("td");
        accountUrl.innerHTML = url
        childFragment.appendChild(accountUrl);

        var accoutName = document.createElement("td");
        accoutName.innerHTML = targetAccounts[i].loginId
        childFragment.appendChild(accoutName);

        var loginBtnTd = document.createElement("td");
        var loginBtn = document.createElement("button");
        loginBtn.className = "loginBtn";
        loginBtn.innerHTML = "login";
        loginBtnTd.appendChild(loginBtn);
        childFragment.appendChild(loginBtnTd);

        var inputBtnTd = document.createElement("td");
        var inputBtn = document.createElement("button");
        inputBtn.className = "inputBtn";
        inputBtn.innerHTML = "input";
        inputBtnTd.appendChild(inputBtn);
        childFragment.appendChild(inputBtnTd);

        var hiddenParamsTd = document.createElement("td");
        var inputLoginId = document.createElement("input");
        inputLoginId.className = "loginId";
        inputLoginId.setAttribute('type', 'hidden');
        inputLoginId.setAttribute('value', targetAccounts[i].loginId);
        hiddenParamsTd.appendChild(inputLoginId);

        var inputLoginUrl = document.createElement("input");
        inputLoginUrl.className = "loginUrl";
        inputLoginUrl.setAttribute('type', 'hidden');
        inputLoginUrl.setAttribute('value', targetAccounts[i].loginUrl);
        hiddenParamsTd.appendChild(inputLoginUrl);

        var inputPassword = document.createElement("input");
        inputPassword.className = "password";
        inputPassword.setAttribute('type', 'hidden');
        inputPassword.setAttribute('value', targetAccounts[i].password);
        hiddenParamsTd.appendChild(inputPassword);
        childFragment.appendChild(hiddenParamsTd);
        accountList.appendChild(childFragment);
        fragment.appendChild(accountList);
      }
    }
    document.getElementById('registedAccountList').innerHTML = "";
    document.getElementById('registedAccountList').appendChild(fragment);
    if(callback) setTimeout(callback(accountLists), 1000);
  }
}
