import mongoose from "mongoose";


const checkConnection =async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/sarahaApp", {serverSelectionTimeoutMS: 3000})
        console.log("connected to database")
    } catch (error) {
        console.log("error connecting to database", error)
    }

}


export default checkConnection;