const fakeUser = {
  username: "Nicolas",
  loggedIn: false,
}

let videos = [
  {
    title: "Hello",
    rating: 4.1,
    createdAt: "2 hours ago",
    views: 59,
    id: 1,
  },
  {
    title: "Second Video",
    rating: 3.5,
    createdAt: "1 hours ago",
    views: 19,
    id: 2,
  },
  {
    title: "What's up",
    rating: 4.9,
    createdAt: "45 minutes ago",
    views: 119,
    id: 3,
  },
  {
    title: "OMG",
    rating: 3.0,
    createdAt: "5 minutes ago",
    views: 1,
    id: 4,
  },
];


export const trending = (req, res) => res.render("home", {pageTitle: "Home", fakeUser, videos});

export const watch = (req, res) => {
  const {id} = req.params;
  const video = videos[id-1];
  return res.render("watch", {pageTitle: `Watching ${video.title}`, fakeUser, video});
};

export const getEdit = (req, res) => {
  const {id} = req.params;
  const video = videos[id-1];
  return res.render("edit", {pageTitle: `Editing ${video.title}`, fakeUser, video});
};
export const postEdit = (req, res) => {
  const {id} = req.params;
  const {title} = req.body;
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", {pageTitle: "Upload Video", fakeUser});
};
export const postUpload = (req, res) => {
  const { title } = req.body;
  const newVideo = {
    title,
    rating: 0,
    comments: 0,
    createdAt: "just now",
    views: 0,
    id: videos.length + 1,
  };
  videos.push(newVideo);
  return res.redirect("/");
} 