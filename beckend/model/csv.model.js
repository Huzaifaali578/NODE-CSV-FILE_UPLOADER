import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    }
});

const uploadModel = mongoose.model("Upload", uploadSchema);

export default uploadModel;
