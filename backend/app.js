import "../env.js";
import express from "express";
import path from "path";
import csvRouter from "./router/csv.routes.js";
import fs from 'fs';
import { fileURLToPath } from "url";

const app = express();

// Serve static files from the frontend directory
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "./frontend")));

// Set the views directory to use for EJS templates
app.set('views', path.join(__dirname, 'backend/views'));
console.log('Views directory:', path.join(__dirname, 'backend/views'));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware for handling JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the csvRouter for handling CSV-related routes
app.use('/', csvRouter);

// Route to serve the homepage (static index.html)
app.get('/', (req, res) => {
    console.log("Sending index.html file");
    res.sendFile(path.join(__dirname, './frontend/index.html'));
});

// Use EJS for the /view route instead of sending an HTML file
app.get('/view', (req, res) => {
    console.log("Rendering view.ejs file");
    res.render('view', {
        title: "View CSV Data",
        // Pass any necessary data here
    });
});

app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    console.log(fileName)
    const filePath = path.join(__dirname, 'uploads', fileName);
    console.log(filePath)


    // Check if the file exists
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});


export default app;
