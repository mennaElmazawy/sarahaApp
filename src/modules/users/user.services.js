import { providerEnum } from "../../common/enum/user.enum.js";
import userModel from "../../DB/models/users.model.js";
import * as db_service from "../../DB/db.service.js"
import { successResponse } from "../../common/utils/response.success.js";
import {  decrypt, encrypt } from "../../common/utils/security/encrypt.security.js";
import { Compare, Hash } from "../../common/utils/security/hash.security.js";
import { v4 as uuidv4 } from 'uuid';
import { GenerateToken } from "../../common/utils/token.service.js";
import otpGenerator from "otp-generator";
import { sendEmail } from "../../common/utils/sendEmail.service.js";






export const signUp = async (req, res, next) => {

    const { userName, email, password, cpassword, phone, age, gender } = req.body;

    if (password !== cpassword) {
        throw new Error("Invalid password", { cause: 400 })
    }

    if (await db_service.findOne({
        model: userModel,
        filter: { email }
    })) {
        throw new Error("email already exists", { cause: 400 })
    }

    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });

    const user = await db_service.create({
        model: userModel,
        data: {
            userName,
            email,
            password: Hash({ plainText: password }),
            phone: encrypt(phone),
            age,
            gender,
            confirmed: false,
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000),

        }
    })
    console.log("OTP:", otp);
    console.log("Sending email to:", email);
    await sendEmail(email, otp);
    successResponse({ res, status: 201 })



}


export const signIn = async (req, res, next) => {

    const { email, password } = req.body;
    const user = await db_service.findOne({
        model: userModel,
        filter: { email, provider: providerEnum.system }
    })
    if (!user) {
        throw new Error("user not exist", { cause: 404 })
    }
    if (!Compare({ plainText: password, cipherText: user.password })) {
        throw new Error("invalid password", { cause: 400 })
    }
    if (!user.confirmed) {
        return res.status(400).json({ message: "Please confirm your email first" });
    }

    const access_token = GenerateToken({
        payload: { id: user._id, email: user.email },
        secret_key: "secretKey",
        options: {
            expiresIn: "1h",
            // issuer: "http://localhost:3000",
            // audience: "http://localhost:4000",
            // notBefore: 60 * 60,
            jwtid: uuidv4()
        }
    })
    successResponse({ res, message: "login success", data: { access_token } })

}


export const getProfile = async (req, res, next) => {
    const decryptedPhone = decrypt(req.user.phone);

    req.user.phone = decryptedPhone;

    successResponse({ res, message: "done", data: req.user })
}