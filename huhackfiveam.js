var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');

//initializing a splash window for loading
var loading_splash_window = new UI.Window();

//creating a text element

var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'Fetching Data',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
  backgroundColor:'white'
});

//opening a splash window
loading_splash_window.add(text);
loading_splash_window.show();



var wmata_api_key = 'kfgpmgvfgacx98de9q3xazww';
var wmata_stations_url = 'http://api.wmata.com/Rail.svc/json/JStations';
var metro_stations = [];
var initial_menu = [];
var counter = 0;


//distance formula
function distance (x1, y1, x2, y2)
{
	var dx = Math.pow(x2 - x1, 2);
	var dy = Math.pow(y2 - y1, 2);

	return Math.pow(dx + dy, 0.5);
}

//after finding the person's geolocation

function success(pos) {
    var lat = pos.coords.latitude;
    var long = pos.coords.longitude;
  
  
    //Attempts to find which station is closest to `position`, and then shows a menu of trains going through that station.
  new ajax(
        {
          url: wmata_stations_url + '?api_key=' + wmata_api_key,
          type: 'json'
        },       
        function (data) {
          var station_dist = 180;
          var closest;
          for (var s in data.Stations)
          {
            var dist = distance(lat, long, data.Stations[s].Lat, data.Stations[s].Lon);
            //finding the shortest distanced metro
            if (dist < 180)
              {
               var content = data.Stations[s].Address.Street + '\n' + data.Stations[s].LineCode1;
                metro_stations.push({
                title: data.Stations[s].Name,
                subtitle: content   
              });
              }         
            if (dist < station_dist)
            {
              counter = counter + 1;
              station_dist = dist;
              closest = data.Stations[s];
              var street_address= data.Stations[s].Address.Street;
              var nearest_metro_distance = dist;
            }
          }
          
          //creating about detail page
          var closest_station = closest.Name;
          var about = 'This app was made in the HUHack in 2015';
          //creating a array of the three things to put in the initial menu
          initial_menu.push({
                title: 'Closest Station',
              body: closest_station
              });
          initial_menu.push({
            title: 'Other Stations',
            body: metro_stations
          });
          initial_menu.push({
            title: 'About',
            body:''
          });
          //creating a menu for main page
          var mainMenu = new UI.Menu({
            sections:[{
              title: 'Menu',
              items: initial_menu
            }]
          });
          mainMenu.show();
          loading_splash_window.hide();
          
          mainMenu.on('select', function(e){
            if (e.itemIndex == 2)
              {
                var card = new UI.Card({
                  title: 'About',
                  subtitle: about
                });
                card.show();
              }
            //nearest, navigation required
            if (e.itemIndex === 0)
              {
                var miles = (parseInt(parseFloat(nearest_metro_distance * 10000))/100.00);
                var nearest_metro_details = street_address + ' \ndistance:\n' + miles.toString()  + ' miles' + '\n' + (parseInt((miles * 60) / 3.1)).toString() + ' minutes walking' ;
               var card1 = new UI.Card({
                  title:closest.Name,
                 subtitle: nearest_metro_details,
                 scrollable: true
                });
                card1.show();
              }
            if (e.itemIndex == 1)
              {
                var other_station_menu = new UI.Menu({
                  sections:[{
                    title:'Other Stations',
                    items: metro_stations,
                    scrollable: true
                  }]  
                });
                other_station_menu.on('select', function(e){
                  var card = new UI.Card({
                    title: metro_stations[e.itemIndex].title,
                    subtitle: metro_stations[e.itemIndex].subtitle,
                    scrollable: true
                  });
                  card.show();
                });
                other_station_menu.show();
              }
          });
        }, 
      function (error) {
          var card = new UI.Card({
            title: 'Error',
            body: 'error'
          });
          card.show();
      });
}
    function error(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    }

navigator.geolocation.getCurrentPosition(success, error);