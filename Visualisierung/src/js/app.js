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
var colorFlow = '#49e2a3';
var colorDiff = '#444444';
var colorGray = '#DDDDDD';
var colorYellow = '#f4c237';

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
	T01: 1.2,
	T02: 1,
	S01: 1,
	S02: 1.3,

	// zwei Nullstellen für k(q)
	/*
	T01: 2,
	T02: 1,
	S01: 1.7,
	S02: 0.3,
	*/

	kT: 1,
	kS: 0.2,
	a: 1,
	b: 1,
	c: 1,

	events: {
		'click a.route': 'linkClick',
		'click .button': 'chooseState'
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


		self.vT01slider = new VValueSlider({ title: 'T<sub>01</sub> : Wassertemperatur im Golf von Mexiko', color: colorGulf });
		self.vS01slider = new VValueSlider({ title: 'S<sub>01</sub> : Salzgehalt im Golf von Mexiko', color: colorGulf });
		self.vT02slider = new VValueSlider({ title: 'T<sub>02</sub> : Wassertemperatur in der Nordsee', color: colorNorthSea });
		self.vS02slider = new VValueSlider({ title: 'S<sub>02</sub> : Salzgehalt in der Nordsee', color: colorNorthSea });
		
		self.vKTslider = new VValueSlider({ title: 'k<sub>T</sub> : Temperaturaustauschrate' });
		self.vKSslider = new VValueSlider({ title: 'k<sub>S</sub> : Salzgehaltaustauschrate' });
		self.vAslider = new VValueSlider({ title: 'a : Fluss-Proportionalitätskonstante', color: colorFlow });
		self.vBslider = new VValueSlider({ title: 'b : Temperatur-Dichte Konstante', color: colorFlow });
		self.vCslider = new VValueSlider({ title: 'c : Salzgehalt-Dichte Konstante', color: colorFlow });
		
		self.vTemperatureAbs = new VPlot({ title: 'Absolut', colors: [colorGulf,colorNorthSea], minValue: 0, maxValue: 2 });
		self.vSaltinessAbs = new VPlot({ title: 'Absolut', colors: [colorGulf,colorNorthSea], minValue: 0, maxValue: 2 });
		self.vTemperatureDiff = new VPlot({ title: 'Differenz', minValue: -0.5, maxValue: 0.5 });
		self.vSaltinessDiff = new VPlot({ title: 'Differenz', minValue: -0.5, maxValue: 0.5 });
		self.vTemperatureNoDim = new VPlot({ title: 'ohne Dimension', minValue: 0, maxValue: 1 });
		self.vSaltinessNoDim = new VPlot({ title: 'ohne Dimension', minValue: 0, maxValue: 1 });

		self.vFlow = new VPlot({ title: 'Absolut', colors: [colorFlow, colorFlow], alpha: [1, 0.3], minValue: -2, maxValue: 2 });
		self.vGq = new VPlot({ title: 'Stabilitätsuntersuchung', colors: [colorFlow, colorFlow, colorYellow], alpha: [1, 0.3, 0.3], minValue: -1, maxValue: 1, startT: -1, endT: 1, showHalfHalf: true });
		//self.vKq = new VPlot({ title: 'k(q)', minValue: -1, maxValue: 1, startT: -1, endT: 1 });


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

		self.$el.find('.selection .button').first().addClass('active');
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

		self.$el.find('#slider-area > .interactive').append(self.vT01slider.render().$el);
		self.$el.find('#slider-area > .interactive').append(self.vS01slider.render().$el);
		self.$el.find('#slider-area > .interactive').append(self.vT02slider.render().$el);
		self.$el.find('#slider-area > .interactive').append(self.vS02slider.render().$el);

		self.vT01slider.setValue(self.T01);
		self.vS01slider.setValue(self.S01);
		self.vT02slider.setValue(self.T02);
		self.vS02slider.setValue(self.S02);

		self.$el.find('#slider-area > .interactive').append(self.vKTslider.render().$el);
		self.$el.find('#slider-area > .interactive').append(self.vKSslider.render().$el);
		self.$el.find('#slider-area > .interactive').append(self.vAslider.render().$el);
		self.$el.find('#slider-area > .interactive').append(self.vBslider.render().$el);
		self.$el.find('#slider-area > .interactive').append(self.vCslider.render().$el);

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
		self.vTemperatureAbs.addLegend(0,'T<sub>1</sub>: Golf von Mexiko');
		self.vTemperatureAbs.addLegend(1,'T<sub>2</sub>: Nordsee');
		self.vSaltinessAbs.render();
		self.vSaltinessAbs.addLegend(0,'T<sub>1</sub>: Golf von Mexiko');
		self.vSaltinessAbs.addLegend(1,'T<sub>2</sub>: Nordsee');
		self.vTemperatureDiff.render();
		self.vSaltinessDiff.render();
		self.vTemperatureNoDim.render();
		self.vTemperatureNoDim.addLegend(0,'T = T<sub>1</sub> &minus; T<sub>2</sub>');
		self.vSaltinessNoDim.render();
		self.vSaltinessNoDim.addLegend(0,'S = S<sub>1</sub> &minus; S<sub>2</sub>');

		self.$el.find('#plot-area .col.flow .plots').append(self.vFlow.$el);
		self.$el.find('#plot-area .col.flow .plots').append(self.vGq.$el);
		//self.$el.find('#plot-area .col.flow .plots').append(self.vKq.$el);
		self.vFlow.render([colorDiff, colorGray]);
		self.vFlow.addLegend(0,'q = a(bT &minus; cS) : Absolut');
		self.vFlow.addLegend(1,'q = &alpha;T - &beta;S : Dimensionslos');
		self.vGq.render();
		self.vGq.addLegend(0,'g(q) = &alpha;(1 / (1 + |q|)) &minus; &beta;(&gamma; / (&gamma; + |q|))');
		self.vGq.addLegend(1,'q &minus; g(q)');
		self.vGq.addLegend(2,'k(q) = (q &minus; g(q))(1 + q)(&gamma; + q)');
		//self.vKq.render();
		
		self.hideLoading();
	},

	calculate: function(){
		var self = this;

		self.$el.find('.selection .button').removeClass('active');

		// function values
		var Tstar1 = [self.T01];
		var Tstar2 = [self.T02];
		var Sstar1 = [self.S01];
		var Sstar2 = [self.S02];
		
		// difference
		var T0 = self.T01 - self.T02;
		var S0 = self.S01 - self.S02;
		var Tstar = [];
		var Sstar = [];
		var Qstar = [];

		// without dimensions
		var T = [1];
		var S = [1];
		var Q = [];
		var alpha = 2*(self.a*self.b/self.kT)*T0; 
    	var beta  = 2*(self.a*self.c/self.kT)*S0;
    	var gamma = self.kS/self.kT;

    	self.$el.find('span.alpha').html(Math.round(alpha*10)/10);
    	self.$el.find('span.beta').html(Math.round(beta*10)/10);
    	self.$el.find('span.alpha-beta').html(Math.round((beta-alpha)*10)/10);

		// timesteps
		var dtstar = 0.1;
		var dt = self.kT * dtstar;

		for(var t = 0; t < 10/dtstar; t++){

			var dTstar = Tstar1[t] - Tstar2[t];
	        var dSstar = Sstar1[t] - Sstar2[t];

			// Original Gleichungen
	        //var qstarValue = self.a*(self.b*(Tstar1[t] - Tstar2[t]) + self.c*(Sstar2[t] - Sstar1[t]));
	        var qstarValue = self.a*(self.b*dTstar - self.c*dSstar);
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
	        /*
	        var dTstar = ( self.kT*(T0 - Tstar[t]) - 2*Math.abs(qstarValue)*Tstar[t] )*dtstar;
	        var dSstar = ( self.kS*(S0 - Sstar[t]) - 2*Math.abs(qstarValue)*Sstar[t] )*dtstar;
			*/
			// var dTstar = dTstar1 - dTstar2;
	  //       var dSstar = dSstar1 - dSstar2;

	        Tstar[Tstar.length] = dTstar;
	        Sstar[Sstar.length] = dSstar;

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
		var Z = [];
		var K = [];
		var resolution = 100;
		var zeroPoints = [];
		var stableQs = [];
		for(var i = 0; i < resolution; i++){
			//var q = i/resolution*6-3;
			var q = i/resolution*2-1;
			var g = alpha*(1/(1+Math.abs(q))) - beta*(gamma/(gamma+Math.abs(q)) );
			G[i] = g;

			//var g = alpha*(1/(1+Math.abs(q))) - beta*(gamma/(gamma+q) );
			//K[i] = (Math.abs(q) - g)*(1 + Math.abs(q))*(gamma + Math.abs(q));
			var z = q - g;
			Z[i] = z;
			if (i > 0 && q > 0){
				if (Z[i]*Z[i-1] < 0){
					zeroPoints.push(i-0.5);
					stableQs.push(q);
				}
			}
		}

		var K = [];
		for(var i = 1/1000000; i < resolution; i++){
			//var q = i/resolution;
			var q = i/resolution*2-1;
			var g = alpha*(1/(1 + q)) - beta*(gamma/(gamma + q));
			//var g = alpha*(1/(1+Math.abs(q))) - beta*(gamma/(gamma+Math.abs(q)) );
			var k = (q - g)*(1 + q)*(gamma + q);
			if (!isNaN(k)){
				K[K.length] = k;
			}
		}

		//self.vKq.update([K]);

		self.vGq.update([G,Z,K]);
		self.$el.find('#plot-area .col.flow .formula').html('');
		for (var i = 0; i < zeroPoints.length; i++){
			self.vGq.plotVerticalLine(zeroPoints[i]/resolution);
			self.vFlow.plotHorizontalLine(stableQs[i]);
			self.vFlow.plotHorizontalLine(-stableQs[i]);
			self.$el.find('#plot-area .col.flow .formula').append('Nullstelle bei q = <span>'+Math.round(stableQs[i]*10)/10+'</span><br>');
		}
	},

	chooseState: function(e){
		var self = this;

		var $btn = $(e.currentTarget);
		var params = $btn.data('params');

		var oldT01 = self.T01;
		var oldT02 = self.T02;
		var oldS01 = self.S01;
		var oldS02 = self.S02;

		var animationSteps = 50;
		var counter = 0;
		var valueStep = setInterval(function(){
			counter++;
			if (counter > animationSteps){
				clearInterval(valueStep);
				$btn.addClass('active');
				return;
			}

			var s = -Math.sin((counter/animationSteps)*Math.PI+Math.PI/2)/2+0.5;

			self.T01 = oldT01 + (params.T01 - oldT01)*s;
			self.vT01slider.setValue(self.T01);

			self.T02 = oldT02 + (params.T02 - oldT02)*s;
			self.vT02slider.setValue(self.T02);

			self.S01 = oldS01 + (params.S01 - oldS01)*s;
			self.vS01slider.setValue(self.S01);

			self.S02 = oldS02 + (params.S02 - oldS02)*s;
			self.vS02slider.setValue(self.S02);

			self.calculate();

		},1/20);

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