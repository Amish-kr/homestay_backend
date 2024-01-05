import BookingModel from "../models/Booking.js";
import UserModel from "../models/UserModel.js";

export const createbooking = async (req, res) => {
  try {
    const { number_of_person, Start_date, End_date } = req.body;
    const User = res.user._id;
    if (
      !number_of_person ||
      !Start_date ||
      !End_date ||
      Start_date > End_date ||
      number_of_person <= 0
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid input data" });
    }
    const startDateObj = new Date(Start_date);
    const endDateObj = new Date(End_date);
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid date format" });
    }

    const overlappingBookings = await BookingModel.find({
      User,
      Start_date: { $lt: endDateObj },
      End_date: { $gt: startDateObj },
    });
    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Booking overlaps with existing bookings",
      });
    }

    const newBooking = new BookingModel({
      number_of_person,
      Start_date: startDateObj,
      End_date: endDateObj,

      User,
    });
    await newBooking.save();
    const user = await UserModel.findById(User);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.bookings.push(newBooking._id);
    await user.save();

    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error occurred while creating the booking",
    });
  }
};

export const extendbooking = async (req, res) => {
  const { bookingId } = req.params;
  const { newEndDate } = req.body;

  try {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }
    const overlappingBookings = await BookingModel.find({
      _id: { $ne: bookingId },
      User: booking.User,
      Start_date: { $lt: new Date(newEndDate) },
      End_date: { $gt: booking.Start_date },
    });

    if (overlappingBookings.length > 0) {
      booking.status = "cancelled";
      await booking.save();
      return res.status(400).json({
        success: false,
        error: "Booking overlaps with existing bookings of the same user",
      });
    }
    booking.End_date = new Date(newEndDate);
    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("Error extending booking:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const getallinactivebookings = async (req, res) => {
  try {
    const currentDate = new Date();
    const inactiveBookings = await BookingModel.find({
      End_date: { $lt: currentDate },
    });
    if (!Array.isArray(inactiveBookings)) {
      inactiveBookings = [inactiveBookings];
    }
    res.status(200).json({ success: true, data: inactiveBookings });
  } catch (error) {
    console.error("Error fetching inactive bookings:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
export const getallinactivebookings2 = async (req, res) => {
  const { userId } = req.params;
  try {
    const currentDate = new Date();
    const activeBookings = await BookingModel.find({
      User: userId,
      End_date: { $lt: currentDate },
    });
    if (!Array.isArray(activeBookings)) {
      activeBookings = [activeBookings];
    }
    res.status(200).json({ success: true, data: activeBookings });
  } catch (error) {
    console.error("Error fetching active bookings:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
export const getallactivebookings2 = async (req, res) => {
  const { userId } = req.params;
  try {
    const currentDate = new Date();
    const activeBookings = await BookingModel.find({
      User: userId,
      End_date: { $gte: currentDate },
    });
    if (!Array.isArray(activeBookings)) {
      activeBookings = [activeBookings];
    }
    res.status(200).json({ success: true, data: activeBookings });
  } catch (error) {
    console.error("Error fetching active bookings:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const getallactivebookings = async (req, res) => {
  try {
    const currentDate = new Date();
    let bookings = await BookingModel.find({
      End_date: { $gt: currentDate },
    });
    if (!Array.isArray(bookings)) {
      bookings = [bookings];
    }
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching active bookings:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
