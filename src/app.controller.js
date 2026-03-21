
import express from 'express'
import userRouter from './modules/users/user.controller.js'
import checkConnection from './DB/ConnectionDB.js'
import cors from 'cors'
import { PORT } from '../config/config.service.js'
import { redisConnection } from './DB/redis/redis.db.js'
import "./cron.js"
const app = express()
const port = PORT


const bootstrap = () => {
    app.use(cors(), express.json())
    checkConnection();
    redisConnection();
    app.use("/uploads", express.static("uploads"))
    app.use("/users", userRouter)

    app.use("{/*demo}", (req, res) => {
        throw new Error(`Url ${req.originalUrl} not found `, { cause: 404 })
    })
    app.use(async(err, req, res, next) => {
        if (req.uploadedImages?.length) {
            for (const public_id of req.uploadedImages) {
                await cloudinary.uploader.destroy(public_id);
            }
        }
        res.status(err.cause || 500).json({ message: err.message, stack: err.stack })
    })

    app.listen(port, () => console.log(`saraha app listening on port ${port}!`))
}


export default bootstrap;