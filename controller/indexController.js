const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const SCRAPE_URL = "https://www.globenewswire.com/"

router.get("/api/scrape", (req, res) => {
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

module.exports = router;