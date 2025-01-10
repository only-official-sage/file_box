import mongoose from "mongoose";

const folderSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: [true, 'Please provide a user id']
    },
    foldername: { 
        type: String,
        requiree: [true, 'please Provide a folder name']
    },
    datecreated: {
        type: String,

    } 
})

const Folder = mongoose.model('folder', folderSchema);

export default Folder;