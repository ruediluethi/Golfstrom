var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

module.exports = Backbone.View.extend({

	className: 'slide',

	template: 'empty',
	colors: undef,

	initialize: function(options) {
		var self = this;

		if (options != undef){
			self.template = options.template;
			self.colors = options.colors;
		}
	},

	render: function(){
		var self = this;

		self.$el.html(templates[self.template]({ colors: self.colors }));

		return self.$el;
	}, 

	resize: function(){
		var self = this;

		var imgSize = $('#slides-container').height() - $('#navigation').height() - self.$el.height();

		self.$el.find('img').css({
			maxHeight: imgSize,
			maxWidth: '100%',
			width: 'auto',
			height: 'auto'
		});

		self.$el.find('img').fadeIn(200);
	}

});