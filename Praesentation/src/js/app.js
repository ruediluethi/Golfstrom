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

var MSimulation = require('./models/simulation');

var colorGulf = '#ed4f80';
var colorNorthSea = '#40a1dd';
var colorFlow = '#49e2a3';
var colorDiff = '#444444';
var colorGray = '#DDDDDD';
var colorYellow = '#f4c237';
var colorOrange = '#d87600';
var colorPurple = '#6c1eaf';

module.exports = Backbone.View.extend({

	className: 'app',

	router: undef,

	resizeTimeout: undef,

	slidesTemplateList: [
		'titel',
		'inhalt',
		'modell',
		'fluss',
		'differenz',
		'ersterplot',
		'dimensionslos',
		'gleichgewicht',
		'stabil',
		'stabilplot'
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

	mSimulation: undef,

	tempSaltParamsShown: false,
	flowParamsShown: false,
	noDimParamsShown: false,

	events: {
		'click .param-selection .selection': 'selectParams',
		'click a.route': 'linkClick'
	},

	initialize: function(options) {
		var self = this;

		self.mSimulation = new MSimulation();

		document.onkeydown = function(evt) {
		    evt = evt || window.event;
		    switch (evt.keyCode) {
		        case 37:
		            self.goBack();
		            break;
		        case 39:
		            self.goForward();
		            break;
		    }
		};
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

		console.log('('+slideNr+'/'+self.slidesTemplateList.length+') '+template);

		var newVSlide = new VSlide({ "template": template, "colors": {
			gulf: colorGulf,
			northsea: colorNorthSea
		} });
		self.$el.find('#slides-container').append(newVSlide.render());

		if (template == 'titel' || template == 'inhalt'){
			self.$el.addClass('full-screen');
		}else{
			self.$el.removeClass('full-screen');
		}


		if (slideNr >= 2 && !self.tempSaltParamsShown){
			self.$el.find('#parameters .gulf').show();
			self.$el.find('#parameters .northsea').show();
			self.$el.find('#parameters .influence').show();

			self.vT01slider.setValue(self.mSimulation.get('T01'));
			self.vS01slider.setValue(self.mSimulation.get('S01'));
			self.vT02slider.setValue(self.mSimulation.get('T02'));
			self.vS02slider.setValue(self.mSimulation.get('S02'));
			self.vKTslider.setValue(self.mSimulation.get('kT'));
			self.vKSslider.setValue(self.mSimulation.get('kS'));

			self.vT01slider.bind('valueHasChanged', function(){
				self.mSimulation.setAndSimulate('T01', self.vT01slider.value);
			});
			self.vT02slider.bind('valueHasChanged', function(){
				self.mSimulation.setAndSimulate('T02', self.vT02slider.value);
			});
			self.vS01slider.bind('valueHasChanged', function(){
				self.mSimulation.setAndSimulate('S01', self.vS01slider.value);
			});
			self.vS02slider.bind('valueHasChanged', function(){
				self.mSimulation.setAndSimulate('S02', self.vS02slider.value);
			});
			self.vKTslider.bind('valueHasChanged', function(){
				self.mSimulation.setAndSimulate('kT', self.vKTslider.value);
			});
			self.vKSslider.bind('valueHasChanged', function(){
				self.mSimulation.setAndSimulate('kS', self.vKSslider.value);
			});

			self.tempSaltParamsShown = true;
		}

		if (slideNr >= 3 && !self.flowParamsShown){
			self.$el.find('#parameters .flow').show();

			self.vAslider.setValue(self.mSimulation.get('a'));
			self.vBslider.setValue(self.mSimulation.get('b'));
			self.vCslider.setValue(self.mSimulation.get('c'));

			self.vAslider.bind('valueHasChanged', function(){
				self.mSimulation.setAndSimulate('a', self.vAslider.value);
			});
			self.vBslider.bind('valueHasChanged', function(){
				self.mSimulation.setAndSimulate('b', self.vBslider.value);
			});
			self.vCslider.bind('valueHasChanged', function(){
				self.mSimulation.setAndSimulate('c', self.vCslider.value);
			});

			self.flowParamsShown = true;
		}

		if (template == 'ersterplot'){

			// Temperatur
			var vTemperature = new VPlot({ title: 'Temperatur', colors: [colorGulf,colorNorthSea,colorDiff], minValue: 0, maxValue: 1.5 , helpLinesCount: 4});
			vTemperature.listenTo(self.mSimulation, 'simulationend', function(){
				vTemperature.update([self.mSimulation.get('T1'), self.mSimulation.get('T2'), self.mSimulation.get('T')], self.mSimulation.get('time'));
			});
			newVSlide.$el.find('.temp').append(vTemperature.$el);
			vTemperature.render();
			vTemperature.addLegend(0,'T<sub>1</sub>: Golf von Mexiko');
			vTemperature.addLegend(1,'T<sub>2</sub>: Nordsee');
			vTemperature.addLegend(2,'T = |T<sub>1</sub> &minus; T<sub>2</sub>|: Differenz');

			// Salzgehalt
			var vSalt = new VPlot({ title: 'Salzgehalt', colors: [colorGulf,colorNorthSea,colorDiff], minValue: 0, maxValue: 1.5 , helpLinesCount: 4 });
			vSalt.listenTo(self.mSimulation, 'simulationend', function(){
				vSalt.update([self.mSimulation.get('S1'), self.mSimulation.get('S2'), self.mSimulation.get('S')], self.mSimulation.get('time'));
			});
			newVSlide.$el.find('.salt').append(vSalt.$el);
			vSalt.render();
			vSalt.addLegend(0,'S<sub>1</sub>: Golf von Mexiko');
			vSalt.addLegend(1,'S<sub>2</sub>: Nordsee');
			vSalt.addLegend(2,'S = |S<sub>1</sub> &minus; S<sub>2</sub>|: Differenz');

			// Fluss
			var vFlow = new VPlot({ title: 'Fluss', colors: [colorFlow], minValue: -1, maxValue: 1 });
			vFlow.listenTo(self.mSimulation, 'simulationend', function(){
				vFlow.update([self.mSimulation.get('Q')], self.mSimulation.get('time'));
			});
			newVSlide.$el.find('.flow').append(vFlow.$el);
			vFlow.render();
			vFlow.addLegend(0,'q(T,S): Fluss');

			self.mSimulation.simulate();
		}

		if (slideNr >= 6 && !self.noDimParamsShown){
			self.$el.find('#parameters .nodim').show();
			self.listenTo(self.mSimulation, 'analyseend', function(){
				self.$el.find('#parameters .nodim .alpha').html(self.mSimulation.get('alpha'));
				self.$el.find('#parameters .nodim .beta').html(self.mSimulation.get('beta'));
				self.$el.find('#parameters .nodim .gamma').html(self.mSimulation.get('gamma'));	
				self.$el.find('#parameters .nodim .alpha-beta').html(self.mSimulation.get('alpha-beta'));	
			});
			self.mSimulation.simulate();
			self.noDimParamsShown = true;
		}

		if (template == 'stabilplot'){
			// Temperatur
			var vTempSalt = new VPlot({ title: 'Temperatur / Salzgehalt', colors: [colorPurple,colorOrange,colorPurple,colorOrange], alpha: [0.2,0.2,0.7,0.7], minValue: 0, maxValue: 1 });
			vTempSalt.listenTo(self.mSimulation, 'simulationend', function(){
				vTempSalt.update([self.mSimulation.get('T'), self.mSimulation.get('S'), self.mSimulation.get('TnoDim'), self.mSimulation.get('SnoDim')], self.mSimulation.get('time'));
			});
			newVSlide.$el.find('.tempsalt').append(vTempSalt.$el);
			vTempSalt.render();
			vTempSalt.addLegend(2,'T: Dimensionslos');
			vTempSalt.addLegend(3,'S: Dimensionslos');
			vTempSalt.addLegend(0,'T: Absolut');
			vTempSalt.addLegend(1,'S: Absolut');

			var vFlow = new VPlot({ title: 'Fluss', colors: [colorFlow,colorFlow], alpha: [1.0,0.2], minValue: -2, maxValue: 2 });
			vFlow.listenTo(self.mSimulation, 'simulationend', function(){
				vFlow.update([self.mSimulation.get('QnoDim'), self.mSimulation.get('Q')], self.mSimulation.get('time'));
			});
			newVSlide.$el.find('.flow').append(vFlow.$el);
			vFlow.render();
			vFlow.addLegend(0,'Q: Dimensionslos');
			vFlow.addLegend(1,'Q: Absolut');

			var vAnalyse = new VPlot({ title: 'Stabilitätspunkte', colors: [colorFlow,colorFlow,colorYellow,colorYellow], alpha: [1.0,0.2,0.6,0.6], minValue: -2, maxValue: 2, startT: -2, endT: 2, showHalfHalf: true });
			vAnalyse.listenTo(self.mSimulation, 'analyseend', function(){
				vAnalyse.update([self.mSimulation.get('G'), self.mSimulation.get('Z'), self.mSimulation.get('Kp'), self.mSimulation.get('Kn')], self.mSimulation.get('qOnX'));
				var zeroPoints = self.mSimulation.get('zeroPoints');
				var stableQs = self.mSimulation.get('stableQs');
				for (var i = 0; i < zeroPoints.length; i++){
					vAnalyse.plotVerticalLine(zeroPoints[i]);
					vFlow.plotHorizontalLine(stableQs[i]);
				}
			});
			newVSlide.$el.find('.analysis').append(vAnalyse.$el);
			vAnalyse.render();
			vAnalyse.addLegend(0,'g(q)');
			vAnalyse.addLegend(1,'q - g(q)');
			vAnalyse.addLegend(2,'k(q)');
			
			self.mSimulation.simulate();
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

		self.$el.html(templates['app']({
			colorGulf: colorGulf,
			colorNorthSea: colorNorthSea,
			colorFlow: colorFlow
		}));

		self.$el.find('#parameters .gulf').append(self.vT01slider.render().$el);
		self.$el.find('#parameters .gulf').append(self.vS01slider.render().$el);
		self.$el.find('#parameters .northsea').append(self.vT02slider.render().$el);
		self.$el.find('#parameters .northsea').append(self.vS02slider.render().$el);
		self.$el.find('#parameters .influence').append(self.vKTslider.render().$el);
		self.$el.find('#parameters .influence').append(self.vKSslider.render().$el);
		self.$el.find('#parameters .flow').append(self.vAslider.render().$el);
		self.$el.find('#parameters .flow').append(self.vBslider.render().$el);
		self.$el.find('#parameters .flow').append(self.vCslider.render().$el);

		self.vT01slider.bind('valueHasChanged', function(){
			self.$el.find('.param-selection .selection').removeClass('selected');
		});
		self.vT02slider.bind('valueHasChanged', function(){
			self.$el.find('.param-selection .selection').removeClass('selected');
		});
		self.vS01slider.bind('valueHasChanged', function(){
			self.$el.find('.param-selection .selection').removeClass('selected');
		});
		self.vS02slider.bind('valueHasChanged', function(){
			self.$el.find('.param-selection .selection').removeClass('selected');
		});
		self.vKTslider.bind('valueHasChanged', function(){
			self.$el.find('.param-selection .selection').removeClass('selected');
		});
		self.vKSslider.bind('valueHasChanged', function(){
			self.$el.find('.param-selection .selection').removeClass('selected');
		});

		self.vAslider.bind('valueHasChanged', function(){
			self.$el.find('.param-selection .selection').removeClass('selected');
		});
		self.vBslider.bind('valueHasChanged', function(){
			self.$el.find('.param-selection .selection').removeClass('selected');
		});
		self.vCslider.bind('valueHasChanged', function(){
			self.$el.find('.param-selection .selection').removeClass('selected');
		});
	},

	selectParams: function(e){
		var self = this;

		var $btn = $(e.currentTarget);
		var params = $btn.data('params');

		var oldT01 = self.mSimulation.get('T01');
		var oldT02 = self.mSimulation.get('T02');
		var oldS01 = self.mSimulation.get('S01');
		var oldS02 = self.mSimulation.get('S02');
		var oldKT = self.mSimulation.get('kT');
		var oldKS = self.mSimulation.get('kS');

		self.$el.find('.param-selection .selection').removeClass('selected');
		$btn.addClass('selected');

		var animationSteps = 50;
		var counter = 0;
		var valueStep = setInterval(function(){
			counter++;
			if (counter > animationSteps){
				clearInterval(valueStep);
				return;
			}

			var s = -Math.sin((counter/animationSteps)*Math.PI+Math.PI/2)/2+0.5;

			var T01 = oldT01 + (params.T01 - oldT01)*s;
			self.vT01slider.setValue(T01);
			self.mSimulation.set('T01',T01);

			var T02 = oldT02 + (params.T02 - oldT02)*s;
			self.vT02slider.setValue(T02);
			self.mSimulation.set('T02',T02);

			var S01 = oldS01 + (params.S01 - oldS01)*s;
			self.vS01slider.setValue(S01);
			self.mSimulation.set('S01',S01);

			var S02 = oldS02 + (params.S02 - oldS02)*s;
			self.vS02slider.setValue(S02);
			self.mSimulation.set('S02',S02);

			if (params.kT != undef){
				var kT = oldKT + (params.kT - oldKT)*s;
				self.vKTslider.setValue(kT);
				self.mSimulation.set('kT',kT);
			}
			if (params.kS != undef){
				var kS = oldKS + (params.kS - oldKS)*s;
				self.vKSslider.setValue(kS);
				self.mSimulation.set('kS',kS);
			}

			self.mSimulation.simulate();

		},1/20);
	},

	goForward: function(){
		var self = this;
		self.router.navigate(self.$el.find('#navigation .go-forward').attr('href'), {trigger: true});
	},

	goBack: function(){
		var self = this;
		self.router.navigate(self.$el.find('#navigation .go-back').attr('href'), {trigger: true});
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