let charts = {};
let propertyTypes = {
	1: '1695',
	2: '1695'
};

const changeDefaultPropertySelection = (index, currentProperty) => {
	propertyTypes[index] = currentProperty !== '1694' ? currentProperty : '1695';
};

const changeHierarchySelection = (currentProperty) => {
	$('#advertising-hierarchy').html($('#advertising-hierarchy-' + currentProperty).html());
};

function addDataSet(dps, chart, stt, typePrice, color, id) {
    var newDataset = {
        label: stt,
        borderColor: color,
        backgroundColor: color,
        fill: false,
        yAxis: stt,
        data: [],
        borderWidth: 2,
        pointBorderColor: color,
        pointBackgroundColor: color,
        pointBorderWidth: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: color,
        pointHoverBorderWidth: 0,
        pointRadius: 1,
        pointHitRadius: 10
    };
    $.each(dps[typePrice], function(index, value) {
        newDataset.data.push(value);
    });
    var rc = chart.data.datasets.push(newDataset);

    //$('.list_added').append('<span class="added" data-set="'+id+'">'+stt+'</span>');
    // chart.update();
};

function drawChartjs(itemF1, itemF2, itemF3, chart, file) {
    $.getScript('' + file + '', function() {
        var i = 0,
            vals_sub = itemF2.val(),
            vals = itemF1.val(),
            typePrice = itemF3.find('li.active').data('price');
        if (!typePrice)
            typePrice = 'price';

        chart.data.datasets = [];
        $.each(vals, function(index, value) {
            var id = vals[i],
                color = jsonData[value][0]['color'],
                title = itemF1.children('option[value="' + value + '"]').html();
            dps = jsonData[id][0];
            if (vals && vals_sub != '000' && itemF2.length > 0) {
                dps = jsonData[id][0]['catergory'][0][vals_sub][0];
            }
            addDataSet(dps, chart, title, typePrice, color, id);
            i++;
        });
        chart.update();
    });
}

const drawChartPro = (chartIndex, jsonData, listingTypeId) => {
	if (jsonData) {
		let selDistricts = $('#price-aver-district');
		let selStreets = $('#price-aver-street');
		let selPropertyTypes = $('#price-aver-property');
		let selLocations = selStreets.length ? selStreets : selDistricts;
		let typePrice = listingTypeId === 1 ? 'gia_ban' : 'gia_thue';

		let type = 'line';
		let typeThis = $('.wrap-filter-chartjs:eq(' + chartIndex + ')').data('type');
		type = typeThis ? typeThis : type;

		let config = {
			type: type,
			data: {
				labels: [],
				datasets: []
			},
			options: {
				responsive: true,
				title: {
					display: true,
					text: ''
				},

				scales: {
					xAxes: [
						{
							gridLines: {
								display: true
							}
						}
					],
					yAxes: [
						{
                            ticks: {
                                beginAtZero: true
                            }
                        }
					]
				}
			}
		};

		if (charts[chartIndex]) {
			charts[chartIndex].destroy();
		}
		let ctx = $('.wrap-filter-chartjs:eq(' + chartIndex + ')').find('.chartContainer');
		chart = new Chart(ctx, config);
		charts[chartIndex] = chart;

		for (let i = 0; i < jsonData.months.length; i++) {
			chart.data.labels.push(jsonData.months[i]);
		}

		chart.data.datasets = [];
		for (const [key, value] of Object.entries(jsonData.chartData)) {
			let lineData = value[0];

			let color = lineData['color'];
			let title = selLocations.children('option[value="' + key + '"]').html();
			dps = lineData;
			if (selLocations.val() && selPropertyTypes.val()) {
				dps = lineData['category'][0][selPropertyTypes.val()][0];
			}
			addDataSet(dps, chart, title, typePrice, color, key);
		}
		chart.update();
	}
};

const drawChartStreetPro = (chartIndex, jsonData, listingTypeId = null) => {
	if (jsonData) {
		let selPropertyTypes = $(listingTypeId ? '#compare-property' : '#price-aver-property');
		let typePrice = listingTypeId ? (listingTypeId === 1 ? 'gia_ban' : 'gia_thue') : 'price';

		let type = 'line';
		let typeThis = $('.wrap-filter-chartjs:eq(' + chartIndex + ')').data('type');
		type = typeThis ? typeThis : type;

		let config = {
			type: type,
			data: {
				labels: [],
				datasets: []
			},
			options: {
				responsive: true,
				title: {
					display: true,
					text: ''
				},

				scales: {
					xAxes: [
						{
							gridLines: {
								display: true
							}
						}
					],
					yAxes: [
						{
                            ticks: {
                                beginAtZero: true
                            }
                        }
					]
				}
			}
		};

		if (charts[chartIndex]) {
			charts[chartIndex].destroy();
		}
		let ctx = $('.wrap-filter-chartjs:eq(' + chartIndex + ')').find('.chartContainer');
		chart = new Chart(ctx, config);
		charts[chartIndex] = chart;

		for (let i = 0; i < jsonData.months.length; i++) {
			chart.data.labels.push(jsonData.months[i]);
		}

		chart.data.datasets = [];
		for (const [key, value] of Object.entries(jsonData.chartData)) {
			let lineData = value[0];

			let color = lineData['color'];
			let title = '';
			if (listingTypeId) {
				for (let i = 0; i < jsonData.address.length; i++) {
					if (key == jsonData.address[i].id) {
						title = jsonData.address[i].name;
						break;
					}
				}
			} else {
				title = selPropertyTypes.children('option[value="' + key + '"]').html();
			}
			dps = lineData;
			if (listingTypeId !== null && selPropertyTypes.val()) {
				dps = lineData['category'][0][selPropertyTypes.val()][0];
			}
			addDataSet(dps, chart, title, typePrice, color, key);
		}
		chart.update();
	}
};

const changeCurrencyLabel = (listingTypeId) => {
	$('.wrap-chartjs .dv').last().html((listingTypeId === 1 ? 'Triệu' : 'Ngàn') + ' VNĐ/m2');
};
