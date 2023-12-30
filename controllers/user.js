import UserModel from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const getdetail = async (req, res) => {
  console.log("dffffff");
  try {
    // Extract userId from cookies
    const userId = res.user._id; // Assuming the cookie name is "userId"

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch the user details and populate the 'bookings' field
    const user = await UserModel.findById(userId).populate("bookings");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Construct the response object with desired user details
    const userDetails = {
      id: user._id,
      name: user.name,
      email: user.email,
      bookings: user.bookings, // This will be populated due to the populate() method
    };

    // Return the user details
    return res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: "Empty fields",
      message: {
        email: "This field is required",
        password: "This field is required",
      },
    });
  }
  try {
    const existinguser = await UserModel.findOne({ email });
    if (!existinguser) {
      return res.status(404).json({ message: "User don't Exist." });
    }

    const isPasswordCrt = bcrypt.compare(password, existinguser.password);
    if (!isPasswordCrt) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        email: existinguser.email,
        id: existinguser._id,
        role: existinguser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    existinguser.tokens.push({ token });
    await existinguser.save();
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_API);
    res.setHeader("Access-Control-Expose-Headers", "Authorization");

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 4 * 60 * 60 * 1000),
    });
    res.status(200).json({ isLoggedIn: true, token });
  } catch (error) {
    res.status(200).json({ message: "Something went worng..." });
  }
};

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      error: "Empty fields",
      message: {
        name: "This field is required",
        email: "This field is required",
        password: "This field is required",
      },
    });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const newUser = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        tokens: [],
        role,
      });

      await newUser.save();
      res.status(200).json({ result: newUser });
    } catch (error) {
      console.error("Error during user creation:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error during user creation." });
    }
  } catch (error) {
    console.error("Error:", error); // Log any other unexpected errors
    res.status(500).json({ message: "Something went wrong..." });
  }
};
export const logout = async (req, res) => {
  const { email } = res.user;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    await user.save();
    res.clearCookie("token", {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    });
    console.log(`User ${email} logged out successfully.`);
    return res
      .status(200)
      .json({ message: "Logout successful. Cookies removed." });
  } catch (error) {
    console.error("Error during logout:", error);
    return res
      .status(500)
      .json({ message: "Failed to logout. Internal server error." });
  }
};

export const loggedIn = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ loggedIn: false });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    const rootUser = await UserModel.findOne({
      _id: verifyToken.id,
      "tokens.token": token,
    });

    if (rootUser) {
      // Assuming your UserModel has a 'role' field which can be 0, 1, or 2.
      // Adjust the property name according to your UserModel's schema if different.
      const userRole = rootUser.role;

      return res.json({ loggedIn: true, role: userRole });
    } else {
      return res.json({ loggedIn: false });
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ loggedIn: false, error: "Unauthorized: Token has expired" });
    }
    res.status(401).json({
      loggedIn: false,
      error: "Unauthorized: No token provided or invalid token",
    });
    console.log(err);
  }
};
