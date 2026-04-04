import joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";
import { general_rules } from "../../common/utils/generalRules.js";

export const signUpSchema = {
  body: joi.object({
    userName: joi.string().min(3).max(40).required(),
    email: general_rules.email.required(),
    password: general_rules.password.required(),
    cpassword: general_rules.cpassword.required(),
    age: joi.number().positive().integer().required(),
    gender: joi.string().valid(...Object.values(genderEnum)),
    phone: joi.number(),
    DOB: joi.date().less("now")
  }).required(),

  // files: joi.object({
  //     profilePicture: joi.array().max(1).items(general_rules.file.required()).required(),
  //     coverPicture: joi.array().items(general_rules.file.required()).required()
  // })

}

export const confirmEmailSchema = {
  body: joi.object({
    email: general_rules.email.required(),
    otp: joi.string().length(6).required()
  }).required()
}
export const resendEmailSchema = {
  body: joi.object({
    email: general_rules.email.required(),
  }).required()
}


export const profilePictureSchema = {
  file: joi
    .object({})
    .keys({
      fieldname: joi.string().required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi.string().required(),
      size: joi.number().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
    })
    .required(),
}

export const coverPictureSchema = {
  files: joi.array().items(joi
    .object({})
    .keys({
      fieldname: joi.string().required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi.string().required(),
      size: joi.number().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
    })
    .required()
  ).required()
}
export const signInSchema = {
  body: joi.object({
    email: general_rules.email.required(),
    password: general_rules.password.required(),
  }).required()
}
export const shareProfileSchema = {
  params: joi.object({
    id: general_rules.id.required()
  }).required()
}
export const updatedProfileSchema = {
  body: joi.object({
    firstName: joi.string().min(3).trim(),
    lastName: joi.string().min(3).trim(),
    gender: joi.string().valid(...Object.values(genderEnum)),
    phone: joi.number(),
  }).required()
}


export const updatedPasswordSchema = {
  body: joi.object({
    oldPassword: general_rules.password.required(),
    newPassword: general_rules.password.required(),
    cnewPassword: joi.string().valid(joi.ref("newPassword")),
  }).required()
}
export const verifyForgetPasswordSchema = {
  body: confirmEmailSchema.body.append({
    password: general_rules.password.required(),
    cpassword: joi.string().valid(joi.ref("password")),
  }).required()

}
export const resetPasswordByLinkSchema = {
  body: joi.object({
    password: general_rules.password.required(),
    cpassword: joi.string().valid(joi.ref("password")),
  }).required()

}

export const verifyOTPSchema = {
  body: joi.object({
    otp: joi.string().length(6).required()
  }).required()
}

