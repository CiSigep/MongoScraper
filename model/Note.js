const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
    body: String
});

module.exports = mongoose.model("Note", NoteSchema);