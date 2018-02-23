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

const tribuneServices = {};
var tribuneLinks = [
    'pakistan',
    'business',
    'technology',
    'multimedia',
    'world',
    'opinion',
    'life-style',
    'sports',
    'magazine'
];

function saveNews(parsedResults, index) {
    if (index === parsedResults.length)
        return;
    else {
        setTimeout(function () {
            console.log(parsedResults[index].url);
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
                    console.log(parsedResults[index].url);
                    saveNews(parsedResults, index);
                }
            });
        }, 3500)
    }
}

function getTribuneNews() {
    return new Promise (function (resolve, reject) {
        var parsedResults = [];
        var completedResults = 0;
        var work = async.queue(function(link, finished) {
            setTimeout(function() {
                request('https://tribune.com.pk/' + link, function (error, response, html) {
                    completedResults++;
                    if (completedResults == tribuneLinks.length) {
                        console.log('Tribune URLs scrapped');
                        console.log(parsedResults.length);
                        saveNews(parsedResults, 0);
                    }
                    if (!error && response.statusCode == 200) {
                        var $ = cheerio.load(html);
                        $('.title').each(function(i, element) {
                            var a = $(this).prev();
                            var title = a.next().text();
                            var url = a.attr();
                            var today = common.newDate();
                            if (url != undefined) {
                                var metadata = {
                                    title: title,
                                    url: url.href,
                                    category: link,
                                    source: 'tribune',
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

        tribuneLinks.forEach(function(link) {
            work.push(link);
        });
    });
}

cron.schedule('0 */45 * * * *', function() {
    getTribuneNews();
});

module.exports = tribuneServices;