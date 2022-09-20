require('dotenv').config();

const mysql = require('mysql2/promise');
// const mysql = require('mysql2-model')

exports.connection = async () => await mysql.createConnection({
    host: process.env.DB_URI,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

exports.getResult = function(result) {
    console.log(result);
    var resultBolean = false;
    if (result.length > 0) {
        if (result[0].affectedRows > 0) {
            resultBolean = true;
        }
    }
    return resultBolean;
}

