let fnCommon = {};
let fnMenu = {};

$(() => {
    fnCommon.setKrLocale();
    // console.log('set ko-Kr locate.');
    Metro.init();

    // Menu
    $('#app-menu').on('click', fnCommon.toggleMenu);

    $('.menu-box-item').each((i, o) => {
        $(o).on('click', fnCommon.gotoMenuUrl);
    });
});

fnCommon = {
    setKrLocale: function() {
        let krLocaleObj = {
            'ko-KR': {
                "calendar": {
                    "months": [
                        "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월",
                        "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월",
                        "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월",
                    ],
                    "days": [
                        "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일",
                        "일", "월", "화", "수", "목", "금", "토", 
                        "Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"
                    ],
                    "time": {
                        "days": "일",
                        "hours": "시",
                        "minutes": "분",
                        "seconds": "초"
                    }
                },
                "buttons": {
                    "ok": "확인",
                    "Cancel": "취소",
                    "done": "완료",
                    "today": "오늘",
                    "now": "현재",
                    "clear": "초기화",
                    "help": "도움",
                    "yes": "예",
                    "no": "아니오",
                    "random": "무작위"
                }
            }
        }
        Metro.utils.addLocale(krLocaleObj);
    },
    toggleMenu: function() {
        //console.log('toggle menu-bar');
        var height = $('.menu-bar').css('height');
        //console.log(height);
        if (height !== '0px') {
            //console.log('close menu');
            $('.menu-bar').animate({
                height: '0px',
                display: 'none',
                // opacity: '0',
            }).show(20, (e) => {
                $('.menu-bar').css('display', 'none');
            });
        } else {
            //console.log('open menu');
            $('.menu-bar').animate({
                height: '320px',
                display: 'flex',
            }).show();
        }
    },
    gotoMenuUrl: function() {
        var url = $(this).data('link');
        // 로그아웃 conirm 달기 (향후)
        window.location.href = url;
    },
}