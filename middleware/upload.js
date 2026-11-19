// Multer: profile photo upload (images only, max 2 MB) - Vercel Serverless Compatible
const multer = require("multer");

const EXT_BY_TYPE = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (EXT_BY_TYPE[file.mimetype]) return cb(null, true);
        cb(new Error("Profile photo must be a JPG, PNG, WEBP or GIF image."));
    }
});

// Wrapper: store buffer as Base64 Data URL on req.file.filename so existing routes work unchanged
function uploadPhoto(req, res, next) {
    upload.single("profile_photo")(req, res, (err) => {
        if (err) {
            req.uploadError = err.code === "LIMIT_FILE_SIZE"
                ? "Profile photo must be smaller than 2 MB."
                : err.message;
        } else if (req.file && req.file.buffer) {
            req.file.filename = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }
        next();
    });
}

// No local files to delete when stored in memory/DB
function removeUpload(filename) {
    // No-op in serverless mode
}

module.exports = { uploadPhoto, removeUpload };