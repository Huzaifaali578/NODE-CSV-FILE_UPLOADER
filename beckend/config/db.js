import mongoose from "mongoose"

const url = process.env.MOGODB_URL
const connectToDB = async () => {
    try {
        const res = await mongoose.connect(url);
        console.log("mongoDB id connected")
    } catch (err) {
        console.log("MongoDB connection Failed");
    }
}

export default connectToDB;