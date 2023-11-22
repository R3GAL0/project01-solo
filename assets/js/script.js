// dotenv doesnt work on static pages apparently
// require('dotenv').config();

const foodTypeEl = document.querySelector('#filter-food-options');
const userLocationEl = document.querySelector('#location-filter');
const pricesEl = document.querySelector('#filter-div-prices');
//
// let submitFormEl = document.getElementById('modal-form');
const searchBtnEl = document.querySelector('#search-button');
const favouritesEl = document.querySelector('#favourites-list');
const searchResultsEl = document.querySelector('#search-results');
const favouriteArr = JSON.parse(localStorage.getItem('favouriteArr')) || [];
// google maps places & details api key
// import apiKey from './config.js';
// const apiKey = require('./config.js');
const apiKey = axios.get(window.apiKey)
// const apiKey = process.env.GOOGLE_KEY;
// api documentation
// https://developers.google.com/maps/documentation/places/web-service/search-find-place
// https://developers.google.com/maps/documentation/places/web-service/details

const proxyurl = "https://cors-anywhere.herokuapp.com/";

// use place search to get a place_id from a general query, then place details for details on that id
// var query = 'indian%20food';
// var url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + query + '&key=AIzaSyBWAZHdf5zRqq6liQdqOjUEEIqyxkdDzAc';
// var proxyurl = "https://cors-anywhere.herokuapp.com/";
// https://stackoverflow.com/questions/28359730/google-place-api-no-access-control-allow-origin-header-is-present-on-the-req

// fetches place_id s when given a querry and calls the location details method
function placeLocations(query) {
    let url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + query + '&key=' + apiKey;
    // var locations = [];
    fetch(proxyurl + url)
        .then(function (response) {
            // console.log(response);
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            for (let i = 0; i < data.results.length; i++) {
                // // locations.push(data.results[i].place_id);
                // console.log('place id ' + i + ' :: ' + data.results[i].place_id);
                locationDetails(data.results[i].place_id, i, 'gen');
            }
            // return locations;
        });

}
// placeLocations(url); // for testing above

// can only make basic requests of place details api. Else will be billed
// Basic 'fields=': The Basic category includes the following fields: address_components, adr_address, business_status, formatted_address, geometry, icon, icon_mask_base_uri, icon_background_color, name, permanently_closed (deprecated), photo, place_id, plus_code, type, url, utc_offset, vicinity, wheelchair_accessible_entrance. 
// need to include at least one basic 'fields=' request or it returns all options

// place_id = ChIJD_SfHlk5tokRjbCVXAaBy3A
const idTest = 'ChIJD_SfHlk5tokRjbCVXAaBy3A';
// this function fetches location details from a place_id and adds the required HTML elements to the page
// id is required for the url to generate the details, index is to later append with a data-X attribute, location is to track if the function is being called to generate favourites or the basic search function.
function locationDetails(id, index, location) {
    let locationURL = 'https://maps.googleapis.com/maps/api/place/details/json?place_id=' + id + '&fields=formatted_address,business_status,icon,name,type,url,wheelchair_accessible_entrance&key=' + apiKey;
    // does type contain resturant, is the buisness_status=true
    fetch(proxyurl + locationURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log(data);
            let resturant = [data.result.name, data.result.formatted_address, data.result.icon, data.result.wheelchair_accessible_entrance, data.result.business_status, data.result.url];
            if (resturant[3]) {
                resturant[3] = 'Yes';
            } else {
                resturant[3] = 'No';
            }
            // console.log('resturant: ' + resturant);
            // print details to the page, with an anchor link and favourite button
            let li = document.createElement('li');
            let btn = document.createElement('button');
            let anchor = document.createElement('a');
            li.textContent = 'Name: ' + resturant[0] +', '+ '\n Address: ' + resturant[1] + '\n Wheelchair Accessible: ' + resturant[3] +', '+ '\n Business Status: ' + resturant[4] +', Link: '+ '    ';
            anchor.textContent = 'Google Maps URL';
            anchor.setAttribute('href', resturant[5]);
            anchor.style.color = 'blue';
            btn.style.color = 'red';
            if (location != 'fav'){
                btn.setAttribute('data-generated', index);
                btn.textContent = 'Favourite';
                searchResultsEl.append(li)
                searchResultsEl.lastChild.appendChild(anchor);
                searchResultsEl.lastChild.appendChild(btn);
            } else {
                btn.setAttribute('data-fav', index);
                btn.textContent = 'UN-Favourite';
                favouritesEl.append(li)
                favouritesEl.lastChild.appendChild(anchor);
                favouritesEl.lastChild.appendChild(btn);
            }
            btn.setAttribute('data-id', id);
        });


}

// var test = locationDetails(idTest);
// console.log('outside the function' + test);


// this formats the search querry and calls the fetch functions when search is pressed
// add to submitBtnEl was searchBtnEl

// document.addEventListener('DOMContentLoaded', function() {
// });

// submitFormEl.addEventListener("submit", function (event) {
searchBtnEl.addEventListener("click", function (event) {

    let searchQuery = $('#search-bar').val();

    // if statements to check the checkboxes
    // if true add to query
    
    // takes food type criteria

    // to be used if modal is implemented
    // if ($('#modal-form').children().eq(1).children().eq(1).val() != '') {
    //     var searchTemp = '%20' + $('#modal-form').children().eq(1).children().eq(1).val().replace(' ', '%20');
    //     searchQuery = searchQuery.concat(searchTemp);
    // }


    if ($(foodTypeEl).children().eq(1).children().eq(0).children().eq(0).prop('checked')) {
        searchQuery = searchQuery.concat('%20italian');
    } // italian
    if ($(foodTypeEl).children().eq(1).children().eq(1).children().eq(0).prop('checked')) {
        searchQuery = searchQuery.concat('%20mexican');
    } // mexican
    if ($(foodTypeEl).children().eq(1).children().eq(2).children().eq(0).prop('checked')) {
        searchQuery = searchQuery.concat('%20chinese');
    } // chinese

    // takes location criteria
    // if ($('#modal-form').children().eq(1).children().eq(3).val() != '') {
    //     var locationTemp = '%20' + $('#modal-form').children().eq(1).children().eq(3).val().replace(' ', '%20');
    //     searchQuery = searchQuery.concat(locationTemp);
    // }
    if ($(userLocationEl).val() != '') {
        let locationTemp = '%20' + $(userLocationEl).val().replace(' ', '%20');
        searchQuery = searchQuery.concat(locationTemp);
    }

    
    // price range -----------------------------------------
    // if ($('#modal-form').children().eq(1).children().eq(5).val() != '') {
    //     var priceTemp = '%20' + $('#modal-form').children().eq(1).children().eq(5).val().replace(' ', '%20');
    //     searchQuery = searchQuery.concat(priceTemp);
    // }

    // old price range
    if ($(pricesEl).children().eq(1).children().eq(0).children().eq(0).prop('checked')) {
        searchQuery = searchQuery.concat('%20cheap');
    } // cheap
    if ($(pricesEl).children().eq(1).children().eq(1).children().eq(0).prop('checked')) {
        searchQuery = searchQuery.concat('%20moderately%20priced');
    } // moderately priced
    if ($(pricesEl).children().eq(1).children().eq(2).children().eq(0).prop('checked')) {
        searchQuery = searchQuery.concat('%20expensive');
    } // expensive


    console.log('final: ' + searchQuery);

    // perform a fetch with user query
    // perform a fetch with location id
    // print details to the page

    placeLocations(searchQuery);
});



// add event listener to btn for fav add + delete
document.addEventListener('click', function (event) {
    // get id from button parent
    let indexGen = event.target.getAttribute('data-generated');
    if (indexGen == null){
    } else if (!isNaN(indexGen)){
        // push to array
        let placeID = event.target.getAttribute('data-id');
        favouriteArr.push(placeID);
        // store locally
        localStorage.setItem('favouriteArr', JSON.stringify(favouriteArr));
    }

    // method to delete favourites
    let indexFav = event.target.getAttribute('data-fav');
    if (indexFav == null){
    } else if (!isNaN(indexFav)){
        // empty ele from fav array
        let placeID = event.target.getAttribute('data-id');
        // filter to remove the old id from the favourites array
            // favouriteArr = favouriteArr.filter(compare(favouriteItem, placeID));
        let arrayTemp = [];
        for (let i=0; i < favouriteArr.length; i++) {
            if (favouriteArr[i] != placeID){
                arrayTemp.push(favouriteArr[i]);
            }
        }
        favouriteArr = arrayTemp;
        // store locally
        localStorage.setItem('favouriteArr', JSON.stringify(favouriteArr));

    }

})

// generate fav list
function genFavs (favouriteArr) {
    for (let i=0; i < favouriteArr.length; i++){
        locationDetails(favouriteArr[i], i, 'fav');
    }
}
genFavs(favouriteArr);


// // for modal window
// let modalEl= document.getElementById('open-modal-button');
// modalEl.addEventListener('click', function () {
//     $('#myModal').modal('show');
// });

