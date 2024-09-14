import uploadModel from "../model/csv.model.js";
import fs from "fs"
import path from "path";
import csvParser from "csv-parser";
import { fileURLToPath } from "url";

export default class csvController {
    constructor() {
        this.uploadModel = uploadModel
    };

    async uploadCsv(req, res, next) {
        try {
            // check if file-exists.
            if (!req.file) {
                return res.status(400).send("No file uploaded");
            }

            // craete new csv-file obj model.
            const { filename, path, size } = req.file;
            const newUpload = new this.uploadModel({ filename, path, size });
            await newUpload.save();

            console.log("file uploaded successfully");
            // redirect to home page
            res.redirect('/home');
        } catch (err) {
            console.log(err)
            res.status(400).send("Error uploading file")
        }
    };

    async getUploadFiles(req, res, next) {
        try {

            // get all the file from db.
            const files = await uploadModel.find({}, { filename: 1, filePath: 1, size: 1 })
            return files
        } catch (err) {
            console.log(err)
            throw new Error("Failed to fetch uploaded files")
        }
    };

    async deleteFile(req, res, next) {
        try {
            // Get the fileId from the request body
            const fileId = req.body.fileId;
    
            // Find the file by ID in the database
            const file = await uploadModel.findById(fileId);
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }
    
            // Delete the file from the database
            await uploadModel.findByIdAndDelete(fileId);
    
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
    
            // Construct the file path
            const filePath = path.join(__dirname, 'uploads', file.filename);
    
            // Delete the file from the filesystem using fs.promises
            await fs.unlink(filePath);
    
            // Successfully deleted
            console.log('File deleted successfully:', filePath);
    
            // Redirect the user or send a JSON response, but not both
            res.redirect('/home');
            // or
            // res.json({ message: 'File deleted successfully' });
        } catch (err) {
            console.error('Error deleting file:', err);
            res.status(500).json({ error: 'Error deleting file' });
        }
    };
    

    async readFile(req, res, next) {
        try {
            const id = req.query.id;
            // Get the search query from the URL query parameters
            const searchQuery = req.query.q;
            
            // Find the file by its ID
            const file = await uploadModel.findById(id);
            if (!file) {
                return res.status(404).send('File not found');
            }
    
            const filePath = file.path; // Use the file's path directly
    
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (data) => {
                    results.push(data);
                })
                .on('end', () => {
                    if (results.length === 0) {
                        return res.status(404).send("No data found in the CSV file");
                    }
    
                    const tableHeaders = Object.keys(results[0]);
                    let tableRows = results;
    
                    // Apply the search filter if a search query is present
                    if (searchQuery) {
                        tableRows = tableRows.filter((row) =>
                            Object.values(row).some((value) =>
                                value.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                        );
                    }
    
                    // Render the view with the parsed CSV data
                    res.render('view', {
                        title: file.filename, // Set the title to the original filename
                        file: file, // Pass the file object
                        searchQuery: searchQuery || '', // Pass the search query from the request
                        tableHeaders: tableHeaders, // Pass the table headers
                        tableRows: tableRows, // Pass the table rows (filtered if search query present)
                        csvData: results, // Pass the entire CSV data
                    });
                })
                .on("error", (error) => {
                    console.error("CSV parsing error:", error);
                    res.status(500).send("Error parsing CSV file");
                });
    
        } catch (err) {
            console.error(err);
            res.status(400).send('Error reading file');
        }
    }
    

}