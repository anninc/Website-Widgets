(function($){
	$.fn.GiftGuide = function(url) {
		// need to make sure we can get this from anywhere in here
		var giftguide	= this;
		var available	= new Array();
		var firstRun	= true;
		var interval	= 0;
		var prevLink	= "#";
		var nextLink	= "#";
		var stories;
		var previousStory;

		// make sure all of our absolute positions will be placed correctly within the div
		$(this).css({
			"position":"relative"
		});

		// a div to contain the design elements reaching outside of the container
		$(this).wrap('<div class="'+this.attr("class")+' wrapper"></div>');

		// adjust the wrapper to accomodate what we need outside our container
		$(this).parent().css({
			"position"	: "relative",
			"height"	: $(giftguide).height(),
			"width"		: ($(giftguide).width()+40)
		});


		/*
		 *	Get the configuration JSON object
		 */
		$.getJSON(url,function(json) {
			// localize the object a bit
			stories = json.stories;


			/*
			 *	Create the WhiteWash div
			 */
			// add whitewash div
			$(giftguide).append('<div class="whitewash"><img src="'+stories.whitewash+'"></div>');

			// position the whitewash
			$(giftguide).find(".whitewash").css({
				"display"	: "none",
				"position"	: "absolute",
				"top"		: "0",
				"left"		: "-978",						// should be gathered programmatically
				"width"		: "1956",						// should be gathered programmatically
				"height"	: $(giftguide).height()
			});


			/*
			 *	Creating the Navigation Frame
			 */
			// add navigation frame
			$(giftguide).parent().append('<div class="navigation"><img src="'+json.navigation.header+'"/></div>');
			$(giftguide).parent().append('<img class="nav tab" src="'+json.navigation.tabs.left+'" />');

			// add left arrow
			$(giftguide).parent().append('<div class="left arrow"><img src="'+json.navigation.arrows.left+'"/></div>');
			$(giftguide).parent().append('<img class="left tab" src="'+json.navigation.tabs.left+'" />');

			// add right arrow
			$(giftguide).parent().append('<div class="right arrow"><img src="'+json.navigation.arrows.right+'"/></div>');
			$(giftguide).parent().append('<img class="right tab" src="'+json.navigation.tabs.right+'" />');

			
			/*
			 *	Create the Splash Page (if one exists)
			 */
			if (json.splash) $(giftguide).append('<div class="story splash"></div>');
			$(giftguide+".story.splash").click(function(){
				window.location = json.splash.link;
			});

			/*
			 *	Let's Get Each Story Built Out
			 */
			$.each(stories.story,function(index,story){

				// create the story page
				$(giftguide).append('<div class="story '+story.id+'"></div>');

				// style the story - including adding the background image
				$(giftguide+".story."+story.id).css({
					"background-image" : "url("+story.background+")"
				});

				$(giftguide+".story."+story.id).click(function(){
					window.location = story.link;
				});

				// and navigation links
				$(giftguide).parent().find(".navigation").append('<a class="link '+story.id+'" href="#">'+story.title+' &nbsp;&rsaquo;</a><br/>');

				/*
				 *	With each story comes Story Elements, let's get them built out now
				 */
				$.each(story.elements,function(index,element){
					setTimeout( function() {
					
						// create the element
						$(giftguide+".story."+story.id).append('<img class="article '+index+'" src="'+element.image+'">');
						
						// position the element
						$(giftguide+".story."+story.id).find(".article."+index).css({
							"display"	: "none",
							"position"	: "absolute",
							"top"		: element.top+"px",
							"left"		: element.left+"px",
							"z-index"	: element.layer
						});
						
						$(giftguide+".story."+story.id).find(".article."+index).mouseover(function(){
							$(giftguide+".story."+story.id).find(".tag."+index).fadeIn();
						});

						$(giftguide+".story."+story.id).find(".article."+index).mouseout(function(){
							$(giftguide+".story."+story.id).find(".tag."+index).fadeOut();
						});

					},1);  // stupid, stupid IE


					/*
					 *	With each Element comes tags, right? Let's get them built out
					 */
					if(element.tag) {
						var title	= element.tag.text.split("|")[0];
						var copy	= element.tag.text.split("|")[1];

						if (copy == undefined) copy = ""; // don't like this

						// create the tag
						$(giftguide+".story."+story.id).append('<div class="tag '+index+'"><div class="title">'+title+'</div>'+copy+'</div>');
	
						// position the tag
						$(giftguide+".story."+story.id).find(".tag."+index).css({
							"display"	: "none",
							"position"	: "absolute",
							"top"		: element.tag.top+"px",
							"left"		: element.tag.left+"px",
							"width"		: element.tag.width,
							"z-index"	: (element.layer+1)
						});
					}
				});
			});


			/*
			 *	Build the Splash Page
			 */
			// localize the configuration for easier accessibility
			var config = json.splash.config;

			// create all the boxes for the images to be dropped into
			$(giftguide+".story.splash").append('<div class="images"></div>');
			$(giftguide+".story.splash .images").append('<div class="welcome"><img src="'+config.path+json.splash.text+'" /></div>');

			// create all the boxes for the images to be dropped into
			for (i=1;i<config.positions;i++) {
				setTimeout( function() {
					$(giftguide+".story.splash .images").append('<div class="image"></div>');

					var image = Math.floor(Math.random()*(config.images-1))+1;

					$(giftguide+".story.splash .image:last-child").html('<img src="'+config.path+image+'.jpg" />');
				},1);  // stupid, stupid IE
				available.push(i);
			}

			// make them appear and then *sparkle* once they're all in
			interval = setInterval(function(){splashSparkle(config);},1);


			/*
			 *	Set Actions for Buttons
			 */
			$(giftguide).parent().find(".link").click(function(){
				var story = $(this).attr("class").split(" ")[1];
				window.location = "#"+story;
				return false;
			});


			/*
			 *	Handle Events - all one of them
			 */
			$(window).hashchange(function(){
				var hash = location.hash.substr(1);
				if (hash.length==0) window.location = "#splash";


				var position = 0;
				$.each(stories.story,function(index,story){
					if(story.id == hash) position = index;
				});

				// calculate previous link
				if (position-1 < 0) {
					prevLink = "#splash";
				} else {
					prevLink = "#"+stories.story[position-1].id;
				}

				// calculate next link
				if(hash == "splash"){
					nextLink = "#"+stories.story[0].id;
				} else if (position+1 < stories.story.length) {
					nextLink = "#"+stories.story[position+1].id;
				}

				// set next link action
				$(giftguide).parent().find(".arrow.right").click(function(){
					window.location = nextLink;
				});

				// set previous link action
				$(giftguide).parent().find(".arrow.left").click(function(){
					window.location = prevLink;
				});

				setPage(hash);
			});

			// force an initial hashchange event to get the ball rolling	
			$(window).hashchange();


			/*
			 *
			 */
			function setPage(story) {
				var story = story;

				$.each(stories.story,function(index){
					if(stories.story[index].id == story)
						story = stories.story[index];
				});

				/*
				 *	Navigation Display
				 *
				 *	Note: I DON'T LIKE THIS _AT_ ALL!!!  I don't have time to clean this up (like a
				 *		  lot of the other ugly code in here), I just needed it working
				 *
				 *	(I like this a _little_ better now that the colors are abstracted out of here)
				 */
				$(giftguide).parent().find(".navigation .link:not(."+story.id+")").css("color",json.navigation.colors.off);
				$(giftguide).parent().find(".navigation .link:not(."+story.id+")").hover(function(){$(this).css("color",json.navigation.colors.on);});
				$(giftguide).parent().find(".navigation .link:not(."+story.id+")").mouseout(function(){$(this).css("color",json.navigation.colors.off);});

				$(giftguide).parent().find(".navigation .link."+story.id).hover(function(){$(this).css("color",json.navigation.colors.on);});
				$(giftguide).parent().find(".navigation .link."+story.id).mouseout(function(){$(this).css("color",json.navigation.colors.on);});
				$(giftguide).parent().find(".navigation .link."+story.id).css("color",json.navigation.colors.on);


				/*
				 *	Animations
				 */
				// make sure the current story is properly hidden
				var timeout = 0;
				if (previousStory) {

					// fade the splash page out
					if (previousStory === "splash") {
						// get the time to fade the splash page out
						var duration = json.splash.config.duration;

						// fade the splash page out
						$(".story.splash").fadeOut(duration);

						// set the timeout to begin fading in the next page
						timeout = Number(duration) * .8;

					// fade all non-splash pages out
					} else {
						// find the total animation time
						$.each(previousStory.elements,function(index,element){
							var total = Number(element.animation.delay) + Number(element.animation.duration);
							if ( timeout < total )
								timeout = total ;
						});
	
						// fade things out according to the reverse order
						$.each(previousStory.elements,function(index,element){
							var delay = timeout - (Number(element.animation.delay) + Number(element.animation.duration));
	
							$(giftguide+".story.visible").find(".article."+index).delay(delay).fadeOut(element.animation.duration);
							//$(giftguide+".story.visible").find(".tag."+index).delay(delay).fadeOut(element.animation.duration);
						});
		
						// hide the background
						$(giftguide+".story.visible").delay(timeout-Number(previousStory.animation.delay)).fadeOut(previousStory.animation.duration,"linear");
	
						// add the story fadeout time to the duration
						timeout = timeout + (Number(previousStory.animation.duration)*.8);
					}
	
					// remove previous story from visible status
					$(giftguide+".story.visible").toggleClass("visible");
				}

				setTimeout(function(){

					// make the new story visible
					if (story == "splash") {
						$(".story.splash").fadeIn();
						$(".story."+story.id).toggleClass("visible");

						previousStory = "splash";
					} else {
						$(".story."+story.id).fadeIn(story.animation.duration,"linear");
						$(".story."+story.id).toggleClass("visible");
		
						// fade it in
						$.each(story.elements,function(index,element){
							$(giftguide+".story.visible").find(".article."+index).delay(element.animation.delay).fadeIn(element.animation.speed);
							//$(giftguide+".story.visible").find(".tag."+index).delay(element.animation.delay).fadeIn(element.animation.speed);
						});
					}
				},timeout);

				// make sure we know what story to fade out next time a story changes
				previousStory = story;
			}
		});
	
		function splashSparkle(config) {
			// select an image from the array at random
			var image		= Math.floor(Math.random()*(config.images-1))+1;

			// select a position in the grid at random
			var position	= Math.floor(Math.random()*(available.length));

			if (available.length===0 && firstRun) {
				// we've populated everything, we're now in the secondRun or subsequent
				firstRun = false;

				// we've populated every location, we can slow down! clear out the existing interval
				clearInterval(interval);

				// slow down the animation a bit to what we've gotten in the configuration file
				interval = setInterval(function(){splashSparkle(config);},config.speed);
			}

			// once we've run through all the available slots, run through them again
			if (available.length===0) for (i=1;i<config.positions;i++) available.push(i);

			// update the div with the latest image
			$(giftguide+".story.splash .image:nth-child("+available[position]+")").html('<img width="50" height="45" src="'+config.path+image+'.jpg" />');

			// fade the image in rather than just displaying it — makes things a little softer
			$(giftguide+".story.splash .image:nth-child("+available[position]+")").find("img").fadeIn(config.fade);

			// remove the rendered image from the available list (don't want to use it again)
			available.splice(position,1);
		}

	}
})(jQuery);
