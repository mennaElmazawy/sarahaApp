
import { hashSync, compareSync } from "bcrypt";



export const Hash= ({plainText,salt_Rounds = process.env.SALT_ROUNDS }={}) => {

    return hashSync(plainText, Number(salt_Rounds))
}

export const Compare= ({plainText, cipherText}={}) => {

    return compareSync(plainText, cipherText)
}