import express from 'express'
import xmlScrape from './lib/js/scraper.js'

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
