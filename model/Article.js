const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    notes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note"
    }]
});

module.exports =  ArticleSchema;