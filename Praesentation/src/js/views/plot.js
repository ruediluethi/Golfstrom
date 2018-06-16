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
	padding: 1,
	paddingTop: 20,
	paddingBottom: 20,
	diagramWidth: 0,
	diagramHeight: 0,

	colors: ['#444444'],
	alpha: undef,
	minValue: -1,
	maxValue: 1,
	starT: 0,
	endT: 50,
	helpLinesCount: 5,
	showHalfHalf: false,

	gAxis: undef,
	gGraphs: undef,
	gLabels: undef,

	initialize: function(options) {
		var self = this;

		if (options != undef){
			self.title = options.title;
			self.minValue = options.minValue;
			self.maxValue = options.maxValue;
			self.alpha = options.alpha;
			if (options.colors != undef){
				self.colors = options.colors;
			}
			if (options.startT != undef && options.endT != undef){
				self.starT = options.startT;
				self.endT = options.endT;
			}
			if (options.showHalfHalf != undef){
				self.showHalfHalf = options.showHalfHalf;
			}
			if (options.helpLinesCount != undef){
				self.helpLinesCount = options.helpLinesCount;
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

		self.gGraphs = svg.append('g');
		self.gGraphs.attr('transform', 'translate('+self.padding+','+self.paddingTop+')');

		self.gLabels = svg.append('g');
		self.gLabels.attr('transform', 'translate('+self.padding+','+self.paddingTop+')');

		self.renderAxis();

		self.gGraphs.selectAll('path').data(self.colors)
			.enter()
			.append('path')
			.attr('fill', 'transparent')
			.attr('stroke', function(d){
				return d;
			})
			.attr('stroke-width', 4)
			.attr('opacity', function(d,i){
				if (self.alpha != undef){
					return self.alpha[i];
				}
			})
			/*.style('stroke-dasharray', function(d,i){
				return ("3, 3");
			});*/

		return self;
	},

	addLegend: function(i, text){
		var self = this;

		var $legend = $('<div class="plot-legend"><svg></svg>'+text+'<div>');
		var svgIcon = d3.select($legend.find('svg')[0]);
		svgIcon.attr('width', 14);
		svgIcon.attr('height', 14);
		svgIcon.append('line')
			.attr('x1', 0)
			.attr('y1', 8)
			.attr('x2', 14)
			.attr('y2', 8)
			.attr('stroke-width', 4)
			.attr('stroke',self.colors[i])
			.attr('opacity', function(){
				if (self.alpha != undef){
					return self.alpha[i];
				}
				return 1;
			});
		self.$el.find('.plot-wrapper').append($legend);
	},

	renderAxis: function(){
		var self = this;

		var zeroXpos = self.diagramWidth/Math.abs(self.endT - self.starT)*Math.abs(self.starT);
		/*self.gAxis.append('line')
			.attr('x1', zeroXpos)
			.attr('y1', 0)
			.attr('x2', zeroXpos)
			.attr('y2', self.diagramHeight)
			.attr('stroke-width', 1)
			.attr('stroke','#777777');*/

		for (var i = 0; i < self.helpLinesCount; i++){
			var value = self.minValue + Math.abs(self.maxValue - self.minValue)*i/(self.helpLinesCount-1);

			self.gAxis.append('line')
				.attr('x1', 0)
				.attr('y1', self.valueToY(value))
				.attr('x2', self.diagramWidth)
				.attr('y2', self.valueToY(value))
				.attr('stroke-width', 1)
				.attr('stroke','#DDDDDD');			
			self.gLabels.append('text')
				.attr('class', 'small')
				.attr('x', 0)
				.attr('y', self.valueToY(value)-6)
				// .attr('text-anchor', 'end')
				.text(Math.round(value*10)/10);
		}

		self.gAxis.append('line')
			.attr('x1', 0)
			.attr('y1', self.valueToY(0))
			.attr('x2', self.diagramWidth)
			.attr('y2', self.valueToY(0))
			.attr('stroke-width', 1)
			.attr('stroke','#777777');

		if (self.showHalfHalf){
			self.gAxis.append('line')
				.attr('x1', 0)
				.attr('y1', self.valueToY(self.starT))
				.attr('x2', self.diagramWidth)
				.attr('y2', self.valueToY(self.endT))
				.attr('stroke-width', 1)
				.attr('stroke','#DDDDDD');
			/*self.gAxis.append('line')
				.attr('x1', self.diagramWidth)
				.attr('y1', self.valueToY(self.starT))
				.attr('x2', 0)
				.attr('y2', self.valueToY(self.endT))
				.attr('stroke-width', 1)
				.attr('stroke','#DDDDDD');*/
		}

	},

	renderTimeLine: function(time){
		var self = this;

		var timeRange = Math.abs(time[time.length-1] - time[0]);
		var timeStep = self.diagramWidth/timeRange;

		var minTime = Math.round(time[0]);
		var maxTime = Math.round(time[time.length-1]);

		self.gAxis.selectAll('line.timeline').remove();
		self.gAxis.selectAll('text.timeline').remove();

		for (var t = minTime; t < maxTime+0.1; t = t+0.1){
			var xPos = Math.round(timeStep*t);
			var lineSize = 2;
			if(Math.abs(Math.round(t)-t) < 0.01){
				lineSize = 3;
				self.gAxis.append('text')
					.attr('class', 'small timeline')
					.attr('x', xPos)
					.attr('y', self.valueToY(0)+15)
					.attr('text-anchor',Math.round(t) == Math.floor(time[time.length-1]) ? 'end' : 'start')
					.text(Math.round(t));
			}
			
			self.gAxis.append('line')
				.attr('class', 'timeline')
				.attr('x1', timeStep*t)
				.attr('y1', self.valueToY(0)-lineSize)
				.attr('x2', timeStep*t)
				.attr('y2', self.valueToY(0)+lineSize)
				.attr('stroke-width', 1)
				.attr('stroke','#777777');
			
		}
	},

	plotVerticalLine: function(percent){
		var self = this;

		var xPos = percent*self.diagramWidth;

		self.gGraphs.append('line')
			.attr('class', 'v-line')
			.attr('x1', xPos)
			.attr('y1', 0)
			.attr('x2', xPos)
			.attr('y2', self.diagramHeight)
			.attr('stroke-width', 1)
			.attr('stroke','#777777')
			//.attr('opacity', 0.6)
			.style("stroke-dasharray", ("1, 3"));
	},

	plotHorizontalLine: function(value){
		var self = this;

		self.gGraphs.append('line')
			.attr('class', 'h-line')
			.attr('x1', 0)
			.attr('y1', self.valueToY(value))
			.attr('x2', self.diagramWidth)
			.attr('y2', self.valueToY(value))
			.attr('stroke-width', 1)
			.attr('stroke','#777777')
			//.attr('opacity', 0.2);
			.style("stroke-dasharray", ("1, 3"));
	},

	update: function(data,time){
		var self = this;

		self.gGraphs.selectAll('line.h-line').remove();
		self.gGraphs.selectAll('line.v-line').remove();

		self.gGraphs.selectAll('path').each(function(d, i){
			var path = d3.select(this);

			var rawData = data[i];
			var pathPoints = [];

			for (var t = 0; t < rawData.length; t++){
				if (rawData[t] != null && !isNaN(rawData[t]) && rawData[t] < self.maxValue*2 && rawData[t] > self.minValue*2){
					pathPoints.push({
						x: self.diagramWidth/rawData.length * t,
						y: self.valueToY(rawData[t])
					});
				}
			}

			path.attr('d', pathDrawFunction(pathPoints));
		});

		if (time != undef){
			self.renderTimeLine(time);
		}
	},

	valueToY: function(value){
		var self = this;
		return self.diagramHeight-((value-self.minValue)/Math.abs(self.maxValue-self.minValue) * self.diagramHeight);
	}

});