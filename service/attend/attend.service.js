const db = require('../../db');
const mapper = require('mybatis-mapper');
mapper.createMapper(['./mappers/attend.mapper.xml']);

exports.getAttends = async function(filter) {
    try {
        var mysql = await db.connection();
        console.log(filter);
        const sqlText = mapper.getStatement('attend', 'getAttend', filter, {});
        let [rows, fields] = await mysql.query(sqlText);
        mysql.end();
        
        var maxAttLimit = null;
        var attUsers = [];
        var absUsers = [];
        var attGuests = [];
        var unvUsers = [];
        for(var o of rows) {
            if (o.tp === 'M') {
                if (o.attendFg === null) {
                    unvUsers.push(o);
                } else if (o.attendFg === '1') {
                    attUsers.push(o);
                } else if (o.attendFg === '0') {
                    absUsers.push(o);
                }
            } else if (o.tp === 'G') {
                attGuests.push(o);
            } else if (o.tp === 'L') {
                maxAttLimit = o.attendFg;
            }
        }

        var list = {
            maxAttLimit: maxAttLimit,
            attUsers: attUsers,
            absUsers: absUsers,
            attGuests: attGuests,
            unvUsers: unvUsers
        }
        return list;

    } catch (error) {
        return error.message;
    }
}

exports.getMyAttend = async function(filter) {
    try {
        var mysql = await db.connection();
        console.log(filter);
        const sqlText = mapper.getStatement('attend', 'getMyAttend', filter, {});
        let [rows, fields] = await mysql.query(sqlText);
        mysql.end();
        if ( rows.length > 0) {
            return rows[0];
        } else {
            return { attendFg: null }
        }
    } catch (error) {
        return error.message;
    }
}

exports.getGuest = async function(filter) {
    try {
        var mysql = await db.connection();
        console.log(filter);
        const sqlText = mapper.getStatement('attend', 'getGeustAttend', filter, {});
        let [rows, fields] = await mysql.query(sqlText);
        mysql.end();
        return { ret:( rows.length > 0), data: rows };
    } catch (error) {
        return { ret:false, data:null, message: error.message };
    }
}

exports.duplicateCheck = async function(obj) {
    try {
        const mysql = await db.connection();
        const sqlText = mapper.getStatement('attend', 'getGeustAttend', obj, {});
        console.log(sqlText);
        let [rows, fields] = await mysql.query(sqlText);
        mysql.end();
        if ( rows.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return null;
    }
}

exports.attendSchedule = async function(obj) {
    try {
        const mysql = await db.connection();
        const sqlText = mapper.getStatement('attend', 'upsertAttend', obj, {});
        console.log(sqlText);
        const result = await mysql.execute(sqlText);
        mysql.end();
        return { ret:db.getResult(result), data:null };
    } catch (error) {
        return error.message;
    }
}

exports.attendGuestSchedule = async function(obj) {
    try {
        const mysql = await db.connection();
        const sqlText = mapper.getStatement('attend', 'insertAttendGuest', obj, {});
        const result = await mysql.execute(sqlText);
        console.log(result);
        return { ret:db.getResult(result), data: obj };
    } catch (error) {
        return { ret:false, data:null, message: error.message };
    }
}

exports.deleteGuestSchedule = async function(obj) {
    try {
        const mysql = await db.connection();
        const sqlText = mapper.getStatement('attend', 'deleteAttendGuest', obj, {});
        console.log(sqlText);
        const result = await mysql.execute(sqlText);
        console.log(result);
        return { ret:db.getResult(result), data: obj };
    } catch (error) {
        return { ret:false, data:null, message: error.message };
    }
}