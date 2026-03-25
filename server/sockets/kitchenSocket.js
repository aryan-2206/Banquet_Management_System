/**
 * Kitchen Socket — real-time guest headcount updates for kitchen
 * GRE scans a QR → updates pax → kitchen gets live update
 */
module.exports = (io) => {
  const kitchenNamespace = io.of('/kitchen');

  const liveState = {}; // { bookingId: { arrived: N, expected: N } }

  kitchenNamespace.on('connection', (socket) => {
    console.log(`🍳 Kitchen client connected: ${socket.id}`);

    // Send current state
    socket.emit('headcount:sync', liveState);

    // GRE checks in a guest
    socket.on('checkin:update', ({ bookingId, arrived, expected }) => {
      liveState[bookingId] = { arrived, expected, updatedAt: new Date().toISOString() };
      kitchenNamespace.emit('headcount:update', { bookingId, arrived, expected });
    });

    socket.on('disconnect', () => {
      console.log(`🍳 Kitchen client disconnected: ${socket.id}`);
    });
  });
};
