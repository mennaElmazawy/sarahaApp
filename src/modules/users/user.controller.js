import { Router } from "express";
import * as US from "./user.services.js"
import { authentication } from "../../common/middleware/authentication.js";
import { confirmEmail } from "./confirmEmail.services.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import * as UV from "./user.validation.js";
import { validation } from "../../common/middleware/validation.js";


const userRouter = Router();




userRouter.post("/signup", validation(UV.signUpSchema), US.signUp)
userRouter.post("/signup/gmail", US.signUpWithGmail)
userRouter.post("/signIn",validation(UV.signInSchema), US.signIn)
userRouter.get("/getProfile", authentication, authorization([RoleEnum.admin]), US.getProfile)
userRouter.post("/confirmEmail", confirmEmail)








export default userRouter;