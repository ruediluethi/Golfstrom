var undef;
var $ = jQuery = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

require('browsernizr/test/history');
var Modernizr = require('browsernizr');

var Router = require('./router');

var VValueSlider = require('./views/valueslider');
var VPlot = require('./views/plot');

var colorGulf = '#ed4f80';
var colorNorthSea = '#40a1dd';
var colorDiff = '#444444';
var colorGray = '#DDDDDD';

module.exports = Backbone.View.extend({

	className: 'app',

	router: undef,

	resizeTimeout: undef,

	vT01slider: undef,
	vT02slider: undef,
	vS01slider: undef,
	vS02slider: undef,
	vKTslider: undef,
	vKSslider: undef,
	vAslider: undef,
	vBslider: undef,
	vCslider: undef,

	vTemperatureAbs: undef,
	vSaltinessAbs: undef,
	vTemperatureDiff: undef,
	vSaltinessDiff: undef,
	vTemperatureNoDim: undef,
	vSaltinessNoDim: undef,
	vFlow: undef,
	vGq: undef,
	vKq: undef,

	// constants
	T01: 1.5,
	T02: 1,
	S01: 1,
	S02: 1.5,
	kT: 1,
	kS: 0.2,
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


		self.vT01slider = new VValueSlider({ title: 'Wassertemperatur im Golf von Mexiko', color: colorGulf });
		self.vS01slider = new VValueSlider({ title: 'Salzgehalt im Golf von Mexiko', color: colorGulf });
		self.vT02slider = new VValueSlider({ title: 'Wassertemperatur in der Nordsee', color: colorNorthSea });
		self.vS02slider = new VValueSlider({ title: 'Salzgehalt in der Nordsee', color: colorNorthSea });
		
		self.vKTslider = new VValueSlider({ title: 'Temperaturaustauschrate' });
		self.vKSslider = new VValueSlider({ title: 'Salzgehaltaustauschrate' });
		self.vAslider = new VValueSlider({ title: 'Fluss-Proportionalitätskonstante' });
		self.vBslider = new VValueSlider({ title: 'B' });
		self.vCslider = new VValueSlider({ title: 'C' });
		
		self.vTemperatureAbs = new VPlot({ title: 'Absolut', colors: [colorGulf,colorNorthSea], minValue: 0, maxValue: 2 });
		self.vSaltinessAbs = new VPlot({ title: 'Absolut', colors: [colorGulf,colorNorthSea], minValue: 0, maxValue: 2 });
		self.vTemperatureDiff = new VPlot({ title: 'Differenz', minValue: -1, maxValue: 1 });
		self.vSaltinessDiff = new VPlot({ title: 'Differenz', minValue: -1, maxValue: 1 });
		self.vTemperatureNoDim = new VPlot({ title: 'ohne Dimension', minValue: 0, maxValue: 1 });
		self.vSaltinessNoDim = new VPlot({ title: 'ohne Dimension', minValue: 0, maxValue: 1 });

		self.vFlow = new VPlot({ title: 'Absolut', colors: [colorDiff, colorGray], minValue: -2, maxValue: 2 });
		self.vGq = new VPlot({ title: 'g(q)', colors: [colorDiff, colorGray], minValue: -2, maxValue: 2, startT: -3, endT: 3, showHalfHalf: true });
		self.vKq = new VPlot({ title: 'k(q)', minValue: -0.5, maxValue: 0.5, startT: 0, endT: 1 });


		self.vT01slider.bind('valueHasChanged', function(){
			self.T01 = self.vT01slider.value;
			self.calculate();
		});
		self.vS01slider.bind('valueHasChanged', function(){
			self.S01 = self.vS01slider.value;
			self.calculate();
		});
		self.vT02slider.bind('valueHasChanged', function(){
			self.T02 = self.vT02slider.value;
			self.calculate();
		});
		self.vS02slider.bind('valueHasChanged', function(){
			self.S02 = self.vS02slider.value;
			self.calculate();
		});
		self.vKTslider.bind('valueHasChanged', function(){
			self.kT = self.vKTslider.value;
			self.calculate();
		});
		self.vKSslider.bind('valueHasChanged', function(){
			self.kS = self.vKSslider.value;
			self.calculate();
		});
		self.vAslider.bind('valueHasChanged', function(){
			self.a = self.vAslider.value;
			self.calculate();
		});
		self.vBslider.bind('valueHasChanged', function(){
			self.b = self.vBslider.value;
			self.calculate();
		});
		self.vCslider.bind('valueHasChanged', function(){
			self.c = self.vCslider.value;
			self.calculate();
		});

		self.render();
		self.calculate();
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

	render: function(inital){
		var self = this;

		self.$el.html(templates['app']({ }));

		self.$el.find('#slider-area').append(self.vT01slider.render().$el);
		self.$el.find('#slider-area').append(self.vS01slider.render().$el);
		self.$el.find('#slider-area').append(self.vT02slider.render().$el);
		self.$el.find('#slider-area').append(self.vS02slider.render().$el);

		self.vT01slider.setValue(self.T01);
		self.vS01slider.setValue(self.S01);
		self.vT02slider.setValue(self.T02);
		self.vS02slider.setValue(self.S02);

		self.$el.find('#slider-area').append(self.vKTslider.render().$el);
		self.$el.find('#slider-area').append(self.vKSslider.render().$el);
		self.$el.find('#slider-area').append(self.vAslider.render().$el);
		self.$el.find('#slider-area').append(self.vBslider.render().$el);
		self.$el.find('#slider-area').append(self.vCslider.render().$el);

		self.vKTslider.setValue(self.kT);
		self.vKSslider.setValue(self.kS);
		self.vAslider.setValue(self.a);
		self.vBslider.setValue(self.b);
		self.vCslider.setValue(self.c);

		self.$el.find('#plot-area .col.temp').append(self.vTemperatureAbs.$el);
		self.$el.find('#plot-area .col.salt').append(self.vSaltinessAbs.$el);
		self.$el.find('#plot-area .col.temp').append(self.vTemperatureDiff.$el);
		self.$el.find('#plot-area .col.salt').append(self.vSaltinessDiff.$el);
		self.$el.find('#plot-area .col.temp').append(self.vTemperatureNoDim.$el);
		self.$el.find('#plot-area .col.salt').append(self.vSaltinessNoDim.$el);
		self.vTemperatureAbs.render();
		self.vSaltinessAbs.render();
		self.vTemperatureDiff.render();
		self.vSaltinessDiff.render();
		self.vTemperatureNoDim.render();
		self.vSaltinessNoDim.render();

		self.$el.find('#plot-area .col.flow').append(self.vFlow.$el);
		self.$el.find('#plot-area .col.flow').append(self.vGq.$el);
		self.$el.find('#plot-area .col.flow').append(self.vKq.$el);
		self.vFlow.render([colorDiff, colorGray]);
		self.vGq.render();
		self.vKq.render();
		
		self.hideLoading();
	},

	calculate: function(){
		var self = this;

		// function values
		var Tstar1 = [self.T01];
		var Tstar2 = [self.T02];
		var Sstar1 = [self.S01];
		var Sstar2 = [self.S02];
		
		// difference
		var T0 = self.T01 - self.T02;
		var S0 = self.S01 - self.S02;
		var Tstar = [T0];
		var Sstar = [S0];
		var Qstar = [];

		// without dimensions
		var T = [1];
		var S = [1];
		var Q = [];
		var alpha = 2*(self.a*self.b/self.kT)*T0; 
    	var beta  = 2*(self.a*self.c/self.kT)*S0;
    	var gamma = self.kS/self.kT;

		// timesteps
		var dtstar = 0.1;
		var dt = self.kT * dtstar;

		for(var t = 0; t < 100; t++){

			// Original Gleichungen
	        var qstarValue = self.a*(self.b*(Tstar1[t] - Tstar2[t]) + self.c*(Sstar2[t] - Sstar1[t]));
	        //Qstar[Qstar.length] = 2*qstarValue/self.kT;
	        Qstar[Qstar.length] = qstarValue;

	        var dTstar1 = ( self.kT*(self.T01 - Tstar1[t]) + Math.abs(qstarValue)*(Tstar2[t] - Tstar1[t]) )*dtstar;
	        var dTstar2 = ( self.kT*(self.T02 - Tstar2[t]) + Math.abs(qstarValue)*(Tstar1[t] - Tstar2[t]) )*dtstar;

	        var dSstar1 = ( self.kS*(self.S01 - Sstar1[t]) + Math.abs(qstarValue)*(Sstar2[t] - Sstar1[t]) )*dtstar;
	        var dSstar2 = ( self.kS*(self.S02 - Sstar2[t]) + Math.abs(qstarValue)*(Sstar1[t] - Sstar2[t]) )*dtstar;

	        Tstar1[Tstar1.length] = Tstar1[t] + dTstar1;
	        Tstar2[Tstar2.length] = Tstar2[t] + dTstar2;

	        Sstar1[Sstar1.length] = Sstar1[t] + dSstar1;
	        Sstar2[Sstar2.length] = Sstar2[t] + dSstar2;

	        // Gleichungen für die Differenz
	        var dTstar = ( self.kT*(T0 - Tstar[t]) - 2*Math.abs(qstarValue)*Tstar[t] )*dtstar;
	        var dSstar = ( self.kS*(S0 - Sstar[t]) - 2*Math.abs(qstarValue)*Sstar[t] )*dtstar;

	        Tstar[Tstar.length] = Tstar[t] + dTstar;
	        Sstar[Sstar.length] = Sstar[t] + dSstar;

	        // dimensionslose Rechnung
	        q  = alpha*T[t] - beta*S[t];
	        Q[Q.length] = q;

	        var dT = (       (1 - T[t]) - Math.abs(q)*T[t] )*dt;
	        var dS = ( gamma*(1 - S[t]) - Math.abs(q)*S[t] )*dt;

	        T[T.length] = T[t] + dT;
	        S[S.length] = S[t] + dS;
		}

		self.vTemperatureAbs.update([Tstar1, Tstar2]);
		self.vSaltinessAbs.update([Sstar1, Sstar2]);
		self.vTemperatureDiff.update([Tstar]);
		self.vSaltinessDiff.update([Sstar]);
		self.vTemperatureNoDim.update([T]);
		self.vSaltinessNoDim.update([S]);

		self.vFlow.update([Qstar, Q]);

		var G = [];
		var K = [];
		var resolution = 100;
		for(var i = 0; i < resolution; i++){
			var q = i/resolution*6-3;
			var g = alpha*(1/(1+Math.abs(q))) - beta*(gamma/(gamma+Math.abs(q)) );
			G[i] = g;

			//var g = alpha*(1/(1+Math.abs(q))) - beta*(gamma/(gamma+q) );
			K[i] = (Math.abs(q) - g)*(1 + Math.abs(q))*(gamma + Math.abs(q));
		}
		self.vGq.update([G,K]);
		
		var K = [];
		for(var i = 0; i < resolution; i++){
			var q = i/resolution;
			g = alpha*(1/(1+Math.abs(q))) - beta*(gamma/(gamma+Math.abs(q)));
			K[i] = (q - g)*(1 + q)*(gamma + q);
		}

		self.vKq.update([K]);
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