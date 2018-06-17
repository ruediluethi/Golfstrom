var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

require('jquery-ui/draggable');

module.exports = Backbone.View.extend({

	className: 'v-slider',

	title: 'untitled',
	color: '#444444',
	minValue: 0.1,
	maxValue: 5,
	value: 1,

	initialize: function(options) {
		var self = this;

		if (options != undef){
			self.title = options.title;
			if (options.color != undef){
				self.color = options.color;
			}
		}
	},


	render: function(){
		var self = this;

		self.$el.html(templates['valueslider']({
			title: self.title,
			color: self.color
		}));
		self.initDragNDrop();

		return self;
	},

	initDragNDrop: function(){
		var self = this;

		self.$el.find('.v-slider-dot').draggable({
			containment: 'parent',
			drag: function(e, ui) {

				if (self.value != self.getValue()){

					self.value = self.getValue();

					self.$el.find('.v-slider-value').html(Math.round(self.value*10)/10);
					self.trigger('valueHasChanged');
				}
			},
		});
	},

	getValue: function(){
		var self = this;

		var pos = self.$el.find('.v-slider-dot').position().left;

		self.$el.find('.v-slider-bar').css({
			width: pos
		});

		pos = pos/(self.$el.find('.v-slider-container').width()-self.$el.find('.v-slider-dot').width());
		pos = pos*Math.abs(self.maxValue - self.minValue)+self.minValue;
		
		return Math.round(pos*10)/10;
	},


	setValue: function(newValue){
		var self = this;

		self.value = newValue;
		self.$el.find('.v-slider-value').html(Math.round(self.value*10)/10);

		var pos = (self.value - self.minValue)/Math.abs(self.maxValue - self.minValue);
		pos = pos*(self.$el.find('.v-slider-container').width()-self.$el.find('.v-slider-dot').width());
		self.$el.find('.v-slider-dot').css({
			left: Math.round(pos)
		});
		self.$el.find('.v-slider-bar').css({
			width: Math.ceil(pos)+self.$el.find('.v-slider-dot').width()/2
		});
	},

	animateToValue: function(newValue){
		var self = this;

		
	}

});