// JavaScript Document
$(document).ready(function () {
    TrackUserRoute.init();
    
    $('#thankMessage').html(
        sessionStorage.getItem('thank-message') ? sessionStorage.getItem('thank-message') : 'Cảm ơn'
        );
    sessionStorage.removeItem('thank-message');

    App.UI.inputAllowNumber(['.consultPhone'], false);

    var csync1 = $('.sec-h-4 .sync-1'),
        csync2 = $('.sec-h-4 .sync-2'),
        csync3 = $('.sec-h-4 .sync-3');
    csync1.on('changed.owl.carousel', function (e) {
        var count = e.item.count,
            current = e.item.index;
        if (csync1.hasClass('s-loop')) {
            if (count < 4) {
                current -= 2;
            } else {
                current = Math.round(current - count / 2 - 0.5);
            }
        }
        if (current <= 0) {
            current = count;
        }
        if (current >= count) {
            current = 0;
        }
        csync2
            .children(':eq(' + current + ')')
            .addClass('active')
            .siblings()
            .removeClass('active');
        csync3
            .children(':eq(' + current + ')')
            .addClass('active')
            .siblings()
            .removeClass('active');
    });
    csync2.on('click', '.item', function (e) {
        e.preventDefault();
        var index = $(this).index();
        csync1.data('owl.carousel').to(index, 300, true);
    });
    csync3.on('click', '.item .number', function (e) {
        e.preventDefault();
        var index = $(this)
            .parent()
            .index();
        csync1.data('owl.carousel').to(index, 300, true);
    });

    // ONEPAFE
    $(window).on('scroll', function () {
        var WindowTop = $(window).scrollTop();
        $('.section-onepage').each(function (i) {
            if (
                WindowTop > $(this).offset().top - 150 &&
                WindowTop < $(this).offset().top + $(this).outerHeight(true)
                ) {
                if (!$(this).hasClass('active')) {
                    $('.section-onepage').removeClass('active');
                    $(this).addClass('active');
                    i = $(this).attr('id');
                    $('.nav-tabs li').removeClass('active');
                    $('.nav-tabs a[href="#' + i + '"]')
                        .parent()
                        .addClass('active');
                }
            }
        });
    });
});

var checkValidFormNhuCau = function (form) {
    form.removeData('bootstrapValidator');
    form.bootstrapValidator({
        message: 'Giá trị chưa đúng',
        excluded: [':hidden'],
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            consultName: {
                validators: {
                    notEmpty: {
                        message: 'Vui lòng nhập Họ và Tên'
                    }
                }
            },
            consultPhone: {
                message: '',
                validators: {
                    notEmpty: {
                        message: 'Vui lòng nhập Số điện thoại'
                    },
                    stringLength: {
                        message: 'Vui lòng nhập Số điện thoại hợp lệ',
                        min: 10,
                        max: 10
                    }
                }
            },
            consultEmail: {
                validators: {
                    notEmpty: {
                        message: 'Vui lòng nhập địa chỉ email'
                    },
                    emailAddress: {
                        message: 'Vui lòng nhập địa chỉ email hợp lệ'
                    }
                }
            }
        }
    });
    var bootstrapValidator = form.data('bootstrapValidator');
    bootstrapValidator.validate();
    return bootstrapValidator.isValid();
};

function consultMe(event, index) {
    let name = $('.consultName:eq(' + index + ')').val();
    let phone = $('.consultPhone:eq(' + index + ')').val();
    let email = $('.consultEmail:eq(' + index + ')').val();
    let btnSend = $($(event.target)[0]);

    btnSend.prop('disabled', true);
    App.UI.showLoadding({});
    if (!checkValidFormNhuCau($('#neededFrm' + index))) {
        App.UI.hideLoadding();
        btnSend.prop('disabled', false);
        return false;
    }

    var dataSend = {
        name: name,
        phone: phone,
        email: email,
        typeId: 1,
        visitList: TrackUserRoute.getVisitedList()
    };

    $.ajax({
        type: 'POST',
        url: '/api/register-service-promotion',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        data: JSON.stringify(dataSend),
        async: true,
        success: function (response) {
            App.UI.hideLoadding();
            $('#contactModal')
                .children('.btnModal.overlay')
                .click();
            if (response.code == 200) {
                $('#neededFrm' + index).find('input').val(null);
                sessionStorage.setItem('thank-message', 'Cám ơn bạn đã đăng ký');
                location.href = '/khuyen-mai/cam-on';
            } else if(response.code == 405 || response.code == 409){
                App.UI.Error(response.message);
                btnSend.prop('disabled', false);
            } else {
                App.UI.Error('Đã có lỗi xảy ra, bạn vui lòng thao tác lại');
                btnSend.prop('disabled', false);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr);
            App.UI.hideLoadding();
            App.UI.Error('Đã có lỗi xảy ra');
        }
    });

    $('#modal-done')
        .find('button.close').click(function () {
            $('body').removeClass('showModal');
        });

    $('.btnModal.overlay').click(function () {
        $('body').removeClass('showModal');
    });
}

var TrackUserRoute = (function(){

	var init = function(){
		let visitedList = getVisitedList();
		let visitedItem = {
			url: window.location.href,
			visitedDate: Date.now()
		};
		visitedList.push(visitedItem);
		setVisitedList(visitedList);
	};

	var getVisitedList = function(){
		let visitedList = window.localStorage.getItem("visitedList");
		if(!visitedList){
			visitedList = [];
		}else{
			visitedList = JSON.parse(visitedList);
		}
		return visitedList;
	};

	var setVisitedList = function(list){
		list = JSON.stringify(list);
		window.localStorage.setItem("visitedList", list);
	};

	var clearVisitedList = function(){
		window.localStorage.setItem("visitedList", []);
	};
	
	return {
		init: init,
		getVisitedList: getVisitedList,
		setVisitedList: setVisitedList,
		clearVisitedList: clearVisitedList
	};
	
})();