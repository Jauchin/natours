/* eslint-disable */

export const displayMap = (locations) => {
  const ACCESS_TOKEN =
    'pk.eyJ1IjoiamF1amF1IiwiYSI6ImNseGZyd21rOTByeGYyanF0MXVybWJjN2YifQ.C0L7KBJQMuomFPFyxquzUQ';

  mapboxgl.accessToken = ACCESS_TOKEN;
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    // center: [-73.99209, 40.68933],
    // zoom: 8.8,
    // interactive: false,
    scrollZoom: false, // 禁用滾動縮放
    doubleClickZoom: false, // 禁用雙擊縮放
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    const popup = new mapboxgl.Popup({
      offset: 50,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`);
    // .addTo(map);

    // Show the popup when mouse enters the marker
    el.addEventListener('mouseenter', () => {
      popup.setLngLat(loc.coordinates).addTo(map);
    });

    // Hide the popup when mouse leaves the marker
    el.addEventListener('mouseleave', () => {
      popup.remove();
    });

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 250,
      bottom: 250,
      left: 100,
      right: 100,
    },
    duration: 0, // 設置為 0 禁用動畫
  });

  // const searchJS = document.getElementById('search-js');
  // searchJS.onload = function () {
  //   const geocoder = new MapboxGeocoder();
  //   geocoder.accessToken = ACCESS_TOKEN;
  //   geocoder.options = {
  //     proximity: [-73.99209, 40.68933],
  //   };
  //   geocoder.marker = true;
  //   geocoder.mapboxgl = mapboxgl;
  //   map.addControl(geocoder);
  // };
};
