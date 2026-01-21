"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {

      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}


const LocationMap = ({ position, onPositionChange }) => {

  const defaultPosition = { lat: -5.0934, lng: -42.8033 };

  const currentPosition = position && position.lat != null && position.lng != null
                          ? [position.lat, position.lng]
                          : [defaultPosition.lat, defaultPosition.lng];

  return (
    <MapContainer
      center={currentPosition} 
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '300px', width: '100%', borderRadius: '8px', zIndex:'0' }}
      
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
      />
      {position && position.lat != null && position.lng != null && ( 
        <Marker position={currentPosition} icon={customMarkerIcon}> 
          <Popup>
            Localização Selecionada: <br /> Latitude: {position.lat.toFixed(4)} <br /> Longitude: {position.lng.toFixed(4)}
          </Popup>
        </Marker>
      )}
      <ClickHandler onMapClick={onPositionChange} />
    </MapContainer>
  );
};

export default LocationMap;