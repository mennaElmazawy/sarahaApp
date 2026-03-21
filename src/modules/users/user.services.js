import { providerEnum } from "../../common/enum/user.enum.js";
import userModel from "../../DB/models/users.model.js";
import fs from "node:fs";
import path from "node:path";
import * as db_service from "../../DB/db.service.js"
import { successResponse } from "../../common/utils/response.success.js";
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js";
import { Compare, Hash } from "../../common/utils/security/hash.security.js";
import { v4 as uuidv4 } from 'uuid';
import { GenerateToken, VerifyToken } from "../../common/utils/token.service.js";
import otpGenerator from "otp-generator";
import { generateOTP, sendEmail } from "../../common/utils/sendEmail.service.js";
import { OAuth2Client } from 'google-auth-library';

import { PREFIX, REFRESH_SECRET_KEY, SALT_ROUNDS, SECRET_KEY } from "../../../config/config.service.js";
import cloudinary from "../../common/utils/cloudinary.js";
import { model } from "mongoose";
import { randomUUID } from "crypto";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import { block_otp_key, block_password_key, del, expire, get, get_key, incr, keys, max_otp_key, max_password_key, otp_key, revoked_key, setValue, ttl } from "../../DB/redis/redis.service.js";
import { emailEnum } from "../../common/enum/email.enum.js";
import { eventEmitter } from "../../common/utils/email.events.js";

export const sendEmailOtp = async ({ email, subject }) => {

    const isblocked = await ttl(block_otp_key({ email, subject }))
    if (isblocked > 0) {
        throw new Error(`You are blocked from requesting OTP. Please try again after ${isblocked} seconds.`);
    }
    const otpTTL = await ttl(otp_key({ email, subject }))
    if (otpTTL > 0) {
        throw new Error(`Please wait ${otpTTL} seconds before requesting a new OTP`);
    }

    const maxTries = await get(max_otp_key({ email, subject }) || 0)
    if (maxTries > 3) {
        await setValue({ key: block_otp_key({ email, subject }), value: 1, ttl: 60 })
        await del(max_otp_key({ email, subject }));
        throw new Error("Maximum OTP resend attempts reached. Please try again later.");
    }

    const otp = await generateOTP();
    eventEmitter.emit("confirmEmail", async () => {
        await sendEmail({
            to: email,
            subject:subject|| "welcome to saraha app",
            html: `<h1>Your OTP for email confirmation is: <b>${otp}</b></h1>`
        });
        await setValue({ key: otp_key({ email, subject }), value: Hash({ plainText: `${otp}` }), ttl: 60 })
        await incr(max_otp_key({ email, subject }))

    })



};
export const resendOTP = async (req, res) => {

    const { email } = req.body;

    const user = await db_service.findOne({
        model: userModel,
        filter: { email, confirmed: { $exists: false }, provider: providerEnum.system },
    })
    if (!user) {
        throw new Error("User not found");
    }
    await sendEmailOtp({ email, subject: emailEnum.confirmEmail });
    successResponse({ res, message: "OTP resent successfully" })


};


export const signUp = async (req, res, next) => {
    const { userName, email, password, cpassword, phone, age, gender } = req.body;
    if (await db_service.findOne({
        model: userModel,
        filter: { email }
    })) {
        throw new Error("email already exists", { cause: 400 })
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
        }
    })

    console.log("Sending email to:", email);
    await sendEmailOtp({ email, subject: emailEnum.confirmEmail });
    successResponse({ res, status: 201, message: "success sign up", data: user })

}
// export const signUp = async (req, res, next) => {
//     req.uploadedImages = [];

//     const { userName, email, password, cpassword, phone, age, gender } = req.body;
//     if (await db_service.findOne({
//         model: userModel,
//         filter: { email }
//     })) {
//         throw new Error("email already exists", { cause: 400 })
//     }

//     const otp = otpGenerator.generate(6, {
//         upperCaseAlphabets: false,
//         lowerCaseAlphabets: false,
//         specialChars: false,
//     });

//     let profilePicture = null;

//     if (req.files?.profilePicture) {
//         const { secure_url, public_id } = await cloudinary.uploader.upload(
//             req.files.profilePicture[0].path,
//             { folder: `sarahaApp/users/profile` }
//         );
//         req.uploadedImages.push(public_id);
//         profilePicture = { secure_url, public_id };
//     }
//     let coverPictures = [];

//     if (req.files?.coverPicture) {

//         for (const file of req.files.coverPicture) {

//             const { secure_url, public_id } = await cloudinary.uploader.upload(
//                 file.path,
//                 { folder: `sarahaApp/users/cover` }
//             );
//             req.uploadedImages.push(public_id);
//             coverPictures.push({ secure_url, public_id });
//         }
//     }

//     const user = await db_service.create({
//         model: userModel,
//         data: {
//             userName,
//             email,
//             password: Hash({ plainText: password, salt_Rounds: SALT_ROUNDS }),
//             phone: encrypt(phone),
//             age,
//             gender,
//             profilePicture,
//             coverPicture: coverPictures,
//             confirmed: false,
//             otp,
//             otpExpires: new Date(Date.now() + 10 * 60 * 1000),

//         }
//     })

//     console.log("OTP:", otp);
//     console.log("Sending email to:", email);
//     await sendEmail(email, otp);
//     successResponse({ res, status: 201, message: "success sign up", data: user })

// }

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



export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    const user = await db_service.findOne({
        model: userModel,
        filter: { email, confirmed: { $exists: true }, provider: providerEnum.system }
    })
    if (!user) {
        throw new Error("User not found", { cause: 404 });
    }
    await sendEmailOtp({ email, subject: emailEnum.forgetPassword });
    successResponse({ res, message: "OTP sent successfully" })
}

export const signIn = async (req, res, next) => {

    const { email, password } = req.body;
    const user = await db_service.findOne({
        model: userModel,
        filter: { email, provider: providerEnum.system, confirmed: { $exists: true } }
    })
    if (!user) {
        throw new Error("user not exist", { cause: 404 })
    }
    const attemptsKey = max_password_key({ email });
    const banKey = block_password_key({ email });
    const isBlocked = await get(banKey);
    if (isBlocked) {
        throw new Error("Account is blocked. Please try again later.", { cause: 400 })
    }

    if (!Compare({ plainText: password, cipherText: user.password })) {
        const attempts = await incr(attemptsKey);
        if (attempts >= 5) {
            await setValue({ key: banKey, value: 1, ttl: 300 })
            const ttlValue = await ttl(block_password_key({ email }));
            console.log("TTL:", ttlValue);
            console.log("Attempts:", attempts);

            await del(attemptsKey)
            throw new Error("Maximum password attempts reached. Please try again later.", { cause: 400 })
        }
        throw new Error("invalid password", { cause: 400 })
    }
    await del(attemptsKey)
    if (!user.confirmed) {
        return res.status(400).json({ message: "Please confirm your email first" });
    }
    if (user.twostepVerification) {

        await sendEmailOtp({
            email,
            subject: emailEnum.login2FA
        });

        return successResponse({
            res,
            message: "OTP sent, please verify to complete login"
        });
    }
    const jwtid = randomUUID();
    const access_token = GenerateToken({
        payload: { id: user._id, email: user.email, role: user.role },
        secret_key: SECRET_KEY,
        options: {
            expiresIn: "1h",
            // issuer: "http://localhost:3000",
            // audience: "http://localhost:4000",
            // notBefore: 60 * 60,
            jwtid
        }
    })
    const Refresh_token = GenerateToken({
        payload: { id: user._id, email: user.email, role: user.role },
        secret_key: REFRESH_SECRET_KEY,
        options: {
            expiresIn: "1y",
            jwtid
        }
    })
    successResponse({ res, message: "login success", data: { access_token, Refresh_token } })


}
export const loginConfirmation = async (req, res, next) => {
    const { email, otp } = req.body;
    const user = await db_service.findOne({
        model: userModel,
        filter: { email }
    });
    if (!user) {
        throw new Error("User not found", { cause: 404 });
    }
    const otpValue = await get(otp_key({ email, subject: emailEnum.login2FA }))
    if (!otpValue) {
        throw new Error("OTP expired ", { cause: 400 });
    }
    if (!Compare({ plainText: otp, cipherText: otpValue })) {
        throw new Error("Invalid OTP", { cause: 400 });
    }
    const jwtid = randomUUID();
    const access_token = GenerateToken({
        payload: { id: user._id, email: user.email, role: user.role },
        secret_key: SECRET_KEY,
        options: {
            expiresIn: "1h",
            // issuer: "http://localhost:3000",
            // audience: "http://localhost:4000",
            // notBefore: 60 * 60,
            jwtid
        }
    })
    const Refresh_token = GenerateToken({
        payload: { id: user._id, email: user.email, role: user.role },
        secret_key: REFRESH_SECRET_KEY,
        options: {
            expiresIn: "1y",
            jwtid
        }
    })
    successResponse({ res, message: "login success", data: { access_token, Refresh_token } })


}
export const verifyForgetPassword = async (req, res, next) => {
    const { email, otp, password } = req.body;

    const otpValue = await get(otp_key({ email, subject: emailEnum.forgetPassword }))
    if (!otpValue) {
        throw new Error("OTP expired ");
    }

    if (!Compare({ plainText: otp, cipherText: otpValue })) {
        throw new Error("Invalid OTP");
    }
    const user = await db_service.updateOne({
        model: userModel,
        filter: { email, confirmed: { $exists: true }, provider: providerEnum.system },
        update: {
            password: Hash({ plainText: password, salt_Rounds: SALT_ROUNDS }),
            changeCredential: new Date()
        }
    })
    if (!user.modifiedCount) {
        throw new Error("User not found ", { cause: 404 })
    }
    await del(get_key({ userId: user._id }))
    await del(otp_key({ email, subject: emailEnum.forgetPassword }))


    successResponse({ res, message: "password reset successfully" })
}



export const getProfile = async (req, res, next) => {
    const key = `profile::${req.user._id}`
    const userExistInCache = await get(key);
    if (userExistInCache) {
        return successResponse({ res, message: "done", data: userExistInCache })
    }
    const decryptedPhone = decrypt(req.user.phone);
    req.user.phone = decryptedPhone;
    await setValue({ key, value: req.user, ttl: 60 })


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
    const revokeToken = await db_service.findOne({ model: revokeTokenModel, filter: { tokenId: decoded.jti } })
    if (revokeToken) {
        throw new Error("invalid token Revoked", { cause: 401 })
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
    const user = await db_service.findById({ model: userModel, id, select: "-password -visitCount" })
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

    await del(`profile::${req.user._id}`)


    successResponse({ res, message: "done", data: user })
}

//update profilePicture locally without cloudinary
export const updateProfilePicture = async (req, res, next) => {
    console.log(req.file)
    if (!req.file) {
        throw new Error("profile picture is required", { cause: 400 })
    }
    const galleryFolder = path.resolve("uploads/users/gallery")

    if (!fs.existsSync(galleryFolder)) {
        fs.mkdirSync(galleryFolder, { recursive: true })
    }
    if (req.user.profilePicture?.path) {
        const oldPath = req.user.profilePicture.path
        if (fs.existsSync(oldPath)) {
            const fileName = path.basename(oldPath)
            const newGalleryPath = path.join(galleryFolder, fileName)
            fs.renameSync(oldPath, newGalleryPath)
            req.user.gallery.push({
                path: newGalleryPath
            })
        }
    }
    req.user.profilePicture = { path: req.file.path }
    await req.user.save();
    successResponse({ res, message: "done", data: req.user })
}

//remove profile picture locally without cloudinary
export const removeProfilePicture = async (req, res, next) => {
    if (!req.user.profilePicture?.path) {
        throw new Error("No profile picture to delete", { cause: 400 });
    }
    const filePath = req.user.profilePicture.path;
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    req.user.profilePicture = null;
    await req.user.save();

    successResponse({ res, message: "Profile picture removed successfully" });
}


//update profilePicture with cloudinary//

// export const updateProfilePicture = async (req, res, next) => {
//     console.log(req.file)
//     if (!req.file) {
//         throw new Error("profile picture is required", { cause: 400 })
//     }
//     const { secure_url, public_id } = await cloudinary.uploader.upload(
//         req.file.path,
//         { folder: `sarahaApp/users/profile` }
//     );
//     console.log(req.user.profilePicture)
//     const oldImage = req.user.profilePicture;
//     if (oldImage?.public_id) {
//         const movedImage = await cloudinary.uploader.upload(
//             oldImage.secure_url,
//             {
//                 folder: `sarahaApp/users/gallery`,
//                 overwrite: true
//             }
//         );
//         req.user.gallery.push({
//             secure_url: movedImage.secure_url,
//             public_id: movedImage.public_id
//         });
//         await cloudinary.uploader.destroy(oldImage.public_id)
//     }
//     req.user.profilePicture = { secure_url, public_id }
//     await req.user.save();




//     successResponse({ res, message: "done", data: req.user })
// }


// 3) Remove Profile Image API
// Create an API to delete the user’s profile image from Hard Disk
// export const removeProfilePicture = async (req, res, next) => {
//     if (!req.user.profilePicture?.path) {
//         throw new Error("No profile picture to delete", { cause: 400 });
//     }
//     const filePath = req.user.profilePicture.path;
//     if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//     }
//     req.user.profilePicture = null;
//     await req.user.save();

//     successResponse({ res, message: "Profile picture removed successfully" });
// }

// Remove Profile Image API with cloudinary
// export const removeProfilePicture = async (req, res, next) => {
//     if (!req.user.profilePicture?.public_id) {
//         throw new Error("No profile picture to delete", { cause: 400 });
//     }

//     await cloudinary.uploader.destroy(req.user.profilePicture.public_id);
//     req.user.profilePicture = null;
//     await req.user.save();


//     successResponse({ res, message: "Profile picture removed successfully" });
// }

export const updateCoverPicture = async (req, res, next) => {
    console.log(req.files)
    if (!req.files || req.files.length === 0) {
        throw new Error("At least one cover picture is required", { cause: 400 });
    }

    const existingCount = req.user.coverPicture?.length || 0;
    if (existingCount + req.files.length > 2) {
        for (const file of req.files) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
        throw new Error(
            `You can only have 2 cover pictures. You already have ${existingCount}`,
            { cause: 400 }
        );
    }
    const uploadedImages = [];
    for (const file of req.files) {
        uploadedImages.push({ path: file.path });
    }
    req.user.coverPicture = [...(req.user.coverPicture || []), ...uploadedImages];
    await req.user.save();

    successResponse({ res, message: "Cover pictures uploaded successfully", data: req.user });
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

export const enable2stepVerification = async (req, res, next) => {
    const user = await userModel.findById(req.user._id);
    if (user.twostepVerification) {
        throw new Error("2-step verification is already enabled", { cause: 400 })
    }

    await sendEmailOtp({
        email: user.email,
        subject: emailEnum.enable2FA
    });

    successResponse({
        res,
        message: "OTP sent to enable 2-step verification. Please verify to complete the process."
    });
}

export const toggle2sv = async (req, res, next) => {
    const user = await db_service.findById({ model: userModel, id: req.user._id })
    if (!user) {
        throw new Error("user not exist", { cause: 404 })
    }
     await sendEmailOtp({
        email: user.email,
        subject:user.twostepVerification?emailEnum.disable2FA : emailEnum.enable2FA
    });

    successResponse({
        res,
        message: "OTP sent. Please verify to complete the process."
    });
}
export const verify2FAOTP = async (req, res, next) => {
    const { otp } = req.body;
    const user = await userModel.findById(req.user._id);
    if (!user) {
        throw new Error("User not found", { cause: 404 });
    }
    const otpValue = await get(otp_key({ email: user.email, subject: user.twostepVerification?emailEnum.disable2FA : emailEnum.enable2FA }))
    if (!otpValue) {
        throw new Error("OTP expired ", { cause: 400 });
    }
    if (!Compare({ plainText: otp, cipherText: otpValue })) {
        throw new Error("Invalid OTP");
    }

    user.twostepVerification = !user.twostepVerification;
    await user.save();

    await del(otp_key({ email: user.email, subject: user.twostepVerification?emailEnum.disable2FA : emailEnum.enable2FA }));
    await del(max_otp_key({ email: user.email, subject:user.twostepVerification?emailEnum.disable2FA : emailEnum.enable2FA}));

    successResponse({ res, message: "Done" });
}
export const logout = async (req, res, next) => {
    const { flag } = req.query

    if (flag === "all") {
        req.user.changeCredential = new Date()
        await req.user.save()
        await del(await keys(get_key({ userId: req.user._id })))
    } else {
        await setValue({
            key: revoked_key({ userId: req.user._id, jti: req.decoded.jti }),
            value: `${req.decoded.jti}`,
            ttl: req.decoded.exp - Math.floor(Date.now() / 1000)
        })


    }
    successResponse({ res, message: "logout success" })
}