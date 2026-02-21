import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";


const checkConnection =async () => {
    try {
        await mongoose.connect(DB_URI, {serverSelectionTimeoutMS: 3000})
        console.log(`connected to database ${DB_URI}`)
    } catch (error) {
        console.log("error connecting to database", error)
    }

}


export default checkConnection;