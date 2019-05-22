'use strict';

console.log('Loading event');

const yelp = require('yelp-fusion');
const distance = require('google-distance-matrix');

const yelpAPIKey = 'a0lWKbJR4P4o5o_nsLacOTqhbdeh3YgQ752QAysky6ztxu1KNLEg0Hr_RVMRptaAb74Ai3o0DZ5pr65uKg392YXRJ4FBX1CH8lebaTlOziXII4yAOjeET3Kl8TZPXHYx';
const googleAPIKey = 'AIzaSyAIGmFmCS9Qxr5Gk3jLE91l6oKngs7tweY';

async function getDistance (currentLat, currentLong, businessLat, businessLong){
    let origins = [`${currentLat},${currentLong}`];
    let destinations = [`${businessLat},${businessLong}`];

    distance.key(googleAPIKey);
    distance.units('imperial');

    return new Promise(function (resolve, reject) {
        distance.matrix(origins, destinations, function (err, distances) {
             if (err) {
                 return console.log(err);
            }
             if (!distances) {
                 return console.log('no distances');
            }
             if (distances.status == 'OK') {
                 for (let i=0; i<origins.length; i++){
                     for (let j=0; j<destinations.length; j++){
                         if (distances.rows[0].elements[j].status == 'OK'){
                             let finalDistance = distances.rows[i].elements[j].distance.text;
                             resolve(finalDistance);
                         }
                         else {
                             reject('error');
                         }
                     }
                 }
             }
         });
});
}

async function findRestaurant (lat, long, res) {
    let currentLatitude = lat;
    let currentLongitude = long;
    let category = res;

    const searchRequest = {
        latitude: currentLatitude,
        longitude: currentLongitude,
        categories: category
    };

    let restaurantList = {
        city: "",
        restaurant: []
    };

    const client = yelp.client(yelpAPIKey);
    const request = await client.search(searchRequest);

    console.log('request', request);
    restaurantList.city = "Cincinnati";

    for (let i=0; i<5; i++){
        const business =  request.jsonBody.businesses[i];
        const businessLocation =  request.jsonBody.businesses[i].coordinates;

        const businessName = business.name;
        const businessRating =  business.rating;
        const businessLatitude = businessLocation.latitude;
        const businessLongitude = businessLocation.longitude;

        restaurantList.restaurant.push({});
        restaurantList.restaurant[i]["name"] = businessName;
        restaurantList.restaurant[i]["rating"] = businessRating;

        let distance = await getDistance(currentLatitude, currentLongitude, businessLatitude, businessLongitude);
        console.log('Returned distance: ', distance);
        restaurantList.restaurant[i]["distance"] = distance;
    }

    console.log("Restaurant list: ", restaurantList);

     return new Promise (function(resolve, reject){
          const response =  {
        body: JSON.stringify(restaurantList),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Origin': '*'
        }
    };
    resolve(response);
     });
}

exports.handler =  async (event) => {
    console.log('Event details: ', event);

    if(event.httpMethod === 'GET'){
        console.log('GET passed trough');

        let userLatitude = event.headers.userlatitude;
        let userLongitude = event.headers.userlongitude;
        let restaurantType = event.headers.userrestaurant;
        let response = findRestaurant(userLatitude, userLongitude, restaurantType);
        return response;
    }
};
