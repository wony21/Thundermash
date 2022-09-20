
$(() => {
    initEvent();
    initView();
});

function initEvent() {
    $('#submit-button').on('click', fnObj.addSchedule);

    $('*:required').each((i, o) => {
        $(o).on('blur', fnObj.invalidate);
    });

    $('#date').on('change', fnObj.invalidate);
}

function initView() {
    fnObj.initHour();
    fnObj.initMin();
    fnObj.initMaxAttend();
    fnObj.initVotyDate();
}

fnObj = {
    initHour: function() {
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
}