
import { hashSync, compareSync } from "bcrypt";

export const Hash= ({plainText, salt_Rounds=12}={}) => {

    return hashSync(plainText, salt_Rounds)
}

export const Compare= ({plainText, cipherText}={}) => {

    return compareSync(plainText, cipherText)
}