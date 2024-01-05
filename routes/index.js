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
  getallinactivebookings2,
  getallactivebookings2,
} from "../controllers/booking.js";
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
router.get("/getallactivebookings/:userId", auth, getallactivebookings2);
router.get("/getallinactivebookings/:userId", auth, getallinactivebookings2);
export default router;
