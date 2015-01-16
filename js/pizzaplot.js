

// incorporate this into plugin
var waitForFinalEvent = (function () {
	var timers = {};
	return function (callback, ms, uniqueId) {
		if (!uniqueId) {
			uniqueId = "Don't call this twice without a uniqueId";
		}
		if (timers[uniqueId]) {
			clearTimeout (timers[uniqueId]);
		}
		timers[uniqueId] = setTimeout(callback, ms);
	};
})();

/*
 * Pizza Plot - v0.1.0 - 2015-01-16
 * https://github.com/JonCatmull/PizzaPlot
 *
 * Copyright (c) 2015 Jonathan Catmull
 * Licensed under the MIT license.
 */
(function ($) {
	$.fn.PizzaPlot = function (custom) {

		var $this = $(this);

		// Default plugin settings
		var defaults = {
			container : $this.offsetParent(),
			originX : 'center',
			originY : 'center',
			angleStart : 0,
			angleRange : 360,
			radius : '100%', // can be either percentage or px value (if pixel and responsive then radius will shrink to keep elements within container)
			maxRadius : '100%', // only 100% supported atm
			contain: true,
			responsive : true,
			delay: 200, // delay in ms between plotting elements
			activeClass: 'plotted',
			onPlot : function() {},
			debug   : false
		};

		// Merge default and user settings
		var settings;

		var methods = {
		  	init: function() {
				settings = $.extend({}, defaults, custom);

				methods.debug('Initialize Circle Plot');
				methods.debug($this.length+' elements matched');

				settings.angleIncrement = settings.angleRange / ((settings.angleRange == 360) ? $this.length : $this.length - 1); // if 360 don't add one so last and first elements don't overlap
				if (settings.maxRadius == '100%') {
					settings.maxRadius = ((settings.container.innerHeight()>=settings.container.innerWidth()) ? settings.container.innerWidth() : settings.container.innerHeight()) / 2;
				}
				methods.validateOrigin();
				settings.radius = parseInt(methods.validateRadius(settings.radius));

				$this.each(function(i,el){
					setTimeout(function(){
						methods.plot($(el), ((settings.angleIncrement*i)+settings.angleStart));
						if (settings.activeClass) {
							$(el).addClass(settings.activeClass);
						}
					},settings.delay*i);
			  	});
			  	settings.delay = 0;
		  	},
		  	validateInput: function(val,max) {
		  		methods.debug('validate: '+val+' max: '+max);
				if (typeof val === 'number') {
		  			methods.debug('number');
		  			val = val;
		  		}
		  		else if (typeof val === 'string') {
		  			methods.debug('string');

		  			switch (val) {
	  					case 'top':
	  					case 'left':
		  					methods.debug('top or left');
	  						val = 0;
	  					break;
	  					case 'center':
		  					methods.debug('center');
	  						val = max / 2;
	  					break;
	  					case 'bottom':
	  					case 'right':
		  					methods.debug('bottom or right');
	  						val = max;
	  					break;
	  					default:
				  			var regex = /(\d+)(%|px)/;
				  			var replaced = val.search(regex) >= 0;
							if (replaced){
					  			val = parseInt(val.replace(regex, function (_, value, unit) {
					  				switch (unit) {
					  					case '%':
					  						methods.debug('percentage');
					  						return (value / 100) * max;
					  					break;
					  					case 'px':
					  						methods.debug('pixels');
					  						return value;
					  					break;
					  				}
								}));
					  		}
					  		else
					  		{
					  			console.error('Radius ("'+val+'") not recognised - default used');
				  				val = max;
					  		}
	  					break;
	  				}
		  		}
		  		else
		  		{
		  			console.error('Radius ('+val+') not recognised - default used');
		  			val = max;
		  		}
		  		methods.debug('post validation val: '+val);
		  		return val;
		  	},
		  	validateOrigin: function() {
				methods.debug('validate originX');
				settings.originX = methods.validateInput(settings.originX,settings.container.innerWidth());
				methods.debug('validate originY');
				settings.originY = methods.validateInput(settings.originY,settings.container.innerHeight());
		  	},
		  	validateRadius: function(radius) {
		  		methods.debug('validate radius');
		  		var outRadius = methods.validateInput(radius,settings.maxRadius);

			    if (settings.contain) {
			    	console.log(typeof outRadius);
			    	console.log(typeof ($this.first().outerWidth()/2));
				    var diffX = settings.maxRadius - (outRadius + ($this.first().outerWidth()/2));
				    methods.debug(diffX);
				    if (diffX < 0)
				    {
				    	outRadius = outRadius + diffX;
				    }
				    var diffY = settings.maxRadius - (outRadius + ($this.first().outerHeight()/2));
				    methods.debug(diffY);
				    if (diffY < 0)
				    {
				    	outRadius = outRadius + diffY;
				    }
				}

		  		return parseInt(outRadius);
		  	},
		  	plot: function(obj, angle) {

			    var rad=(angle-90)*Math.PI/180;
			    var dx = Math.cos(rad)*settings.radius;
			    var dy = Math.sin(rad)*settings.radius;
			    var xpos = (settings.originX+dx)-(obj.outerWidth()/2);
			    var ypos = (settings.originY+dy)-(obj.outerHeight()/2);
			    
			    settings.onPlot(obj, angle);

			    obj.css({ 
			        position: 'absolute',
			        top: ypos+'px', left: xpos+'px'
			    });
			},
			debug: function(message) {
				if (settings.debug && typeof console !== 'undefined' && typeof console.debug !== 'undefined') {
					console.debug(message);
				}
		  	}
		};

		methods.init(); // Initialization

		if(settings.responsive) {
			$(window).resize(function () {
			    methods.debug('resize called');
			    waitForFinalEvent(function(){
			    	methods.debug('resize run');
			    	methods.init();
			    }, 200, "plot-circle");
			});
		}

		return $this;

	};
})(jQuery);
