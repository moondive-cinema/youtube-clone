import multer from "multer";

export const localMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Nutube";
    res.locals.loggedInUser = req.session.user || {};
    next();
};


export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        return next();
    } else {
        return res.redirect("/login");
    }
};


export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        return next();
    } else {
        return res.redirect("/");
    }
};


export const avatarUploads = multer({
    dest: "uploads/avatars", 
    limits: {
        fileSize: 2000000
    }, 
});


export const videoUploads = multer({
    dest: "uploads/videos", 
    limits: {
        fileSize: 10000000
    }, 
});