import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  role: { type: String },
  // later to be done
  //proof: {type;}
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
  bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
});

const UserModel = model("User", userSchema);

export default UserModel;
