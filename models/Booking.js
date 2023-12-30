import { Schema, model } from "mongoose";

const BookingSchema = new Schema({
  number_of_person: { type: String },
  Start_date: { type: Date, required: true },
  End_date: { type: Date, required: true },
  payment_done: { type: String },
  User: { type: Schema.Types.ObjectId, ref: "UserModel" },
});

const BookingModel = model("Booking", BookingSchema);

export default BookingModel;
