import uploadModel from "../model/csv.model.js";
import fs from "fs"
import csvParser from "csv-parser";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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

            const filePath = path.join(__dirname, 'uploads', file.filename);

            // Check if the file exists before trying to delete it
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file from filesystem:', err);
                        return res.status(500).json({ error: 'Error deleting file from filesystem' });
                    }

                    console.log('File deleted successfully:', filePath);
                    res.json({ message: 'File deleted successfully' });
                });
            } else {
                console.log('File not found in the filesystem:', filePath);
                res.status(404).json({ error: 'File not found in the filesystem' });
            }

        } catch (err) {
            console.error('Error deleting file:', err);
            res.status(400).send('Error deleting file');
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
            const results = [];

            const filePath = path.join(__dirname, 'uploads', file.filename);
            if (!fs.existsSync(filePath)) {
                return res.status(404).send('File not found');
            }

            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (data) => {
                    results.push(data);
                })
                .on('end', () => {
                    if (results.length === 0) {
                        return res.status(404).send("No data found in the CSV file");
                    }
                    res.render('view', {
                        title: file.filename,
                        file: file,
                        tableHeaders: Object.keys(results[0]),
                        tableRows: results,
                        searchQuery: searchQuery || '',
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