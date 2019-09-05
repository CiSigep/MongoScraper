const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

const router = express.Router();

// URIs
const SCRAPE_URL = "https://www.globenewswire.com/";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Models
const db = require("../model");

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false });

// Routes

// Get all scraped articles, then render the page to the user
router.get("/", (req, res) => {
    
    db.Article.find({})
        .then((articles) => {
            res.render("index", {
                articles: articles,
                available: articles.length > 0
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).end();
        });
});

// Get all saved articles, then render the saved page to the user
router.get("/saved", (req, res) => {
    db.SavedArticle.find({}).then((articles) => {
        res.render("saved", {
            articles: articles,
            available: articles.length > 0
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).end();
    });
})

// Scrape the news site for articles
router.get("/api/article/scrape", (req, res) => {
    db.Article.deleteMany({})
        .then(() => {
            axios.get(SCRAPE_URL).then(response => {
                let $DOM = cheerio.load(response.data);
        
                // Get the data we want into an array.
                let articleArray = $DOM("h1[class^=post-title]").map(function (i, ele) {
                    return {
                        title: $DOM(ele).children("a").text(),
                        url: SCRAPE_URL + $DOM(ele).children("a").attr("href"),
                        summary: $DOM(ele).next("p").text()
                    };
                }).get();
        
                db.Article.insertMany(articleArray)
                    .then((dbArticles) => res.json(dbArticles))
                    .catch(err => {
                        console.log(err);
                        res.status(500).end();
                    });
        
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});

// Clear out the scraped articles
router.delete("/api/article/scrape", (req, res) => {
    db.Article.deleteMany({})
        .then(() => res.json(true))
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});

// Save an article from scraped to saved
router.post("/api/article", (req, res) => {
    // Remove article from scraped
    db.Article.findByIdAndDelete(req.body.scrapeId)
        .then(() => {
            // Add article to saved
            db.SavedArticle.create(req.body)
            .then(dbArticle => res.status(201).json(dbArticle._id))
            .catch(err => {
                console.log(err);
                res.status(500).end();
        });
    }).catch(err => {
        console.log(err);
        res.status(500).end();
    });
    
});

// Delete all saved articles
router.delete("/api/article/saved", (req, res) => {
    db.SavedArticle.deleteMany({})
        .then(data => {
            // Delete the articles notes as well
            db.Note.deleteMany({})
            .then(data => res.json(true))
            .catch(err => {
                console.log(err);
                res.status(500).end();
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});

// Delete a single saved article
router.delete("/api/article/saved/:id", (req, res) => {
    db.SavedArticle.findByIdAndRemove(req.params.id).lean().then(article => {
        db.Note.deleteMany({ _id: {$in: article.notes}})
            .then(data => res.json(true))
            .catch(err => {
                console.log(err);
                res.status(500).end();
        });
    }).catch(err => {
        console.log(err);
        res.status(500).end();
    });
});

// Delete a note
router.delete("/api/note/:id", (req, res) => {
    let idObject = new mongoose.Types.ObjectId(req.params.id);
    db.Note.findByIdAndRemove(req.params.id)
        .then(note => {
            db.SavedArticle.findOneAndUpdate({notes: idObject}, { $pull: { notes: idObject }})
            .then(data => res.json(true)).catch(err => {
                console.log(err);
                res.status(500).end();
        });
        }).catch(err => {
            console.log(err);
            res.status(500).end();
    });
});

// Add a note to an article
router.post("/api/article/:id", (req, res) => {
    let note;
    db.Note.create(req.body)
        .then(dbNote => {
            note = dbNote;
            return db.SavedArticle.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
        })
        .then(data => res.status(201).json(note))
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});

// Get the notes for an article
router.get("/api/article/:id", (req, res) => {
    db.SavedArticle.findOne({ _id: req.params.id })
        .populate("notes")
        .then(dbArticle => res.json(dbArticle))
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});

module.exports = router;