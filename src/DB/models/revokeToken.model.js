import mongoose from "mongoose";
const revokeTokenSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    expireAt: {
        type: Date,
        required: true,

    },

}, {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
revokeTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })
const revokeTokenModel =mongoose.models.revokeToken||mongoose.model("RevokeToken", revokeTokenSchema)
revokeTokenModel.syncIndexes()

export default revokeTokenModel;