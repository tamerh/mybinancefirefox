function saveAPIKey(e) {
  browser.storage.sync.set({
    myBinanceApiKey: document.querySelector("#myBinanceApiKey").value
  });
  e.preventDefault();
}


function restoreAPIKey() {

  var gettingItem = browser.storage.sync.get('myBinanceApiKey');
  gettingItem.then((res) => {
    document.querySelector("#myBinanceApiKey").value = res.myBinanceApiKey;
  });
}

document.addEventListener('DOMContentLoaded', restoreAPIKey);
document.querySelector("#register").addEventListener('click', saveAPIKey);