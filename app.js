require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const db = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- View engine (EJS) ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------- Static files: CSS, JS, images, uploaded photos ----------
app.use(express.static(path.join(__dirname, "public")));

// ---------- Form & JSON data ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---------- Sessions (login state) ----------
app.use(session({
    secret: process.env.SESSION_SECRET || "alumni-lab7-change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 } // 1 hour
}));

// ---------- Values available in every EJS view ----------
app.use((req, res, next) => {
    // flash message: set it before a redirect, shown once on the next page
    req.flash = (type, text) => { req.session.flash = { type, text }; };

    res.locals.flash = req.session.flash || null;
    delete req.session.flash;

    res.locals.currentUser = req.session.user || null;
    res.locals.user = req.session.user || null;
    res.locals.currentPath = req.path;
    res.locals.title = "Alumni Management System";
    res.locals.photoUrl = (file) => (file ? "/uploads/" + file : "/img/default-avatar.svg");
    next();
});

// ---------- Routes ----------
app.use("/", require("./routes/index"));
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/dashboard"));
app.use("/", require("./routes/alumni"));

// ---------- 404 ----------
app.use((req, res) => {
    res.status(404).render("error", {
        title: "Page Not Found",
        status: 404,
        message: "The page you are looking for does not exist."
    });
});

// ---------- Error handler (Express 5 forwards async errors here automatically) ----------
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render("error", {
        title: "Server Error",
        status: 500,
        message: "Something went wrong. Please try again."
    });
});

// ---------- Export for Vercel ----------
module.exports = app;

// ---------- Start (Local development only) ----------
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, async () => {
        console.log(`Server running at http://localhost:${PORT}`);
        try {
            await db.query("SELECT 1");
            console.log("MySQL Connected Successfully");
        } catch (err) {
            console.log("Database connection FAILED: " + err.message);
            console.log("Did you run database/schema.sql ? Check the credentials in database/db.js");
        }
    });
}