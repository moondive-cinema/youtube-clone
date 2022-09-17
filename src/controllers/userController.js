import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
    return res.render("Join", {pageTitle: "Join"});
};

export const postJoin = async (req, res) => {
    const {name, email, username, password, password2, location} = req.body;
    const pageTitle = "Join";
    const exists = await User.exists({ $or: [{ username }, { email }]});
    if (exists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This username or email has already taken."
        })
    } 
    if (password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password confirmation not matching."
        });
    }
    try {
        await User.create({
            name, 
            email, 
            username,
            password,
            location,
        });
        return res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle: "Join",
            errorMessage: error._message,
        });
    }
    
}

export const getLogin = (req, res) => {
    return res.render("login", {pageTitle: "Login"});
}

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    console.log("username: ", username, " & pw: ", password);
    const pageTitle = "Login"
    // User model에서 일치하는 유저네임을 찾는다
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).render("login", {pageTitle, errorMessage: "User not exists",});
    }
    const pass = await bcrypt.compare(password, user.password);
    if (!pass) {
        return res.status(400).render("login", {pageTitle, errorMessage: "Wrong password",});
    } 
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");

export const logout = (req, res) => res.send("Log out");
export const see = (req, res) => res.send("See User");