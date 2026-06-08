/**
 * Kitchen Socket — real-time guest headcount updates
 *
 * Flow:
 *  GRE scans QR → API /api/guests/check-in/:id → guestController emits headcount:update
 *  Kitchen Dashboard receives headcount:update and shows live arrived/expected counts
 *
 * Events:
 *  Client → Server:
 *    joinKitchen          {}                        (kitchen staff connects)
 *    checkin:update       { bookingId, arrived, expected }  (manual push from GRE client-side)
 *    requestSync          { bookingId }             (request current state)
 *
 *  Server → Client:
 *    headcount:sync       { [bookingId]: { arrived, expected, updatedAt } }
 *    headcount:update     { bookingId, arrived, expected, updatedAt }
 */
module.exports = (io) => {
  const kitchenNamespace = io.of('/kitchen');

  // Live state: { [bookingId]: { arrived, expected, updatedAt } }
  const liveState = {};

  kitchenNamespace.on('connection', (socket) => {
    console.log(`🍳 Kitchen client connected: ${socket.id}`);

    // Send full current state immediately on connect
    socket.emit('headcount:sync', liveState);

    /* ── GRE manually pushes headcount (client-side socket path) ── */
    // Also handled via HTTP → guestController → io.of('/kitchen').emit(...)
    // This handles the client-side direct socket push as fallback
    socket.on('checkin:update', ({ bookingId, arrived, expected }) => {
      if (!bookingId) return;

      liveState[bookingId] = {
        arrived:   arrived  || 0,
        expected:  expected || 0,
        updatedAt: new Date().toISOString(),
      };

      // Broadcast to ALL kitchen clients (chefs on all devices)
      kitchenNamespace.emit('headcount:update', {
        bookingId,
        arrived:   liveState[bookingId].arrived,
        expected:  liveState[bookingId].expected,
        updatedAt: liveState[bookingId].updatedAt,
      });

      console.log(`🍳 Headcount update → Booking ${bookingId}: ${arrived}/${expected} arrived`);
    });

    /* ── Request current state for a specific booking ── */
    socket.on('requestSync', ({ bookingId }) => {
      if (bookingId && liveState[bookingId]) {
        socket.emit('headcount:update', { bookingId, ...liveState[bookingId] });
      } else {
        socket.emit('headcount:sync', liveState);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🍳 Kitchen client disconnected: ${socket.id}`);
    });
  });
};
