'use strict';

const common = require('../../lib/common.js'),
    tribuneRoute = require(common.commonRoute('route', 'tribune', 'tribune.js')),
    dawnRoute = require(common.commonRoute('route', 'dawn', 'dawn.js'));

module.exports = function (app) {
    app.use('/api/tribune', tribuneRoute);
    app.use('/api/dawn', dawnRoute);
};


