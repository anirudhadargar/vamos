// getgetoloaction start
function initialize() {
    var address = (document.getElementById('pac-input'));
    var autocomplete = new google.maps.places.Autocomplete(address);
    autocomplete.setTypes(['geocode']);
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }

    var address = '';
    if (place.address_components) {
        address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
    }
    /***********************/
    /* var address contain your autocomplete address *******/
    /* place.geometry.location.lat() && place.geometry.location.lat() **/
    /* will be used for current address latitude and longitude******/
    /***********************/
    let latt = place.geometry.location.lat();
    let lngg = place.geometry.location.lng();
    document.getElementById('lat').value = place.geometry.location.lat();
    document.getElementById('long').value = place.geometry.location.lng();
    });
}

google.maps.event.addDomListener(window, 'load', initialize);
//   getgeolocationend`````

// export { latt,lngg };
// const popupContent = new google.maps.InfoWindow()
// google .maps.event.addListener(marker,'hover',(function(marker){
//     return function(){
//          popupContent.setContent("m.info")
//          popupContent.open(map,marker)
//     }
// })(marker)
// )

// marker.setMap(map);