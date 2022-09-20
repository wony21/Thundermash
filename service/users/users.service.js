const db = require('../../db')
const mapper = require('mybatis-mapper');
mapper.createMapper(['./mappers/users.mapper.xml']);

exports.getUsers = async function (userId, userName, password) {
    var mysql = await db.connection();
    var param = {
        userId: userId,
        userName: userName,
        password: password,
    };
    const sqlText = mapper.getStatement('users', 'getUsers', param, {});
    //console.log(sqlText);
    let [rows, fields] = await mysql.query(sqlText);
    mysql.end();
    return rows;
}

exports.authentication = async function (userId, password) {
    var mysql = await db.connection();
    var param = {
        userId: userId,
        password: password,
    };
    const sqlText = mapper.getStatement('users', 'getUsers', param, {});
    //console.log(sqlText);
    let [rows, fields] = await mysql.query(sqlText);
    mysql.end();
    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    }
}

exports.getOneUser = async function (userId, userName, password) {
    var mysql = await db.connection();
    var param = {
        userId: userId,
        userName: userName,
        password: password,
    };
    const sqlText = mapper.getStatement('users', 'getUsers', param, {});
    //console.log(sqlText);
    let [rows, fields] = await mysql.query(sqlText);
    mysql.end();
    if (rows.length == 0) {
        return null;
    }
    var userInfo = {
        userId: rows[0].userId,
        userName: rows[0].userName,
        mobile: rows[0].mobile,
        gender: rows[0].gender,
        grade: rows[0].grade,
        age: rows[0].age,
    }
    return userInfo;
}

exports.addUser = async function (userId, userName, password, mobile, gender, grade, age) {
    var mysql = await db.connection();
    var param = {
        userId: userId,
        userName: userName,
        password: password,
        mobile: mobile,
        gender: gender,
        grade: grade,
        age: age
    };
    const sqlText = mapper.getStatement('users', 'addUser', param, {});
    //console.log(sqlText);
    let result = await mysql.execute(sqlText);
    if (result.length == 0) {

    }
    mysql.end();
    return userId;
}

exports.getUserInfo = async function (userId, userName) {
    var mysql = await db.connection();
    var param = {
        userId: userId,
        userName: userName,
    };
    const sqlText = mapper.getStatement('users', 'getUserInfo', param, {});
    console.log(sqlText);
    let [rows, fields] = await mysql.query(sqlText);
    mysql.end();
    var userInfo = null;
    if (rows.length > 0) {
        userInfo = {
            userId: rows[0].userId,
            userName: rows[0].userName,
            mobile: rows[0].mobile,
            gender: rows[0].gender,
            grade: rows[0].grade,
            age: rows[0].age,
            dateFmtStr: rows[0].dateFmtStr,
            registerDateFmt: rows[0].registerDateFmt,
        }
    }
    return userInfo;
}

exports.updateUserInfo = async function (obj) {
    var mysql = await db.connection();
    const sqlText = mapper.getStatement('users', 'updateUser', obj, {});
    let result = await mysql.execute(sqlText);
    mysql.end();
    return { ret: db.getResult(result), data: obj };
}