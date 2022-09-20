var fnObj = {};
var fnView = {};

$(() => {
    initEvent();
    initView();
});

function initEvent() {
    /*********************
     * 회원가입완료 form
     *********************/
    $('#join-us-button').on('click', fnObj.AddUser);

    $('*:required').each((i, o) => {
        $(o).on('blur', fnObj.invalidate);
    });

    $('#mobile').on('keyup', fnObj.mobileAutoFormat);

    $('#id').on('keyup', fnObj.checkDuplicateId);

    /*********************
     * 회원가입완료 form
     *********************/
    $('#goto-main-button').on('click', fnObj.gotoMain);

    //-------------------------------------
    // 
    //-------------------------------------
    $('#change-user-button').on('click', fnObj.changeUserInfo);

    $('#goto-list-button').on('click', fnObj.gotoCalendar)
}

function initView() {

    fnView.userInfoBind();
}

fnObj = {
    gotoMain: function () {
        console.log('clicked');
        window.location.href = '/login'
    },
    AddUser: function () {
        var valid = true;
        var firstErrorObj = null;
        $('*:required').each((i, o) => {
            $(o).trigger('blur');
            var childValid = $(o).data('valid');
            valid = childValid && valid;
            if (firstErrorObj == null && !valid) {
                firstErrorObj = $(o);
            }
        });

        if (valid) {
            $('#join-form').trigger('submit');
        } else {
            firstErrorObj.focus();
        }
    },
    invalidate: function (e) {
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
        } else if (id === 'id') {
            // 아이디 길이 체크
            if (value.length < 4) { vaild = false; }
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
    mobileAutoFormat: function (e) {
        var mobile = $(this).val();
        mobile = mobile.replace(/[^0-9]/g, '');
        if (mobile.length < 4) {
            mobile = mobile;
        } else if (mobile.length < 7) {
            mobile = mobile.substr(0, 3) + '-' + mobile.substr(3);
        } else if (mobile.length < 11) {
            mobile = mobile.substr(0, 3) + '-' + mobile.substr(3, 3) + '-' + mobile.substr(6);
        } else {
            mobile = mobile.substr(0, 3) + '-' + mobile.substr(3, 4) + '-' + mobile.substr(7);
        }
        $(this).val(mobile);
    },
    changeUserInfo: function () {
        var valid = true;
        var firstErrorObj = null;
        $('*:required').each((i, o) => {
            $(o).trigger('blur');
            var childValid = $(o).data('valid');
            valid = childValid && valid;
            if (firstErrorObj == null && !valid) {
                firstErrorObj = $(o);
            }
        });

        var checkObj = {
            userid: $('#userid').text().trim(),
            password: $('#password').val(),
        }
        console.log('-- request users/auth --');
        $.post('/users/auth', checkObj, function (data, status) {
            console.log(data);
            if (data.status == 200) {
                if (valid) {
                    $('#update-form').trigger('submit');
                } else {
                    firstErrorObj.focus();
                }
            } else {
                alert(data.msg);
                //$('#password').focus();
                $('#password').addClass('display-error');
            }
        });
    },
    checkDuplicateId: function () {
        var userId = $('#id').val();
        if (userId.length < 4) {
            $('#idcheck').text('');
            return false;
        }
        var params = {
            userId: userId,
        }
        $.post('/users/checkId', params, function (data, status) {
            // 중복
            if (data.checked) {
                $('#idcheck').text('중복');
                $('#idcheck').removeClass('fg-color-ok');
                $('#idcheck').addClass('fg-color-rd');
            } else {
                // 미중복
                $('#idcheck').text('OK');
                $('#idcheck').removeClass('fg-color-rd');
                $('#idcheck').addClass('fg-color-ok');
            }
        });
    },
    gotoCalendar: function() {
        window.location.href = '/schedule';
    },
}

fnView = {
    userInfoBind: function () {
        var gender = $('#gender').data('value');
        $('#gender').children(`option[value='${gender}']`).each((i, o) => {
            $(o).attr('selected', 'selected');
        });
        $('#gender').removeAttr('data-value');

        var grade = $('#grade').data('value');
        $('#grade').children(`option[value='${grade}']`).each((i, o) => {
            $(o).attr('selected', 'selected');
        });
        $('#grade').removeAttr('data-value');

        var age = $('#age').data('value');
        $('#age').children(`option[value='${age}']`).each((i, o) => {
            $(o).attr('selected', 'selected');
        });
        $('#age').removeAttr('data-value');
    },
}