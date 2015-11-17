'use strict';
var _ = require('lodash');
var whichMobile = require('./whichMobile.js');


/**
 * クライアントがモバイルデバイスかどうか調べて結果を返す。
 * @return {boolean} クライアントがモバイルデバイスならtrue、さもなければfalse
 * @exports utility/isMobileDevice
 */
module.exports = function() {
    return _.some(_.toArray(whichMobile()), function(v) {return v;});
};
