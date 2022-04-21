/**
 * Filename: html-scraper.js
 * 
 * Purpose: Pull all data from a post and return an object containing that data. 
 * 
 */

const htmlparser2 = require('htmlparser2');
const fetch = require('node-fetch');
const fs = require('fs');

const uhOhWords = fs.readFileSync('./resources/txt/badwords.txt', 'utf8');
const uhOhArray = uhOhWords.split(',');

const regex = /(\n|\r|\t|,|\s\s)/g;

module.exports = async function postScrape(url) {
    // Create our post data object
    var postData = {
        postId: 'empty',
        siteUrl: 'empty',
        postUrl: 'empty',
        postTitle: 'empty',
        postBody: 'empty',
        wordsFound: [],
        lastRan: 'empty'
    }
    
    // Initialize variables
    var allText = [];
    var postTitle = [];
    var badWordsFound = [];
    var titleFound = false;
    var bodyFound = true;
    var skip = false;

    // Create new parser
    var parserHTML = new htmlparser2.Parser(
        {
            onopentag(name, attributes) {
                if (name === 'title') {
                    titleFound = true;
                    skip = true;
                }
                if (name === 'body') {
                    bodyFound = true;
                }
                if (name === 'style' || name === 'script') {
                    skip = true;
                }
            },
            ontext(text) {
                if (bodyFound == true && skip == false) {
                    allText.push(text.toLowerCase());
                }
                if (titleFound === true) {
                    postTitle.push(text);
                }
            },
            onclosetag(tagname) { 
                if (tagname === 'title') {
                    titleFound = false;
                    skip = false;
                }
                if (tagname === 'body') {
                    bodyFound = false;
                }
                if (tagname === 'style' || tagname === 'script') {
                    skip = false;
                }
            }
        },
        { decodeEntities: true },
    )
    // Fetch the content of the URL.
    return await fetch(url)
    .then(data => data.text())
    .then((text) => {
        // Parse the fetched data from the post URL.
        parserHTML.write(text);
        parserHTML.end();

        // Create a new URL object
        tempUrl = new URL(url)

        // Start populating our postData object with actual information from the parsed page.
        postData.siteUrl = tempUrl.hostname
        postData.postTitle = postTitle.join();
        postData.postTitle = postData.postTitle.replace(regex, '');
        postData.postUrl = url;
        postData.postBody = allText.join();
        postData.postBody = postData.postBody.replace(regex, '');
        postData.lastRan = new Date();

        // Loop through our "bad words" and add every word we find into the bad word array.
        for (x=0; x < uhOhArray.length; x++) {
            if (postData.postBody.indexOf(uhOhArray[x]) != -1) {
                badWordsFound.push(uhOhArray[x]);
            }
        }
        postData.wordsFound = badWordsFound;

        // Reset our variables
        allText = [];
        postTitle = [];
        badWordsFound = [];

        // Return the final postData object.
        return postData;
    });
}

