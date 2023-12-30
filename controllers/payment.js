import crypto from "crypto";
import Razorpay from "razorpay";

import { Payment } from "../models/transactions.js";
import UserModel from "../models/UserModel.js";
import BookingModel from "../models/Booking.js";

const razorpayInstance = new Razorpay({
  key_id: "rzp_test_a8RK1FJbMDqT9S",
  key_secret: "MGZtPQLENa0UEwIBlhhbYOW5",
});

export const checkout = async (req, res) => {
  const { bookingId } = req.body;
  try {
    // Ensure booking exists
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    // Calculate the total amount based on the number of days
    const numberOfDays = Math.ceil(
      (booking.End_date - booking.Start_date) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = numberOfDays * 5000;

    // Create Razorpay order
    const options = {
      amount: totalAmount,
      currency: "INR",
      receipt: `receipt_${bookingId}`,
      payment_capture: 1,
    };
    const order = await razorpayInstance.orders.create(options);

    // Update booking payment status

    // Send response
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: totalAmount,
      currency: "INR",
      receipt: `receipt_${bookingId}`,
      razorpayOptions: {
        key: process.env.RAZORPAY_ID_KEY,
        order,
      },
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error occurred during checkout" });
  }
};

export const paymentVerification = async (req, res) => {
  console.log("ssssssssssssssssssssssssssss");
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      Booking_id,
      User_id,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const user = await UserModel.findById(User_id);
    const booking = await BookingModel.findById(Booking_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    booking.payment_done = "Yes";
    const alreadyPaid = user.bookings.includes(Booking_id);

    if (alreadyPaid) {
      return res.status(200).json({
        success: true,
        message: "Already Paid!",
      });
    }

    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      Booking_id,
      User_id,
    });

    user.bookings.push(Booking_id);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Payment Successful.",
      data: {
        reference: razorpay_payment_id,
        razorpay_order_id,
        Booking_id,
      },
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during payment verification",
    });
  }
};
