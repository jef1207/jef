(function() {
  var $ = function(_) { return document.getElementById(_); };
  var isTelegram = typeof Telegram !== 'undefined';

  init = function(quality) {
    var width = isTelegram ? Telegram.WebApp.viewportWidth : window.innerWidth;
    var height = isTelegram ? Telegram.WebApp.viewportHeight : window.innerHeight;
    
    var hexGL = new bkcore.hexgl.HexGL({
      document: document,
      width: width,
      height: height,
      container: $('main'),
      overlay: $('overlay'),
      gameover: $('step-5'),
      quality: quality,
      difficulty: 0,
      hud: true,
      controlType: 1, // TOUCH
      godmode: false,
      track: 'Cityscape'
    });

    window.hexGL = hexGL;
    var progressbar = $('progressbar');
    
    hexGL.load({
      onLoad: function() {
        hexGL.init();
        hexGL.start();
      },
      onProgress: function(p) {
        progressbar.style.width = (p.loaded / p.total * 100) + "%";
      }
    });
  };

  if (isTelegram) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    Telegram.WebApp.MainButton.hide();
  }

  // Автозапуск с оптимальными настройками
  setTimeout(function() {
    $('progress-container').style.display = 'block';
    init(1); // MEDIUM quality
  }, 500);

  $('step-5').onclick = function() {
    if(isTelegram) {
      Telegram.WebApp.showPopup({
        title: 'Game Over',
        message: 'Restart the game?',
        buttons: [{ type: 'ok' }, { type: 'cancel' }]
      }, function(btnId) {
        if(btnId === 'ok') window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  // Проверка WebGL
  var hasWebGL = function() {
    try {
      var canvas = document.createElement('canvas');
      return !!window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch(e) { return false; }
  };

  if (!hasWebGL()) {
    $('progress-container').innerHTML = '<p>WebGL not supported!</p>';
  }
})();
