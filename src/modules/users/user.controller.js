import { Router } from "express";
import * as US from "./user.services.js"
import { authentication } from "../../common/middleware/authentication.js";
import { confirmEmail } from "./confirmEmail.services.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import * as UV from "./user.validation.js";
import { validation } from "../../common/middleware/validation.js";
import { multer_host, multer_local } from "../../common/middleware/multer.js";
import { multerEnum } from "../../common/enum/multer.enum.js";
import { countProfileVisits } from "../../common/middleware/countProfileVisits.js";


const userRouter = Router();




userRouter.post("/signup", validation(UV.signUpSchema), US.signUp)
// userRouter.post("/signup",
//     multer_host(multerEnum.image).fields([
//         { name: "profilePicture", maxCount: 1 },
//         { name: "coverPicture", maxCount: 1 }
//     ]), validation(UV.signUpSchema),
//     US.signUp)

// userRouter.post("/signup",
//     multer_local({custom_path :"users",custom_types : [...multerEnum.image, ...multerEnum.pdf]}).fields([
//         { name: "profilePicture", maxCount: 1 },
//         { name: "coverPicture", maxCount: 1 }
//     ]),, validation(UV.signUpSchema)
//      US.signUp)

userRouter.post("/signup/gmail", US.signUpWithGmail)
userRouter.get("/refreshToken", US.refreshToken)
userRouter.get("/shareProfile/:id", countProfileVisits, validation(UV.shareProfileSchema), US.shareProfile)
userRouter.post("/signIn", validation(UV.signInSchema), US.signIn)
userRouter.post("/loginConfirmation", validation(UV.confirmEmailSchema), US.loginConfirmation)
userRouter.patch("/updatedProfile", authentication, validation(UV.updatedProfileSchema), US.updatedProfile)
userRouter.patch("/updatedPassword", authentication, validation(UV.updatedPasswordSchema), US.updatePassword)
userRouter.get("/getProfile", authentication, authorization([RoleEnum.admin]), US.getProfile)
userRouter.patch("/confirmEmail", validation(UV.confirmEmailSchema), confirmEmail)
userRouter.post("/enable2step", authentication, US.enable2stepVerification)
userRouter.post("/toggle2step", authentication, US.toggle2sv)
userRouter.post("/verify2FAOTP", authentication,validation(UV.verifyOTPSchema), US.verify2FAOTP)
userRouter.post("/resendOTP", validation(UV.resendOTPSchema), US.resendOTP)
userRouter.post("/forgetPassword", validation(UV.resendOTPSchema), US.forgetPassword)
userRouter.patch("/resetForgetPassword", validation(UV.verifyForgetPasswordSchema), US.verifyForgetPassword)
userRouter.post("/logout", authentication, US.logout)
userRouter.patch("/updateProfilePicture", authentication,
    multer_local({ custom_path: "users/profile", custom_types: [...multerEnum.image] }).single("profilePicture"), validation(UV.profilePictureSchema), US.updateProfilePicture)
// userRouter.patch("/updateProfilePicture", authentication,
//     multer_host(multerEnum.image).single("profilePicture"),validation(UV.profilePictureSchema), US.updateProfilePicture)
userRouter.delete("/removeProfilePicture", authentication, US.removeProfilePicture);
userRouter.patch("/updateCoverPicture", authentication,
    multer_local({ custom_path: "users/cover", custom_types: [...multerEnum.image] }).array("coverPicture", 1), validation(UV.coverPictureSchema), US.updateCoverPicture)








export default userRouter;