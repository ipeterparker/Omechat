const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.get('/', (req, res) => res.send('Omechat server running'));

let waiting = null;
const partners = {};

function pair(a, b) {
    partners[a.id] = b.id;
    partners[b.id] = a.id;
    a.emit('matched');
    b.emit('matched');
}

function unpair(socket) {
    const pid = partners[socket.id];
    if (pid) {
        delete partners[socket.id];
        delete partners[pid];
        const p = io.sockets.sockets.get(pid);
        if (p) p.emit('partner_left');
    }
    if (waiting && waiting.id === socket.id) waiting = null;
}

function broadcastCount() {
    io.emit('online_count', io.of('/').sockets.size);
}

io.on('connection', (socket) => {
    let lastMsg = 0;
    broadcastCount();

    socket.on('find', () => {
        unpair(socket);
        if (waiting && waiting.connected && waiting.id !== socket.id) {
            const other = waiting;
            waiting = null;
            pair(socket, other);
        } else {
            waiting = socket;
        }
    });

    socket.on('message', (text) => {
        if (typeof text !== 'string') return;
        const now = Date.now();
        if (now - lastMsg < 300) return;
        lastMsg = now;
        text = text.trim().slice(0, 500);
        if (!text) return;
        const pid = partners[socket.id];
        if (pid) io.to(pid).emit('message', text);
    });

    socket.on('skip', () => unpair(socket));

    socket.on('disconnect', () => {
        unpair(socket);
        broadcastCount();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server on ' + PORT));
