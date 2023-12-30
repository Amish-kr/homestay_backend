import mongoose from "mongoose";
import moment from "moment-timezone";

const paymentSchema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_signature: {
    type: String,
    required: true,
  },
  created_at: {
    type: String,
    default: moment().tz("Asia/Kolkata").format("dddd, DD/MM/YYYY h:mm:ss A"),
  },
  Booking_id: { type: String },
  User_id: { type: String },
});

export const Payment = mongoose.model("Payment", paymentSchema);
