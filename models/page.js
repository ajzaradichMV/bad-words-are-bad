const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    postId: Number,
    siteUrl: String,
    postUrl: String,
    postTitle: String,
    postBody: String,
    wordsFound: Array,
    lastRan: Date
});

const Post = mongoose.model('post', PostSchema);
module.exports = Post;
