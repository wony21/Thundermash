var request = require('request');

exports.findLocation = function (location) {
    console.log('findlocation service');
    return new Promise(function(resolve, reject){
        var apiKey = process.env.VWORLD_KEY;
        var param = {
            key: apiKey,
            service: 'search',
            version: '2.0',
            request: 'search',
            format: 'json',
            errorFormat: 'json',
            size: '100',
            page: '1',
            query: location,
            type: 'PLACE',
            crs: 'EPSG:3857',
        }
        
        const option = {
            uri: process.env.LOCATION_REQUEST_URL,
            method: 'get',
            qs: param,
        }

        request(option, function(err, response, body){
            var data = JSON.parse(body);
            if (data.response.status === 'OK') {
                resolve(data);
            } else {
                reject(data);
            }
        });
    });
}

