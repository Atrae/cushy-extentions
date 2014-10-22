chrome.browserAction.onClicked.addListener(function(tab){
  loginCheck(openLoginForm(), function(){alert('yeah');});
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details){
    if (details.method == "POST") {

      var mail, password, userName;
      var formData = JSON.stringify(details.requestBody['formData']);
      //if formData have a password, it is regarded as a sing in or sing up function.

      if(formData.match(/password/i)){
        split_form_data = formData.split(",");
        for(i in split_form_data){
          if(split_form_data[i].match(/"(.+)?password(.)?"/)){ //pull out a password
            var passwordFormId = String(split_form_data[i].match(/"(.+)?password(.)?":/)).replace(/:(.+)/, '').replace(/"/g, '');
            password = details.requestBody['formData'][passwordFormId];
          }else if(split_form_data[i].match(/"(.+)?mail(.)?"/)){ //pull out a email
            var mailId = String(split_form_data[i].match(/"(.+)?mail(.)?":/)).replace(/:(.+)/, '').replace(/"/g, '');
            mail = details.requestBody['formData'][mailId];
          }else if(split_form_data[i].match(/"(.+)?user(.+)?"/)){ //pull out a userName
            alert(split_form_data[i]);
            var userNameId = String(split_form_data[i].match(/"(.+)?user(.+)?":/)).replace(/:(.+)/, '').replace(/"/g, '');
            userName = details.requestBody['formData'][userNameId];
          }
        }
      }
      var alertStr = "";
      if(password){
        alertStr += "password: " + password + "\n";
      }
      if(mail){
        alertStr += "email: " + mail + "\n";
      }
      if(userName){
        alertStr += "userName: " + userName + "\n";
      }
      if(alertStr!=""){
        alert(alertStr);
      }
    }
    //getDate();
  },
  {
    urls: ["<all_urls>"]
  },
  ['requestBody']
);


function loginCheck(afterLoginFunc, beforeLoginFunc){
  //this is witten login judge logic.
  //you can deal with storage data only in the callback.
  chrome.storage.local.get(null, function (result) {
    if(result.user_id){
      alert('logined');
      $(afterLoginFunc);
    }else{
      alert('no login');
      $(beforeLoginFunc);
    }
  });
}

function openLoginForm(){
  var windowParmas = {
    width: 300,
    height: 300,
    left: 500,
    top: 300,
    focused: true,
    url: chrome.extension.getURL("login.html"),
    type: "popup"
  }
  chrome.windows.create(windowParmas, function(){});
}
