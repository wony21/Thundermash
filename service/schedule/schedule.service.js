const db = require('../../db');
const mapper = require('mybatis-mapper');
mapper.createMapper(['./mappers/schedule.mapper.xml']);

exports.getSchedule = async function(filter) {
    try {
        console.log('service get schedule');
        var mysql = await db.connection();
        const sqlText = mapper.getStatement('schedule', 'getSchedule', filter, {});
        console.log('invoke mapper end');
        let [rows, fields] = await mysql.query(sqlText);
        mysql.end();
        return { ret:(rows.length > 0), data: rows };
    } catch (error) {
        return { ret:false, message: error.message };
    }
}

exports.addSchedule = async function(obj) {
    try {
        const mysql = await db.connection();
        const schObj = await this.getSchedule({schLoc: obj.schLoc, schDate: obj.schDate });
        console.log(schObj);
        if (schObj.length > 0) {
            return 'ERR-EXIST';
        }
        const sqlText = mapper.getStatement('schedule', 'addSchedule', obj, {});
        const result = await mysql.execute(sqlText);
        console.log(result);
        console.log(result[0].insertId);
        return result[0].insertId;
    } catch (error) {
        return error.message;
    }
}

exports.modifySchedule = async function(obj) {
    try {
        const mysql = await db.connection();
        const sqlText = mapper.getStatement('schedule', 'updateSchedule', obj, {});
        const result = await mysql.execute(sqlText);
        return { ret: db.getResult(result), data: obj };
    } catch (error) {
        return { ret: false, message: error.message };
    }
}

exports.deleteSchedule = async function(id) {
    try {
        const mysql = await db.connection();
        const sqlText = mapper.getStatement('schedule', 'deleteSchedule', {id: id}, {});
        console.log(sqlText);
        const result = await mysql.execute(sqlText);
        console.log(result);
        return { ret: db.getResult(result), data: id };
    } catch (error) {
        return { ret: false, message: error.message };
    }
}