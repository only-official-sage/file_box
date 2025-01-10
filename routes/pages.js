
import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();
import { routeProtect } from '../middlewares/routeProtect.js'

import Folder from '../models/Folder.js';
import File from '../models/file.js';
import User from '../models/User.js';
import { fileURLToPath } from 'url';
import path from 'path';

router.get('/', routeProtect, async (req, res) => {
    const { data } = req.token;
    if (mongoose.Types.ObjectId.isValid(data)) {
        const files = await File.find({ userId: data });
        const user = await User.find({ _id: new mongoose.Types.ObjectId(data) }, { username: 1, email: 1, storage: 1, maxstorage: 1, date_joined: 1 })
        res.render('index', {
            files,
            data,
            user
        });
    } else {
        res.render('login')
    }
});

router.get('/folders', routeProtect, async (req, res) => {
    const { data } = req.token;
    if (mongoose.Types.ObjectId.isValid(data)) {
        const folders = await Folder.find({ user_id: data });
        const user = await User.find({ _id: new mongoose.Types.ObjectId(data) }, {username: 1, email: 1, storage: 1, maxstorage: 1, date_joined: 1})
        res.render('folders', {
            folders,
            data,
            user
        })
    } else {
        res.render('login')
    }
})

router.get('/upload', routeProtect, async (req, res) => {
    const { data } = req.token;
    const user = await User.find({ _id: new mongoose.Types.ObjectId(data) }, { username: 1, email: 1, storage: 1, maxstorage: 1, date_joined: 1 });
    res.render('upload', { data, user});
})


router.get('/storage', routeProtect, async (req, res) => {
    const { data } = req.token;
    const user = await User.find({ _id: new mongoose.Types.ObjectId(data) }, { username: 1, email: 1, storage: 1, maxstorage: 1, date_joined: 1 });
    res.render('storage', {
        data,
        user
    })
});


router.get('/folder/:id', routeProtect, async (req, res) => {
    const { data } = req.token;
    const foldername = req.params.id;
    const user = await User.find({ _id: new mongoose.Types.ObjectId(data) }, { username: 1, email: 1, storage: 1, maxstorage: 1, date_joined: 1 });
    try {
        const files = await File.find({ folder: foldername })
        res.render('folder', {
            files,
            data,
            user,
            foldername
        })
    } catch (error) {
        res.send(404);
    }
})


router.get('/file/:id', routeProtect, async (req, res) => {
    const fileId = req.params.id;
    const { data } = req.token;
    const user = await User.find({ _id: new mongoose.Types.ObjectId(data) }, { username: 1, email: 1, storage: 1, maxstorage: 1, date_joined: 1 });
    try {
        const files = await File.find({ _id: new mongoose.Types.ObjectId(fileId) })
        res.render('file', {
            files,
            data,
            user
        })
    } catch (error) {
        res.send(404);
    }
})

// Route for downloading files
router.get('/download/:folder/:filename', (req, res) => {

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filename = req.params.filename;
    const folder = req.params.folder;
    const filePath = path.join(__dirname, '..', `folders/${folder}`, filename); // Adjust the path to your files directory

    res.download(filePath, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(404).send('File not found');
        }
    });
});
 

// Authentication Routes
router.get('/login', (req, res) => {
    res.render('login', {data: ''})
})

router.get('/register', (req, res) => {
    res.render('register', {data: ''})
})

router.get('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/')
})

export default router;