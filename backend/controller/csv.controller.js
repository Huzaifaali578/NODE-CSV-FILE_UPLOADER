import uploadModel from "../model/csv.model.js";
import fs from "fs";
import csvParser from "csv-parser";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default class csvController {
    constructor() {
        this.uploadModel = uploadModel;
    }

    async uploadCsv(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).send("No file uploaded");
            }

            const { filename, path: filePath, size } = req.file;

            // Save new CSV file to the database
            const newUpload = new this.uploadModel({ filename, filePath, size });
            await newUpload.save();

            console.log("File uploaded successfully");
            return res.redirect('/home');
        } catch (err) {
            console.error("Error uploading file:", err);
            if (!res.headersSent) {
                return res.status(400).send("Error uploading file");
            }
        }
    }

    async getUploadFiles(req, res, next) {
        try {
            const files = await this.uploadModel.find({}, { filename: 1, filePath: 1, size: 1 });
            return res.status(200).json(files);
        } catch (err) {
            console.error("Error fetching files:", err);
            if (!res.headersSent) {
                return res.status(500).send("Failed to fetch uploaded files");
            }
        }
    }

    async deleteFile(req, res, next) {
        try {
            const fileId = req.body.fileId;

            // Find the file in the database
            const file = await this.uploadModel.findById(fileId);
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }

            const filePath = path.join(__dirname, 'uploads', file.filename);

            // Check if the file exists
            if (fs.existsSync(filePath)) {
                // Remove the file from the filesystem
                fs.unlink(filePath, async (err) => {
                    if (err) {
                        console.error("Error deleting file:", err);
                        if (!res.headersSent) {
                            return res.status(500).json({ error: 'Error deleting file' });
                        }
                    }

                    // Delete the file from the database
                    await this.uploadModel.findByIdAndDelete(fileId);
                    console.log('File deleted successfully:', filePath);
                    if (!res.headersSent) {
                        return res.json({ message: 'File deleted successfully' });
                    }
                });
            } else {
                console.log('File not found in the filesystem:', filePath);
                if (!res.headersSent) {
                    return res.status(404).json({ error: 'File not found in the filesystem' });
                }
            }
        } catch (err) {
            console.error("Error deleting file:", err);
            if (!res.headersSent) {
                return res.status(500).send("Error deleting file");
            }
        }
    }

    async readFile(req, res, next) {
        try {
            const id = req.query.id;
            const searchQuery = req.query.q || '';

            // Find the file by its ID in the database
            const file = await this.uploadModel.findById(id);
            if (!file) {
                return res.status(404).send("File not found");
            }

            const filePath = path.join(__dirname, 'uploads', file.filename);
            if (!fs.existsSync(filePath)) {
                return res.status(404).send("File not found in the filesystem");
            }

            const results = [];

            // Stream and parse the CSV file
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    if (results.length === 0) {
                        return res.status(404).send("No data found in the CSV file");
                    }

                    return res.render('view', {
                        title: file.filename,
                        file: file,
                        tableHeaders: Object.keys(results[0]),
                        tableRows: results,
                        searchQuery,
                    });
                })
                .on('error', (error) => {
                    console.error("CSV parsing error:", error);
                    if (!res.headersSent) {
                        return res.status(500).send("Error parsing CSV file");
                    }
                });
        } catch (err) {
            console.error("Error reading file:", err);
            if (!res.headersSent) {
                return res.status(400).send("Error reading file");
            }
        }
    }
}