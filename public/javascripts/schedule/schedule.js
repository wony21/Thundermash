let fnObj = {};
let scheduleTemplate = null;
let vMap;
let vMarkerLayer;
let defaultXY = [
    14118749.269098494,
    4484072.700684194
];
let zoom = 17;

$(() => {
    console.log('schedule.js');
    initEvent();
    initView();
});

function initEvent() {
    $('#submit-button').on('click', fnObj.addSchedule);
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
    $('#popup-tools-background').on('click', fnObj.hidePops);
    // $('#popup-tools-background').on('click', fnObj.hideConfirm);

    $('#delete-confirm-button').on('click', fnObj.deleteSchedule);
    $('#delete-cancel-button').on('click', ()=> { $('#popup-tools-background').trigger('click'); });
}

function initView() {
    fnObj.initHour();
    fnObj.initMin();
    fnObj.initMaxAttend();
    fnObj.initVotyDate();
    fnObj.searchSchedule();
    fnObj.lockScroll();
    // template 초기화
    scheduleTemplate = $('#template').html();
    // map
    // fnPlaceObj.initMap();
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
        console.log('-- init hour --');
        var hour = 0;
        for(hour=0; hour <24; hour++) {
            var hourFmt = String(hour).padStart(2, '0');
            if ( hour == 18 ) {
                $('#hour').append(`<option value=${hourFmt} selected> ${hourFmt}시`);
            } else {
                $('#hour').append(`<option value=${hourFmt}> ${hourFmt}시`);
            }
        }
    },
    initMin: function() {
        var min = 0;
        for(min=0; min <60; min += 10) {
            var minFmt = String(min).padStart(2, '0');
            if ( min == 30 ) {
                $('#min').append(`<option value=${minFmt} selected> ${minFmt}분`);
            } else {
                $('#min').append(`<option value=${minFmt}> ${minFmt}분`);
            }
        }
    },
    initMaxAttend: function() {
        var attend = 4;
        for(attend=4; attend <= 60; attend += 2) {
            // var attendFmt = String(attend).padStart(2, '0');
            if ( attend == 20 ) {
                $('#max-attend').append(`<option value=${attend} selected> ${attend}명`);
            } else {
                $('#max-attend').append(`<option value=${attend}> ${attend}명`);
            }
        }
    },
    initVotyDate: function() {
        var day = 1;
        for(day=1; day <= 5; day++) {
            // var attendFmt = String(attend).padStart(2, '0');
            if ( day == 1 ) {
                $('#voteDays').append(`<option value=${day} selected> ${day}일`);
            } else {
                $('#voteDays').append(`<option value=${day}> ${day}일`);
            }
        }
    },
    invalidate: function(e) {
        var id = $(this).attr('id');
        var value = $(this).val().replace(/(\s*)/g, ''); // 공백 같이 제거
        var div = $(`div[data-target=${id}`)[0];
        var msg = $(`span[data-target=${id}]`)[0];
        var errorClassName = 'display-error';
        var vaild = true;
        // 공백제거적용
        $(this).val(value);
        // 빈 문자는 무조껀 오류
        if (!value) { 
            vaild = false; 
        }
        if (!vaild) {
            // 테두리 강조
            if (div) { $(div).addClass(errorClassName); }
            // 오류메시지 표시
            if (msg) { $(msg).css('display', 'block'); }

        } else {
            // 테두리 강조 제거
            if (div) { $(div).removeClass(errorClassName); }
            // 오류메시지 숨김
            if (msg) { $(msg).css('display', 'none'); }
        }

        $(this).data('valid', vaild);

        return vaild;
    },
    hidePops: function() {
        fnObj.hideConfirm();
        fnPlaceObj.hide();
    },
    addSchedule: function() {
        var focusObj = null;
        $('*:required').each((i, o) => {
            $(o).trigger('blur');
            var value = $(o).val();
            if (!value && focusObj == null) {
                focusObj = $(o);
            }
        });

        if ( focusObj !== null) {
            focusObj.trigger('focus');
            return false;
        }

        // 등록
        $('#add-schedule').trigger('submit');
    },
    getScheduleOfMonth: function(month) {
        try {
            var element = document.getElementById('schedule-calendar');
            var calendar = Metro.getPlugin(element, 'calendar');
            // 선택 초기화
            calendar.selected = [];
            // 일정 데이터 바인딩
            console.log('-- request list --');
            $.get('/schedule/v1/list', {month: month}, function(res){
                console.log('-- request list response --');
                try {
                    dates = [];
                    for(var val of res.data) {
                        console.log(val);
                        var date = val.schDate.split(' ', 2)[0];
                        dates.push(date);
                        val.totalAttCount = val.attendCount + val.guestCount;
                    }
                    calendar.setPreset(dates.join(','));
                    var html = Mustache.render(scheduleTemplate, {list : res.data});
                    $('#schedule-card-list').html(html);
                    $('[id=delete-schedule-button]').on('click', fnObj.deleteConfirm);
                    $('[id=modify-schedule-button]').on('click', fnObj.gotoModifySchedule);
                } catch (error) {
                    console.error(error.message);
                }
            });
        } catch (error) {
            console.log(error);
        }
    },
    searchSchedule: function() {
        var element = document.getElementById('schedule-calendar');
        if (!element) return;
        var calendar = Metro.getPlugin(element, 'calendar');
        var todayObj = calendar.getToday();
        console.log(todayObj);
        var month = todayObj.value.toFormat('YYYYMM');
        console.log(month);
        fnObj.getScheduleOfMonth(month);
    },
    gotoScheduleCalendar: function() {
        console.log('click');
        window.location.href = '/schedule';
    },
    hideConfirm: function() {
        $('#delete-confirm').fadeOut();
        $('#popup-tools-background').css('display', 'none');
    },
    lockScroll: function() {
        $('#popup-tools-background').on('scroll touchmove mousewheel', function(e){
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    },
    unlockScroll: function() {
        $('#popup-tools-background').off('scroll touchmove mousewheel');
    },
    deleteConfirm: function() {
        var id = $(this).closest('#schedule-info-card').data('id');
        console.log(`schedule request id: ${id}`);
        $('#delete-confirm').data('id', id);

        $('#popup-tools-background').css('top', window.pageYOffset);
        $('#popup-tools-background').css('display', 'block');
        var windowHeight = $(window).height();
        var dlgHeight = $('#delete-confirm').height();
        var topPosition = (windowHeight/2) - (dlgHeight/2) + window.pageYOffset;
        $('#delete-confirm').css('top', topPosition);
        $('#delete-confirm').fadeIn();
    },
    deleteSchedule: function() {
        var id = $('#delete-confirm').data('id');
        //var id = $(this).data('id');
        //console.log(`delete schedule id: ${id}`);
        var param = {
            id: id,
        }
        $.post('/schedule/v1/delete', param, function(obj) {
            if (obj.ret) {
                fnObj.searchSchedule();
                fnObj.hideConfirm();
            } else {
                Metro.toast.create(obj.message, null, null, 'alert');
            }
        })
    },
    gotoModifySchedule: function() {
        var id = $(this).closest('#schedule-info-card').data('id');
        // console.log(`schedule id2: ${id2}`);
        window.location.href = `/schedule/modify?id=${id}`;
    },
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