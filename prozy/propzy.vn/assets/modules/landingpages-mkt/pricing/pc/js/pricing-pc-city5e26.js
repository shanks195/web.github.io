$(document).ready(function () {
	$('.btnSubscribeEmail').click(function () {
		let currentForm = $(this).closest('#email-subcribe');
		if (checkValidFormSubscribeEmail(currentForm)) {
			var emailContent = $('#email-subcribe .textinput').val();
			var formEmailElm = $('.propzy-newsletter');
			var postData = {
				email: emailContent,
				formIdMailChimp: 1666
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
				success: function (response) {
					if (response.result) {
						// success
						formEmailElm.addClass('show-text');
						formEmailElm.text('Đăng ký email thành công.');
						setTimeout(function () {
							formEmailElm.removeClass('show-text').animate({ duration: 500 });
							$('#email-subcribe .textinput').val('');
						}, 5000);
					} else {
						// fail
						formEmailElm.addClass('show-text');
						formEmailElm.text('Đã có lỗi xảy ra, bạn vui lòng thử lại');
						setTimeout(function () {
							formEmailElm.removeClass('show-text').animate({ duration: 500 });
						}, 5000);
						console.log('error', thrownError);
						console.log('error xhr', xhr);
					}
				},
				error: function (xhr, ajaxOptions, thrownError) {
					console.log(xhr);
					App.UI.hideLoadding();
					App.UI.Error('Đã có lỗi xảy ra');
				}
			});
		}
	});

	$('#select-district').change(function () {
		$('#select-street').val('');
		$('#select-street').html('');

		let districtId = $('#select-district').val();
		if (districtId) {
			$.ajax({
				url: '/api/get-streets-pricing-chart',
				method: 'POST',
				dataType: 'json',
				contentType: 'application/json;charset=utf-8',
				data: JSON.stringify({
					districtId: districtId
				}),
				success: function (result) {
					if (result && Array.isArray(result)) {
						$('#select-street').html(
							'<option value="">Tất cả đường</option>'
						);

						for (let i = 0; i < result.length; i++) {
							$('#select-street').append('<option value="' + result[i].streetIds + '">' + result[i].streetName + '</option>');
						}

						$('#select-street').attr('disabled', false);
						$('#select-street').selectpicker('refresh');
					}
				},
				error: function (error) {
					console.log(error);
				}
			});
		} else {
			$('#select-street').attr('disabled', true);
		}

		$('#select-street').selectpicker('refresh');
	});

	$('#btn-search').click(function () {
		let url = '/gia-nha-dat/hcm';
		let streetId = $('#select-street').val();
		let districtId = $('#select-district').val();
		if (streetId) {
			url += '/' + App.Feature.strToUrl($('#select-district option:selected').text()) + '-' + App.Feature.strToUrl($('#select-street option:selected').text());
		} else if (districtId) {
			url += '/' + App.Feature.strToUrl($('#select-district option:selected').text());
		}

		location.href = url;
	});

	initInteractiveEvents();
	drawAverageChart();
    // bđs đang rao
    // A. change select
    // 1. change district
    $('#select-advertise-district').change(function(){
        reloadContentAdvertising();
    });
    // 2. change propertyType
    $('#advertising-property').change(function(){
		let currentProperty = $(this).val();
		changeDefaultPropertySelection(2, currentProperty);
		changeHierarchySelection(currentProperty);

        reloadContentAdvertising();
    });
    // 3. change hierarchyType
    $('#advertising-hierarchy').change(function(){
        reloadContentAdvertising();
    });
    // B. Click active tab
    // click giá bán
    $('#advertise-buying').click(function(){
        $('.type-advertising').text('BÁN');
        $('#advertise-renting').removeClass('active');
		$('#advertise-buying').addClass('active');
        $('.text-price-aver-m').text('Triệu VNĐ/m2');
        $('.text-price-aver').text('Triệu VNĐ');
        //
		$('#advertising-property').html($('#price-aver-property-buy').html());
		$('#advertising-property').val(propertyTypes[2]);
		changeHierarchySelection(propertyTypes[2]);
        reloadContentAdvertising();
    });
    // click giá thuê
	$('#advertise-renting').click(function(){
        $('.type-advertising').text('THUÊ');
        $('#advertise-buying').removeClass('active');
		$('#advertise-renting').addClass('active');
        $('.text-price-aver-m').text('Ngàn VNĐ/m2');
        $('.text-price-aver').text('Ngàn VNĐ');
        //
		$('#advertising-property').html($('#price-aver-property-rent').html());
		$('#advertising-property').val(propertyTypes[2]);
		changeHierarchySelection(propertyTypes[2]);
		reloadContentAdvertising();
	});
	setTimeout(function(){
        $('#bl-buy-aver').DataTable({
            serverSide: true,
            scrollX: true,
            autoWidth: false,
            destroy: true,
            lengthChange: false,
            searching: false,
            ordering: false,
            bInfo: false,
            order: [],
            language: {
                paginate: {
                    previous: '<',
                    next: '>'
                }
            },
            ajax: function (data, callback, settings) {
                $.post(
                    '/api/get-average-pricing-chart',
                    {
                        page: (data.start / data.length) + 1,
						length: data.length,
						dataPost: {
							cityId: 1,
							listingTypeId: 1
						}
                    },
                    function (res) {
                        let data = JSON.parse(res);
                        callback({
                            recordsTotal: data.totalItems,
                            recordsFiltered: data.totalItems,
                            data: data.list.map((x) => {
                                let arr = [];
                                arr.push(x.name);
                                arr.push(x.landPrice);
                                arr.push(x.facadePrice);
                                arr.push(x.alleyPrice);
                                arr.push(x.apartmentPrice);
                                return arr;
                            })
                        });
                    }
                );
            },
            columnDefs: [
                {
                    render: function (data) {
                        return getCellContent(data);
                    },
                    targets: 1
                },
                {
                    render: function (data) {
                        return getCellContent(data);
                    },
                    targets: 2
                },
                {
                    render: function (data) {
                        return getCellContent(data);
                    },
                    targets: 3
                },
                {
                    render: function (data) {
                        return getCellContent(data);
                    },
                    targets: 4
                }
            ]
        });
    },500);
	
    setTimeout(function(){
        $('#bl-rent-aver').DataTable({
            serverSide: true,
            scrollX: true,
            autoWidth: false,
            destroy: true,
            lengthChange: false,
            searching: false,
            ordering: false,
            bInfo: false,
            order: [],
            language: {
                paginate: {
                    previous: '<',
                    next: '>'
                }
            },
            ajax: function (data, callback, settings) {
                $.post(
                    '/api/get-average-pricing-chart',
                    {
                        page: (data.start / data.length) + 1,
						length: data.length,
						dataPost: {
							cityId: 1,
							listingTypeId: 2
						}
                    },
                    function (res) {
                        let data = JSON.parse(res);
                        callback({
                            recordsTotal: data.totalItems,
                            recordsFiltered: data.totalItems,
                            data: data.list.map((x) => {
                                let arr = [];
                                arr.push(x.name);
                                arr.push(x.facadePrice);
                                arr.push(x.alleyPrice);
                                arr.push(x.apartmentPrice);
                                return arr;
                            })
                        });
                    }
                );
            },
            columnDefs: [
                {
                    render: function (data) {
                        return getCellContent(data);
                    },
                    targets: 1
                },
                {
                    render: function (data) {
                        return getCellContent(data);
                    },
                    targets: 2
                },
                {
                    render: function (data) {
                        return getCellContent(data);
                    },
                    targets: 3
                }
            ]
        });
    },1000);
	
	reloadContentAdvertising();
});

const getCellContent = (data) => {
	return (data.value ?? '') +
		'<span class="percent-medium ' + (data.isUp ? 'up' : data.compare === '0%' ? 'up' : 'down') + '">' +
		data.compare + '<i class="icon-arrow-9"></i>' +
		'</span>';
};

const getDataPostAdvertising = ()  => {
	let dataPostAdvertising = {};
	dataPostAdvertising.cityId = 1;
	dataPostAdvertising.districtId = $('#select-advertise-district').val();
	dataPostAdvertising.propertyTypeId = $('#advertising-property').val();
	dataPostAdvertising.listingTypeId = $('.listingtype-advertising.active').data('listingtype');
	dataPostAdvertising.hierarchyTypeId = $('#advertising-hierarchy').val();

	return dataPostAdvertising;
};

const reloadContentAdvertising = () => {
	if (!$.fn.DataTable.isDataTable('#bl-content-advertising')) {
        setTimeout(function(){
            $('#bl-content-advertising').DataTable({
                serverSide: true,
                scrollX: true,
                autoWidth: false,
                destroy: true,
                lengthChange: false,
                searching: false,
                ordering: false,
                bInfo: false,
                order: [],
                language: {
                    paginate: {
                        previous: '<',
                        next: '>'
                    }
                },
                ajax: function (data, callback, settings) {
                    $.post(
                        '/api/get-advertising-pricing-chart',
                        {
                            page: data.start / data.length + 1,
                            length: data.length,
                            dataPost: getDataPostAdvertising()
                        },
                        function (res) {
                            let data = JSON.parse(res);
                            callback({
                                recordsTotal: data.totalItems,
                                recordsFiltered: data.totalItems,
                                data: data.list.map((x) => {
                                    let arr = [];
                                    arr.push(x.streetName);
                                    arr.push(x.districtName);
                                    arr.push(x.midPrice);
                                    arr.push(x.closingPrice);
                                    arr.push(x.propertyTypeName);
                                    arr.push(x.hierarchyTypeName);
                                    return arr;
                                })
                            });
                        }
                    );
                },
                columnDefs: [
                    {
                        render: function (data) {
                            return getCellContent(data);
                        },
                        targets: 2
                    },
                    {
                        render: function (data) {
                            return getCellContent(data);
                        },
                        targets: 3
                    }
                ]
            });
        },1500);
	} else {
		let table = $('#bl-content-advertising').DataTable();
		table.ajax.reload();
	}
};

const checkValidFormSubscribeEmail = function (form) {
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

const initInteractiveEvents = () => {
	$('#aver-type-buy').click(() => {
		$('#price-aver-property').html($('#price-aver-property-buy').html());
		$('#price-aver-property').val(propertyTypes[1]);
		setTimeout(() => {
			$('#price-aver-property').selectpicker('refresh');
		});
		$('#aver-type-rent').removeClass('active');
		$('#aver-type-buy').addClass('active');
		changeCurrencyLabel(1);

		drawAverageChart();
	});

	$('#aver-type-rent').click(() => {
		$('#price-aver-property').html($('#price-aver-property-rent').html());
		$('#price-aver-property').val(propertyTypes[1]);
		setTimeout(() => {
			$('#price-aver-property').selectpicker('refresh');
		});
		$('#aver-type-buy').removeClass('active');
		$('#aver-type-rent').addClass('active');
		changeCurrencyLabel(2);

		drawAverageChart();
	});

	$('#price-aver-district').change(() => {
		drawAverageChart();
	});
	
	$('#price-aver-property').change(() => {
		let currentProperty = $('#price-aver-property').val();
		changeDefaultPropertySelection(1, currentProperty);
		drawAverageChart();
	});

	$('#selCol').change(() => {
		drawAverageChart();
	});
};

const drawAverageChart = () => {
	let listingTypeId = $('#aver-type-buy').hasClass('active') ? 1 : 2;
	let channelId = $("input[name=options]:checked").val();

	let dataPost = {
		cityId: 1,
		districtIds: $('#price-aver-district').val().map((x) => Number(x)),
		propertyTypeId: Number($('#price-aver-property').val()),
		listingTypeId: listingTypeId,
		fromDate: $('#option-' + channelId).data('fromdate'),
		toDate: $('#option-' + channelId).data('todate'),
		displayType: $('#selCol').val(),
	};

	$.ajax({
		url: '/api/get-pricing-chart-city',
		method: 'POST',
		dataType: 'json',
		contentType: 'application/json;charset=utf-8',
		data: JSON.stringify(dataPost),
		success: function (result) {
			drawChartPro(0, result, listingTypeId);
		},
		error: function (error) {
			console.log(error);
		}
	});
};

const changeSelCol = (id) => {
	$('#selCol').html($('#selCol-' + id).html());
	$('#selCol').selectpicker('refresh');
	setTimeout(() => {
		drawAverageChart();
	});
}
