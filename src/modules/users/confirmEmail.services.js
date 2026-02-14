import { successResponse } from "../../common/utils/response.success.js";
import userModel from "../../DB/models/users.model.js";


export const confirmEmail = async (req, res) => {

  const { email, otp } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.confirmed) {
    return res.status(400).json({ message: "Email already confirmed" });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  user.confirmed = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  successResponse({ res, message: "email confirmed successfully" })


};
