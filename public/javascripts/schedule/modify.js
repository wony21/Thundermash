let fnObj;
let vMap;
let vMarkerLayer;
let defaultXY = [
    14118749.269098494,
    4484072.700684194
];
let zoom = 17;

$(() => {
    initView();
    initEvent();
});

function initView() { 
    fnObj.initHour();
    fnObj.initMin();
    fnObj.initMaxAttend();
    fnObj.initVotyDate();
    // fnObj.getScheduleInfo();
}

function initEvent() {

    $('#submit-button').on('click', fnObj.modifySchedule);
    $('#search-submit-button').on('click', fnObj.searchSchedule);
    $('#goto-list-button').on('click', fnObj.gotoScheduleCalendar);
    $('*:required').each((i, o) => {
        $(o).on('blur', fnObj.invalidate);
    });
    $('#date').on('change', fnObj.invalidate);
    $('#location').on('focus', fnPlaceObj.show);
    //$('#place-search-form').on('change', fnPlaceObj.findPlace);
    $('#search-button').on('click', fnPlaceObj.search);
    $('.item').on('click', fnPlaceObj.clickedItem);
    $('#select-location-button').on('click', fnPlaceObj.selectLocation);
    $('#popup-tools-background').on('click', fnPlaceObj.hide);

}

function gotoList(sel, day, el) {
    console.log('test');
    console.log(sel);
    console.log(day);
    console.log(el);
    return false;
}

function changeMonth(curr, el) {
    var element = document.getElementById('schedule-calendar');
    var calendar = Metro.getPlugin(element, 'calendar');
    var month = curr.year + (String(curr.month + 1).padStart(2, '0'));
    fnObj.getScheduleOfMonth(month);
}

fnObj = {
    initHour: function() {
        var selValue = $('#hour').data('org');
        if (!selValue) {
            selValue = 18;
        }
        var hour = 0;
        for(hour=0; hour <24; hour++) {
            var hourFmt = String(hour).padStart(2, '0');
            if ( hour == selValue ) {
                $('#hour').append(`<option value=${hourFmt} selected>${hourFmt}시</option>`);
            } else {
                $('#hour').append(`<option value=${hourFmt}>${hourFmt}시</option>`);
            }
        }
    },
    initMin: function() {
        var selValue = $('#min').data('org');
        if (!selValue) {
            selValue = 18;
        }
        var min = 0;
        for(min=0; min <60; min += 10) {
            var minFmt = String(min).padStart(2, '0');
            if ( min == selValue ) {
                $('#min').append(`<option value=${minFmt} selected>${minFmt}분</option>`);
            } else {
                $('#min').append(`<option value=${minFmt}>${minFmt}분</option>`);
            }
        }
    },
    initMaxAttend: function() {
        var selValue = $('#max-attend').data('org');
        console.log(`max attend: ${selValue}`);
        if (!selValue) {
            selValue = 20;
        }
        console.log(`max attend: ${selValue}`);
        var attend = 4;
        for(attend=4; attend <= 60; attend += 2) {
            // var attendFmt = String(attend).padStart(2, '0');
            if ( attend == Number(selValue) ) {
                $('#max-attend').append(`<option value=${attend} selected>${attend}명</option>`);
            } else {
                $('#max-attend').append(`<option value=${attend}>${attend}명</option>`);
            }
        }
    },
    initVotyDate: function() {
        var selValue = $('#vateDays').data('org');
        if (!selValue) {
            selValue = 1;
        }
        for(var day=1; day <= 5; day++) {
            // var attendFmt = String(attend).padStart(2, '0');
            if ( day == selValue ) {
                $('#voteDays').append(`<option value=${day} selected>${day}일</option>`);
            } else {
                $('#voteDays').append(`<option value=${day}>${day}일</option>`);
            }
        }
    },
    getScheduleInfo: function() {
        var schId = $('#schId').val();
        if (!schId) {
            alert('잘못된 접근 입니다.');
            window.location.href = '/';
        }
        var param = {id: schId};
        $.get('/scheulde/v1/get', param, function(res){
            if (res.ret) {
                if (res.data.length > 0) {
                    scheduleInfoBinding(res.data[0]);
                }
            } else {
                alert(res.message);
                window.location.href = '/';
            }
        });
    },
    scheduleInfoBinding: function(obj) {
        $('#schId').val(obj.id);
        $('#coordX').val(obj.coordX);
        $('#coordY').val(obj.coordY);
        $('#road').val(obj.addrRoad);
        $('#parcel').val(obj.addrParcel);

        $('#name').val(obj.schNm);
        $('#location').val(obj.schLoc);
        var schDateTime = obj.schDate;
        var schDate = schDateTime.schDate.split(' ')[0];
        var schTime = schDateTime.schDate.split(' ')[1];
        var schHour = schTime.split(':')[0];
        var schMin = schTime.split(':')[1];
        $('#date').val(schDate);
        $('#hour').val(schHour).prop('selected', true);
        $('#min').val(schMin).prop('selected', true);

        $('#max-attend').val(obj.maxAttLimit).prop('selected', true);
        $('#url1Nm').val(obj.url1Nm);
        $('#url1').val(obj.url1);
        $('#url2Nm').val(obj.url2Nm);
        $('#url2').val(obj.url2);

        $('#teamTreeUrl').val(obj.teamTreeUrl);
        $('#voteDays').val(obj.voteDays);

        // $('#')
    },
    modifySchedule: function() {
        console.log('click modify');
        $('#modify-schedule').trigger('submit');
    }
}

fnPlaceObj = {
    initMap: function() {
        console.log(vMap);
        if (vMap === undefined ) {
            vw.ol3.MapOptions = {
                basemapType: vw.ol3.BasemapType.GRAPHIC
              , controlDensity: vw.ol3.DensityType.EMPTY
              , interactionDensity: vw.ol3.DensityType.BASIC
              , controlsAutoArrange: true
              , homePosition: vw.ol3.CameraPosition
              , initPosition: vw.ol3.CameraPosition
            };
        
            vMap = new vw.ol3.Map("scheduleMap",  vw.ol3.MapOptions); 
        }
        $('#location-search').val(null);
        $('#address-road').val(null);
        $('#address-parcel').val(null);
        $('#place-result-select').empty();
        $('#place-result-select').append(
            '<div class="comment">검색 후 장소를 선택해주세요.</div>'
        );
        if (vMarkerLayer != null) {
            vMap.removeLayer(vMarkerLayer);
        }
        var pan = ol.animation.pan({
            duration: 200,
            source: (vMap.getView().getCenter())
        });
        vMap.beforeRender(pan);
        vMap.getView().setCenter(defaultXY);
        vMap.getView().setZoom(zoom);
    },
    search: function() {
        console.log('-- search location --');
        var loadingItem = `<span class="mif-spinner5 ani-spin></span> 장소 검색 중...`;
        $('#place-result-select').empty();
        $('#place-result-select').append(loadingItem);

        var location = $('#location-search').val();
        console.log(location);
        if ( !location ) {
            $('#location-search').trigger('focus');
            return false;
        }

        var param = {
            location: location,
        }

        $.get('/map/search', param, function(data){
            console.log(data);
            if (data.response.status === 'OK') {
                var selectItem = `<select id="location-select" class="choice">`;
                if (Number(data.response.record.total) > 0) {
                    // $('#support-comment').text(`검색결과: ${data.response.record.total}건이 검색되었습니다.`);
                    for(var obj of data.response.result.items) {
                        selectItem += `<option value="${obj.point.x},${obj.point.y}" `;
                        selectItem += `data-cordx="${obj.point.x}" `;
                        selectItem += `data-cordy="${obj.point.y}" `;
                        selectItem += `data-road="${obj.address.road}" `;
                        selectItem += `data-parcel="${obj.address.parcel}" `;
                        selectItem += `>${obj.title}</option>`;
                    }
                }
                $('#place-result-select').empty();
                $('#place-result-select').append(selectItem);
                $('#location-select').on('change', fnPlaceObj.onLocationChanged);
                $('#location-select').trigger('change');
            }
        });
    },
    onLocationChanged: function() {
        var selectObj = $('#location-select option:selected'); 
        var location = selectObj.val();
        var locationDesr = selectObj.text();
        var road = selectObj.data('road');
        var parcel = selectObj.data('parcel');
        var coordX = location.split(',')[0];
        var coordY = location.split(',')[1];
        const coordNm = 'EPSG:3857';
        //console.log(`cordX: ${cordX}, cordY: ${cordY}`);
        //console.log(vmap);

        var centerPoint = [ Number(coordX), Number(coordY) ];
        var pan = ol.animation.pan({
            duration: 200,
            source: (vMap.getView().getCenter())
        });
        vMap.beforeRender(pan);
        vMap.getView().setCenter(centerPoint);
        vMap.getView().setZoom(zoom);

        // Maker
        vw.ol3.markerOption = {
            x: coordX,
            y: coordY,
            epsg: coordNm,
            title: locationDesr,
            iconUrl: 'http://map.vworld.kr/images/ol3/marker_blue.png',
            text : {
                offsetX: 0.5, //위치설정
                offsetY: 20,   //위치설정
                // font: '12px Calibri,sans-serif',
                // fill: {color: '#000'},
                // stroke: {color: '#fff', width: 2},
                text: locationDesr,
            },
            attr: {"id":"schedule-location-point","name":"schedule-location-point"}
        }
        if (vMarkerLayer != null) {
            vMap.removeLayer(vMarkerLayer);
        }
        vMarkerLayer = new vw.ol3.layer.Marker(vMap);
        vMap.addLayer(vMarkerLayer);
        vMarkerLayer.addMarker(vw.ol3.markerOption);

        $('#address-road').text(road);
        $('#address-parcel').text(parcel);
    },
    clickedItem: function() {
        var addr = $(this).text();
        // document.execCommand('copy');
        if (addr) {
            navigator.clipboard.writeText(addr).then(() => {
                Metro.toast.create('주소가 복사되었습니다.', null, null, 'info');
            });
        }
    },
    show: function() {

        // $('#location').val(locationDesr);
        // var coordX = $('#location').data('coordX');
        // var coordY = $('#location').data('coordY');
        // var road = $('#location').data('road');
        // var parcel = $('#location').data('parcel');
        // console.log(`${coordX} ${coordY} ${road} ${parcel}`);

        $('#popup-tools-background').css('display', 'block');
        $('#place-search-form').fadeIn();
        fnPlaceObj.initMap();
    },
    hide: function() {
        $('#popup-tools-background').css('display', 'none');
        $('#place-search-form').fadeOut();
    },
    selectLocation: function() {
        var selectObj = $('#location-select option:selected');
        console.log(selectObj.length);
        if (selectObj.length === 0) {
            $('#location-search').trigger('focus');
            Metro.toast.create('장소를 선택하세요.', null, null, 'alert');
            return false;
        }
        var location = selectObj.val();
        var locationDesr = selectObj.text();
        var road = selectObj.data('road');
        var parcel = selectObj.data('parcel');
        var coordX = location.split(',')[0];
        var coordY = location.split(',')[1];

        $('#location').val(locationDesr);
        $('#location').data('coordX', coordX);
        $('#location').data('coordY', coordY);
        $('#location').data('road', road);
        $('#location').data('parcel', parcel);

        $('#coordX').val(coordX);
        $('#coordY').val(coordY);
        $('#road').val(road);
        $('#parcel').val(parcel);

        fnPlaceObj.hide();

        $('#location').trigger('blur');
    }
}