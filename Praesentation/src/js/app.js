var undef;
var $ = jQuery = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

require('browsernizr/test/history');
var Modernizr = require('browsernizr');

var Router = require('./router');

var VValueSlider = require('./views/valueslider');
var VPlot = require('./views/plot');

var VSlide = require('./views/slide');

var colorGulf = '#ed4f80';
var colorNorthSea = '#40a1dd';
var colorFlow = '#49e2a3';
var colorDiff = '#444444';
var colorGray = '#DDDDDD';
var colorYellow = '#f4c237';

module.exports = Backbone.View.extend({

	className: 'app',

	router: undef,

	resizeTimeout: undef,

	slidesTemplateList: [
		"modell",
		"fluss",
		"differenz"
	],
	vCrntSlide: undef,

	vT01slider: undef,
	vT02slider: undef,
	vS01slider: undef,
	vS02slider: undef,
	vKTslider: undef,
	vKSslider: undef,
	vAslider: undef,
	vBslider: undef,
	vCslider: undef,

	// constants
	T01: 1,
	T02: 1,
	S01: 1,
	S02: 1,

	kT: 1,
	kS: 1,
	a: 1,
	b: 1,
	c: 1,

	events: {
		'click a.route': 'linkClick'
	},

	initialize: function(options) {
		var self = this;

	},


	initRouter: function(){
		var self = this;

		// init the router and push states
	    self.router = new Router({
	    	app: self
	    });

	    // because of IE9 stupidity
	    if (!window.location.origin) {
			window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
		}

	    // start backbone history
	    Backbone.history.start({
	    	pushState: Modernizr.history,
	    	root: window.base.replace(window.location.origin, '')
	    });

	},


	showRoot: function(){
		var self = this;
		self.showSlide(self.slidesTemplateList[0]);
	},

	showSlide: function(template){
		var self = this;

		console.log("SHOW: "+template);

		if (self.vCrntSlide == undef){ // if there is no current slide, do inital app rendering
			self.render();
		}else{
			self.vCrntSlide.remove();
		}

		var slideNr = -1;
		for (var i = 0; i < self.slidesTemplateList.length; i++){
			if (template == self.slidesTemplateList[i]){
				slideNr = i;
				if (i > 0){
					self.$el.find('#navigation .go-back').show();
					self.$el.find('#navigation .go-back').attr('href', 'slide/'+self.slidesTemplateList[i-1]);
				}else{
					self.$el.find('#navigation .go-back').hide();
				}
				if (i < self.slidesTemplateList.length-1){
					self.$el.find('#navigation .go-forward').show();
					self.$el.find('#navigation .go-forward').attr('href', 'slide/'+self.slidesTemplateList[i+1]);
				}else{
					self.$el.find('#navigation .go-forward').hide();
				}
				break;
			}
		}

		var newVSlide = new VSlide({ "template": template });
		self.$el.find('#slides-container').append(newVSlide.render());


		if (slideNr >= 0){
			self.$el.find('#parameters .gulf').show();
			self.$el.find('#parameters .gulf').append(self.vT01slider.render().$el);
			self.$el.find('#parameters .gulf').append(self.vS01slider.render().$el);

			self.$el.find('#parameters .northsea').show();
			self.$el.find('#parameters .northsea').append(self.vT02slider.render().$el);
			self.$el.find('#parameters .northsea').append(self.vS02slider.render().$el);

			self.$el.find('#parameters .influence').show();
			self.$el.find('#parameters .influence').append(self.vKTslider.render().$el);
			self.$el.find('#parameters .influence').append(self.vKSslider.render().$el);

			self.vT01slider.setValue(self.T01);
			self.vS01slider.setValue(self.S01);
			self.vT02slider.setValue(self.T02);
			self.vS02slider.setValue(self.S02);
			self.vKTslider.setValue(self.kT);
			self.vKSslider.setValue(self.kS);
		}

		if (slideNr >= 1){
			self.$el.find('#parameters .flow').show();
			self.$el.find('#parameters .flow').append(self.vAslider.render().$el);
			self.$el.find('#parameters .flow').append(self.vBslider.render().$el);
			self.$el.find('#parameters .flow').append(self.vCslider.render().$el);

			self.vAslider.setValue(self.a);
			self.vBslider.setValue(self.b);
			self.vCslider.setValue(self.c);
		}

		if (template == 'ersterplot'){
			
		}

		self.vCrntSlide = newVSlide; // the new slide is now the current
		self.hideLoading();
	},

	initResize: function(){
		var self = this;

		$(window).resize(function(){
			clearTimeout(self.resizeTimeout);
			self.resizeTimeout = setTimeout(function(){
				self.resize();
				self.render(false);
			}, 1000);
		});
	},

	resize: function(){
		var self = this;

		var width = $(window).width();
		var height = $(window).height();
		
	},

	render: function(){
		var self = this;

		self.vT01slider = new VValueSlider({ title: 'T<sub>01</sub> : Temperatur', color: colorGulf });
		self.vS01slider = new VValueSlider({ title: 'S<sub>01</sub> : Salzgehalt', color: colorGulf });
		self.vT02slider = new VValueSlider({ title: 'T<sub>02</sub> : Temperatur', color: colorNorthSea });
		self.vS02slider = new VValueSlider({ title: 'S<sub>02</sub> : Salzgehalt', color: colorNorthSea });
		
		self.vKTslider = new VValueSlider({ title: 'k<sub>T</sub> : Temperatur' });
		self.vKSslider = new VValueSlider({ title: 'k<sub>S</sub> : Salzgehalt' });
		self.vAslider = new VValueSlider({ title: 'a : Proportionalitätskonstante', color: colorFlow });
		self.vBslider = new VValueSlider({ title: 'b : Temperatur-Dichte', color: colorFlow });
		self.vCslider = new VValueSlider({ title: 'c : Salzgehalt-Dichte', color: colorFlow });

		self.$el.html(templates['app']({ }));
	},


	linkClick: function(e){
		var self = this;

        var $a = $(e.currentTarget);

        if(e.preventDefault){
            e.preventDefault();
        }else{
            e.returnValue = false;
        }

        var url = $a.attr('href');	

        window.app.showLoading();
        window.app.router.navigate(url, true);
	},

	showLoading: function(){
		var self = this;
		$('#loading-overlay').stop().fadeIn(500);
	},

	hideLoading: function(){
		var self = this;
		$('#loading-overlay').stop().fadeOut(500);
	}

});