'use strict';

const router = require('express').Router(),
    common = require('../../lib/common'),
    dawnServices = require(common.commonRoute('business', 'dawn', 'dawn.js'));

router.route('/')
    .all(function(req, res, next) {
        next();
    })
    .get(function(req, res) {
        const process = dawnServices.getDawnNews();
        process.then(function(data) {
            common.commonResponse(res, 200, data);
        }, function (err) {
            common.commonResponse(res, 404, err);
        });
    });

module.exports = router;