import joi from "joi";
import { Types } from "mongoose";

export const general_rules = {
    email: joi.string().email(),
    password: joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    cpassword: joi.string().valid(joi.ref("password")),

    id: joi.string().custom((value, helper) => {
        const isValid=Types.ObjectId.isValid(value);
        return isValid ? value : helper.message("invalid Id");
    }),

    file: joi.object({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi.string().required(),
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        size: joi.number().required()
    }).messages({'any.required': "file is required"})
}