const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

const router = express.Router();

// URIs
const SCRAPE_URL = "https://www.globenewswire.com/";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Models
const Article = require("../model/Article");

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

router.get("/api/article/scrape", (req, res) => {
    axios.get(SCRAPE_URL).then(response => {
        let $DOM = cheerio.load(response.data);

        // Get the data we want into an array.
        let articleArray = $DOM("h1[class^=post-title]").map(function(i, ele) {
            return {
                title: $DOM(ele).children("a").text(),
                url: SCRAPE_URL + $DOM(ele).children("a").attr("href"),
                summary: $DOM(ele).next("p").text()
            };
        }).get();

        res.json(articleArray);
    });
});

router.post("/api/article", (req, res) => {
    Article.create(req.body)
        .then(dbArticle => res.status(201).json(dbArticle._id))
        .catch(err => {
            console.log(err);
            res.status(500).end();
        });
});

module.exports = router;