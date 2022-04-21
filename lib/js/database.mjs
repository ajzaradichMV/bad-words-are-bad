import mongoose from 'mongoose';
import xmlScrape from './scraper.js';
import postScrape from './html-scraper.js';
import Post from '../../models/page.js';

const url = 'https://support-sandbox.com/wp-sitemap-posts-post-1.xml';
//mongoose.connect('mongodb://127.0.0.1:27017/test_database', {useNewUrlParser: true});
mongoose.connect('mongodb://127.0.0.1:27017/my_database', {useNewUrlParser: true});

theData(url)

async function theData(sitemapUrl) {
    
    const allPostUrls = await xmlScrape(sitemapUrl);
    
    for (let x=0; x < allPostUrls.length; x++) {
        let filter = allPostUrls[x]
        let postData = await postScrape(allPostUrls[x]);
        // See if the post already exists in the database
        let result = await Post.find({ postUrl: filter})

        // If the result is an empty array, nothing was found so create the db entry
        if (result.length === 0) {
            Post.create({
                postId: 2,
                siteUrl: postData.siteUrl,
                postUrl: postData.postUrl,
                postTitle: postData.postTitle,
                postBody: postData.postBody,
                wordsFound: postData.wordsFound,
                lastRan: postData.lastRan
            }, (error, post) => {
                console.log(error,post);
            })
        } else {

            // Do some work if the result was found, we'll want to update the DB if it
            // was last ran 30 days ago.

            let lastRanDate = result[0].lastRan;
            let lastRanMonth = lastRanDate.getMonth() + 1;
            let lastRanYear = lastRanDate.getFullYear();

            let todayDate = new Date()
            let todayMonth = todayDate.getMonth() + 1;
            let todayYear = todayDate.getFullYear();

            if (lastRanMonth == todayMonth && lastRanYear == todayYear) {
                // do nothing
                console.log('i did nothing')
            } else {
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
                })
                console.log('i ran')
            }
        }

    }
}


/*testDbPull();
async function testDbPull() {
    let filter2 = 'test.com/post-slug'

    let result2 = await Post.find({ postUrl: filter2})
    console.log(result2)
    if (result2.length === 0) {
        console.log('didnt find')
    } else {
        console.log('found')
    }
}*/