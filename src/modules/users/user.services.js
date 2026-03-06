import { providerEnum } from "../../common/enum/user.enum.js";
import userModel from "../../DB/models/users.model.js";
import * as db_service from "../../DB/db.service.js"
import { successResponse } from "../../common/utils/response.success.js";
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js";
import { Compare, Hash } from "../../common/utils/security/hash.security.js";
import { v4 as uuidv4 } from 'uuid';
import { GenerateToken, VerifyToken } from "../../common/utils/token.service.js";
import otpGenerator from "otp-generator";
import { sendEmail } from "../../common/utils/sendEmail.service.js";
import { OAuth2Client } from 'google-auth-library';

import { PREFIX, REFRESH_SECRET_KEY, SALT_ROUNDS, SECRET_KEY } from "../../../config/config.service.js";
import cloudinary from "../../common/utils/cloudinary.js";



export const signUp = async (req, res, next) => {
    req.uploadedImages = [];

    const { userName, email, password, cpassword, phone, age, gender } = req.body;
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

    let profilePicture = null;

    if (req.files?.profilePicture) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
            req.files.profilePicture[0].path,
            { folder: "sarahaApp/users/profile" }
        );
        req.uploadedImages.push(public_id);
        profilePicture = { secure_url, public_id };
    }
    let coverPictures = [];

    if (req.files?.coverPicture) {

        for (const file of req.files.coverPicture) {

            const { secure_url, public_id } = await cloudinary.uploader.upload(
                file.path,
                { folder: "sarahaApp/users/cover" }
            );
            req.uploadedImages.push(public_id);
            coverPictures.push({ secure_url, public_id });
        }
    }

    const user = await db_service.create({
        model: userModel,
        data: {
            userName,
            email,
            password: Hash({ plainText: password, salt_Rounds: SALT_ROUNDS }),
            phone: encrypt(phone),
            age,
            gender,
            profilePicture,
            coverPicture: coverPictures,
            confirmed: false,
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000),

        }
    })

    console.log("OTP:", otp);
    console.log("Sending email to:", email);
    await sendEmail(email, otp);
    successResponse({ res, status: 201, message: "success sign up", data: user })

}


export const signUpWithGmail = async (req, res, next) => {

    const { idToken } = req.body;

    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
        idToken,
        audience: "902153661363-7khm0nr0k7dqr8ksjp3j16rt7l6t65b2.apps.googleusercontent.com"
        ,
    });
    const payload = ticket.getPayload();
    console.log(payload)
    const { email, email_verified, name, picture } = payload

    let user = await db_service.findOne({ model: userModel, filter: { email } })

    if (!user) {
        user = await db_service.create({
            model: userModel,
            data: {
                email,
                confirmed: email_verified,
                userName: name,
                profilePicture: picture,
                provider: providerEnum.google
            }
        })
    }
    if (user.provider == providerEnum.system) {
        throw new Error("please login on system only", { cause: 400 })
    }

    const access_token = GenerateToken({
        payload: { id: user._id, email: user.email, role: user.role },
        secret_key: SECRET_KEY,
        options: {
            expiresIn: "1h",

        }
    })
    successResponse({ res, message: "login success", data: { access_token } })



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
        payload: { id: user._id, email: user.email, role: user.role },
        secret_key: SECRET_KEY,
        options: {
            expiresIn: "1h",
            // issuer: "http://localhost:3000",
            // audience: "http://localhost:4000",
            // notBefore: 60 * 60,
            jwtid: uuidv4()
        }
    })
    const Refresh_token = GenerateToken({
        payload: { id: user._id, email: user.email, role: user.role },
        secret_key: REFRESH_SECRET_KEY,
        options: {
            expiresIn: "1y",
            jwtid: uuidv4()
        }
    })
    successResponse({ res, message: "login success", data: { access_token, Refresh_token } })

}

export const getProfile = async (req, res, next) => {
    const decryptedPhone = decrypt(req.user.phone);

    req.user.phone = decryptedPhone;

    successResponse({ res, message: "done", data: req.user })
}

export const refreshToken = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        throw new Error("token not exist", { cause: 400 })
    }
    const [prefix, token] = authorization.split(" ");
    if (prefix !== PREFIX) {
        throw new Error("invalid prefix", { cause: 401 })
    }
    const decoded = VerifyToken({
        token,
        secret_key: REFRESH_SECRET_KEY
    })
    if (!decoded || !decoded?.id) {
        throw new Error("invalid token", { cause: 400 })
    }
    const user = await db_service.findOne({ model: userModel, filter: { _id: decoded.id } })
    if (!user) {
        throw new Error("user not exist", { cause: 404 })
    }
    const access_token = GenerateToken({
        payload: { id: user._id, email: user.email },
        secret_key: SECRET_KEY,
        options: {
            expiresIn: 60 * 5,
        }
    })
    successResponse({ res, message: "success", data: { access_token } })
}

export const shareProfile = async (req, res, next) => {
    const { id } = req.params;
    const user = await db_service.findById({ model: userModel, id, select: "-password" })
    if (!user) {
        throw new Error("user not exist", { cause: 404 })
    }
    user.phone = decrypt(user.phone);

    successResponse({ res, message: "done", data: user })
}


export const updatedProfile = async (req, res, next) => {
    let { firstName, lastName, gender, phone } = req.body;
    if (phone) {
        phone = encrypt(phone)
    }
    const user = await db_service.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        update: { firstName, lastName, gender, phone }
    })
    if (!user) {
        throw new Error("user not exist", { cause: 404 })
    }


    successResponse({ res, message: "done", data: user })
}


export const updatePassword = async (req, res, next) => {
    let { oldPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user._id).select("+password")
    console.log(req.user)
    if (!Compare({ plainText: oldPassword, cipherText: user.password })) {
        throw new Error("invalid old password", { cause: 400 })
    }
    const hash = Hash({ plainText: newPassword, salt_Rounds: SALT_ROUNDS })
    req.user.password = hash;
    await req.user.save();

    successResponse({ res, message: "done" })
}