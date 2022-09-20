var fnObj = {};

$(() => {
    initEvent();
    initView();
});

function initEvent() {
    // 회원가입으로 이동
    $('#btn-joinus').on('click', fnObj.moveToJoinUs);
    // 로그인
    $('#login-button').on('click', fnObj.login);
}

function initView() {

}

fnObj = {
    moveToJoinUs: function() {
        console.log('test')
        window.location.href = '/joinus';
    },
    login: function() {
        console.log('request login');
        var username = $('#id').val().trim();
        var password = $('#password').val().trim();
        if ( !username ) {
            $('#id').focus();
            return false;
        }
        if ( !password ) {
            $('#password').focus();
            return false;
        }
        $('#login-form').trigger('submit');
    },
}