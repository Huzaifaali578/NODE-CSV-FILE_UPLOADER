import mongoose from "mongoose"

const url = process.env.MOGODB_URL
const connectToDB = async () => {
    try {
        const res = await mongoose.connect(url);
        console.log("mongoDB DB connected")
    } catch (err) {
        console.log("MongoDB connection Failed");
        console.log(err)
    }
}

export default connectToDB;