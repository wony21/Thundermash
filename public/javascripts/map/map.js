/* map.js */
let fnObj = {}
let mapController;
let vmap;
let markerLayer;

$(() => {
    initView();
    initEvent();
});

function initView() {
    // vw.MapControllerOption = {
    //     container : "vmap",
    //     mapMode : "2d-map",
    //     basemapType : vw.ol3.BasemapType.GRAPHIC,
    //     controlDensity : vw.ol3.DensityType.EMPTY,
    //     interactionDensity : vw.ol3.DensityType.BASIC,
    //     controlsAutoArrange : true,
    //     homePosition : vw.ol3.CameraPosition,
    //     initPosition : vw.ol3.CameraPosition,
    // };

    // mapController = new vw.MapController(vw.MapControllerOption);

    vw.ol3.MapOptions = {
        basemapType: vw.ol3.BasemapType.GRAPHIC
      , controlDensity: vw.ol3.DensityType.EMPTY
      , interactionDensity: vw.ol3.DensityType.BASIC
      , controlsAutoArrange: true
      , homePosition: vw.ol3.CameraPosition
      , initPosition: vw.ol3.CameraPosition
    };

    vmap = new vw.ol3.Map("vmap",  vw.ol3.MapOptions); 
}

function initEvent() {
    $('#search-button').on('click', fnObj.searchLocation);
}

fnObj = {
    searchLocation: function() {
        var loadingItem = `<span class="mif-spinner5 ani-spin></span> 장소 검색 중...`;
        $('#place-result-select').empty();
        $('#place-result-select').append(loadingItem);
        console.log('1');
        var location = $('#location').val();
        console.log('2');
        if ( !location ) {
            $('#location').trigger('focus');
            return false;
        }
        console.log('3');
        var param = {
            location: location,
        }
        console.log('4');
        $.get('/map/search', param, function(data){
            console.log(data);
            if (data.response.status === 'OK') {
                var selectItem = `<select id="location-select" class="choice">`;
                if (Number(data.response.record.total) > 0) {
                    $('#search-result-comment').text(`검색결과: ${data.response.record.total} 건 검색되었습니다.`);
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
                $('#location-select').on('change', fnObj.onLocationChanged);
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
        var cordX = location.split(',')[0];
        var cordY = location.split(',')[1];
        console.log(`cordX: ${cordX}, cordY: ${cordY}`);

        console.log(vmap);

        var centerPoint = [ Number(cordX), Number(cordY) ];
        var z = 16;
        var pan = ol.animation.pan({
            duration: 2000,
            source: (vmap.getView().getCenter())
        });
        vmap.beforeRender(pan);
        vmap.getView().setCenter(centerPoint);
        vmap.getView().setZoom(17);

        // Maker
        vw.ol3.markerOption = {
            x: cordX,
            y: cordY,
            epsg: 'EPSG:3857',
            title: locationDesr,
            iconUrl: 'http://map.vworld.kr/images/ol3/marker_blue.png',
            text : {
                offsetX: 0.5, //위치설정
                offsetY: 20,   //위치설정
                font: '12px Calibri,sans-serif',
                fill: {color: '#000'},
                stroke: {color: '#fff', width: 2},
                text: locationDesr,
            },
            attr: {"id":"maker01","name":"속성명1"}
        }
        if (markerLayer != null) {
            vmap.removeLayer(markerLayer);
        }
        markerLayer = new vw.ol3.layer.Marker(vmap);
        vmap.addLayer(markerLayer);
        markerLayer.addMarker(vw.ol3.markerOption);

        $('#address-road').text(road);
        $('#address-parcel').text(parcel);
    }
}

