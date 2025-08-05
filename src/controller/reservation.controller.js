const Reservation = require("../model/reservation.model");
const sendReservationSMS = require("../Utils/sendReservationSms");
const sendReservationEmail = require("../Utils/sendReservationEmail");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

function formatPhoneNumber(number) {
  if (number.startsWith("0")) {
    return "+234" + number.slice(1);
  }
  return number;
}

exports.createReservation = async (req, res) => {
  const { name, contact, guests, date, time, request, notes, email } = req.body;

  try {
    const reservation = new Reservation({
      user: req.user._id,
      name,
      contact,
      guests,
      date,
      time,
      request,
      notes,
    });

    await reservation.save();

    const formattedContact = formatPhoneNumber(contact);
    await sendReservationSMS(formattedContact, name, date, time, guests);

    if (email) {
      await sendReservationEmail(email, {
        name,
        guests,
        date,
        time,
        request,
        notes,
      });
    }
    await sendReservationEmail(ADMIN_EMAIL, {
      name,
      guests,
      date,
      time,
      request,
      notes,
    });

    res.status(201).json({
      message: "Reservation created",
      reservation,
    });
  } catch (err) {
    console.error("❌ Create reservation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ reservations });
  } catch (err) {
    console.error("Get reservations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    reservation.status = "cancelled";
    await reservation.save();

    res.status(200).json({ message: "Reservation cancelled", reservation });
  } catch (err) {
    console.error("Cancel reservation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate(
      "user",
      "name email phone"
    );
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
