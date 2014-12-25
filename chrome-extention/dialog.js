var Dialog = function(){
  this.message;
  this.select_options = '';
  this.button;
  this.ngButton;
  this.existFlg = false;
}

Dialog.prototype = {
  insert: function() {
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

    if (this.select_options) {
      var selectElement = document.createElement("select");
      selectElement.id = "forDialog";
      selectElement.setAttribute("style", "font-size: 16px; padding: 10px; margin: 0 0 5px; width: 100%; height: 2em; border: 2px solid #f9f9f9; background: #fff;");
      selectElement.innerHTML = this.select_options;
      backgroundElement.appendChild(selectElement);
    }

    var dialogChildElement3 = document.createElement("div");
    dialogChildElement3.className = "cushy-ext-dialog-js";
    if (this.button) dialogChildElement3.innerHTML = this.button;
    if (this.ngButton) dialogChildElement3.innerHTML += this.ngButton;
    backgroundElement.appendChild(dialogChildElement3);

    dialogParent2.appendChild(dialogElement);
    dialogParent2.appendChild(backgroundElement);
    dialogParent.appendChild(dialogParent2);

    if (!this.existFlg) {
      document.body.appendChild(dialogParent);
      this.existFlg = true;
    }
  },
  close: function(){
    chrome.runtime.sendMessage({action: "dialogClose"}, function(){});
    document.getElementById('cushy-ext-dialog').setAttribute("style", "height: 0px; opacity: 0; display: none;");
  },
  setSubmitMsg: function (msg) {
    this.button = '<input type="submit" class="cushy-ext-submit-js" style="width: 100%; font-size: 16px; height: 40px; background: #111F34; border-radius: 4px; text-shadow: none; color: #fff; font-weight: bold;" value="'+msg+'">';
  },
  setNgBtnMsg: function (msg) {
    this.ngButton = '<input type="button" class="cushy-ext-never-disp-js" style="width: 100%; font-size: 16px; height: 40px; background: #111F34; border-radius: 4px; text-shadow: none; color: #fff; font-weight: bold;" value="'+msg+'">';
  },
  submit: function(account, submitType){
    //localへの保存 + サーバへの保存
    var requestType = (submitType === 'changePassword')? 'PUT' : 'POST';
    chrome.runtime.sendMessage({ action: "saveAccount", account: account, requestType: requestType });
    this.close();
  },
  registerNgUrl: function (url) {
    chrome.runtime.sendMessage({ action: "registerNgUrl", url: url });
    this.close();
  },
  setForSave: function (account, groups) {
    this.setSubmitMsg("登録する");
    this.setNgBtnMsg("never display");
    this.message = account.domain +"での"+ account.loginId +"のアカウントを登録しますか？";
    this.select_options += "<option group-id=''>【PRIVATE GROUP】For only me</option>";
    for (key in groups) {
      this.select_options += "<option group-id='"+ groups[key][0].id +"'>【"+ groups[key][0].company_name +"】For "+ key +"</option>";
    }
    this.insert();
  },
  setForChangePw: function (account) {
    this.setSubmitMsg("変更する");
    this.message = account.domain +"での"+ account.loginId +"のアカウントのPWを変更しますか？";
    this.insert();
  },
  setForNoLogin: function () {
    this.message = "現在未ログインのようです。ログインしていただかないとアカウントは登録されません。";
    this.insert();
  },
  setForFill: function (accounts) {
    for (var i = 0, len = accounts.length; i < len; i++) {
      this.select_options += "<option login-id='"+ i +"'>"+ accounts[i].loginId +"</option>"
    }
  },
  setForLogin: function () {
    this.message = "以前登録したアカウントでloginしますか？";
    this.setSubmitMsg("login");
    this.insert();
  }
}
