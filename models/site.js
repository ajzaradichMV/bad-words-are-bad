const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const siteSchema = new Schema({
    siteId: Number,
    siteDomain: String,
    siteMapUrl: String
});

const Site = mongoose.model('site', siteSchema);
module.exports = Site;
