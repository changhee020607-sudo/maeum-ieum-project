const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.post('/book', reservationController.createReservation);
router.get('/my', reservationController.getMyReservations);
router.put('/update/:id', reservationController.updateReservation);
router.delete('/cancel/:id', reservationController.cancelReservation);
router.get('/:id', reservationController.getReservationDetail);

module.exports = router;