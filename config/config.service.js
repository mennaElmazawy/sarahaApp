import dotenv from 'dotenv'
import { resolve } from "node:path"


const NODE_ENV = process.env.NODE_ENV|| "development"

let envPaths = {
    development: ".env.development",
    production: ".env.production"
}

dotenv.config({ path: resolve(`config/${envPaths[NODE_ENV]}`) })


export const PORT = +process.env.PORT
export const SALT_ROUNDS = process.env.SALT_ROUNDS
export const DB_URI = process.env.DB_URI
export const CLIENT_ID = process.env.CLIENT_ID
export const SECRET_KEY = process.env.ACCESS_SECRET_KEY
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY
export const CLOUD_NAME = process.env.CLOUD_NAME
export const API_KEY = process.env.API_KEY
export const API_SECRET = process.env.API_SECRET
export const PREFIX = process.env.PREFIX
export const REDIS_URL = process.env.REDIS_URL
export const EMAIL = process.env.EMAIL
export const PASSWORD = process.env.PASSWORD
export const WHITE_LIST = process.env.WHITE_LIST.split(",")|| []