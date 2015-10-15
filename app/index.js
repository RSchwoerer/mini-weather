'use strict';
var remote = require('remote');
var app = remote.require('app');
var ipc = require('ipc');

var moment = require('moment');
window.$ = window.jQuery = require('jquery');





// --- forcast.io ------------------------------------------------------------
var TIMEOUT_forecast = 5 * 60 * 1000;
var request = require("request");
var requests = 0;
var ForcastIo = require('forecastio');
// requires Forcast.IO API key, visit https://developer.forecast.io/ and sign up to get one.
// replace 'APIKEY' with your api key.
var fio = new ForcastIo('APIKEY');

function requestForcast() {
	fio.forecast('45.1418815', '-93.0913258', updateForcast);
	requests += 1;
	window.setTimeout(requestForcast, TIMEOUT_forecast);
}

function updateForcast(err, data) {
	if (err) throw err;
	
	
	// update app icon
	ipc.send('temperature-update', data.currently.temperature.toFixed(0) + '°');
	
	var degFloat = parseFloat(data.currently.temperature);
	var color = '#ffffff';
	if (degFloat <= 0) { color = '#8a00a0'; }
	if (degFloat > 0 && degFloat <= 10) { color = '#5121a8'; }
	if (degFloat > 10 && degFloat <= 20) { color = '#303ba6'; }
	if (degFloat > 20 && degFloat <= 30) { color = '#435ef9'; }
	if (degFloat > 30 && degFloat <= 40) { color = '#1396f1'; }
	if (degFloat > 40 && degFloat <= 50) { color = '#18afca'; }
	if (degFloat > 50 && degFloat <= 60) { color = '#128675'; }
	if (degFloat > 60 && degFloat <= 70) { color = '#68ea5b'; }
	if (degFloat > 70 && degFloat <= 80) { color = '#7ab839'; }
	if (degFloat > 80 && degFloat <= 90) { color = '#fbb70b'; }
	if (degFloat > 90 && degFloat <= 100) { color = '#fd840a'; }
	if (degFloat > 100) { color = '#fa3e1b'; }
	
	// $('.temp-color').css('background', color);
	$('.temp-color').css('color', color);

	// background: linear-gradient(#5121a8,#303ba6,#435ef9,#1396f1, #18afca, #128675, #68ea5b, #7ab839, #fbb70b, #fd840a, #fa3e1b);

	$('#current-temperature').text(data.currently.temperature.toFixed(0) + '°')
	$('#current-summary').text(data.currently.summary);


	$('#forcastDebug').text("forcast > " + requests.toString() + "  " + moment(data.currently.time * 1000).format("dddd, MMMM Do YYYY, h:mm:ss a"));

}


// --- wunderground pollen data scrape hack ------------------------------------------------------------
var TIMEOUT_pollen = 60 * 60 * 1000;
var pollenRequests = 0;

function requestWundergroundPollen() {

	request({
		uri: "http://www.wunderground.com/DisplayPollen.asp?Zipcode=55014"
	},
		function (error, response, body) {

			var data = new Object();
			data.currently = {};
			data.forcast = {};
			
			// scrape website to find data
			// pollen type...
			var ptype = $(body).find('.panel.viewport-full h3').text();
			data.currently.Ptype = ptype;

			// days forcast is for...
			var day = [];
			day[1] = $(body).find('table.pollen-table tr:eq(0) td:eq(1) div').text();
			day[2] = $(body).find('table.pollen-table tr:eq(0) td:eq(2) div').text();
			day[3] = $(body).find('table.pollen-table tr:eq(0) td:eq(3) div').text();
			day[4] = $(body).find('table.pollen-table tr:eq(0) td:eq(4) div').text();
			data.currently.Day = day[1];


			// levels...
			var lvl = [];
			lvl[1] = $(body).find('table.pollen-table tr:eq(1) td:eq(1)').text().trim();
			lvl[2] = $(body).find('table.pollen-table tr:eq(1) td:eq(2)').text().trim();
			lvl[3] = $(body).find('table.pollen-table tr:eq(1) td:eq(3)').text().trim();
			lvl[4] = $(body).find('table.pollen-table tr:eq(1) td:eq(4)').text().trim();
			data.currently.Level = lvl[1];

			// update view	
			updatePollenData(data);

			document.getElementById('pollenDebug').innerHTML = "pollen > " + pollenRequests.toString() + "  " + moment(Date.now()).format("dddd, MMMM Do YYYY, h:mm:ss a");

		});

	pollenRequests += 1;
	window.setTimeout(requestWundergroundPollen, TIMEOUT_pollen);
}

function updatePollenData(data) {

	var ty = data.currently.Ptype.replace('Pollen Type: ', '');
	$('#today #current-pollen span').text(ty + ' ' + parseFloat(data.currently.Level).toFixed(2));
	
	//$('#forcast').text(levels[1]);

}

requestWundergroundPollen();
requestForcast();




