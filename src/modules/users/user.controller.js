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


const userRouter = Router();




userRouter.post("/signup",
    multer_host(multerEnum.image).fields([
        { name: "profilePicture", maxCount: 1 },
        { name: "coverPicture", maxCount: 1 }
    ]), validation(UV.signUpSchema),
    US.signUp)

// userRouter.post("/signup",
//     multer_local({custom_path :"users",custom_types : [...multerEnum.image, ...multerEnum.pdf]}).fields([
//         { name: "profilePicture", maxCount: 1 },
//         { name: "coverPicture", maxCount: 1 }
//     ]),, validation(UV.signUpSchema)
//      US.signUp)

userRouter.post("/signup/gmail", US.signUpWithGmail)
userRouter.get("/refreshToken", US.refreshToken)
userRouter.get("/shareProfile/:id", validation(UV.shareProfileSchema), US.shareProfile)
userRouter.post("/signIn", validation(UV.signInSchema), US.signIn)
userRouter.patch("/updatedProfile", authentication, validation(UV.updatedProfileSchema), US.updatedProfile)
userRouter.patch("/updatedPassword", authentication, validation(UV.updatedPasswordSchema), US.updatePassword)
userRouter.get("/getProfile", authentication, authorization([RoleEnum.admin]), US.getProfile)
userRouter.post("/confirmEmail", confirmEmail)








export default userRouter;