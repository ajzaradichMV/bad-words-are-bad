import mongoose from 'mongoose';
import xmlScrape from './scraper.js';
import postScrape from './html-scraper.js';
import Post from '../../models/page.js';

// Can uncomment below for testing this file directly.

//const url = 'https://support-sandbox.com/wp-sitemap-posts-post-1.xml';
//databaseRun(url)
//mongoose.connect('mongodb://127.0.0.1:27017/test_database', {useNewUrlParser: true});

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/my_database', {useNewUrlParser: true});

// Main database functionality

export async function databaseRun(sitemapUrl, forced) {
    
    var allPostUrls = await xmlScrape(sitemapUrl);
    var postCount = allPostUrls.length;
    var skipped = 0;
    var updated = 0;
    let postData = [];
    
    for (let x=0; x < allPostUrls.length; x++) {
        let filter = allPostUrls[x];
        // See if the post already exists in the database
        let result = await Post.find({ postUrl: filter});

        // If the result is an empty array, nothing was found so create the db entry
        if (result.length === 0) {
            postData = await postScrape(allPostUrls[x]); // Pull data for post.
            console.log(postData)
            // Create DB Entry
            Post.create({
                postId: 2,
                siteUrl: postData.siteUrl,
                postUrl: postData.postUrl,
                postTitle: postData.postTitle,
                postBody: postData.postBody,
                wordsFound: postData.wordsFound,
                lastRan: postData.lastRan
            }, (error, post) => {
                console.log(error, post);
            })
        } else {

            // Do some work if the result was found, we'll want to update the DB if it
            // was last ran 30 days ago. If forced is set to True then the pull happens
            // regardless.

            let lastRanDate = result[0].lastRan;
            let lastRanMonth = lastRanDate.getMonth() + 1;
            let lastRanYear = lastRanDate.getFullYear();

            let todayDate = new Date();
            let todayMonth = todayDate.getMonth() + 1;
            let todayYear = todayDate.getFullYear();
            if (! (lastRanMonth == todayMonth && lastRanYear == todayYear) || forced == 'true') {
                postData = await postScrape(allPostUrls[x]); // Post data is old, pull a new version
                await Post.findOneAndUpdate({
                    _id: result[0]._id
                },
                {
                    postId: 3,
                    siteUrl: postData.siteUrl,
                    postUrl: postData.postUrl,
                    postTitle: postData.postTitle,
                    postBody: postData.postBody,
                    wordsFound: postData.wordsFound,
                    lastRan: postData.lastRan
                });
                
                updated += 1;
            } else {
                skipped += 1;
            }
        }

    }
    postData = [];
    return 'Posts added: ' + (postCount - updated - skipped) + ' Posts updated: ' + updated + ' Posts skipped: ' + skipped + ' Total Posts: ' + postCount
}

/*testDbPull();
async function testDbPull() {
    let result2 = await Post.find({ postUrl: 'https://support-sandbox.com/funny-valentines-day-gifts-for-married-couples-keeping-it-real-no-touchy/' })
    console.log(result2)
    if (result2.length === 0) {
        console.log('didnt find')
    } else {
        console.log('found')
    }
}*/