const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

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
    const data = JSON.parse(message);
    
    if (data.type === 'move') {
      players[playerId] = data.position;
      broadcast({ type: 'update', playerId, position: data.position }, ws);
    }
  });
  
  ws.on('close', () => {
    delete players[playerId];
    broadcast({ type: 'leave', playerId });
  });
});

function broadcast(data, exclude = null) {
  wss.clients.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

console.log("Сервер запущен на ws://localhost:8080");
