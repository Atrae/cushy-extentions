var client = new PopupClient();
var accountLists = [];

self.port.on("show", function(elementContent) {
  client.accounts = elementContent;
  client.refresh(accountLists, function(accountLists){
    var accountDoms = document.getElementsByClassName('account');
    for(var i=0, len=accountDoms.length; i < len; i++){
      var accountList = new AccountList();
      var _self = accountDoms[i];
      accountList.url = _self.querySelector('input.loginUrl').value;
      accountList.loginId = _self.querySelector('input.loginId').value;
      accountList.password = _self.querySelector('input.password').value;
      accountLists.push(accountList);
    }
  });
});

document.addEventListener('click', function (e) {
  var className = e.target.className;
  if(className === 'loginBtn'){
    var index = indexByClassName(e.target);
    var account = accountLists[index];
    account.login();
  }else if(className === 'inputBtn'){
    var index = indexByClassName(e.target);
    var account = accountLists[index];
    account.input();
  }
});

document.addEventListener('click', function (e){
  if(e.target.id === 'storageRefresh') self.port.emit("storageRefresh");
});

var Closest = function(element, tagname) {
  tagname = tagname.toLowerCase();
  do {
    if(element.nodeName.toLowerCase() === tagname){
      return element;
    }
  }while(element = element.parentNode)
  return null;
};

function indexByClassName(element) {
  var elements = document.getElementsByClassName(element.className);
  var num = 0;
  for(var i=0, len=elements.length; i<len; i++){
    if(elements[i]===element){
      return num;
    }else{
      num++;
    }
  }
  return -1;
}

function updateAccountLists(accountLists){
}
