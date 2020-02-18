var baseEndpoint = "https://api.binance.com/api/v3/userDataStream";
var apiKey = "";
var listenKey = "";
var binanceSocket = null;

var connected = false;
var retryFrequency = 10000;
var extendFrequency = retryFrequency * 6 * 10;
var initialized = false;

init();

function init() {

  var gettingApiKey = browser.storage.sync.get('myBinanceApiKey');

  gettingApiKey.then((res) => {
    if (typeof (res.myBinanceApiKey) !== 'undefined') {

      apiKey = res.myBinanceApiKey;

      listenBinance();

      if (!initialized) {
        initialized = true;
        checkConnectionPeriodically();
      }

    }
  });

}

browser.storage.onChanged.addListener(function (changes, areaName) {

  console.log("local storage changed");
  init();

});

function listenBinance() {

  if (binanceSocket != null) {
    console.log("closing existing socket connection");
    binanceSocket.close();
  }

  fetch(baseEndpoint, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': apiKey,
      }
    })
    .then((response) => response.json())
    .then((data) => {
      listenKey = data.listenKey;
      console.log('Success:', data);


      binanceSocket = new WebSocket("wss://stream.binance.com:9443/ws/" + listenKey);

      connected = true;

      binanceSocket.onmessage = function (event) {
        var eventData = JSON.parse(event.data);
        console.log(eventData);
        if (eventData.e && eventData.e == "executionReport") {
          browser.notifications.create({
            "type": "basic",
            "title": "Binance Order Update",
            "message": eventData.s,
            "iconUrl": "icons/48.png"
          });
        }
      }

      binanceSocket.onerror = function (event) {
        console.log(event);
        connected = false;
      }

    })
    .catch((error) => {
      console.log(event);
      connected = false;
    });
}

function checkConnectionPeriodically() {

  // retry connetion if it failed
  var extendTimer = 0;
  setInterval(function () {

    if (!connected) {
      listenBinance();
    }

    extendTimer = extendTimer + retryFrequency;

    if (extendTimer >= extendFrequency) {
      connected = false;
      extendTimer = 0;
    }

  }, retryFrequency);

}