var SaveDialog = function(){
  this.message;
  this.select_options = '';
  this.button;
}

SaveDialog.prototype = {
  insert: function(){
    var dialogParent = document.createElement("div");
    dialogParent.id = "cushy-ext-dialog";
    dialogParent.setAttribute("style", "width: 380px; position: fixed; top: 10px; z-index: 99999; background-color: rgba(17, 31, 52, 0.4); border-radius: 4px; right: 10px;box-shadow: 0 0 5px rgba(55,55,55,0.2);");

    var dialogParent2 = document.createElement("div");
    dialogParent2.setAttribute("style", "margin: 0; padding: 5px; background-color: #667894; border-radius: 2px;");

    var dialogElement = document.createElement("div");
    dialogElement.setAttribute("style", "color: #fff; text-align: center;font-size: 18px; padding-bottom: 5px; position: relative;");
    dialogElement.innerHTML = "Cushy";

    var dialogChildElement = document.createElement("div");
    dialogChildElement.setAttribute("style", "color: #D6D6D6; font-size: 18px; padding-bottom: 5px; position: absolute; top: -3px; right: 5px;");

    var dialogChildElement2 = document.createElement("div");
    dialogChildElement2.className = "cushy-ext-dialog-js";

    var dialogButton = document.createElement("button");
    dialogButton.className = "cushy-ext-close-js";
    dialogButton.setAttribute("style", "background: transparent; color: #fff; font-size: 18px; padding: 0; margin: 0; line-height: 1; border: 0;");
    dialogButton.innerHTML = "×";

    dialogChildElement2.appendChild(dialogButton);
    dialogChildElement.appendChild(dialogChildElement2);
    dialogElement.appendChild(dialogChildElement);

    var backgroundElement = document.createElement("div");
    backgroundElement.setAttribute("style", "background: #F9F9F9; padding: 5px 15px 15px;");

    var pTagElement = document.createElement("p");
    pTagElement.setAttribute("style", "margin: 10px 0 5px; font-size: 13px;");
    pTagElement.innerHTML = this.message;
    backgroundElement.appendChild(pTagElement);

    if(this.select_options){
      var selectElement = document.createElement("select");
      selectElement.id = "forDialog";
      selectElement.setAttribute("style", "font-size: 16px; padding: 10px; margin: 0 0 5px; width: 100%; height: 2em; border: 2px solid #f9f9f9; background: #fff;");
      selectElement.innerHTML = this.select_options;
      backgroundElement.appendChild(selectElement);
    }

    var dialogChildElement3 = document.createElement("div");
    dialogChildElement3.className = "cushy-ext-dialog-js";
    dialogChildElement3.innerHTML = this.button;
    backgroundElement.appendChild(dialogChildElement3);

    dialogParent2.appendChild(dialogElement);
    dialogParent2.appendChild(backgroundElement);
    dialogParent.appendChild(dialogParent2);

    document.body.appendChild(dialogParent);
  },
  close: function(){
    dialogClose();
    document.getElementById('cushy-ext-dialog').setAttribute("style", "height: 0px; opacity: 0; display: none;");
  },
  setSubmitMsg: function(msg){
    this.button = '<input type="submit" class="cushy-ext-submit-js" style="width: 100%; font-size: 16px; height: 40px; background: #111F34; border-radius: 4px; text-shadow: none; color: #fff; font-weight: bold;" value="'+msg+'">';
  },
  submit: function(tempData, submitType){
    //localへの保存 + サーバへの保存
    var domain = tempData.domain;
    var loginElementName = tempData.loginElementName;
    var loginId = tempData.loginId[0];
    var passwordElementName = tempData.passwordElementName;
    var password = tempData.password[0];
    var url = tempData.url;
    var groupId = tempData.groupId;
    var storageData = {};
    var storageClient = new StorageClient();
    chrome.storage.local.get(["accounts"], function (result){
      var accounts = (result["accounts"])? result["accounts"] : [];
      var accountInfos = (result["accounts"][domain])? result["accounts"][domain] : [];
      if(submitType === 'save'){ //save ver.
        accountInfos.push({
          'loginElementName': loginElementName,
          'loginId': loginId,
          'passwordElementName': passwordElementName,
          'password': password,
          'url': url
        })
      }else if(submitType === 'changePassword'){
        for(var i=0; i < accountInfos.length; i++){
          if(loginId === accountInfos[i].loginId){
            accountInfos[i].password = password;
            accountInfos[i].passwordElementName = passwordElementName;
            accountInfos[i].url = url;
          }
        }
      }
      accounts[domain] = accountInfos;
      storageClient.save(accounts);
    });

    var requestType = (submitType === 'changePassword')? 'PUT' : 'POST';
    chrome.storage.local.get(['userInfo'], function(result){
      var request = new XMLHttpRequest();
      var data = {
        user_id: result['userInfo'].userId, //認証方法は別途検討
        login_id: loginId,
        password: password,
        url: url,
        name: domain,
        group_id: groupId,
        api_key: result['userInfo'].apiKey
      }
      request.open(requestType, 'https://cushy-staging.herokuapp.com/api/v1/accounts', true);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      request.send(EncodeHTMLForm(data));
    });
    this.close();
  }
}

function dialogClose(){
  chrome.runtime.sendMessage({action: "dialogClose"}, function(){});
}


function EncodeHTMLForm(data){
  var params = [];
  for(var name in data){
    var value = data[name];
    var param = encodeURIComponent(name).replace(/%20/g, '+')
      + '=' + encodeURIComponent(value).replace(/%20/g, '+');
    params.push(param);
  }
  return params.join('&');
}
