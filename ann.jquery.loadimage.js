/*!
 *	== LOADIMAGE ==
 *	This plugin will load an image into a container div.  It will
 *	display a "loader" image while the primary images loads.
 *
 *	== INPUT OPTIONS ==
 *	(string) loader		URL to the loader image
 *	(string) url		URL to the display image
 *	(string) over		URL to the over state for the display image
 *	(int) speed			the speed, in milliseconds, the fadeIn/fadeOut mouse events must take
 *	(string) alt		ALT tag value for the display image
 *	(string) title		TITLE tag value for the display image
 *
 *	@author Ryan Provost (ryan_provost@anninc.com)
 *	@created 2011-11-29
 */
(function( $ ){
	$.fn.loadImage = function(options) {
		// set context variable
		var frame	= this;

		// we shouldn't reload an image, right???
		if(this.find(".display").attr("src") != options.path) {
	
			// clear things out if this is called again on the same div
			this.html("");
	
			// make sure this thing displays everything properly
			this.css({
				"overflow"	: "hidden"		// make sure things don't break the box
			});
	
			// default settings
			var settings = {
				"loader"	: "http://upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif",
				"speed"		: 150
			};
	
			// add/merge settings
			if (options)
				$.extend(settings,options );

			// create the display image div
			this.append("<img class='loadImage display' />");
	
			// create the loader image div
			this.append("<img class='loadImage loader' src='"+settings.loader+"'/>");
	
			// set the "title" tag for the display image
			if (settings.title !== undefined)
				this.find(".display").attr("title",settings.title);
	
			// set the "alt" tag for the display image
			if (settings.alt !== undefined)
				this.find(".display").attr("alt",settings.alt);
	
			// we need to hide the display image because we want it to display when it's completely loaded
			this.find(".display").hide();
	
			// position the loader image so that it's centered over the image
			//	Note: need to make more accurate by getting dimensions for loader itself
			this.find(".loader").css({
				"position"	: "absolute",
				"top"		: ((this.height()/2)-16),	// i don't like that the height of the loader isn't being programmatically calculated
				"left"		: ((this.width()/2)-16),	// i don't like that the width of the loader isn't being programmatically calculated
				"z-index"	: 2
			});
	
			// load the image
			this.find(".display").attr("src",settings.path).load(function(){
	
				// hide the loader when the display image is ready to be rendered
				frame.find(".loader").hide();
	
				// render the display image
				frame.find(".display").show();
			});
	
			// did the user request mouse-overs for the image — let's handle them
			if (settings.over !== undefined && settings.over.length > 0) {
	
				// create the over image div
				this.append("<img class='loadImage over' src='"+settings.over+"'/>");
	
				// position the over image so that it's layered over the display image
				this.find(".over").css({
					"position"	: "absolute",
					"cursor"	: "pointer",
					"top"		: 0,
					"left"		: 0,
					"z-index"	: 1
				});
	
				// we need to hide this image because, chances are, nobody has moused over this yet
				this.find(".over").hide();
	
				// we've been moused-over, let's show them the over image instead of the display image
				this.find(".display").mouseenter(function(){
					frame.find(".over").fadeIn(settings.speed);
				});
	
				// they've moused out — let's get them back to the correct display image
				this.find(".over").mouseleave(function(){
					frame.find(".over").fadeOut(settings.speed);
				});
	
			}
		}

		return this;

	};
})( jQuery );