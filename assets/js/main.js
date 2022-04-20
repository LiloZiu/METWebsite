(function($) {

	var	$window = $(window),
		$body = $('body'),
		$sidebar = $('#sidebar'),
		$mobileheader = $('#mobile-header')
	;
	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ null,      '480px'  ]
		});

	// Hack: Enable IE flexbox workarounds.
		if (browser.name == 'ie')
			$body.addClass('is-ie');

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Forms.

		// Hack: Activate non-input submits.
			$('form').on('click', '.submit', function(event) {

				// Stop propagation, default.
					event.stopPropagation();
					event.preventDefault();

				// Submit form.
					$(this).parents('form').submit();

			});

	// Sidebar.
		if ($sidebar.length > 0) {

			var $sidebar_a = $sidebar.find('a');

			$sidebar_a
				.addClass('scrolly')
				.on('click', function() {

					var $this = $(this);

					// External link? Bail.
						if ($this.attr('href').charAt(0) != '#')
							return;

					// Deactivate all links.
						$sidebar_a.removeClass('active');

					// Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
						$this
							.addClass('active')
							.addClass('active-locked');

				})
				.each(function() {

					var	$this = $(this),
						id = $this.attr('href'),
						$section = $(id);

					// No section for this link? Bail.
						if ($section.length < 1)
							return;

					// Scrollex.
						$section.scrollex({
							mode: 'middle',
							top: '-20vh',
							bottom: '-20vh',
							initialize: function() {

								// Deactivate section.
									$section.addClass('inactive');

							},
							enter: function() {

								// Activate section.
									$section.removeClass('inactive');

								// No locked links? Deactivate all links and activate this section's one.
									if ($sidebar_a.filter('.active-locked').length == 0) {

										$sidebar_a.removeClass('active');
										$this.addClass('active');

									}

								// Otherwise, if this section's link is the one that's locked, unlock it.
									else if ($this.hasClass('active-locked'))
										$this.removeClass('active-locked');

							}
						});

				});

		}

	// Scrolly.
		$('.scrolly').scrolly({
			speed: 1000,
			offset: function() {

				// If <=large, >small, and sidebar is present, use its height as the offset.
					if (breakpoints.active('<=large')
					&&	!breakpoints.active('<=small')
					&&	$sidebar.length > 0)
						return $sidebar.height();

				return 0;

			}
		});

	// Spotlights.
		$('.spotlights > section')
			.scrollex({
				mode: 'middle',
				top: '-10vh',
				bottom: '-10vh',
				initialize: function() {

					// Deactivate section.
						$(this).addClass('inactive');

				},
				enter: function() {

					// Activate section.
						$(this).removeClass('inactive');

				}
			})
			.each(function() {

				var	$this = $(this),
					$image = $this.find('.image'),
					$img = $image.find('img'),
					x;

				// Assign image.
					$image.css('background-image', 'url(' + $img.attr('src') + ')');

				// Set background position.
					if (x = $img.data('position'))
						$image.css('background-position', x);

				// Hide <img>.
					$img.hide();

			});

	// Features.
		$('.features')
			.scrollex({
				mode: 'middle',
				top: '-20vh',
				bottom: '-20vh',
				initialize: function() {

					// Deactivate section.
						$(this).addClass('inactive');

				},
				enter: function() {

					// Activate section.
						$(this).removeClass('inactive');

				}
			});
	// Mobile Header.
	if ($body.length > 0
		&&	$mobileheader.hasClass('alt')) {

		$window.on('resize', function() {
			$window.trigger('scroll');
		});

		$window.on('load', function() {

			$banner.scrollex({
				bottom:		$mobileheader.height() + 10,
				terminate:	function() { $mobileheader.removeClass('alt'); },
				enter:		function() { $mobileheader.addClass('alt'); },
				leave:		function() { $mobileheader.removeClass('alt'); $mobileheader.addClass('reveal'); }
			});

			window.setTimeout(function() {
				$window.triggerHandler('scroll');
			}, 100);

		});

	}
	// Menu.
	var $mobilemenu = $('#mobile-menu'),
		$mobilemenuInner;

	$mobilemenu.wrapInner('<div class="inner"></div>');
	$mobilemenuInner = $mobilemenu.children('.inner');
	$mobilemenu._locked = false;

	$mobilemenu._lock = function() {

		if ($mobilemenu._locked)
			return false;

		$mobilemenu._locked = true;

		window.setTimeout(function() {
			$mobilemenu._locked = false;
		}, 350);

		return true;

	};

	$mobilemenu._show = function() {

		if ($mobilemenu._lock())
			$body.addClass('is-menu-visible');

	};

	$mobilemenu._hide = function() {

		if ($mobilemenu._lock())
			$mobilebody.removeClass('is-menu-visible');

	};

	$mobilemenu._toggle = function() {

		if ($mobilemenu._lock())
			$body.toggleClass('is-menu-visible');

	};

	$mobilemenuInner
		.on('click', function(event) {
			event.stopPropagation();
		})
		.on('click', 'a', function(event) {

			var href = $(this).attr('href');

			event.preventDefault();
			event.stopPropagation();

			// Hide.
			$mobilemenu._hide();

			// Redirect.
			window.setTimeout(function() {
				window.location.href = href;
			}, 250);

		});

	$mobilemenu
		.appendTo($body)
		.on('click', function(event) {

			event.stopPropagation();
			event.preventDefault();

			$body.removeClass('is-menu-visible');

		})
		.append('<a class="close" href="#mobile-menu">Close</a>');

	$body
		.on('click', 'a[href="#mobile-menu"]', function(event) {

			event.stopPropagation();
			event.preventDefault();

			// Toggle.
			$mobilemenu._toggle();

		})
		.on('click', function(event) {

			// Hide.
			$mobilemenu._hide();

		})
		.on('keydown', function(event) {

			// Hide on escape.
			if (event.keyCode == 27)
				$mobilemenu._hide();

		});

})(jQuery);

//Sidebar submenus
jQuery(document).ready(function(){
	jQuery('ul.sf-menu').superfish({
		animation: {height:'show'},	// slide-down effect without fade-in
		delay:		 0.2			// 0.2 second delay on mouseout
	});
});

//Sidebar width toggle
function toggleSidebarwidth(event) {
	mouseinelement=event.offsetX<document.getElementById("sidebar").offsetWidth
	if (mouseinelement) {
		document.getElementById("sidebar").style.width = "38em";
	} else {
		document.getElementById("sidebar").style.width = "16em";
	}
}

function collapseSidebar(event){
	document.getElementById("sidebar").style.width="16em"
}

//Svg draw
function draw() {
	document.getElementById("Layer_1").classList.add('active')
}

setTimeout(draw, 3000)

// Menu.
var $mobilemenu = $('#mobile-menu'),
	$mobilemenuInner;

$mobilemenu.wrapInner('<div class="inner"></div>');
$mobilemenuInner = $mobilemenu.children('.inner');
$mobilemenu._locked = false;

$mobilemenu._lock = function() {

	if ($mobilemenu._locked)
		return false;

	$mobilemenu._locked = true;

	window.setTimeout(function() {
		$mobilemenu._locked = false;
	}, 350);

	return true;

};

$mobilemenu._show = function() {

	if ($mobilemenu._lock())
		$body.addClass('is-menu-visible');

};

$mobilemenu._hide = function() {

	if ($mobilemenu._lock())
		$mobilebody.removeClass('is-menu-visible');

};

$mobilemenu._toggle = function() {

	if ($mobilemenu._lock())
		$body.toggleClass('is-menu-visible');

};

$mobilemenuInner
	.on('click', function(event) {
		event.stopPropagation();
	})
	.on('click', 'a', function(event) {

		var href = $(this).attr('href');

		event.preventDefault();
		event.stopPropagation();

		// Hide.
		$mobilemenu._hide();

		// Redirect.
		window.setTimeout(function() {
			window.location.href = href;
		}, 250);

	});

$mobilemenu
	.appendTo($body)
	.on('click', function(event) {

		event.stopPropagation();
		event.preventDefault();

		$body.removeClass('is-menu-visible');

	})
	.append('<a class="close" href="#mobile-menu">Close</a>');

$body
	.on('click', 'a[href="#mobile-menu"]', function(event) {

		event.stopPropagation();
		event.preventDefault();

		// Toggle.
		$mobilemenu._toggle();

	})
	.on('click', function(event) {

		// Hide.
		$mobilemenu._hide();

	})
	.on('keydown', function(event) {

		// Hide on escape.
		if (event.keyCode == 27)
			$mobilemenu._hide();

	});

