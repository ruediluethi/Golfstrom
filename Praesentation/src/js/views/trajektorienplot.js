var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

var d3 = require('d3-browserify'); // ~150KB !!

var pathDrawFunction = d3.svg.line()
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .interpolate('linear');

module.exports = Backbone.View.extend({

	className: 'plot',

	title: 'untitled',
	width: 200,
	height: 200,
	padding: 10,
	paddingTop: 10,
	paddingBottom: 10,
	diagramWidth: 0,
	diagramHeight: 0,

	colors: ['#444444'],

	gAxis: undef,
	gField: undef,
	gGraphs: undef,
	gLabels: undef,

	initialize: function(options) {
		var self = this;

		if (options != undef){
			self.title = options.title;
			if (options.colors != undef){
				self.colors = options.colors;
			}
		}
	},

	render: function(){
		var self = this;

		self.$el.html(templates['plot']({ title: self.title }));
		var svg = d3.select(self.$el.find('svg')[0]);

		self.width = self.$el.width();
		self.height = self.width;

		svg.attr('width', self.width);
		svg.attr('height', self.height);

		self.diagramWidth = self.width - 2*self.padding;
		self.diagramHeight = self.height - self.paddingTop - self.paddingBottom;

		self.gAxis = svg.append('g');
		self.gAxis.attr('transform', 'translate('+self.padding+','+self.paddingTop+')');

		self.gField = svg.append('g');
		self.gField.attr('transform', 'translate('+self.padding+','+self.paddingTop+')');

		self.gGraphs = svg.append('g');
		self.gGraphs.attr('transform', 'translate('+self.padding+','+self.paddingTop+')');

		self.gLabels = svg.append('g');
		self.gLabels.attr('transform', 'translate('+self.padding+','+self.paddingTop+')');

		//self.renderAxis();

		/*
		for (var x = 0; x < self.diagramWidth; x++){
			self.gLabels.append('rect')
				.attr('x',x)
				.attr('y',0)
				.attr('width',1)
				.attr('height',20)
				.attr('fill', self.getColorOnColorWheel(x/self.diagramWidth));
		}
		*/

		self.gGraphs.selectAll('path').data(self.colors)
			.enter()
			.append('path')
			.attr('fill', 'transparent')
			.attr('stroke', function(d){
				return d;
			})
			.attr('stroke-width', 4)
			.attr('opacity', 0.6);



		return self;
	},

	update: function(vectorField,xStack,yStack){
		var self = this;

		var fieldResolution = vectorField.length;

		var lineLengthX = self.diagramWidth/(fieldResolution-1);
		var lineLengthY = self.diagramHeight/(fieldResolution-1);

		var fieldData = [];
		for (var x = 0; x < fieldResolution; x++){
			for (var y = 0; y < fieldResolution; y++){

				var dx = vectorField[x][y].dx;
				var dy = vectorField[x][y].dy;

				var vLength = Math.sqrt(dx*dx + dy*dy);

				fieldData.push({
					x: x*lineLengthX,
					y: self.diagramHeight - y*lineLengthX,
					dx: dx/vLength * lineLengthX*0.5,
					dy: dy/vLength * lineLengthY*0.5,
					angle: window.atan2(dx,dy)
				});
			}
		}

		/*
		var rects = self.gField.selectAll('rect').data(fieldData);
		rects.enter()
			.append('rect')
			.attr('x', function(d,i){
				return d.x;
			})
			.attr('y', function(d,i){
				return d.y;
			})
			.attr('width',lineLengthX)
			.attr('height',lineLengthY)
			.attr('stroke', 'transparent')
			.attr('stroke-width', 0);

		rects.attr('fill', function(d,i){
			return self.getColorOnColorWheel(d.angle / (2*Math.PI));
		});
		*/

		var circle = self.gField.selectAll('circle').data(fieldData);
		circle.enter()
			.append('circle')
			.attr('cx', function(d,i){
				return d.x;
			})
			.attr('cy', function(d,i){
				return d.y;
			})
			.attr('r',lineLengthX/2-1)
			.attr('stroke', 'transparent')
			.attr('stroke-width', 0)
			.attr('opacity', 0.7);

		circle.attr('fill', function(d,i){
			return self.getColorOnColorWheel(d.angle / (2*Math.PI));
		});

		var lines = self.gField.selectAll('line').data(fieldData);
		lines.enter()
			.append('line')
			.attr('stroke-width', 1)
			//.attr('stroke','#777777')
			.attr('x1', function(d,i){
				return d.x;
			})
			.attr('y1', function(d,i){
				return d.y;
			});

		lines.attr('x2', function(d,i){
				return d.x + d.dx;
			})
			.attr('y2', function(d,i){
				return d.y + d.dy;
			})
			.attr('stroke', function(d,i){
				return '#FFFFFF';
				//return self.getColorOnColorWheel(d.angle / (2*Math.PI));
			});

		self.gGraphs.selectAll('path').each(function(d, i){
			var path = d3.select(this);

			var pathPoints = [];

			var X = xStack[i];
			var Y = yStack[i];

			for (var t = 0; t < X.length; t++){
				var x = self.diagramWidth * X[t];
				var y = self.diagramHeight - (self.diagramHeight * Y[t]);

				var distanceToLast = self.diagramWidth*self.diagramHeight;
				if (pathPoints.length > 0){
					var dx = x - pathPoints[pathPoints.length-1].x;
					var dy = y - pathPoints[pathPoints.length-1].y;
					distanceToLast = Math.sqrt(dx*dx + dy*dy);
				}

				if (!isNaN(x) && !isNaN(y) && x > 0 && x < self.diagramWidth && y > 0 && y < self.diagramHeight && distanceToLast > 3){
					pathPoints.push({
						x: x,
						y: y
					});
				}
			}

			path.attr('d', pathDrawFunction(pathPoints));
		});

	},

	hexToRgb: function (hex) {
	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	        return r + r + g + g + b + b;
	    });

	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	},

	componentToHex: function (c) {
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	},

	rgbToHex: function(r, g, b) {
	    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	},


	interpolateColor: function(from, to, value){

		// value = -Math.sin((value)*Math.PI+Math.PI/2)/2+0.5;

	    var rgbFrom = this.hexToRgb(from);
	    var rgbTo = this.hexToRgb(to);

	    var rgbCalced = {
	        r: Math.round(rgbFrom.r + (rgbTo.r - rgbFrom.r)*value),
	        g: Math.round(rgbFrom.g + (rgbTo.g - rgbFrom.g)*value),
	        b: Math.round(rgbFrom.b + (rgbTo.b - rgbFrom.b)*value)
	    };

	    return this.rgbToHex(rgbCalced.r, rgbCalced.g, rgbCalced.b);
	},

	getColorOnColorWheel: function(a){
		var self = this;

		var color = '#000000';

		//var colorAnchors = ['#FF0000','#FF00FF','#0000FF','#00FFFF','#00FF00','#FFFF00'];
		var colorAnchors = ['#dd3a78','#895baa','#40a1dd','#4be0d8','#2ee88f','#e8b22d'];

		if (a < 1/6){
			color = self.interpolateColor(colorAnchors[0], colorAnchors[1], a*6);
		}else if (a < 2/6){
			color = self.interpolateColor(colorAnchors[1], colorAnchors[2], (a-1/6)*6);
		}else if (a < 3/6){
			color = self.interpolateColor(colorAnchors[2], colorAnchors[3], (a-2/6)*6);
		}else if (a < 4/6){
			color = self.interpolateColor(colorAnchors[3], colorAnchors[4], (a-3/6)*6);
		}else if (a < 5/6){
			color = self.interpolateColor(colorAnchors[4], colorAnchors[5], (a-4/6)*6);
		}else if (a < 6/6){
			color = self.interpolateColor(colorAnchors[5], colorAnchors[0], (a-5/6)*6);
		}

		return color;
	}
});