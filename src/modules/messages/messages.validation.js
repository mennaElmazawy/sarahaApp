import Joi from "joi";
import { general_rules } from "../../common/utils/generalRules.js";


export const sendMessageSchema={
    body: Joi.object({
            content: Joi.string().required(),
            receiverId: general_rules.id.required(),
    }).required(),

    files: Joi.array().items(general_rules.file)
}

export const getMessageSchema={
    params:Joi.object({
        messageId:general_rules.id.required()
    }).required()
}