import express from 'express';
import multer from 'multer';
import path from 'path';
import fs, { existsSync } from 'fs';
import fsPromises from 'fs/promises';


import File from '../models/file.js';
import Folder from '../models/Folder.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


function returnGB(bytes) {
    return bytes / (1024 * 1024 * 1024);
}


// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `folders/${req.session.folder?.foldername}`);
    },
    filename: (req, file, cb) => {
        const currentDate = new Date()
            .toISOString()
            .replace(/:/g, '-')
            .replace(/\..+/, '');
        // Save the file with its original name
        const ext = path.extname(file.originalname);
        const name = file.originalname.replace(ext, '');
        cb(null, `${file.fieldname}_${currentDate}${ext}`); // Filename with original extension
    }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    const { originalname, mimetype, destination, filename, path, size } = req.file
    const { uuid, folder } = req.body;
    try {
        console.log(originalname, uuid, folder);

        const fileUpload = await File.create({
            userId: uuid,
            docName: originalname,
            docSize: size, 
            docType: mimetype,
            date: getFormattedDate(),
            doc: filename,
            docPath: path,
            folder: folder,
            status: 'pending'
        }); 

        const updateStorage = await User.updateOne(
            { _id: new mongoose.Types.ObjectId(uuid) },
            { $inc: { storage: returnGB(size) } }
        )

        res.status(200).json({ msg: `File has been uploaded to the folder: ${fileUpload}`, url: '/' });
    } catch (error) {
        res.status(400).json({ msg: 'Error uploading file' });
        console.error("Error uploading file:", error);
    }
});


// This endpoint is called first before the /upload endpoint is called 
router.post('/crd', (req, res) => {
    if (req.body.folder) {
        // Create folder if it doesn't exist
        if (!fs.existsSync(`folders/${req.body.folder}`)) {
            fs.mkdirSync(`folders/${req.body.folder}`, { recursive: true });
        }
        req.session.folder = { foldername: req.body.folder }
        res.status(200).json({ msg: 'Process successful' });
    } else {
        res.status(404).json({ msg: 'A folder is required' });
    }
})

// Route POST [create a folder under a user]
router.post('/crfd', async (req, res) => {
    const { foldername, uuid } = req.body;

    if (!existsSync(`folders/${foldername}`)) {
        try {
            const currentDate = getFormattedDate();
            const addFolder = await Folder.create({
                user_id: uuid,
                foldername: foldername,
                datecreated: currentDate
            })
            fs.mkdirSync(`folders/${foldername}`);

            res.status(200).json({ msg: `Folder created here ${foldername} and data ${addFolder}`, url: '/folders' });
        } catch (error) {
            res.status(400).json({ msg: `Could not create the folder ${error.message}` });
        }
    } else {
        res.status(200).json({ msg: 'This folder already exist try another name' });
    }
})

// Route GET [returns the folders under a particular user]
router.get('/folders/:id', async (req, res) => {
    const uuid = req.params.id;

    if (mongoose.Types.ObjectId.isValid(uuid)) {
        try {
            const folders = await Folder.find({ user_id: uuid }, { foldername: 1 });
            if (folders) {
                res.status(200).json({ folders: folders })
            } else {
                res.status(200).json({ folders: {} });
            }
        } catch (error) {
            res.status(400).json({ msg: `An error occured: ${error}` });
        }
    } else {
        res.status(400).json({ msg: "Invalid Uuid" })
    }
})

router.post('/rmfd', async (req, res) => {
    const { foldername } = req.body;
    try {

        const fileUnderFolder = await File.find({ folder: foldername });
        let sizeReduction = 0;
        let fileUserId = '';
        fileUnderFolder.forEach( async (file, id) => {
            const { _id, docSize, userId } = file;
            const sizeInGB = -returnGB(docSize);
            sizeReduction += sizeInGB;
            fileUserId = userId;
            await File.deleteOne({_id: new mongoose.Types.ObjectId(_id)})
        })

        await fsPromises.rm(`folders/${foldername}`, { recursive: true, force: true });
        const folderToDel = await Folder.deleteOne({ foldername: foldername })
        const updateStorage = await User.updateOne(
            { _id: new mongoose.Types.ObjectId(fileUserId) },
            { $inc: { storage: sizeReduction } }
        )
        if (folderToDel) {
            res.status(200).json({ msg: 'Folder deleted', url: '/folders' })
        } else {
            res.status(400).json({ msg: 'Error deleting from Storage' })
        }
    } catch (error) {
        console.error(`Error deleting folder: ${error.message}`);
        res.status(200).json({ msg: `Error deleting folder ${foldername} Error: ${error.message}` })
    }
})

router.post('/rmf', async (req, res) => {
    const { filename } = req.body;
    try {
        const getFileDetails = await File.find({ docName: filename })
        if (getFileDetails) {
            const { docPath, docSize, userId } = getFileDetails[0];
            const pathToDelete = path.resolve(docPath);
            fs.unlink(pathToDelete, async (err) => {
                if (err) {
                    res.status(400).json({ msg: "Error Deleting file" })
                }

                const dbDropFile = await File.deleteOne({ docName: filename });
                const updateStorage = await User.updateOne(
                    { _id: new mongoose.Types.ObjectId(userId) },
                    { $inc: { storage: -returnGB(docSize)} }
                )

                if (dbDropFile) {
                    res.status(200).json({ msg: "File deleted successfully", url: '/' })
                }
            })
        } else {
            res.status(400).json({ msg: 'File does not exist in directory' })
        }
    } catch (error) {
        console.error(`Error deleting file: ${error.message}`);
        res.status(200).json({ msg: `Error deleting file ${filename} Error: ${error.message}` })
    }
})





export default router;