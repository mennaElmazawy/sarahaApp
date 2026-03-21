import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        minLength: 2,
        maxLength: 10000,
        required: function () {
            return !this.attachments?.length
        },

    },
    attachments: {
        type: [String]
    }

},
    {
        timestamps: true,
        collection: "Messages"
    })

export const MessageModel = mongoose.model.Message || mongoose.model("Message", messageSchema)