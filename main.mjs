import express from 'express'
import xmlScrape from './lib/js/scraper.js'
import {databaseRun} from './lib/js/database.mjs'

const app = new express()


// const port = process.env.PORT // Remove comments when porting over to heroku

app.listen(4000, ()=> {
    console.log('App listening on port 4000') // Replace port number with port constant when porting over to heroku
})

app.get('/', (req, res) => {

    xmlScrape('https://support-sandbox.com/wp-sitemap-posts-post-1.xml').then( (ret)=> {
        res.json(ret)
    })
})

/**
 * Endpoint: /api/v1
 * 
 * Query params: 
 * 
 * site - Takes an URL location as a parameter and passes it to the API. Requires a sitemap.xml file.
 * force - Accepts either "true" or "false" and if set to "true" will force the record to be updated even if less than 30 days. Defaults to false.
 * 
 */
app.get('/api/v1', (req, res) => {
    let siteXML = '';
    let force = 'false';

    if (req.query.site == undefined) {
        res.json ('Requires site xml. Use query param: ?site=<link here>');
    } else {
        siteXML = req.query.site;
    }

    if (req.query.force == undefined) {
        req.query.force = 'false';
    } else {
        if ( !(req.query.force == 'false' || req.query.force == 'true') ) {
            res.json('Force must be true or false. Default: false');
        }
    }
    force = req.query.force;

    databaseRun(siteXML, force)
    res.json(siteXML)
})