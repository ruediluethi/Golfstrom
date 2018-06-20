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
		var TnoDim = [0];
		var SnoDim = [0];
		var alpha = 2*(this.get('a')*this.get('b')/this.get('kT'))*T0; 
    	var beta  = 2*(this.get('a')*this.get('c')/this.get('kT'))*S0;
    	var gamma = this.get('kS')/this.get('kT');
    	var QnoDim = [alpha - beta];

    	var Stest = [S0/S0];

    	// timesteps
		var dt = 0.01;
		var dtNoDim = dt * this.get('kT');
		var time = [dt];

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

	        time[time.length] = time[t] + dt;

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
		this.set('time',time);
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
    	this.set('alpha', Math.round(alpha*100)/100);
    	this.set('beta', Math.round(beta*100)/100);
    	this.set('gamma', Math.round(gamma*100)/100);
    	this.set('alpha-beta', Math.round((alpha-beta)*100)/100);

    	var qOnX = [];
		var G = [];
		var Z = [];
		var Kp = [];
		var Kn = [];
		var resolution = 500;
		var zeroPoints = [];
		var stableQs = [];
		for(var i = 0; i < resolution; i++){
			//var q = i/resolution*6-3;
			var q = (i/resolution*2-1)*2;
			qOnX[i] = q;
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

			var g = alpha*(1/(1+Math.abs(q))) - beta*(gamma/(gamma+Math.abs(q)) );
			// var k = (Math.abs(q) - Math.abs(g)) *(1 + Math.abs(q))*(gamma + Math.abs(q));
			var k = (q - g) *(1 + q)*(gamma + q);
			if (q >= 0){
				Kp[Kp.length] = k;
				Kn[Kn.length] = null;
			}else{
				Kp[Kp.length] = null;
				//g = alpha*(1/(1 - q)) - beta*(gamma/(gamma - q) );
				//k = (- q + g)*(1 - q)*(gamma - q);
				k = -(q*q*q) + q*q*(1 + gamma) + q*(gamma*(beta-1)-alpha) + gamma*(alpha - beta);
				Kn[Kn.length] = k;
			}
		}

		var q1 = 0.5*(-Math.sqrt(4*alpha - 4*beta + 1) - 1);
		var q2 = 0.5*(+Math.sqrt(4*alpha - 4*beta + 1) - 1);
		var q3 = 0.5*(-Math.sqrt(4*beta - 4*alpha + 1) + 1);
		var q4 = 0.5*(+Math.sqrt(4*beta - 4*alpha + 1) + 1);

		//console.log(q1+' / '+q2+' / '+q3+' / '+q4);
		//console.log(stableQs);

		for (var i = 0; i < stableQs.length; i++){
			var stableQ = stableQs[i];
			var ddqg = -stableQ/Math.abs(stableQ) * ( alpha/((1+Math.abs(stableQ))*(1+Math.abs(stableQ))) - (beta*gamma)/((gamma+Math.abs(stableQ))*(gamma+Math.abs(stableQ))) );
			console.log('q = '+stableQ+'; k\' = '+ddqg);
		}

		var T = this.get('TnoDim');
		var S = this.get('SnoDim');
		var stableT = T[T.length-1];
		var stableS = S[S.length-1];
		var stableQ = alpha*stableT - beta*stableS;

		var dTdT = -1 -stableQ/Math.abs(stableQ)*alpha*stableT - Math.abs(stableQ);
		var dTdS = -stableQ/Math.abs(stableQ)*(-beta)*stableT;
		var dSdT = -stableQ/Math.abs(stableQ)*alpha*stableS;
		var dSdS = -gamma -stableQ/Math.abs(stableQ)*(-beta)*stableS - Math.abs(stableQ);

		//console.log(dTdT+" "+dTdS+";"+dSdT+" "+dSdS);

		var det = dTdT*dSdS - dSdT*dTdS;
		//console.log(det);

		var det2 = stableQ/Math.abs(stableQ)*(alpha*stableT*gamma - beta*stableS) + stableQ*stableQ + gamma + Math.abs(stableQ) + Math.abs(stableQ)*gamma + Math.abs(stableQ)*Math.abs(stableQ);
		//console.log(det2);

		var trace = 1 + gamma + 2*Math.abs(stableQ) + (stableQ*stableQ)/Math.abs(stableQ);
		//console.log(trace);

		this.set('qOnX',qOnX);
		this.set('G',G);
		this.set('Kp',Kp);
		this.set('Kn',Kn);
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