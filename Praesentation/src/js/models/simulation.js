var undef;
var $ = jQuery = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;

module.exports = Backbone.Model.extend({

	defaults: {
		T01: 1,
		T02: 1,
		S01: 1,
		S02: 1,

		kT: 1,
		kS: 1,
		a: 1,
		b: 1,
		c: 1,

		T1: [],
		T2: [],
		S1: [],
		S2: [],

		T: [],
		S: []
	},

	simulate: function(){

		// function values
		var T1 = [this.get('T01')];
		var T2 = [this.get('T02')];
		var S1 = [this.get('S01')];
		var S2 = [this.get('S02')];

		// difference
		var T0 = this.get('T01') - this.get('T02');
		var S0 = this.get('S01') - this.get('S02');
		var T = [];
		var S = [];
		var Q = [];

		// without dimensions
		var TnoDim = [1];
		var SnoDim = [1];
		var alpha = 2*(this.get('a')*this.get('b')/this.get('kT'))*T0; 
    	var beta  = 2*(this.get('a')*this.get('c')/this.get('kT'))*S0;
    	var gamma = this.get('kS')/this.get('kT');
    	var QnoDim = [alpha - beta];

    	var Stest = [S0/S0];

    	this.set('alpha', Math.round(alpha*100)/100);
    	this.set('beta', Math.round(beta*100)/100);
    	this.set('gamma', Math.round(gamma*100)/100);

    	// timesteps
		var dt = 0.1;
		var dtNoDim = dt * this.get('kT');

		for(var t = 0; t < 10/dt; t++){

			var dT = T1[t] - T2[t];
	        var dS = S1[t] - S2[t];

			// Original Gleichungen
	        var q = this.get('a')*(this.get('b')*dT - this.get('c')*dS);
	        Q[Q.length] = q;

	        var dT1 = ( this.get('kT')*(this.get('T01') - T1[t]) + Math.abs(q)*(T2[t] - T1[t]) )*dt;
	        var dT2 = ( this.get('kT')*(this.get('T02') - T2[t]) + Math.abs(q)*(T1[t] - T2[t]) )*dt;

	        var dS1 = ( this.get('kS')*(this.get('S01') - S1[t]) + Math.abs(q)*(S2[t] - S1[t]) )*dt;
	        var dS2 = ( this.get('kS')*(this.get('S02') - S2[t]) + Math.abs(q)*(S1[t] - S2[t]) )*dt;

	        T1[T1.length] = T1[t] + dT1;
	        T2[T2.length] = T2[t] + dT2;

	        S1[S1.length] = S1[t] + dS1;
	        S2[S2.length] = S2[t] + dS2;

	        T[T.length] = Math.abs(T1[t] - T2[t]);
	        S[S.length] = Math.abs(S1[t] - S2[t]);

	        Stest[Stest.length] = (S1[t] - S2[t])/S0;

	        // Dimensionslos
	        var qNoDim = alpha * TnoDim[t] - beta * SnoDim[t];
	        var dTnoDim = ( (1 - TnoDim[t]) - Math.abs(qNoDim)*TnoDim[t] )*dtNoDim;
	        var dSnoDim = ( gamma*(1 - SnoDim[t]) - Math.abs(qNoDim)*SnoDim[t] )*dtNoDim;
	        TnoDim[TnoDim.length] = TnoDim[t] + dTnoDim;
	        SnoDim[SnoDim.length] = SnoDim[t] + dSnoDim;
	        QnoDim[QnoDim.length] = qNoDim;
		}

		// console.log(TnoDim);
		// console.log(SnoDim);

		this.set('T1',T1);
		this.set('T2',T2);
		this.set('S1',S1);
		this.set('S2',S2);
		this.set('T',T);
		this.set('S',S);
		this.set('Q',Q);
		this.set('TnoDim',TnoDim);
		this.set('SnoDim',SnoDim);
		this.set('QnoDim',QnoDim);
		this.set('Stest',Stest);

		this.trigger('simulationend');
		this.analyse();
	},

	analyse: function(){
		var T0 = this.get('T01') - this.get('T02');
		var S0 = this.get('S01') - this.get('S02');
		var alpha = 2*(this.get('a')*this.get('b')/this.get('kT'))*T0;
    	var beta  = 2*(this.get('a')*this.get('c')/this.get('kT'))*S0;
    	var gamma = this.get('kS')/this.get('kT');

		var G = [];
		var Z = [];
		var K = [];
		var resolution = 100;
		var zeroPoints = [];
		var stableQs = [];
		for(var i = 0; i < resolution; i++){
			//var q = i/resolution*6-3;
			var q = (i/resolution*2-1)*2;
			var g = alpha*(1/(1+Math.abs(q))) - beta*(gamma/(gamma+Math.abs(q)) );
			G[i] = g;

			var z = q - g;
			Z[i] = z;
			if (i > 0){
				if (Z[i]*Z[i-1] < 0){
					zeroPoints.push((i-0.5)/resolution);
					stableQs.push(q);
				}
			}

			var g = alpha*(1/(1+q)) - beta*(gamma/(gamma+q) );
			var k = (q - g)*(1 + q)*(gamma + q);
			
			if (!isNaN(k)){
				K[K.length] = k;
			}
		}

		this.set('G',G);
		this.set('K',K);
		this.set('Z',Z);
		this.set('zeroPoints', zeroPoints);
		this.set('stableQs', stableQs);

		this.trigger('analyseend');
	},

	setAndSimulate: function(key, val){
		this.set(key,val);
		this.simulate();
	}

});