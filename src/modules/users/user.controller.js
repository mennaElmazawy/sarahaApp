import { Router } from "express";
 import * as US from "./user.services.js"
import { authentication } from "../../common/middleware/authentication.js";
import { confirmEmail } from "./confirmEmail.services.js";

const userRouter= Router();

userRouter.post("/signUp",US.signUp)
userRouter.post("/signIn",US.signIn)
userRouter.get("/getProfile",authentication,US.getProfile)
userRouter.post("/confirmEmail",confirmEmail)








export default userRouter;