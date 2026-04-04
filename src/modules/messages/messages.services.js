import { successResponse } from "../../common/utils/response.success.js";
import * as db_service from "../../DB/db.service.js"
import { MessageModel } from "../../DB/models/message.model.js";
import userModel from "../../DB/models/users.model.js";

export const sendMessage = async (req, res, next) => {
    const { content, receiverId } = req.body;
    const user = await db_service.findById({
        model: userModel,
        id: receiverId
    })
    if (!user) {
        throw new Error("Receiver not found", { cause: 404 });
    }

    let arr = []

    if (req.files?.length) {
        for (const file of req.files) {
            arr.push(file.path)
        }
    }
    const message = await db_service.create({
        model: MessageModel,
        data: {
            content,
            receiverId: user._id,
            attachments: arr
        }
    })
    successResponse({ res,status:201, message: "Message sent successfully", data: { message } })


}


export const getMessage = async (req, res, next) => {
    const { messageId } = req.params
    const message = await db_service.findOne({
        model: MessageModel,
        filter: {
            _id: messageId,
            receiverId: req.user._id
        }
    })
    if (!message) {
        throw new Error("Message not found", { cause: 404 });
    }
    successResponse({ res,status:200, message: "Message retrieved successfully", data: { message } })
}

export const getAllMessages =async (req,res,next)=>{
    const messages= await db_service.find({
        model:MessageModel,
        filter:{receiverId:req.params.userId}
    })
    successResponse({ res,status:200, message: "Messages retrieved successfully", data: { messages } })
}