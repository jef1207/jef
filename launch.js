(function() {
  console.log('Launch script started');
  
  var $ = function(_) { 
    var el = document.getElementById(_);
    if (!el) console.error('Element not found: ' + _);
    return el;
  };
  
  var isTelegram = typeof Telegram !== 'undefined';
  console.log('Telegram environment:', isTelegram);

  // Проверка WebGL с подробными сообщениями
  var hasWebGL = function() {
    try {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        console.error('WebGL context creation failed');
        return false;
      }
      
      console.log('WebGL supported:', gl.getParameter(gl.VERSION));
      return true;
    } catch(e) {
      console.error('WebGL check error:', e);
      return false;
    }
  };

  if (!hasWebGL()) {
    var errorMsg = 'WebGL not supported in your browser';
    console.error(errorMsg);
    $('loading-text').textContent = errorMsg;
    return;
  }

  var init = function() {
    console.log('Initializing game...');
    
    try {
      var width = isTelegram ? Telegram.WebApp.viewportWidth : window.innerWidth;
      var height = isTelegram ? Telegram.WebApp.viewportHeight : window.innerHeight;
      console.log('Viewport size:', width, 'x', height);

      // Проверяем наличие элементов DOM
      if (!$('main')) throw new Error('main element not found');
      if (!$('overlay')) throw new Error('overlay element not found');
      if (!$('progress-container')) throw new Error('progress-container not found');

      console.log('Creating HexGL instance');
      var hexGL = new bkcore.hexgl.HexGL({
        document: document,
        width: width,
        height: height,
        container: $('main'),
        overlay: $('overlay'),
        gameover: $('step-5'),
        quality: 1, // MEDIUM
        difficulty: 0,
        hud: true,
        controlType: 1, // TOUCH
        godmode: false,
        track: 'Cityscape'
      });

      window.hexGL = hexGL;
      var progressFill = $('progress-fill');
      var loadingText = $('loading-text');

      console.log('Starting asset loading');
      hexGL.load({
        onLoad: function() {
          console.log('Assets loaded successfully');
          try {
            hexGL.init();
            hexGL.start();
            
            // Показываем игровое поле, скрываем загрузчик
            $('progress-container').style.display = 'none';
            $('step-4').style.display = 'block';
            
            console.log('Game started');
          } catch(e) {
            console.error('Game start error:', e);
            loadingText.textContent = 'Start error: ' + e.message;
          }
        },
        onError: function(s) {
          var errorMsg = 'Error loading: ' + s;
          console.error(errorMsg);
          loadingText.textContent = errorMsg;
        },
        onProgress: function(p) {
          var percent = Math.round((p.loaded / p.total) * 100);
          progressFill.style.width = percent + "%";
          loadingText.textContent = 'Loading: ' + percent + '% (' + p.loaded + '/' + p.total + ')';
        }
      });
    } catch(e) {
      console.error('Initialization error:', e);
      $('loading-text').textContent = 'Init error: ' + e.message;
    }
  };

  // Telegram WebApp инициализация
  if (isTelegram) {
    console.log('Initializing Telegram WebApp');
    try {
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
      Telegram.WebApp.MainButton.hide();
      console.log('Telegram WebApp initialized');
    } catch(e) {
      console.error('Telegram init error:', e);
    }
  }

  // Обработчик рестарта
  var restartBtn = $('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function() {
      console.log('Restarting game');
      window.location.reload();
    });
  }

  // Запуск игры после загрузки страницы
  if (document.readyState === 'complete') {
    console.log('Document already ready, starting init');
    init();
  } else {
    console.log('Adding DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOMContentLoaded event fired');
      init();
    });
  }

  // Резервный таймаут на случай проблем с событиями
  setTimeout(function() {
    if (!window.hexGL) {
      console.log('Fallback init after timeout');
      init();
    }
  }, 3000);
})();
