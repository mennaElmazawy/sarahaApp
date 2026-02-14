
import express from 'express'
import userRouter from './modules/users/user.controller.js'
import checkConnection from './DB/ConnectionDB.js'
const app = express()
const port = 3000


const bootstrap = () => {
    app.use(express.json())
    checkConnection();

    app.use("/users", userRouter)

    app.use("{/*demo}", (req, res) => {
        throw new Error(`Url ${req.originalUrl} not found `,{cause:404})
    })
app.use ((err, req, res, next) => {
    res.status(err.cause||500).json({message: err.message, stack: err.stack})
})

    app.listen(port, () => console.log(`saraha app listening on port ${port}!`))
}


export default bootstrap;