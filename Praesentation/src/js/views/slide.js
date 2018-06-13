var undef;
var Backbone = require('backbone');
var $ = jQuery = require('jquery');
Backbone.$ = $;

module.exports = Backbone.View.extend({

	className: 'slide',

	template: 'empty',

	initialize: function(options) {
		var self = this;

		if (options != undef){
			self.template = options.template;
		}
	},

	render: function(){
		var self = this;

		self.$el.html(templates[self.template]({ }));

		return self.$el;
	}

});