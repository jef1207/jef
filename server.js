const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, '../public')));

const server = app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Клиент доступен по адресу: http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

const players = {};

wss.on('connection', ws => {
  const playerId = Math.random().toString(36).substr(2, 9);
  
  players[playerId] = { x: 0, y: 0, z: 0 };
  
  ws.send(JSON.stringify({ 
    type: 'init', 
    playerId,
    players 
  }));
  
  broadcast({ type: 'join', playerId }, ws);
  
  ws.on('message', message => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'move') {
        players[playerId] = data.position;
        broadcast({ type: 'update', playerId, position: data.position }, ws);
      }
    } catch (e) {
      console.error('Ошибка обработки сообщения:', e);
    }
  });
  
  ws.on('close', () => {
    delete players[playerId];
    broadcast({ type: 'leave', playerId });
    console.log(`Игрок ${playerId} отключился`);
  });
  
  console.log(`Новый игрок подключен: ${playerId}`);
});

function broadcast(data, exclude = null) {
  wss.clients.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
