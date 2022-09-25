import express from "express";
import { protectorMiddleware, publicOnlyMiddleware, avatarUploads } from "../middlewares";
import { 
    getEdit,
    postEdit, 
    logout, 
    seeProfile, 
    startGithubLogin, 
    finishGithubLogin,
    getChangePassword,
    postChangePassword,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/logout", protectorMiddleware, logout);
userRouter
    .route("/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    .post(avatarUploads.single("avatar"), postEdit);
userRouter
    .route("/change-password")
    .all(protectorMiddleware)
    .get(getChangePassword)
    .post(postChangePassword);
userRouter.get("/:id", seeProfile);


export default userRouter;