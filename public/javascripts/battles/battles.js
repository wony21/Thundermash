var fnObj;
var listTemplate;
$(() => {
    // set evnets
    $('#refresh-button').on('click', fnObj.getBattles);
    $('#add-battle-button').on('click', fnObj.goToAddBattles);
    $('#create-battle-button').on('click', fnObj.createBattle);
    $('#back-to-list').on('click', fnObj.gotoBattleList);
    $('#preview-location-url').on('click', fnObj.previewLocation);
});

fnObj = {
    getBattles: function() {
        var JObj = $('#battle-list-table');
        var tableObj = JObj.data('table');
        tableObj.loadData('/battles/list?id&name&sttdate&enddate&location');
    },
    goToAddBattles: function() {
        window.location.href = '/battles/v2/add';
    },
    createBattle: function() {
        
        Metro.dialog.create({
            title: '모임 만들기',
            content: '<div>모임을 생성 하시겠습니까?</div>',
            actions: [
                {
                    caption: '생성',
                    cls: 'js-dialog-close alert',
                    onclick: function() {
                        $('#create-battle-form').submit();
                        console.log('result : true');
                        return true;
                    }
                },
                {
                    caption: '닫기',
                    cls: 'js-dialog-close',
                    onclick: function() {
                        console.log('result : false');
                        return false;
                    }
                }
            ]
        });
    },
    addBattles: function() {
        let battleName = $('#battle-name').val();
        let battleDate = $('#battle-date').val();
        let battleTime = $('#battle-time').val();
        let battleLoc = $('#battle-location').val();
        let url1 = $('#url1').val();
        let url2 = $('#url2').val();
        // name, date, location, url1, url2, creator 
        let param = {
            name: battleName,
            date: battleDate + ' ' + battleTime,
            location: battleLoc,
            url1: url1,
            url2: url2,
            // creator: 'admin'
        };
        $.post('add', param, function(data, status){
            console.log(status);
            console.log(data);
        });

        $('#create-battle-form').submit();

    },
    gotoBattleList : function() {
        window.location.href = '/battles';
    },
    previewLocation: function() {
        let url1 = $('#url1').val();
        var previewUrl = "<div><iframe src='" + url1 + "'></iframe></div>"

        Metro.dialog.create({
            title: "장소 미리보기",
            content: previewUrl,
            closeButton: true
        });
    }
}

