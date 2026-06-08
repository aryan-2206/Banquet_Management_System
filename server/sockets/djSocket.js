/**
 * DJ Socket — event-scoped real-time song request queue
 *
 * Each event has its own isolated room: `dj:${eventId}`
 * Different events = different queues, fully independent.
 * The DJ and guests for event X cannot see or affect event Y.
 *
 * Events:
 *  Client → Server:
 *    joinRoom        { eventId, role: 'dj'|'guest', guestName }
 *    request:add     { eventId, song, artist, requestedBy, genre, vibe, duration }
 *    request:vote    { eventId, requestId }
 *    request:remove  { eventId, requestId }       (DJ only)
 *    nowPlaying:update { eventId, ...songData }    (DJ only)
 *
 *  Server → Client:
 *    queue:sync      { queue, nowPlaying }         (on join)
 *    queue:update    { queue, newRequest? }
 *    nowPlaying:sync { ...songData }
 *    room:info       { eventId, memberCount }
 */
module.exports = (io) => {
  const djNamespace = io.of('/dj');

  // Per-room state: { [eventId]: { queue: [], nowPlaying: null } }
  const rooms = {};

  function getRoom(eventId) {
    if (!rooms[eventId]) {
      rooms[eventId] = { queue: [], nowPlaying: null };
    }
    return rooms[eventId];
  }

  djNamespace.on('connection', (socket) => {
    console.log(`🎵 DJ socket connected: ${socket.id}`);

    let currentEventId = null; // track which room this socket is in

    /* ── JOIN ROOM ─────────────────────────────────────── */
    socket.on('joinRoom', ({ eventId, role = 'guest', guestName = 'Guest' }) => {
      if (!eventId) return;

      // Leave previous room if switching
      if (currentEventId && currentEventId !== eventId) {
        socket.leave(`dj:${currentEventId}`);
      }

      currentEventId = eventId;
      socket.join(`dj:${eventId}`);

      const room = getRoom(eventId);
      console.log(`🎵 [DJ] ${role} "${guestName}" joined room dj:${eventId}`);

      // Send current state to the newly joined client
      socket.emit('queue:sync', { queue: room.queue, nowPlaying: room.nowPlaying });

      // Broadcast updated member count
      const memberCount = djNamespace.adapter.rooms.get(`dj:${eventId}`)?.size || 1;
      djNamespace.to(`dj:${eventId}`).emit('room:info', { eventId, memberCount });
    });

    /* ── ADD SONG REQUEST ──────────────────────────────── */
    socket.on('request:add', (data) => {
      const eventId = data.eventId || currentEventId;
      if (!eventId) return;

      const room = getRoom(eventId);
      const request = {
        id:          `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        song:        data.song        || 'Unknown Song',
        artist:      data.artist      || 'Unknown Artist',
        requestedBy: data.requestedBy || 'Guest',
        genre:       data.genre       || 'Other',
        vibe:        data.vibe        || 'fun',
        duration:    data.duration    || '3:30',
        votes:       1,
        timestamp:   new Date().toISOString(),
      };

      room.queue.push(request);
      room.queue.sort((a, b) => b.votes - a.votes);

      djNamespace.to(`dj:${eventId}`).emit('queue:update', {
        queue: room.queue,
        newRequest: request,
      });

      console.log(`🎵 [DJ:${eventId}] New request: "${request.song}" by ${request.requestedBy}`);
    });

    /* ── VOTE FOR A SONG ───────────────────────────────── */
    socket.on('request:vote', ({ eventId, requestId }) => {
      const eid = eventId || currentEventId;
      if (!eid) return;

      const room = getRoom(eid);
      const req  = room.queue.find(r => r.id === requestId);
      if (req) {
        req.votes += 1;
        room.queue.sort((a, b) => b.votes - a.votes);
        djNamespace.to(`dj:${eid}`).emit('queue:update', { queue: room.queue });
      }
    });

    /* ── REMOVE SONG (DJ only) ─────────────────────────── */
    socket.on('request:remove', ({ eventId, requestId }) => {
      const eid = eventId || currentEventId;
      if (!eid) return;

      const room = getRoom(eid);
      room.queue  = room.queue.filter(r => r.id !== requestId);
      djNamespace.to(`dj:${eid}`).emit('queue:update', { queue: room.queue });
    });

    /* ── UPDATE NOW PLAYING (DJ only) ──────────────────── */
    socket.on('nowPlaying:update', (songData) => {
      const eid = songData.eventId || currentEventId;
      if (!eid) return;

      const room    = getRoom(eid);
      room.nowPlaying = songData;
      djNamespace.to(`dj:${eid}`).emit('nowPlaying:sync', room.nowPlaying);
      console.log(`🎵 [DJ:${eid}] Now playing: "${songData.song}"`);
    });

    /* ── GET ROOM STATE ────────────────────────────────── */
    socket.on('getState', ({ eventId }) => {
      const eid = eventId || currentEventId;
      if (!eid) return;
      const room = getRoom(eid);
      socket.emit('queue:sync', { queue: room.queue, nowPlaying: room.nowPlaying });
    });

    /* ── DISCONNECT ────────────────────────────────────── */
    socket.on('disconnect', () => {
      console.log(`🎵 DJ socket disconnected: ${socket.id}`);
      if (currentEventId) {
        const memberCount = (djNamespace.adapter.rooms.get(`dj:${currentEventId}`)?.size || 1) - 1;
        djNamespace.to(`dj:${currentEventId}`).emit('room:info', {
          eventId: currentEventId,
          memberCount: Math.max(0, memberCount),
        });
      }
    });
  });
};
