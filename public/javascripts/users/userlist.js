let fnObj = {}
let fnView = {}
let templete;

$(() => {
    initView();
    initEvent();
});

function initView() {
    templete = $('#template').html();
    fnObj.getUserList();
}

function initEvent() {

}

fnObj = {
    getUserList: function() {
        $.get('/users/v1/get', {}, function(res){
            console.log(res);
            if (res.ret) {
                var no = 1;
                var totalCnt = 0;
                var maleCnt = 0;
                var femaleCnt = 0;
                res.data.forEach((o, i) => {
                    console.log(o);
                    o.no = no;
                    no = no + 1;
                    if (o.gender === '남성') {
                        o.genderCode = 'male';
                        maleCnt = maleCnt + 1;
                    } else {
                        o.genderCode = 'female';
                        femaleCnt = femaleCnt + 1;
                    }
                });
                totalCnt = maleCnt + femaleCnt;
                var html = Mustache.render(templete, {list : res.data});
                $('#member-info-container').html(html);
                $('#total-count').text(`총 인원: ${totalCnt}명`);
                $('#male-count').text(`남성: ${maleCnt}명`);
                $('#female-count').text(`여성: ${femaleCnt}명`);

            }
        });
    },
}
