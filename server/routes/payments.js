const express = require('express');
const {
  getPayments, getPayment, getPaymentByBooking, recordPayment,
  confirmBooking, updateInstallmentPlan, autoRelease
} = require('../controllers/paymentController');

const router = express.Router();

router.get('/', getPayments);
router.get('/booking/:bookingId', getPaymentByBooking);
router.get('/:id', getPayment);
router.post('/:id/record', recordPayment);
router.patch('/:id/confirm', confirmBooking);
router.put('/:id/installment-plan', updateInstallmentPlan);
router.post('/auto-release', autoRelease);

module.exports = router;
