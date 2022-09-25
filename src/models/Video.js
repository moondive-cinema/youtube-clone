import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxLength: 80},
    description: { type: String, required: true, trim: true, maxLength: 200 },
    fileUrl: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    hashtags: [{type: String, trim: true}],
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    meta: {
        views: { type: Number, default: 0, required: true },
        rating:{ type: Number, default: 0, required: true },
    },
});

videoSchema.static("formatHashtags", function(hashtags) {
    return hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));
  });

const Video = mongoose.model("Video", videoSchema);

export default Video;