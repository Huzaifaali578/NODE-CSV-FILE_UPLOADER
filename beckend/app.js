import "../env.js"
import express from "express";
import path from "path"

const app = express();

// serve static file from frontend directry.
const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, "./frontend")));



export default app;