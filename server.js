const express = require("express");
const exphbs = require("express-handlebars");

const app = express();

const PORT = process.env.PORT || 7001;

// Public files
app.use("/static", express.static("public"));

// JSON parse
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
app.use(require("./controller/indexController"));

app.listen(PORT,  () => {
    console.log("App listening on port: " + PORT);
})