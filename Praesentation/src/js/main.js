var undef;
var $ = jQuery = require('jquery');

// gloabl vars
window.isMobile = false;
window.isTouch = 'ontouchstart' in document.documentElement; // TODO: use modernizer for that

$.ajaxPrefilter( function(options, originalOptions, jqXHR){
    if (options.url.indexOf('http://') < 0 && !options.loadFromAppHost){
        options.url = window.dbinterface + options.url;
    }
});

window.numberWithCommas = function(x) {
   if (x.toString().length > 4){
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }else{
      return x;
    }
}

window.atan2 = function(x,y) {

    var angle = Math.atan(y/x);

    if (y >= 0 && x < 0){ // top left
        angle = Math.PI + angle;
    }
    if (y < 0 && x <= 0){ // bottom left
        angle = Math.PI + angle;
    }
    if (y <= 0 && x > 0){ // bottom right
        angle = 2*Math.PI + angle;
    }

    return angle;
}

// app
var App = require('./app');

// dom ready
$(document).ready(function(){

    var resize = function(){
        window.isMobile = false;
        window.isMedium = false;
        window.isPortrait = false;
        $('body').removeClass('mobile');
        $('body').removeClass('medium');
        $('body').removeClass('portrait');

        if ($(window).width() < 1100){
            window.isMedium = true;
            $('body').addClass('medium');
        }
        if ($(window).width() < 600){
            window.isMobile = true;
            $('body').addClass('mobile');
        }
        if ($(window).height() > $(window).width()){
            window.isPortrait = true;
            $('body').addClass('portrait');
        }
    };
    $(window).resize(resize);
    resize();
    

    // init app
    window.app = new App({
        el: $('#wrapper')
    });

    window.app.initRouter();
});
