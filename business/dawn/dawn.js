'use strict';

const Mongoose = require('mongoose'),
    common = require('../../lib/common.js'),
    newsModel = require(common.commonRoute('model', 'news', 'news.js')),
    Promise = require('promise'),
    async = require('async'),
    cheerio = require('cheerio'),
    cron = require('node-cron'),
    request = require('request'),
    ogs = require('open-graph-scraper');

const dawnServices = {};
var dawnLinks = [
    'pakistan',
    'world',
    'sport',
    'business',
    'opinion',
    'magazines',
    'tech',
    'multimedia'
];

function saveNews(parsedResults, index) {
    if (index === parsedResults.length)
        return;
    else {
        setTimeout(function () {
            var options = {'url': parsedResults[index].url, 'timeout': 2000};
            ogs(options, function (err, results) {
                if (results && results.data) {
                    if (results.data.ogDescription)
                        parsedResults[index].description = results.data.ogDescription;
                    else {
                        console.log('\n \n \n');
                        console.log('description not found');
                        console.log(results.data);
                    }
                    if (results.data.ogImage.url)
                        parsedResults[index].image = results.data.ogImage.url;
                    else {
                        console.log('\n \n \n');
                        console.log('images not found');
                        console.log(results.data);
                    }
                    newsModel.findOneAndUpdate({url: parsedResults[index].url}, parsedResults[index], {upsert: true, returnNewDocument: true}).exec(function (err, savedNews) {
                        if (err) {
                            console.log('\n \n \n');
                            console.log('saving erorr');
                            console.log(err);
                        } else {
                            saveNews(parsedResults, ++index);
                        }
                    });
                } else {
                    console.log('\n \n \n');
                    if (results)
                        console.log(results);
                    console.log('results.data not found');
                    console.log(err);
                    saveNews(parsedResults, ++index);
                }
            });
        }, 3000)
    }
}

function getDawnNews() {
    return new Promise (function (resolve, reject) {
        var parsedResults = [];
        var completedResults = 0;
        var work = async.queue(function(link, finished) {
            setTimeout(function() {
                request('https://dawn.com/' + link, function (error, response, html) {
                    completedResults++;
                    if (completedResults == dawnLinks.length) {
                        console.log('Dawn URLs scrapped');
                        saveNews(parsedResults, 0);
                    }
                    if (!error && response.statusCode == 200) {
                        var $ = cheerio.load(html, {normalizeWhitespace: true});
                        $('.story__link').each(function(i, element) {
                            var a = $(this);
                            var title = a.text();
                            var url = a.attr();
                            var today = common.newDate();
                            if (url != undefined) {
                                var metadata = {
                                    title: title,
                                    url: url.href,
                                    category: link,
                                    source: 'dawn',
                                    date: today.date,
                                    hour: today.hour
                                };
                                parsedResults.push(metadata);
                            }
                        });
                    }
                });
                finished(link);
            }, Math.floor((Math.random() * 2000) + 1000))
        }, 5);

        dawnLinks.forEach(function(link) {
            work.push(link);
        });
    });
};

cron.schedule('0 */45 * * * *', function() {
    getDawnNews();
});

module.exports = dawnServices;