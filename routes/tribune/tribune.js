'use strict';

const router = require('express').Router(),
    common = require('../../lib/common'),
    tribuneServices = require(common.commonRoute('business', 'tribune', 'tribune.js'));

router.route('/')
    .all(function(req, res, next) {
        next();
    })
    .get(function(req, res) {
        const process = tribuneServices.getTribuneNews();
        process.then(function(data) {
            common.commonResponse(res, 200, data);
        }, function (err) {
            common.commonResponse(res, 404, err);
        });
    });

module.exports = router;