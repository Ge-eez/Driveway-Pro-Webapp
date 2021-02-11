function GetMap() {
    var map = new Microsoft.Maps.Map('#myMap', {
        credentials: 'Aqtur3l2fZ_uaFh4pMVyrZvFKkFMRue9-W6aYL10dVoAcWLNwtd_jYnI6dVwbJ8H'
    });
    

    //Request the user's location
    navigator.geolocation.getCurrentPosition(function (position) {
        var loc = new Microsoft.Maps.Location(
            position.coords.latitude,
            position.coords.longitude);

        //Add a pushpin at the user's location.
        var pin = new Microsoft.Maps.Pushpin(loc);
        map.entities.push(pin);

        if (typeof(Number.prototype.toRad) === "undefined") {
            Number.prototype.toRad = function() {
              return this * Math.PI / 180;
            }
        }
        

        console.log(position.coords.latitude,
            position.coords.longitude);
        //Center the map on the user's location.
        map.setView({ center: loc, zoom: 14 });
    });
}