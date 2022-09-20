let fnObj = {};
let vMap;
let vMarkerLayer;
let defaultXY = [
    14118749.269098494,
    4484072.700684194
];
let zoom = 17;

$(() => {
    initEvent();
    initView();
});

function initEvent() {
    $('#attend').on('click', fnObj.toggleAttend);
    $('#not-attend').on('click', fnObj.toggleAttend);
    // 참석, 불참
    $('#attend-radio').on('change', fnObj.toggleJoin);
    $('#absent-radio').on('change', fnObj.toggleJoin);
    // 게스트 신청
    $('#guest-button').on('click', fnObj.showGuestAttend);
    $('.background-filter').on('click', fnObj.hideGuestAttend);
    $('.background-filter').on('click', fnObj.hideGuestInfoDlg);
    $('#guest-attend-button').on('click', fnObj.attendGuest);
    // 게스트 신청삭제
    $('#guest-remove-button').on('click', fnObj.removeGuest);
}

function initView() {
    fnObj.initCheck();
    fnObj.getScheduleAttend();
    fnPlaceObj.initMap();
}

fnObj = {
    initCheck: function() {
        var schId = $('#schId').data('schedule');
        var param = {
            schId: schId,
        }
        $.get('/attend/v1/my', param, function(data) {
            if (data.attendFg === '1' ) {
                // 참석
                $('#attend-radio').attr('checked', 'checked');
            } else if ( data.attendFg === '0' ) {
                // 불참
                $('#absent-radio').attr('checked', 'checked');
            } else {
                // 미투표 상태
                console.log('else');
            }
        });
    },
    initGuestDialog: function() {
        $('#guest-name').val(null);
        $('#age').val('50');
        $('#grade').val('F');
        $('#gender').val('M');
    },
    setCheck: function(id, status) {
        console.log('set check:', id);
        var obj = $('#' + id);
        var removeClassName;
        var addClassName;
        if (id === 'attend') {
            removeClassName = (status ? 'exercies-join' : 'exercise-attend');
            addClassName = (status ? 'exercise-attend' : 'exercies-join');
        } else {
            // not-attend
            removeClassName = (status ? 'exercise-not-join' : 'exercise-not-attend');
            addClassName = (status ? 'exercise-not-attend' : 'exercise-not-join');
        }

        if (status) {
            obj.attr('checked', 'checked');
        } else {
            obj.removeAttr('checked');
        }

        obj.removeClass(removeClassName);
        obj.addClass(addClassName);
    },
    toggleAttend: function() {
        console.log('toggle');
        var id = $(this).attr('id');
        //console.log(id);
        var checkTargetObj = (id === 'attend') ? $('#attend') : $('#not-attend');
        var uncheckTargetObj = (id === 'attend') ? $('#not-attend') : $('#attend');
        //console.log(checkTargetObj);
        //console.log(uncheckTargetObj);
        var checked = checkTargetObj.attr('checked');
        //console.log(checked);

        var schId = $('#schId').data('schedule');
        var attend = checkTargetObj.data('value');
        var param = { schId: schId, attend: attend };
        console.log(param);
        $.post('/attend/v1/add', param, function(data, status){
            console.log(data);
            if (data.ret) {
                if (checked) {
                    console.log('checked ==> unchecked');
                    fnObj.setCheck(checkTargetObj.attr('id'), false);
                    fnObj.setCheck(uncheckTargetObj.attr('id'), true);
                } else {
                    console.log('unchecked ==> checked');
                    fnObj.setCheck(checkTargetObj.attr('id'), true);
                    fnObj.setCheck(uncheckTargetObj.attr('id'), false);
                }
                // 정보 다시불러오기
                fnObj.getScheduleAttend();
            }
        });
       
    },
    toggleJoin: function() {
        var schId = $('#schId').data('schedule');
        var attendFg = $(this).data('value');
        var param = { schId: schId, attend: attendFg };
        console.log(param);
        $.post('/attend/v1/add', param, function(data, status){
            console.log(data);
            if (data.ret) {
                fnObj.getScheduleAttend();
            }
        });
    },
    getScheduleAttend: function() {
        var schId = $('#schId').data('schedule');
        var param = { 
            schId: schId 
        }
        $.get('/attend/v1/get', param, function(data){
            $('#attend-list-header').text('참석자(' + data.attUsers.length + '명)');
            $('#attend-list').empty();
            for(var o of data.attUsers) {
                var item = `<div class="cus-info-small-box bg-color-ok">`+ o.userName +`</div>`;
                $('#attend-list').append(item);
            }
            $('#absent-list-header').text('불참자(' + data.absUsers.length + '명)');
            $('#absent-list').empty();
            for(var o of data.absUsers) {
                var item = `<div class="cus-info-small-box bg-color-rd">`+ o.userName +`</div>`;
                $('#absent-list').append(item);
            }
            $('#unvote-list-header').text('미투표자(' + data.unvUsers.length + '명)');
            $('#unvote-list').empty();
            for(var o of data.unvUsers) {
                var item = `<div class="cus-info-small-box bg-color-gy">`+ o.userName +`</div>`;
                $('#unvote-list').append(item);
            }
            $('#guest-list-header').text('게스트(' + data.attGuests.length + '명)');
            $('#guest-list').empty();
            for(var o of data.attGuests) {
                var item = `<div class="cus-info-small-box bg-color-yw" data-group="guest-item">`+ o.userName +`</div>`;
                $('#guest-list').append(item);
            }

            var totalAttendCount = data.attUsers.length + data.attGuests.length;
            var maxAttendLimit = data.maxAttLimit;
            var description = totalAttendCount + '명 / ' + maxAttendLimit + '명';
            $('#total-attend-users').text(description);

            // 게스트 아이템 이벤트 트리거
            $('[data-group="guest-item"]').on('click', function(){
                // console.log($(this).text());
                fnObj.showGuestInfo(this);
            });

        });
    },
    showBackgroundLock: function(visible) {
        if (visible) {
            $('.background-filter').css('display', 'flex');
        } else {
            $('.background-filter').css('display', 'none');
        }
    },
    showGuestAttend: function() {
        var speed = 200;
        fnObj.initGuestDialog();
        $('#guest-attend-dialog').css('height', '360px');
        $('#guest-attend-dialog').fadeIn(speed);
        fnObj.showBackgroundLock(true);
    },
    hideGuestAttend: function() {
        $('#guest-attend-dialog').css('display', 'none');
        fnObj.showBackgroundLock(false);
    },
    showGuestInfoDlg: function() {
        var speed = 200;
        $('#guest-info-dialog').css('height', '460px');
        $('#guest-info-dialog').fadeIn(speed);
        fnObj.showBackgroundLock(true);
    },
    hideGuestInfoDlg: function() {
        $('#guest-info-dialog').css('display', 'none');
        fnObj.showBackgroundLock(false);
    },
    attendGuest: function() {
        var schId = $('#schId').data('schedule');
        var name = $('#guest-name').val();
        var grade = $('#grade').val();
        var gender = $('#gender').val();
        var age = $('#age').val();
        var param = {
            schId: schId,
            guestname: name,
            grade: grade,
            gender: gender,
            age: age,
        }
        if (!param.guestname.trim()) {
            $('#guest-name').val(null);
            $('#guest-name').trigger('focus');
            return;
        }
        $.post('/attend/v1/add/guest', param, function(obj, status){
            console.log(obj);
            if (obj.ret) {
                fnObj.getScheduleAttend();
                Metro.toast.create('[' + obj.data.guestNm + ']님이 등록되었습니다.', null, null, 'info');
            } else {
                Metro.toast.create(obj.message, null, null, 'alert');
            }
            fnObj.hideGuestAttend();
        });
    },
    showGuestInfo: function(_this) {
        fnObj.showGuestInfoDlg(true);
        var schId = $('#schId').data('schedule');
        var guestNm = $(_this).text();
        var param = {
            schId: schId,
            guestNm: guestNm,
        }
        console.log(param);
        $.get('/attend/v1/get/guest', param, function(data){
            console.log(data);
            if (data.ret) {
                fnObj.setGuestInfo(data.data[0]);
            } else {
                Metro.toast.create(data.message, null, null, 'alert');
            }
        });
    },
    setGuestInfo: function(obj) {
        console.log(obj);
        $('#guest-name-info').val(obj.guestNm);
        $('#age-info').val(obj.age).prop('selected', true);
        $('#grade-info').val(obj.grade).prop('selected', true);
        $('#gender-info').val(obj.gender).prop('selected', true);

        $('#guest-userid-info').val(obj.userNm);
        $('#guest-attend-date').val(obj.attRegDt);

        $('#age-info').css('pointer-events', 'none');
        $('#grade-info').css('pointer-events', 'none');
        $('#gender-info').css('pointer-events', 'none');

        // $('#age-info').not(':selected').attr('disabled', 'disabled');
    },
    removeGuest: function() {
        var schId = $('#schId').data('schedule');
        var guestNm = $('#guest-name-info').val();
        var param = {
            schId: schId,
            guestname: guestNm,
        }
        console.log('removeGuest');
        console.log(param);
        $.post('/attend/v1/delete/guest', param, function(obj){
            if (obj.ret) {
                fnObj.getScheduleAttend();
                fnObj.hideGuestInfoDlg();
                Metro.toast.create('[' + obj.data.guestNm + ']님이 등록취소 되었습니다.', null, null, 'alert');
            } else {
                Metro.toast.create(obj.message, null, null, 'alert');
            }
        });
    },
}


fnPlaceObj = {
    initMap: function() {
        var coordX = $('#location-data-info').data('coord-x');
        var coordY = $('#location-data-info').data('coord-y');
        var road = $('#location-data-info').data('road');
        var parcel = $('#location-data-info').data('parcel');
        const coordNm = 'EPSG:3857';
        var locationNm = $('#schId').text();
        if (vMap === undefined ) {
            console.log(vMap);
            vw.ol3.MapOptions = {
                basemapType: vw.ol3.BasemapType.GRAPHIC
              , controlDensity: vw.ol3.DensityType.EMPTY
              , interactionDensity: vw.ol3.DensityType.BASIC
              , controlsAutoArrange: true
              , homePosition: vw.ol3.CameraPosition
              , initPosition: vw.ol3.CameraPosition
            };
            vMap = new vw.ol3.Map("vmap",  vw.ol3.MapOptions); 
        }
        var center = [coordX, coordY];
            var pan = ol.animation.pan({
                duration: 200,
                source: (vMap.getView().getCenter())
            });
            vMap.beforeRender(pan);
            vMap.getView().setCenter(center);
            vMap.getView().setZoom(zoom);
            // Maker
            vw.ol3.markerOption = {
                x: coordX,
                y: coordY,
                epsg: coordNm,
                title: locationNm,
                iconUrl: 'http://map.vworld.kr/images/ol3/marker_blue.png',
                text : {
                    offsetX: 0.5, //위치설정
                    offsetY: 20,   //위치설정
                    // font: '12px Calibri,sans-serif',
                    // fill: {color: '#000'},
                    // stroke: {color: '#fff', width: 2},
                    text: locationNm,
                },
                attr: {"id":"schedule-location-point","name":"schedule-location-point"}
            }
            if (vMarkerLayer != null) {
                vMap.removeLayer(vMarkerLayer);
            }
            vMarkerLayer = new vw.ol3.layer.Marker(vMap);
            vMap.addLayer(vMarkerLayer);
            vMarkerLayer.addMarker(vw.ol3.markerOption);
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