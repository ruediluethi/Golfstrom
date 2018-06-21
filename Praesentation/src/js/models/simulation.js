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
		var T0 = T1 - T2;
		var S0 = S1 - S2;
		var T = [Math.abs(T0)];
		var S = [Math.abs(S0)];
		var Q = [this.get('a')*(this.get('b')*T0 - this.get('c')*S0)];

		// without dimensions
		var TnoDim = [1];
		var SnoDim = [1];
		var alpha = 2*(this.get('a')*this.get('b')/this.get('kT'))*T0; 
    	var beta  = 2*(this.get('a')*this.get('c')/this.get('kT'))*S0;
    	var gamma = this.get('kS')/this.get('kT');
    	var QnoDim = [alpha * TnoDim[0] - beta * SnoDim[0]];

    	// timesteps
		var dt = 0.1;
		var dtNoDim = dt * this.get('kT');
		var time = [0];

		for(var t = 0; t < 10/dt; t++){

			time[t+1] = time[t] + dt;


			// Original Gleichungen
	        var dT1 = ( this.get('kT')*(this.get('T01') - T1[t]) + Math.abs(Q[t])*(T2[t] - T1[t]) )*dt;
	        var dT2 = ( this.get('kT')*(this.get('T02') - T2[t]) + Math.abs(Q[t])*(T1[t] - T2[t]) )*dt;

	        var dS1 = ( this.get('kS')*(this.get('S01') - S1[t]) + Math.abs(Q[t])*(S2[t] - S1[t]) )*dt;
	        var dS2 = ( this.get('kS')*(this.get('S02') - S2[t]) + Math.abs(Q[t])*(S1[t] - S2[t]) )*dt;

	        T1[t+1] = T1[t] + dT1;
	        T2[t+1] = T2[t] + dT2;

	        S1[t+1] = S1[t] + dS1;
	        S2[t+1] = S2[t] + dS2;

	        T[t+1] = Math.abs(T1[t+1] - T2[t+1]);
	        S[t+1] = Math.abs(S1[t+1] - S2[t+1]);

	        var dT = T1[t+1] - T2[t+1];
	        var dS = S1[t+1] - S2[t+1];
	        Q[t+1] = this.get('a')*(this.get('b')*dT - this.get('c')*dS);

	        // Dimensionslos
	        var dTnoDim = ( (1 - TnoDim[t]) - Math.abs(QnoDim[t])*TnoDim[t] )*dtNoDim;
	        var dSnoDim = ( gamma*(1 - SnoDim[t]) - Math.abs(QnoDim[t])*SnoDim[t] )*dtNoDim;
	        TnoDim[t+1] = TnoDim[t] + dTnoDim;
	        SnoDim[t+1] = SnoDim[t] + dSnoDim;
	        QnoDim[t+1] = alpha * TnoDim[t+1] - beta * SnoDim[t+1];
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
		var resolution = 100;
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
				Kp[i] = k;
				Kn[i] = null;
			}else{
				Kp[i] = null;
				//g = alpha*(1/(1 - q)) - beta*(gamma/(gamma - q) );
				//k = (- q + g)*(1 - q)*(gamma - q);
				k = -(q*q*q) + q*q*(1 + gamma) + q*(gamma*(beta-1)-alpha) + gamma*(alpha - beta);
				Kn[i] = k;
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
			//console.log('q = '+stableQ+'; k\' = '+ddqg);
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
		this.generateTrajektorien(16,20);
	},

	generateTrajektorien: function(amount, fieldResolution){

		// environoment params
		var T0 = this.get('T01') - this.get('T02');
		var S0 = this.get('S01') - this.get('S02');

		// without dimensions
		var alpha = 2*(this.get('a')*this.get('b')/this.get('kT'))*T0; 
    	var beta  = 2*(this.get('a')*this.get('c')/this.get('kT'))*S0;
    	var gamma = this.get('kS')/this.get('kT');
    	var QnoDim = [alpha - beta];

    	// timesteps
		var dt = 0.1;
		var time = [dt];

		var Tstack = [];
		var Sstack = [];
		var Qstack = [];
		var timeStack = [];

		for (var i = 0; i < Math.sqrt(amount); i++){

			for (var j = 0; j < Math.sqrt(amount); j++){

				var T = [i/(Math.sqrt(amount)-1)];	
				var S = [j/(Math.sqrt(amount)-1)];
				var Q = [alpha*T[0] - beta*S[0]];
				var time = [0];

				for(var t = 0; t < 10/dt; t++){
					time[t+1] = time[t] + dt;
			        var dT = ( (1 - T[t]) - Math.abs(Q[t])*T[t] )*dt;
			        var dS = ( gamma*(1 - S[t]) - Math.abs(Q[t])*S[t] )*dt;
			        T[t+1] = T[t] + dT;
			        S[t+1] = S[t] + dS;
			        Q[t+1] = alpha * T[t+1] - beta * S[t+1];
			        /*
			        T[t+1] = T[t] + 0.01;
			        S[t+1] = S[t] + 0.02;
			        Q[t+1] = 0.5;
			        */
				}
				Tstack.push(T);
				Sstack.push(S);
				Qstack.push(Q);
				timeStack.push(time);
			}
		}

		var vectorField = [];
		for (var x = 0; x < fieldResolution; x++){
			vectorField.push([]);
			for (var y = 0; y < fieldResolution; y++){
				var T = x/fieldResolution;
				var S = y/fieldResolution;
				var q = alpha * T - beta * S;
		        var dT = (1 - T) - Math.abs(q)*T;
		        var dS = gamma*(1 - S) - Math.abs(q)*S;
		        vectorField[x][y] = {"dx":dT,"dy":dS};
			}
		}

		this.set('Tstack', Tstack);
		this.set('Sstack', Sstack);
		this.set('Qstack', Qstack);
		this.set('timeStack', timeStack);
		this.set('vectorField', vectorField);

		this.trigger('trajektorienend');
	},

	setAndSimulate: function(key, val){
		this.set(key,val);
		this.simulate();
	}

});