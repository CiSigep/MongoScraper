const Article = require("./Article");
const mongoose = require("mongoose");

module.exports = {
    Note: require("./Note"),
    Article: mongoose.model("Article", Article),
    SavedArticle: mongoose.model("SavedArticle", Article)
};