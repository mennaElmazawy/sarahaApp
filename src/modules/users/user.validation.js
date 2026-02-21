import joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";

export const signUpSchema = {
    body: joi.object({
        userName: joi.string().min(3).max(40).required(),
        email: joi.string().email().required(),
        password: joi.string().min(8).required(),
        cpassword: joi.string().valid(joi.ref("password")).required(),
        age: joi.number().positive().integer().required(),
        gender:joi.string().valid(...Object.values(genderEnum)),
        phone:joi.number()
    }).required()
}
export const signInSchema = {
    body: joi.object({

        email: joi.string().required(),
        password: joi.string().required()
    }).required(),
    query: joi.object({
        x:joi.number().min(10)
    }).required()
}