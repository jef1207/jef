// launch.js
(function() {
  var $ = function(_) { return document.getElementById(_); };
  var isTelegram = typeof Telegram !== 'undefined';

  var init = function(quality) {
    var width = isTelegram ? Telegram.WebApp.viewportWidth : window.innerWidth;
    var height = isTelegram ? Telegram.WebApp.viewportHeight : window.innerHeight;
    
    try {
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
        controlType: 1, // Всегда TOUCH
        godmode: false,
        track: 'Cityscape'
      });

      window.hexGL = hexGL;
      var progressbar = $('progressbar');
      
      hexGL.load({
        onLoad: function() {
          console.log('LOADED.');
          hexGL.init();
          hexGL.start();
          
          // Показываем игровое поле, скрываем загрузчик
          $('progress-container').style.display = 'none';
          $('step-4').style.display = 'block';
        },
        onError: function(s) {
          console.error("Error loading " + s + ".");
          $('loading-text').textContent = 'Error loading: ' + s;
        },
        onProgress: function(p) {
          var percent = (p.loaded / p.total) * 100;
          progressbar.style.width = percent + "%";
          $('loading-text').textContent = 'Loading: ' + Math.round(percent) + '%';
        }
      });
    } catch(e) {
      console.error('Initialization error:', e);
      $('loading-text').textContent = 'Init error: ' + e.message;
    }
  };

  if (isTelegram) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    Telegram.WebApp.MainButton.hide();
  }

  // Проверка WebGL
  var hasWebGL = function() {
    try {
      var canvas = document.createElement('canvas');
      return !!window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch(e) { 
      return false; 
    }
  };

  if (!hasWebGL()) {
    $('loading-text').textContent = 'WebGL not supported!';
    return;
  }

  // Автозапуск игры
  setTimeout(function() {
    init(1); // MEDIUM quality
  }, 500);

  $('restart-btn').addEventListener('click', function() {
    window.location.reload();
  });

  // Обработчик изменения размера экрана
  window.addEventListener('resize', function() {
    if (window.hexGL) {
      var width = isTelegram ? Telegram.WebApp.viewportWidth : window.innerWidth;
      var height = isTelegram ? Telegram.WebApp.viewportHeight : window.innerHeight;
      window.hexGL.resize(width, height);
    }
  });
})();
