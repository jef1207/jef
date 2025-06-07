<!doctype html>
<html lang="en">
  <head>
    <title>HexGL Racing</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <style>
      /* Стили остаются без изменений */
    </style>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
  </head>

  <body>
    <div id="progress-container">
      <div id="loading-text">Initializing game...</div>
      <div id="progressbar">
        <div id="progress-fill"></div>
      </div>
    </div>

    <div id="step-4">
      <div id="overlay"></div>
      <div id="main"></div>
    </div>

    <div id="step-5">
      <div id="time">Time: 0:00</div>
      <div id="gameover-text">Race Completed!</div>
      <button id="restart-btn">PLAY AGAIN</button>
    </div>

    <!-- Загрузка Three.js первым через CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    
    <!-- Остальные скрипты -->
    <script src="libs/Detector.js"></script>
    <script src="bkcore.coffee/Utils.js"></script>
    <script src="bkcore.coffee/controllers/TouchController.js"></script>
    
    <script src="bkcore/threejs/RenderManager.js"></script>
    <script src="bkcore/threejs/Shaders.js"></script>
    <script src="bkcore/threejs/Loader.js"></script>
    
    <script src="bkcore/hexgl/HUD.js"></script>
    <script src="bkcore/hexgl/ShipControls.js"></script>
    <script src="bkcore/hexgl/Gameplay.js"></script>
    
    <script src="bkcore/hexgl/tracks/Cityscape.js"></script>
    <script src="bkcore/hexgl/HexGL.js"></script>
    
    <script src="launch.js"></script>
  </body>
</html>
