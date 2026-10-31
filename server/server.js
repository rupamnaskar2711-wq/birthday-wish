const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

// Homepage
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/index.html")
    );
});

// Server status
app.get("/api/status", (req, res) => {
    res.json({
        project: "BirthdayVerse",
        status: "Online",
        message: "Welcome to BirthdayVerse!"
    });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `BirthdayVerse running at http://localhost:${PORT}`
    );
});