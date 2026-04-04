
import express from 'express'
import userRouter from './modules/users/user.controller.js'
import checkConnection from './DB/ConnectionDB.js'
import cors from 'cors'
import { PORT, WHITE_LIST } from '../config/config.service.js'
import { redisConnection } from './DB/redis/redis.db.js'
import "./cron.js"
import messagesRouter from './modules/messages/messages.controller.js'
import fs from "node:fs"
import cloudinary from './common/utils/cloudinary.js'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'

const app = express()
const port = PORT



const bootstrap = () => {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 20,
        message: "Too many requests from this IP, please try again after 15 minutes",
        statusCode:400,
        requestPropertyName:"rateLimit"

    })
    const corsOptions = {
        origin: function (origin, callback) {
            if ([...WHITE_LIST, undefined].includes(origin)) {
                callback(null, true)
            } else {
                callback(new Error("Not allowed by CORS"))
            }
        }
    }
    app.use(
        cors(corsOptions),
        helmet(),
        limiter,
        express.json()
    )
    checkConnection();
    redisConnection();

    app.get("/", (req, res) => {
        return res.json({ message: "Welcome to the Saraha App" });
    });
    app.use("/uploads", express.static("uploads"))
    app.use("/users", userRouter)
    app.use("/messages", messagesRouter)

    app.use("{/*demo}", (req, res) => {
        throw new Error(`Url ${req.originalUrl} not found `, { cause: 404 })
    })
    app.use(async (err, req, res, next) => {
        if (req.file) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path)
            }
        }

        if (req.files) {
            for (const file of req.files) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path)
                }
            }
        }
        if (req.uploadedImages?.length) {
            for (const img of req.uploadedImages) {
                if (img?.public_id) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }
        }
        res.status(err.cause || 500).json({ message: err.message, stack: err.stack })
    })

    app.listen(port, () => console.log(`saraha app listening on port ${port}!`))
}


export default bootstrap;