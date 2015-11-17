'use strict'
window.jQuery = window.$ = require('jquery');
var _ = require('lodash');
var isMobile = require('./modules/utilities/isMobile.js')();

$(function(){
    var $window      = $(window),
        $body        = $('body,html');

    var $el = {
        headerCanvas : $('#canvas'),
        navBtn       : $('.menu-trigger'),
        navMenu      : $('.menu'),
        btnTop       : $('.js-pagetop')
    };

    if(isMobile) {
        $el.headerCanvas.hide();
    }

    if($window.width() < 768){
        $el.navMenu.hide();
        $el.navBtn.on('click', function(){
            $(this).toggleClass('active');
            $el.navMenu.fadeToggle().toggleClass('active');
        });
    }

    $('a').on({
        'mouseenter' : function() {
            $(this).stop().animate({'opacity': 0.7}, 300)
        },
        'mouseleave' : function() {
            $(this).stop().animate({'opacity': 1}, 300)
        }
    });

    $el.btnTop.on('click', function(){
        $body.animate({'scrollTop': 0}, 500);
        return false;
    })

});