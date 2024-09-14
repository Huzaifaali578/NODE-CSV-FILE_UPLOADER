import uploadModel from "../model/csv.model.js";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { fileURLToPath } from "url";

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
            const newUpload = new this.uploadModel({ filename, path: filePath, size });
            await newUpload.save();

            console.log("File uploaded successfully");
            res.redirect('/home');
        } catch (err) {
            console.log(err);
            res.status(400).send("Error uploading file");
        }
    }

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
            const fileId = req.body.fileId;
            const file = await uploadModel.findById(fileId);

            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }

            await uploadModel.findByIdAndDelete(fileId);

            const filePath = file.path;

            await fs.promises.unlink(filePath);  // Using fs.promises to delete

            console.log('File deleted successfully:', filePath);
            res.json({ message: 'File deleted successfully' });
        } catch (err) {
            console.error('Error deleting file:', err);
            res.status(500).json({ error: 'Error deleting file' });
        }
    }

    async readFile(req, res, next) {
        try {
            const id = req.query.id;
            const searchQuery = req.query.q;

            const file = await uploadModel.findById(id);
            if (!file) {
                return res.status(404).send('File not found');
            }

            const filePath = file.path;

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

                    if (searchQuery) {
                        tableRows = tableRows.filter((row) =>
                            Object.values(row).some((value) =>
                                value.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                        );
                    }

                    res.render('view', {
                        title: file.filename,
                        searchQuery: searchQuery || '',
                        tableHeaders,
                        tableRows,
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
