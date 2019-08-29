const express = require("express");

const app = express();

const PORT = process.env.PORT || 7001;

// JSON parse
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use(require("./controller/indexController"));

app.listen(PORT,  () => {
    console.log("App listening on port: " + PORT);
})