import express from "express";
import upload from "../middleware/cvs_fileUploader.middleware.js";

import csvController from "../controller/csv.controller.js";
const controller = new csvController();

const csvRouter = express.Router();

// route for handling route upload.
csvRouter.post('/upload', upload.single('csvFile'), (req, res, next) => {
    controller.uploadCsv(req, res, next)
});

// route for fetching all the file from db.
csvRouter.get('/home', async (req, res, next) => {
    try {
        const files = await controller.getUploadFiles();  // Call the method and get files
        res.json(files);  // Send the response here in the route
    } catch (err) {
        console.log(`Error fetching uploaded files: ${err.message}`);
        res.status(500).json({ error: 'Failed to fetch uploaded files' });  // Error response
    }
});


// route for delete csv file.
csvRouter.delete('/delete', (req, res, next) => {
    controller.deleteFile(req, res, next)
});

// Route to view the CSV file.
csvRouter.get('/view', async (req, res, next) => {
    const id = req.query.id; // Access 'id' from query parameters
    //console.log(`Extracted id: ${id}`);
    if (!id) {
        return res.status(400).send('Missing id parameter');
    }
    controller.readFile(req, res, next)
})



export default csvRouter;