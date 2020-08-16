function itemOwl(owl,responsive,paramowl) {
    var autospeed = 5000,
        margin = 0,
        start = 0,
        marginRes = 10,
        arrows = 'icon-arrow-1',
        dataout,datain,dotsContainer,navContainer;

    var owlArray = paramowl.split('||');
    $.each(owlArray, function (index, value) {
      var value = value.split('=');
      if(value[0] == 'autospeed')
        autospeed = parseInt(value[1]);
      else if(value[0] == 'out')
        dataout = value[1];
      else if(value[0] == 'in')
        datain = value[1];
      else if(value[0] == 'nav')
        navContainer = value[1];
      else if(value[0] == 'dot')
        dotsContainer = value[1];
      else if(value[0] == 'start')
        start = parseInt(value[1]);      
      else if(value[0] == 'margin') {
        margin = parseInt(value[1]);
        if(margin==0){
            marginRes = 0;
        }
      }
      else if(value[0] == 'arrows')
        arrows = value[1];

    });

    owl.owlCarousel({
        navText: ['<i class="'+arrows+' ix"></i>','<i class="'+arrows+'"></i>'],
        nav:(owl.hasClass('s-nav') ? true : false),
        dots:(owl.hasClass('s-dots') ? true : false),
        loop: owl.hasClass('s-loop') ? true : false,
        autoplay: owl.hasClass('s-auto') ? true : false,
        autoplayHoverPause:true,
        center: owl.hasClass('s-center') ? true : false,
        autoWidth: (owl.hasClass('s-width') ? true : false),
        autoHeight: (owl.hasClass('s-height') ? true : false),
        lazyLoad:true,
        video:(owl.hasClass('s-video') ? true : false),
        mouseDrag:(owl.hasClass('s-drag') ? false :true),                
        autoplayTimeout: autospeed,   
        startPosition : start,             
        animateOut: (dataout ? dataout : ''),
        animateIn: (datain ? datain : ''),
        navContainer: (navContainer ? navContainer : false),
        dotsContainer: (dotsContainer ? dotsContainer : false),
        margin: margin,

        responsive:{
            0:{
                items:parseInt(responsive[3]),
                margin:marginRes,
            },
            576:{
                items:parseInt(responsive[2]),
                margin:marginRes,
            },
            768:{
                items:parseInt(responsive[1]),
                margin:marginRes,
            },
            992:{
                items:parseInt(responsive[0])
            }
        }
    })            
}
// Responsive OWL    
function ResOwlSlider() {
    $(".owl-carousel").each(function () {
        var owl = $(this),
            responsive =  owl.attr('data-res'),
            paramowl = owl.attr('paramowl'); 
            if(!paramowl) paramowl='';

        if(!responsive) { responsive = '1,1,1,1'; }
        responsive = responsive.split(',');

        owl.imagesLoaded(function(){    
            itemOwl(owl,responsive,paramowl);
        });

        owl.on('initialized.owl.carousel',function(e){
          $('.owl-item.active .group-ef').addClass('loaded');
        }) 
    });    
}        
ResOwlSlider();    

// Responsive OWL    
function SynOwlSlider() {
    $(".wrap-syn-owl").each(function () {
        var $this = $(this);
        var sync1 = $this.find(".syn-slider-1");
        var sync2 = $this.find(".syn-slider-2");
        sync2.find('.owl-item:first-child').addClass('current');
        sync1.on("changed.owl.carousel", function(e) {
            var count = e.item.count,
                current = e.item.index;
            if(sync1.hasClass('s-loop')){ 	
                if(count<4){
                    current -=2;
                }else {
                    current = Math.round(current - (count/2) - .5);
                }   
            }

            if(current <= 0) {
              current = count;
            }
            if(current >= count) {
              current = 0;
            }

            console.log(count);
            if(sync2.data('owl.carousel')!= undefined){
                sync2.trigger("to.owl.carousel", [current, 300, true]);
                sync2.find(".owl-item").removeClass("current").eq(current).addClass("current");
            }
        });
        sync2.on("click", ".owl-item", function(e) {
            e.preventDefault();

            var number = $(this).index();
            if(sync1.data('owl.carousel')!= undefined){
                $(this).addClass("current").siblings().removeClass('current');
                sync1.trigger("to.owl.carousel", [number, 300, true]);
            }
         });

    });    
}        
$(window).bind("load", function() {
    SynOwlSlider();   
     $(".nav-middle-img").each(function () {  
         var h = $(this).find('.owl-item:first-child .img').outerHeight();
         $(this).find('.owl-nav').css('top',h/2); 
     });              
 });     