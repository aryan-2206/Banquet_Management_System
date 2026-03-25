/**
 * DJ Socket — handles real-time song request queue
 * Emits to all connected clients in the 'dj' room
 */
module.exports = (io) => {
  const djNamespace = io.of('/dj');

  // In-memory queue (would be persisted to Redis in production)
  let queue = [];
  let nowPlaying = null;

  djNamespace.on('connection', (socket) => {
    console.log(`🎵 DJ client connected: ${socket.id}`);

    // Send current state to newly connected client
    socket.emit('queue:sync', { queue, nowPlaying });

    // Guest sends a song request
    socket.on('request:add', (data) => {
      const request = {
        id: `req-${Date.now()}`,
        song: data.song,
        artist: data.artist,
        requestedBy: data.requestedBy || 'Guest',
        genre: data.genre || 'Other',
        vibe: data.vibe || 'fun',
        duration: data.duration || '3:30',
        votes: 1,
        timestamp: new Date().toISOString(),
      };
      queue.push(request);
      queue.sort((a, b) => b.votes - a.votes);
      djNamespace.emit('queue:update', { queue, newRequest: request });
    });

    // Guest votes for a song
    socket.on('request:vote', ({ requestId }) => {
      const req = queue.find((r) => r.id === requestId);
      if (req) {
        req.votes += 1;
        queue.sort((a, b) => b.votes - a.votes);
        djNamespace.emit('queue:update', { queue });
      }
    });

    // DJ removes a song from queue
    socket.on('request:remove', ({ requestId }) => {
      queue = queue.filter((r) => r.id !== requestId);
      djNamespace.emit('queue:update', { queue });
    });

    // DJ updates now playing
    socket.on('nowPlaying:update', (song) => {
      nowPlaying = song;
      djNamespace.emit('nowPlaying:sync', nowPlaying);
    });

    socket.on('disconnect', () => {
      console.log(`🎵 DJ client disconnected: ${socket.id}`);
    });
  });
};
