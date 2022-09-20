const db = require('../../db')
const mapper = require('mybatis-mapper');
mapper.createMapper(['./mappers/schedule.mapper.xml']);

exports.getBattlesCount = async function() {
    var mysql = await db.connection();
    const cntText = mapper.getStatement('battles', 'getBattleCount', {}, {});
    let [rows, fields] = await mysql.query(cntText);
    mysql.end();
    return rows[0].battleCount;
}

exports.getBattles = async function(id, name, sttdate, enddate, location) {
    
    var mysql = await db.connection();
    var param = {
        id: id,
        battleName: name, 
        sttdate: sttdate, 
        enddate: enddate,
        location: location,
    };

    const sqlText = mapper.getStatement('battles','getBattles', param, {});

    console.log(sqlText);

    let [rows, fields] = await mysql.query(sqlText);
    mysql.end();

    return rows;
}

exports.addBattle = async function(name, date, location, url1, url2, creator, maxAttend, voteDays, leagueTreeUrl) {
    var status = 'I';
    var mysql = await db.connection();
    var param = {
        name: name,
        date: date,
        location: location,
        url1: url1,
        url2: url2,
        creator: creator,
        status: status,
        maxAttend: maxAttend,
        voteDays: voteDays,
        leagueTreeUrl: leagueTreeUrl
    };
    const sqlText = mapper.getStatement('battles','addBattle', param, {});
    console.log(sqlText);
    let result = await mysql.execute(sqlText);
    console.log('-- add battle --');
    console.log(result);
    console.log('inserted ID:', result[0].insertId);
    mysql.end();
    let id = '';
    if ( result.length > 0) {
        id = result[0].insertId;
    }
    return id;
}

exports.createBattle = async function(name, date, location, url1, url2, creator, attendEndTime, maxAttend, voteDays, leagueTreeUrl) {
    var status = 'I';
    var mysql = await db.connection();
    var param = {
        name: name,
        date: date,
        location: location,
        url1: url1,
        url2: url2,
        creator: creator,
        status: status,
        attendEndTime: attendEndTime,
        maxAttend: maxAttend,
        voteDays: voteDays,
        leagueTreeUrl: leagueTreeUrl
    };
    const sqlText = mapper.getStatement('battles','addBattle', param, {});
    console.log(sqlText);
    let result = await mysql.execute(sqlText);
    console.log('-- add battle --');
    console.log(result);
    console.log('inserted ID:', result[0].insertId);
    mysql.end();
    let id = '';
    if ( result.length > 0) {
        id = result[0].insertId;
    }
    return id;
}