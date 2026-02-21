import mongoose from "mongoose";
import { genderEnum, providerEnum, RoleEnum } from "../../common/enum/user.enum.js";



const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 8,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 8,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: function(){
            return this.provider ==providerEnum.google? false :true
        },
        minLength: 6,
        trim: true
    },
 
    phone: {
        type: String,

    },
    role:{
        type:String,
        enum:Object.values(RoleEnum),
        default:RoleEnum.admin
    },
    age: Number,
    gender: {
        type: String,
        enum: Object.values(genderEnum),
        default: genderEnum.male
    },
    profilePicture: String,
    confirmed: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpires: Date,
    provider: {
        type: String,
        enum: Object.values(providerEnum),
        default: providerEnum.system
    },

}, {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


userSchema.virtual("userName")
    .get(function () {
        return this.firstName + " " + this.lastName
    })
    .set(function (value) {
        const [firstName, lastName] = value.split(" ");
        this.set({ firstName, lastName });


    })

const userModel = mongoose.model.User || mongoose.model("User", userSchema)

export default userModel;