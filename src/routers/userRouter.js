import express from "express";
import { protectorMiddleware, publicOnlyMiddleware, uploadFiles } from "../middlewares";
import { 
    getEdit,
    postEdit, 
    logout, 
    see, 
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
    .post(uploadFiles.single("avatar"), postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get(":id", see);


export default userRouter;