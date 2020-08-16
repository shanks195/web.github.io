const ResOwlSlider = () => {
	$('.owl-carousel').each(function () {
		var owl = $(this),
			responsive = owl.attr('data-res'),
			paramowl = owl.attr('paramowl');
		if (!paramowl) paramowl = '';

		if (!responsive) {
			responsive = '1,1,1,1';
		}
		responsive = responsive.split(',');

		owl.imagesLoaded(function () {
			itemOwl(owl, responsive, paramowl);
		});
	});
};

const itemOwl = (owl, responsive, paramowl) => {
	var autospeed = 5000,
		margin = 0,
		dataout,
		datain,
		dotsContainer,
		navContainer;

	var owlArray = paramowl.split('||');
	$.each(owlArray, function (index, value) {
		var value = value.split('=');
		if (value[0] == 'autospeed') autospeed = parseInt(value[1]);
		else if (value[0] == 'out') dataout = value[1];
		else if (value[0] == 'in') datain = value[1];
		else if (value[0] == 'nav') navContainer = value[1];
		else if (value[0] == 'dot') dotsContainer = value[1];
		else if (value[0] == 'margin') margin = parseInt(value[1]);
	});

	owl.owlCarousel({
		navText: ["<i class='icon-arrow-1 ix'></i>", "<i class='icon-arrow-1'></i>"],
		nav: owl.hasClass('s-nav') ? true : false,
		dots: owl.hasClass('s-dots') ? true : false,
		loop: owl.hasClass('s-loop') ? true : false,
		autoplay: owl.hasClass('s-auto') ? true : false,
		autoplayHoverPause: true,
		center: owl.hasClass('s-center') ? true : false,
		autoWidth: owl.hasClass('s-width') ? true : false,
		autoHeight: owl.hasClass('s-height') ? true : false,
		lazyLoad: true,
		video: owl.hasClass('s-video') ? true : false,
		mouseDrag: owl.hasClass('s-drag') ? false : true,

		autoplayTimeout: autospeed,
		animateOut: dataout ? dataout : '',
		animateIn: datain ? datain : '',
		navContainer: navContainer ? navContainer : false,
		dotsContainer: dotsContainer ? dotsContainer : false,
		margin: margin,

		responsive: {
			0: {
				items: parseInt(responsive[3]),
			},
			576: {
				items: parseInt(responsive[2]),
			},
			768: {
				items: parseInt(responsive[1]),
			},
			992: {
				items: parseInt(responsive[0]),
			},
		},
	});
};
