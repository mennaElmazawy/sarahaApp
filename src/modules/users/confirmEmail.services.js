import { successResponse } from "../../common/utils/response.success.js";
import userModel from "../../DB/models/users.model.js";
import * as db_service from "../../DB/db.service.js"
import { del, get, max_otp_key, otp_key } from "../../DB/redis/redis.service.js";
import { emailEnum } from "../../common/enum/email.enum.js";
import { Compare } from "../../common/utils/security/hash.security.js";
import { providerEnum } from "../../common/enum/user.enum.js";


export const confirmEmail = async (req, res) => {

  const { email, otp } = req.body;

  const otpValue = await get(otp_key({ email, subject: emailEnum.confirmEmail }))
  if (!otpValue) {
    throw new Error("OTP expired ");
  }

  const user = await db_service.findOne({
    model: userModel,
    filter: { email, confirmed: { $exists: false }, provider: providerEnum.system },

  })
  if (!user) {
    throw new Error("User not found");
  }
  if (!Compare({ plainText: otp, cipherText: otpValue })) {
    throw new Error("Invalid OTP");
  }
  user.confirmed = new Date();
  await user.save();
  await del(otp_key({ email, subject: emailEnum.confirmEmail }))
  await del(max_otp_key({ email, subject: emailEnum.confirmEmail }));
  

  successResponse({ res, message: "email confirmed successfully" })


};

