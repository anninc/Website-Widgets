/*
 *	== ANN, Inc. SlideShow ==
 *	This plugin will take a custom JSON object as input and generate a
 *	swipe-able, accessible slideshow in the LOFT StyleCloset form.
 *
 *	@author Ryan Provost (ryan_provost@anninc.com)
 *	@created 2011-10-25
 */
(function($){
	$.fn.SlideShow = function(data) {

		/*
		 *	Data referencing
		 */
		var config		= data.config;
		var stylecloset	= data.sections;
		var tabIndex	= 1;

		/*
		 *	UI constraining
		 */
		$(this).css({
				"overflow":"hidden"
			}
		);

		/*
		 *	Create Timeline for All Pages - one big timeline
		 */
		var timeline	= Array();
		var parent		= "";

		// if a splash page has been defined, display that before any section pages
		if (config.splash) {
			var splash = config.splash;

			splash.parent	= "splash";
			splash.pageId	= 1;

			timeline.push(splash);
		}

		// loop through all the editorials
		$.each(stylecloset.section, function(index,section){

			// loop through all slides to create the timeline
			$.each(section.pages, function(index,page){

				// reset the page count if we're in a new editorial
				if (parent != section.id ) pageid = 1;

				// grab some info from the parent
				page.parent	= section.id;
				page.pageId	= pageid;
				page.arrows	= section.arrows;

				// add the slide to the timeline
				timeline.push(page);

				// set the parent for the next iteration
				parent = section.id;

				// increment the page count for the next iteration
				pageid++;
			});
		});


		/*
		 *	Build UI elements
		 */
		// create page viewer
		$(this).append('<div class="pages">');

		if (stylecloset.section.length > 1) {
			// create the navigation area
			$(this).append('<div class="sections">');
	
			// create the list area within the navigation area
			$(".sections").append('<div class="sectionList">');
	
			// create navigation objects
			$(this).append('<div class="nav section left">');
			$(this).append('<div class="nav section right">');
	
			// if there is navigation information, build what we can
			if (config.navigation) {
				// load the left section navigation arrow
				$(this).find(".nav.section.left").loadImage({
						"path"	: config.navigation.arrows.left.off,
						"over"	: config.navigation.arrows.left.over
					});
		
				// load the right section navigation arrow
				$(this).find(".nav.section.right").loadImage({
						"path"	: config.navigation.arrows.right.off,
						"over"	: config.navigation.arrows.right.over
					});
			}
		}

		// create navigation objects
		$(this).append('<div class="nav page left">');
		$(this).append('<div class="nav page right">');

		/*
		 *	Create the editorial navigation region (since this will be smaller, this needs to be built before the pages)
		 */
		$.each(stylecloset.section, function(index,section) {
				if (section.navigation) {
					// create the section
					$(".sections .sectionList").append('<div class="section">');

					setTimeout( function() { // stupid, stupid IE
						// load the section navigation image
						$(".sections .sectionList .section:nth-child("+(index+1)+")").loadImage({
							"path"	: section.navigation.image,
							"alt"	: section.navigation.alt,
							"title"	: section.navigation.title,
							"over"	: section.navigation.over
						});
		
						// maybe this should be in the loadImage plugin???
						$(".sections .sectionList .section:nth-child("+(index+1)+")").click(function(){
							window.location = "#"+section.id;
						});
					},1);
				}
			});


		/*
		 *	Create all the pages, but don't load the images — we only want to load the images that have or will be viewed (let's save some bandwidth for us and them)
		 */
		$.each(timeline, function(index,page){
			var pid		= index;
			var shift	= ($(".pages").width() * pid);

			$(".pages").append("<div class='page "+page.parent+" "+page.pageId+"'></div>");
	
			$(".pages .page."+page.parent+"."+page.pageId).css({
				"position":"absolute",
				"top":0,
				"left":shift
			});
	
			setTimeout( function() { // stupid, stupid IE
				// add a link so that all accessibility features work
				$(".pages").append('<a href="'+page.link+'" class="accessible '+page.parent+' '+page.pageId+'" tabindex="'+tabIndex+'" style="font-size:1pt;">'+page.alt+'</a>');
	
				// Make this seem like a link onHover — show a pointer instead of an arrow
				$(".pages .page."+page.parent+"."+page.pageId).hover().css({
					"cursor":"pointer"
				});
	
				// maybe this should be in the loadImage plugin???
				$(".pages .page."+page.parent+"."+page.pageId).click(function(){

					// REALLY STUPID IE BUG - FOR SOME REASON, ALL CLICKS ARE TRIGGERED REGARDLESS OF WHAT'S ON TOP!!!
					if ($.browser.msie && Number($.browser.version.split(".")[0]) < 9 ) {
						setTimeout( function() { // stupid, stupid IE
							window.location = page.link;
						},750);
					} else {
						window.location = page.link;
					}
				});
	
				// maybe this should be in the loadImage plugin???
				$(".pages .accessible."+page.parent+"."+page.pageId).focus(function(){
					window.location	= "#"+page.parent+":"+page.pageId;
					return false;
				});
	
				tabIndex++;
			},1);

			// if there is an imagemap specified, we need to build it, right?
			if (page.map) {
				setTimeout( function() { // stupid, stupid IE
					// build the image map
					map = '<map name="'+page.parent+page.pageId+'">';

					for(i=0;i<page.map.length;i++) {
						var mapClass	= 'class="area '+page.parent+' page' +index+' map'+i+'"';
						var mapShape	= 'shape="'+page.map[i].shape+'"';
						var mapCoords	= 'coords="'+page.map[i].coords+'"';
	
						if (page.map[i].link) {
							var mapHref = 'href="'+page.map[i].link+'"';
						} else {
							var mapHref = 'href="'+page.link+'"';
						}
						if (page.map[i].alt) var mapAlt = 'alt="'+page.map[i].alt+'"';
	
						map = map + '<area '+mapClass+' '+mapShape+' '+mapCoords+' '+mapHref+' '+mapAlt+' />';

						// add any hover actions
						if (page.map[i].hover) {
							var hover	= page.map[i].hover;
	
							// don't like the "onclick" there, but I don't feel like dealing with more IE bugs right now
							$(".pages").append('<img class="hover page'+index+' map'+i+'" src="'+hover.image+'" onclick="window.location=\''+page.link+'\';" />');
							$(".pages .hover.page"+index+".map"+i).css({
								"display"	:"none",
								"position"	:"absolute",
								"left"		: shift+Number(hover.left)+"px",
								"top"		: hover.top+"px"
							})
						}
	
					}
					map = map + '</map>';
	
					// add the map to the SlideShow DOM
					$(map).appendTo(".pages");
				},1);
			}
		});


			$(".pages").width($(this).width()*timeline.length);

		$(".area").live("click",function(){
			areaClicked = true;			
		});

		$(".area").live("mouseover",function(){
			var parent = $(this).attr("class").split(' ')[2];
			var area = $(this).attr("class").split(' ')[3];
			$(".pages .hover."+parent+"."+area).fadeIn("fast");
		});

		$(".area").live("mouseout",function(e){
			var parent = $(this).attr("class").split(' ')[2];
			var area = $(this).attr("class").split(' ')[3];

			// make sure we're not over the actual hover image - can't have things all wonky, can we?
			if (e.relatedTarget.className != "hover "+parent+" "+area) {
				$(".pages .hover."+parent+"."+area).fadeOut("fast");
			}
		});

		$(".pages").find("a").css({
				"position":"absolute",
				"top":"5px",
				"width":"1px",
				"height":"px",
				"font-size":"1pt",
				"opacity":"0",
				"z-index":"-1"
			});

		/*
		 *	Navigator Sliding (not relying on maxScrollDistance — need to clean this up and get it a bit more functional)
		 */
		// application derived variables
		var containerWidth			= $(".sections").width();
		var objectWidth				= $(".sections .sectionList .section").outerWidth(true);
		var numberOfObjects			= $(".sections .sectionList .section").length;
		var visibleObjects			= Math.ceil(containerWidth/objectWidth);
		var totalScrollableDistance	= numberOfObjects * objectWidth;
		var maxScrollDistance		= totalScrollableDistance-((visibleObjects-config.objectsToScroll)*objectWidth);
		var scrollDistance			= objectWidth * config.objectsToScroll;
	

		/*
		 *	Button controls
		 */
		// scroll navigation area left
		$(".nav.section.left").click(function(){
			// figure out where we're planning on scrolling to
			scrollLeft = $(".sections").scrollLeft() - scrollDistance;
		});
	
		// scroll navigation area right
		$(".nav.section.right").click(function(){
			// figure out where we're planning on scrolling to
			scrollLeft = $(".sections").scrollLeft() + scrollDistance;
		});

		$(".nav.section").click(function(){
			// reset opacity on the buttons
			$(".nav.section.left").css("opacity","1");
			$(".nav.section.right").css("opacity","1");

			// if scrolling left is not possible, dim the left arrow
			if ((scrollLeft-scrollDistance) < 0)
				$(".nav.section.left").css("opacity",".15");

			// if scrolling right is not possible, dim the right arrow
			if ((scrollLeft+scrollDistance) >= totalScrollableDistance)
				$(".nav.section.right").css("opacity",".15");

			// if we're within the scrollable area, animate
			if((scrollLeft < totalScrollableDistance) && (scrollLeft >= 0))
				$(".sections").animate({"scrollLeft":scrollLeft},config.scrollSpeed);

			return false;
		});


		// slide back a page
		$(".nav.page.left").click(function(){
			// update the url to fire the hash event (...and so all browser navigation works as expected)
			window.location = prevLink;

			// make sure the link does nothing other than what we just did
			return false;
		});

		// slide forward a page
		$(".nav.page.right").click(function(){
			// update the url to fire the hash event (...and so all browser navigation works as expected)
			window.location = nextLink;

			// make sure the link does nothing other than what we just did
			return false;
		});

		// we'll treat swipe events as buttons
		$(".pages").wipetouch({
			// slide to the next page
			wipeLeft: function(result) { window.location = nextLink },

			// slide to the previous page
			wipeRight: function(result) { window.location = prevLink }
		});

		// we'll treat swipe events as buttons
		$(".sections").wipetouch({
			// slide to the next page
			wipeLeft: function(result) { 
				var scrollLeft = $(".sections").scrollLeft() + scrollDistance;
	
				if (scrollLeft < totalScrollableDistance)
					$(".sections").animate({"scrollLeft":scrollLeft},config.scrollSpeed);
			},

			// slide to the previous page
			wipeRight: function(result) { 
				var scrollLeft = $(".sections").scrollLeft() - scrollDistance;
				$(".sections").animate({"scrollLeft":scrollLeft},config.scrollSpeed);
			}
		});


		/*
		 *	EVERYTHING NEEDS TO BE EVENT DRIVEN - RUN EVERYTHING THROUGH THIS
		 */
		$(window).hashchange(function(){
			var hash		= location.hash.substr(1);
			var section		= hash.split(":")[0];
			var page		= hash.split(":")[1];
			var position	= 0;

			// set a default value for the section
			if(section.length==0) {
				section = timeline[0].parent;
				if (config.splash)
					section = timeline[0].parent;
			}

			// set a default value for the page id
			if(page==undefined) page = 1;

			// make sure that an initial hash is set
			if((hash.split(":")[0].length==0) && (hash.split(":")[1]==undefined)) {
				window.location = "#"+section+":"+page;
			}

			// calculate previous and next page position
			$(timeline).each(function(index,event){
				if(event.parent == section && event.pageId == page) position = index;
			});

			// if position is valid, build previous link
			if ((position-1) >= 0 ) prevLink = "#"+timeline[position-1].parent+":"+timeline[position-1].pageId;

			// if position is valid, build next link
			if ((position+1) < timeline.length) nextLink = "#"+timeline[position+1].parent+":"+timeline[position+1].pageId;

			// calculate how far we need to shift the pages to display the correct page
			var shift = $(".pages").find(".page."+section+"."+page).css("left");

			// load the requested image — but only when requested
			$(".pages").find(".page."+section+"."+page).loadImage({
				"path"		: timeline[position].image
			});

			// add the image map if one has been defined
			if (timeline[position].map)
				$(".pages").find(".page."+section+"."+page).find(".display").attr("usemap","#"+timeline[position].parent+timeline[position].pageId);

			// make sure the next image is loaded
			if ((position+1) < timeline.length) {
				$(".page."+timeline[position+1].parent+"."+timeline[position+1].pageId).loadImage({
					"path"		: timeline[position+1].image
				});
			}

			// make sure the previous image is loaded
			if ((position-1) >= 0 ) {
				$(".page."+timeline[position-1].parent+"."+timeline[position-1].pageId).loadImage({
					"path"		: timeline[position-1].image
				});
			}

			// shift the pages to display the selected page (once we've triggered the image to load, of course)
			$(".pages").animate({"right":shift},500);


			// set the inactive arrow opacity
			var opacity = "0.25";	 // default opacity for an inactive arrow
			if (timeline[position].arrows.left.inactiveOpacity) opacity = timeline[position].arrows.left.inactiveOpacity;

			// set the left-bound arrow display
			$(".page.nav.left").css({"opacity":opacity});
			$(".page.nav.left").loadImage({
					"path"	: timeline[position].arrows.left.off,
					"over"	: timeline[position].arrows.left.over
				});
			if ((position-1) >= 0 ) $(".page.nav.left").css({"opacity":"1"});


			// set the right-bound arrow display
			$(".page.nav.right").css({"opacity":opacity});
			$(".page.nav.right").loadImage({
					"path"	: timeline[position].arrows.right.off,
					"over"	: timeline[position].arrows.right.over
				});
			if ((position+1) < timeline.length) $(".page.nav.right").css({"opacity":"1"});
		});

		// trigger a hashchange event when the page is initially loaded to set state properly
		$(window).hashchange();
	}
})(jQuery);

