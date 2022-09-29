import User from "../models/User";
import fetch from "node-fetch";
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
    const pageTitle = "Login"
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).render("login", {pageTitle, errorMessage: "User not exists",});
    }
    console.log(user.password);
    console.log(password);
    const pass = await bcrypt.compare(password, user.password);
    console.log(pass);
    if (!pass) {
        return res.status(400).render("login", {pageTitle, errorMessage: "Wrong password",});
    } 
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}


export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GITHUB_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
  };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    console.log(finalUrl);
    return res.redirect(finalUrl);
};


export const finishGithubLogin = async (req,res) => {
    
    // GitHub에서 URL 쿼레에 보내온 코드와 client_id, client_secret을 파라미터에 담아 엑세스토큰 요청을 위한 URL을 POST 
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GITHUB_CLIENT,
        client_secret: process.env.GITHUB_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json"
            },
        })).json();
    
    // json 형식으로 받은 데이터에 access_token 키가 없으면 로그인 페이지로 리디렉트
    if (!("access_token" in tokenRequest)) {
        return res.redirect("/login");
    };

    // 엑세스 토큰과 깃헙 API URL 변수 설정
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";

    // access_token을 헤더에 담아 유저 정보를 받아 json 형식으로 파싱
    // {"login":"moondive-cinema", "id":123456, ....} 
    const userData = await (
        await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })
    ).json();
    console.log(userData);

    // access_token을 헤더에 담아 이메일 데이터를 받아 json 형식으로 파싱
    // [{"email":"abc@gmail.com","primary":true,"verified":true,"visibility":"private"}, {..},..]
    const emailData = await (
        await fetch(`${apiUrl}/user/emails`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })
    ).json();

    // email 오브젝트 중 primary 키와 verified 키가 true인 이메일오브젝트 필터링, 없으면 로그인으로 리디렉트
    const emailObj = emailData.find(
        (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
        return res.redirect("/login");
    }

    // 깃헙에서 확인된 이메일 주소로 유저 DB를 필터링하여 있으면 로그인시키고 없으면 깃허브 데이터로 유저 모델 생성하고 로그인시킴
    const existingUser = await User.findOne({ email: emailObj.email });
    if (existingUser) {
        req.session.loggedIn = true;
        req.session.user = existingUser;
        return res.redirect("/");
    } else {
        const user = await User.create(
            {
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialLogin: true,
                location: userData.location,
            }
        );
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    }
};


export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};


export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
}


export const postEdit = async (req, res) => {
    const {
        session: {
            user: { _id, avatarUrl },
          },
          body: { name, email, username, location },
          file,
    } = req;
    
    // Form에 입력된 email과 username이 User 모델에 이미 존재하는 경우 이슈가 있는 필드를 에러메시지와 함께 렌더링함
    let existingEmail = false;
    let existingUsername = false;
    if ( req.session.user.email !== email && User.exists({email: email}) ) {
     existingEmail = true;
    }
    if ( req.session.user.username !== username && User.exists({username: username}) ) {
        existingUsername = true;
    }
    if ( existingEmail  &&  existingUsername ) {
        return res.render("edit-profile", 
            { 
                pageTitle: "Edit Profile", 
                errorMessage: `Both email(${email}) and username(${username}) are already taken.`,
            });
        } else if  ( existingEmail ) {
            return res.render("edit-profile", 
            { 
                pageTitle: "Edit Profile", 
                errorMessage: `email(${email}) already taken.`,
            });
        } else if ( existingUsername ) {
            return res.render("edit-profile", 
            { 
                pageTitle: "Edit Profile", 
                errorMessage: `username(${username}) already taken.`,
            });
        }
    
    // 
    const updatedUser = await User.findByIdAndUpdate(
        _id, 
        {
            avatarUrl: file ? file.path : avatarUrl, 
            name, 
            email, 
            username, 
            location
        }, 
        {new: true}
    );
    req.session.user = updatedUser;
    return res.redirect("edit");
}


export const getChangePassword = (req, res) => {
    if (req.session.user.socialLogin === true) {
      return res.redirect("/");
    }
    return res.render("change-password", { pageTitle: "Change Password" });
  };


  export const postChangePassword = async (req, res) => {
    const {
        session: {user: {_id},},
        body: {oldPassword, newPassword, newPasswordConfirmation},
    } = req;
    const user = await User.findById(_id);
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
        return res.status(400).render("change-password", {
            pageTitle: "Change Password", 
            errorMessage: "The current password is incorrect",
        });
    }
    if (newPassword !== newPasswordConfirmation) {
        return res.status(400).render("change-password", {
            pageTitle: "Change Password", 
            errorMessage: "The password does not match the confirmation",
        });
    }
    user.password = newPassword;
    user.save();
    return res.redirect("/users/logout");
  };


export const seeProfile = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
          path: "owner",
          model: "User",
        },
    });
    if (!user) {
        return res.status(404).render("404", {pageTitle: "User not found."})
    }
    return res.render("profile", {pageTitle: user.name, user});
};