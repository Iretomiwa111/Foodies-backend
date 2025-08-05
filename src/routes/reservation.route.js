const express = require("express");
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  cancelReservation,
  getAllReservations
} = require("../controller/reservation.controller");
const {verifyToken, verifyAdmin }= require("../middleware/verify-token.middleware");

router.post("/", verifyToken, createReservation);
router.get("/me", verifyToken, getMyReservations);
router.delete("/:id", verifyToken, cancelReservation);

router.get("/", verifyToken, verifyAdmin, getAllReservations);

module.exports = router;
