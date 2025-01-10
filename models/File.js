import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Please provide a user ID'],
    },
    docName: {
        type: String,
        required: [true, 'Provide a document name'],
    },
    docSize: {
        type: Number,
        required: [true, 'Provide a document size'],
        min: [1, 'Document size must be greater than 0'],
    },
    docType: {
        type: String,
        required: [true, 'Provide a document type'],
    },
    date: {
        type: Date,
        required: [true, 'Provide a document date'],
    },
    doc: {
        type: String,
        required: [true, 'Provide a document'],
    },
    docPath: {
        type: String,
        required: [true, 'Provide a document path'],
    },
    folder: {
        type: String,
        required: [true, 'Provide a folder']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true });

// fileSchema.index({ userId: 1 }); // Optional index for optimization

const File = mongoose.model('File', fileSchema);

export default File;
