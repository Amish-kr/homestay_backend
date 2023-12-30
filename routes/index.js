import express from "express";

import {
  login,
  register,
  loggedIn,
  logout,
  getdetail,
} from "../controllers/user.js";

import { auth } from "../middleware/auth.js";
import {
  createbooking,
  extendbooking,
  getallactivebookings,
  getallinactivebookings,
} from "../controllers/booking.js";
import { checkout, paymentVerification } from "../controllers/payment.js";
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/loggedIn", loggedIn);
router.post("/logout", auth, logout);
router.get("/getdetail", auth, getdetail);
router.post("/createbooking", auth, createbooking);
router.post("/extendbooking/:bookingId", extendbooking);
router.get("/getallactivebookings", auth, getallactivebookings);
router.get("/getallinactivebookings", auth, getallinactivebookings);
router.post("/checkout", auth, checkout);
router.post("/order/validate", auth, paymentVerification);
export default router;
