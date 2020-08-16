var bookingListingLink;
var bookingListingId;
var bookingListingTypeId;
var bookingPropertyTypeId;
var bookingDistrictId;
var bookingPrice;

$(document).ready(function() {
    initSpanEyes();
	$('#thankMessage').html(sessionStorage.getItem('thank-message') ? sessionStorage.getItem('thank-message') : 'Cảm ơn');
	sessionStorage.removeItem('thank-message');
	
	$('.c-form1__info__select i').on('click', function(event) {
		$('.c-form1__info__select input').focus();
	});

	$('#dp2').datetimepicker({
		format: 'DD/MM/YYYY HH:mm A'
	});

	if (location.href.includes('?')) {
		setTimeout(() => {
			$('html, body').animate({
				scrollTop: $('#section1').offset().top
			});
		}, 1000);
	}

	App.UI.inputAllowNumber(['.consultPhone', '#customer-phone'], false);
	// ONEPAFE

	$(window).on('scroll', function() {
		var WindowTop = $(window).scrollTop();
		$('.section-onepage').each(function(i) {
			if (WindowTop > $(this).offset().top - 250 && WindowTop < $(this).offset().top + $(this).outerHeight(true)) {
				if (!$(this).hasClass('active')) {
					$('.section-onepage').removeClass('active');
					$(this).addClass('active');
					i = $(this).attr('id');
					$('.nav-tabs li').removeClass('active');
					$('.nav-tabs a[href="#' + i + '"]').parent().addClass('active');
				}
			}
		});
	});

	$('.menu-top-header #li1').click(function() {
		$('.menu-top-header .li-head').removeClass('active');
		$(this).addClass('active');
	});

	$('.btn-booking').click(function(e) {
		e.preventDefault();
		$('#quickview').removeClass('active');
		$('div#popup').addClass('active');
	});

	$('#form-tu-van, #form-booking').submit(function(e) {
		e.preventDefault();
		$('#successModal').addClass('active');
		$($(this).closest('.divmodal')).removeClass('active');
	});

	$('.btnSubscribeEmail').click(function() {
		if (checkValidFormSubscribeEmail($('#email-subcribe'))) {
			var emailContent = $('#email-subcribe .textinput').val();
			var formEmailElm = $('.propzy-newsletter');
			var postData = {
				email: emailContent,
                formIdMailChimp: 1668
			};

			formEmailElm.addClass('show-text');
			formEmailElm.text('Vui lòng chờ...');

			$.ajax({
				type: 'POST',
				url: '/api/subcribe-email-news',
				dataType: 'json',
				contentType: 'application/json;charset=utf-8',
				data: JSON.stringify(postData),
				async: true,
				success: function(response) {
					if (response.result) {
						// success
						formEmailElm.addClass('show-text');
						formEmailElm.text('Đăng ký email thành công.');
						setTimeout(function() {
							formEmailElm.removeClass('show-text').animate({ duration: 500 });
							$('#email-subcribe .textinput').val('');
						}, 5000);
					} else {
						// fail
						formEmailElm.addClass('show-text');
						formEmailElm.text(
							'Đã có lỗi xảy ra, bạn vui lòng thử lại'
						);
						setTimeout(function() {
							formEmailElm.removeClass('show-text').animate({ duration: 500 });
						}, 5000);
						console.log('error', thrownError);
						console.log('error xhr', xhr);
					}
				},
				error: function(xhr, ajaxOptions, thrownError) {
					console.log(xhr);
					App.UI.hideLoadding();
					App.UI.Error('Đã có lỗi xảy ra');
				}
			});
		}
	});

	/**
	 * event đặt lịch xem
	 */
	$('#form-booking').bootstrapValidator({
		message: 'Giá trị chưa đúng',
		excluded: [':hidden'],
		feedbackIcons: {
			valid: 'glyphicon glyphicon-ok',
			invalid: 'glyphicon glyphicon-remove',
			validating: 'glyphicon glyphicon-refresh'
		},
		fields: {
			name: {
				validators: {
					notEmpty: {
						message: 'Vui lòng nhập Họ và tên'
					}
				}
			},
			phone: {
				validators: {
					notEmpty: {
						message: 'Vui lòng nhập số điện thoại'
					},
					stringLength: {
						message: 'Vui lòng nhập số điện thoại hợp lệ',
						min: 10,
						max: 10
					}
				}
			},
			email: {
				validators: {
					emailAddress: {
						message: 'Vui lòng nhập địa chỉ email hợp lệ'
					}
				}
			},
			date: {
				validators: {
					timeLate: {
						message: 'Vui lòng nhập ngày giờ trong tương lai'
					}
				}
			}
		}
	});

	var checkValidForm = function(form) {
		var bootstrapValidator = form.data('bootstrapValidator');
		bootstrapValidator.validate();
		return bootstrapValidator.isValid();
	};

	$('#btnSendInfo').click(function() {
		var curForm = $(this).closest('#form-booking');
		if (!checkValidForm(curForm)) {
			App.UI.Error(
				'Bạn cần cung cấp đầy đủ thông tin để Propzy có thể tư vấn tốt nhất cho bạn'
			);
			return false;
		}
		App.UI.showLoadding();

		var postData = {};
		if ($('#dp2').val().trim()) {
			postData.date = moment($('#dp2').val().trim(),'dd/mm/yyyy').unix() * 1000;
		} else {
			postData.date = null;
		}
		//3(Đặt lịch xem)
		postData.requestTypeIds = [3];
		postData.form_type = 3;
		if ($('#customer-name').length > 0 && $ ('#customer-name').val() !== '') {
			postData.customerName = $('#customer-name').val().trim();
		}
		if ($('#customer-phone').length > 0 && $('#customer-phone').val() !== '') {
			postData.customerPhone = $('#customer-phone').val().trim();
		}
		if ($('#customer-email').length > 0 && $('#customer-email').val() !== '') {
			postData.email = $('#customer-email').val().trim();
		}

		postData.message = 'Đặt lịch xem từ trang thuê nhà siêu tốc';
		postData.links = [bookingListingLink];
		postData.rlistingIds = [bookingListingId];
		postData.content_ids = bookingListingId;
		postData.content_category = bookingDistrictId;
		postData.value = bookingPrice;
		postData.currency = 'VND';
		postData.contentRequest = 'Tìm nhà siêu tốc!';
		postData.campaignName = 'sieu_toc';
		postData.listingTypeId = Number(bookingListingTypeId);
		postData.propertyTypeId = Number(bookingPropertyTypeId);
		postData.districtIds = [Number(bookingDistrictId)];
        postData.formIdMailChimp = 1688;
		console.log(postData);

		$.ajax({
			type: 'POST',
			url: '/api/dat-lich-xem',
			dataType: 'json',
			contentType: 'application/json;charset=utf-8',
			data: JSON.stringify(postData),
			async: true,
			success: function(response) {
				App.UI.hideLoadding();
				if (response.code == 410) {
					// là moi gioi can login
					App.UI.ShowFormMessage(
						'#popup-login',
						'Số điện thoại đã tồn tại trong hệ thống, bạn vui lòng đăng nhập',
						App.UI.notiTypeError
					);
					$('#popup-login').modal('show');
				} else {
					if (response.result) {
						sessionStorage.setItem('thank-message', 'Đặt lịch xem thành công');
						location.href = '/thue-nha-sieu-toc/cam-on';
					} else {
						App.UI.Error('Có lỗi xảy ra trong quá trình ghi nhận. Bạn vui lòng liên hệ với chúng tôi để được tư vấn thêm');
					}
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				console.log(xhr);
				App.UI.hideLoadding();
				App.UI.Error('Đã có lỗi xảy ra');
			}
		});
	});
    //
    $(document).on("click", '#forgot-password', function(){
        $('#popup-login').modal('hide');
        $('#popup-forgot-password').modal();
    });
    //
    var checkValidForm = function (form) {
        form.removeData('bootstrapValidator');
        form.bootstrapValidator({
            message: "Giá trị chưa đúng", excluded: [":hidden"], feedbackIcons: {
                valid: "glyphicon glyphicon-ok",
                invalid: "glyphicon glyphicon-remove",
                validating: "glyphicon glyphicon-refresh"
            }
            , fields: {
                forgot_input: {
                    validators: {
                        notEmpty: {
                            message: 'Vui lòng nhập giá trị'
                        }
                    }
                }
            }
        });
        var bootstrapValidator = form.data('bootstrapValidator');
        bootstrapValidator.validate();
        return bootstrapValidator.isValid();
    };
    var checkValidFormReset = function (form) {
        form.removeData('bootstrapValidator');
        form.bootstrapValidator({
            message: "Giá trị chưa đúng", excluded: [":hidden"], feedbackIcons: {
                valid: "glyphicon glyphicon-ok",
                invalid: "glyphicon glyphicon-remove",
                validating: "glyphicon glyphicon-refresh"
            },
            fields: {
                password: {
                    validators: {
                        notEmpty: {
                            message: 'Bạn chưa nhập password'
                        },
                        stringLength: {
                            message: "Mật khẩu từ 6 đến 20 ký tự", min: 6, max: 20
                        }
                    }
                },
                code: {
                    validators: {
                        notEmpty: {
                            message: 'Vui lòng nhập mã xác nhận'
                        }
                    }
                }
            }
        });
        var bootstrapValidator = form.data('bootstrapValidator');
        bootstrapValidator.validate();
        return bootstrapValidator.isValid();
    };
    $("#forgotPassword input[name='forgot_input']").keypress(function(e) {
        if (e.which == 13) {
            e.preventDefault();
            $('#continue-forgot-password').trigger('click');
        }
    });
    $(document).on('click', '#continue-forgot-password', function(){
        $('#popup-forgot-password').find(".flash-message").remove();
        $('.errors_input').html('');
        var curForm = $(this).closest("#forgotPassword");
        if (!checkValidForm(curForm)) {
            return false;
        }
        var forgot_input = $('#forgot_input').val();
        var postData = {};
        if (App.UI.isValidEmail(forgot_input)) {
            postData.email = forgot_input;
            postData.phone = null;
            App.Feature.Post("/api/forgot-password", postData, function (response) {
                if (response.result) {
                    console.log(response);
                    $('#popup-forgot-password').modal('hide');
                    App.UI.Info('Vui lòng kiểm tra email để đổi mật khẩu');
                    $('#modal-info').on('hide.bs.modal', function () {
                        $('.modal-backdrop.fade').hide();
                    });
                } else {
                    console.log(response);
                    if (response.code == 401) {
                        App.UI.ShowFormMessage('#popup-forgot-password', 'Email này chưa được đăng ký', App.UI.notiTypeError);
                    } else if (response.code == 402) {
                        App.UI.ShowFormMessage('#popup-forgot-password', 'Email này chưa được kích hoạt', App.UI.notiTypeError);
                    } else {
                        App.UI.ShowFormMessage('#popup-forgot-password', response.message, App.UI.notiTypeError);
                    }
                    //
                    $('#modal-error').on('hide.bs.modal', function () {
                        $('.modal-backdrop.fade').hide();
                    });
                }
            });
        } else if (App.UI.validatePhone(forgot_input)) {
            postData.email = null;
            postData.phone = forgot_input;

            App.Feature.Post("/api/forgot-password", postData, function (response) {
                if (response.result) {
                    $('#popup-forgot-password').modal('hide');
                    $('#popup-re-password-phone').modal();
                    //
                    $(document).on('click', '#reset-pass-phone', function(){
                        var curForm = $(this).closest("#resetPassword");
                        if (!checkValidFormReset(curForm)) {
                            return false;
                        }
                        var phone = forgot_input;
                        var email = null;
                        var code = $('#code').val();
                        var newPassword = $('#password').val();
                        var dataSend = {};
                        dataSend.phone = phone;
                        dataSend.email = email;
                        dataSend.code = code;
                        dataSend.newPassword = newPassword;
                        console.log(dataSend);
                        //
                        App.Feature.Post("/api/reset-password", dataSend, function (response) {
                            if (response.result) {
                                App.UI.Info('Cập nhật mật khẩu mới thành công');
                                $('#popup-re-password-phone').modal('hide');
                            } else {
                                App.UI.ShowFormMessage('#popup-re-password-phone', response.message, App.UI.notiTypeError);
                            }
                            $("#reset-pass-phone").unbind("click");
                        });
                    });
                } else {
                    if (response.code == 401) {
                        App.UI.ShowFormMessage('#popup-forgot-password', 'Số điện thoại này chưa được đăng ký', App.UI.notiTypeError);
                    } else if (response.code == 402) {
                        App.UI.ShowFormMessage('#popup-forgot-password', 'Số điện thoại này chưa được kích hoạt', App.UI.notiTypeError);
                    } else {
                        App.UI.ShowFormMessage('#popup-forgot-password', response.message, App.UI.notiTypeError);
                    }
                }
            });
        } else {
            $('.errors_input').html('Email/Số điện thoại không hợp lệ');
            $('#form-input').removeClass('has-success');
            $('#form-input').addClass('has-error');
            $('#forgot_input').next().removeClass('glyphicon-ok');
            $('#forgot_input').next().addClass('glyphicon-remove');
            return false;
        }
    });
});

function setBookingData(event, ele) {
	var btnBooking = $(event.target);

	bookingListingLink = btnBooking.data('listing-link');
	bookingListingId = btnBooking.data('listing-id');
	bookingListingTypeId = btnBooking.data('listing-type-id');
	bookingPropertyTypeId = btnBooking.data('property-type-id');
	bookingDistrictId = btnBooking.data('district-id');
	bookingPrice = btnBooking.data('price');
	a = $(ele);
	id = a.data('modal');
	showModal(id);
}

$.fn.extend({
	// equalHeight
	equal2: function(padding) {
		var tempHeight = 0;
		var here = this;
		here.each(function() {
			tempHeight = tempHeight > this.offsetHeight ? tempHeight : this.offsetHeight; //kiem chieu cao lon nhat
		});

		here.css('height', tempHeight + padding + 'px');
	}
});

var checkValidFormNhuCau = function(form) {
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
					emailAddress: {
						message: 'Vui lòng nhập địa chỉ email hợp lệ'
					}
				}
			},
			consultDistrict: {
				validators: {
					notEmpty: {
						message: 'Vui lòng chọn Quận/Huyện'
					}
				}
			}
		}
	});
	var bootstrapValidator = form.data('bootstrapValidator');
	bootstrapValidator.validate();
	return bootstrapValidator.isValid();
};

let checkValidFormSubscribeEmail = function(form) {
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
			email: {
				validators: {
					notEmpty: {
						message: 'Vui lòng nhập địa chỉ email hợp lệ'
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
	let propertyType = $('.consultPropertyType:eq(' + index + ')').val();
	let district = $('.consultDistrict:eq(' + index + ')').val();
	let btnSend = $($(event.target)[0]);

	btnSend.prop('disabled', true);
	App.UI.showLoadding({});
	if (!checkValidFormNhuCau($('#neededFrm' + index))) {
		App.UI.hideLoadding();
		btnSend.prop('disabled', false);
		return false;
	}
	var districtIds = [];
	districtIds.push(district);

	var dataSend = {
		customerName: name,
		customerPhone: phone,
		email: email,
		listingTypeId: 2,
		propertyTypeId: parseInt(propertyType),
		districtIds: districtIds,
		sourceId: 2,
        formIdMailChimp: 1667,
		contentRequest: 'Tìm nhà siêu tốc!',
		campaignName: 'sieu_toc',
		requestText: $('.consultPropertyType:eq(' + index + ') option:selected').text()
	};

	$.ajax({
		type: 'POST',
		url: '/api/request-find-home',
		dataType: 'json',
		contentType: 'application/json;charset=utf-8',
		data: JSON.stringify(dataSend),
		async: true,
		success: function(response) {
			App.UI.hideLoadding();
			$('#popup-bottom').children('.close-modal').click();
			if (response.code == 200) {
				$('#neededFrm' + index).find('input').val(null);
				$('#neededFrm' + index).find('.consultDistrict').val(null);

				sessionStorage.setItem('thank-message', 'Đăng ký tìm nhà thành công');
				location.href = '/thue-nha-sieu-toc/cam-on';
			} else {
				if (response.code == 410) {
					// là moi gioi can login
					App.UI.ShowFormMessage(
						'#popup-login',
						'Số điện thoại đã tồn tại trong hệ thống, bạn vui lòng đăng nhập',
						App.UI.notiTypeError
					);
					$('#popup-login').modal('show');
				} else if (response.code == 405) {
					App.UI.Error(response.message);
					btnSend.prop('disabled', false);
				} else {
					App.UI.Error('Đã có lỗi xảy ra, bạn vui lòng thao tác lại');
					btnSend.prop('disabled', false);
				}
			}
		},
		error: function(xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			App.UI.hideLoadding();
			App.UI.Error('Đã có lỗi xảy ra');
		}
	});
}

function filterRent() {
	var propertyType = $('#selPropertyType').val();
	var district = $('#selDistrict').val();

	// tạo slug cho quận
	if (typeof district != 'undefined' && district != '' && district.split(',').length == 1) {
		$.query = $.query.set('quan', district);
	} else {
		$.query = $.query.remove('quan');
	}
	// giá
	renderParams();
	// loại
	if (typeof propertyType != 'undefined') {
		if (propertyType == 1) {
			$.query = $.query.set('loai', 'chung-cu');
		} else {
			$.query = $.query.set('loai', 'nha-rieng');
		}
	} else {
		$.query = $.query.remove('loai');
	}
	var query = $.query.toString();
	if (history.pushState) {
		var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + query;
		window.history.pushState({ path: newurl }, '', newurl);
	}
	location.href = newurl;
}

function viewAll() {
	var districtId = $('#selDistrict').val();
	if (!districtId) {
		districtId = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24';
	}
	if ($('#selPropertyType').val() == 1) {
		var defaulSlug = '/thue/can-ho/hcm';
		var searchObject = {
			CityID: 1,
			ListingTypeID: 2,
			PropertyTypeIDs: 1
		};
	} else {
		var defaulSlug = '/thue/nha/hcm';
		var searchObject = {
			CityID: 1,
			ListingTypeID: 2,
			PropertyTypeIDs: 2
		};
	}
	districtId && districtId.split(',').length == 1 ? (searchObject.DistrictIDs = districtId) : (searchObject.DistrictIDs = null);
	var slug = null;
	App.Feature.Post('/api/get-search-slug', searchObject, function(response) {
		if (response.result) {
			slug = response.data.slug;
			if (slug == null) {
				window.open(defaulSlug);
			}
			renderParams();
			var link = '/' + slug;
			window.open(link);
		}
	});
}

function getListingDetailModal(event) {
	var dataSend = {
		listingId: $(event.target).data('id')
	};

	$.ajax({
		type: 'POST',
		url: '/api/render-modal-listing-detail-rent',
		data: JSON.stringify(dataSend),
		async: true,
		success: function(response) {
			App.UI.hideLoadding();
			$('#quickview').html(response);
			$('.close-modal').click(function() {
				closeModalV();
			});
			showModal('quickview');
			ResOwlSlider();
			setTimeout(function() {
				SynOwlSlider();
			}, 500);
			$('.readmore-block').readmore({
				speed: 1000,
				collapsedHeight: 240,
				moreLink: '<a class="readmore-detail show-readmore" href="#"><div class="show-content">Xem thêm</div></a>',
				lessLink: '<a class="readmore-detail hide-readmore" href="#"><div class="hide-content">Thu gọn</div></a>',
				blockCSS: 'display: block;position: relative;'
			});
			$('.btn-booking').click(function(e) {
				e.preventDefault();
				$('#quickview').removeClass('active');
				$('div#popup').addClass('active');
			});
		},
		error: function(xhr, ajaxOptions, thrownError) {
			console.log(xhr);
			App.UI.hideLoadding();
			App.UI.Error('Đã có lỗi xảy ra');
		}
	});
}

// render param theo url query
function renderParams() {
	// price slug
	var priceSlug = false;
	if ($('#selPrice option:selected').data('max-price') && $('#selPrice option:selected').data('max-price') != 0) {
		var priceFrom = renderPriceValue($('#selPrice option:selected').data('min-price'));
		var priceTo = renderPriceValue($('#selPrice option:selected').data('max-price'));

		if (priceTo == '10ty' || priceTo == '1000000ty') {
			priceSlug = priceFrom;
		} else {
			if (priceFrom.length != 0 && priceTo.length != 0) {
				priceSlug = priceFrom + '-' + priceTo;
			} else if (priceFrom.length == 0 && priceTo.length != 0) {
				priceSlug = 0 + '-' + priceTo;
			} else if (priceFrom.length != 0 && priceTo.length == 0) {
				priceSlug = priceFrom;
			}
		}

		if (priceSlug) {
			priceSlug = priceSlug.replace('ty-', '-').replace('trieu-', '-').replace('ngan-', '-').trim();
		}
		$.query = priceSlug ? $.query.set('gia', priceSlug) : $.query.remove('gia');
	} else {
		$.query = $.query.remove('gia');
	}
    // sapxep
    if($('#sort').val() != '1'){
        $.query = $.query.set("sapxep", $('#sort').val());
    } else {
        $.query = $.query.remove("sapxep");
    }
}

function renderPriceValue(value) {
	var unit;
	if (value > 999999999) {
		unit = 'ty';
		value = value / 1000000000;
	} else if (value > 999999) {
		unit = 'trieu';
		value = value / 1000000;
	} else if (value == 0) {
		return 0;
	}
	return value + unit;
}

var initSpanEyes = function(){
    $(".span-eyes").unbind("click");
    $(".span-eyes").on('click', function(){
        $(this).parent().find('input').each(function(){
            if ($(this).attr('type') == 'password') {
                $(this).attr('type', 'text');
            } else {
                $(this).attr('type', 'password');
            }
        });
    });
};