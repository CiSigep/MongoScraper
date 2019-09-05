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

router.delete("/api/article/scrape", (req, res) => {
    db.Article.deleteMany({})
        .then(() => res.json(true))
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});

router.post("/api/article", (req, res) => {
    db.Article.findByIdAndDelete(req.body.scrapeId)
        .then(() => {
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

router.delete("/api/article/saved", (req, res) => {
    db.SavedArticle.deleteMany({})
        .then(data => {
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

router.post("/api/article/:id", (req, res) => {
    db.Note.create(req.body)
        .then(dbNote => {
            return db.SavedArticle.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
        })
        .then(dbArticle => res.json(dbArticle))
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});

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