import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Incident } from '../../types';
import { Layers, Ungroup } from 'lucide-react';

// --- Helper Functions and Components ---

const createSeverityIcon = (incident: Incident, isSelected: boolean, isNew: boolean) => {
  const colors: Record<Incident['severity'], string> = {
    'Low': 'bg-green-500',
    'Medium': 'bg-yellow-500',
    'High': 'bg-orange-500',
    'Critical': 'bg-red-500',
  };
  const colorClass = colors[incident.severity] || 'bg-gray-500';
  const selectedClass = isSelected ? 'ring-2 ring-offset-2 ring-offset-neutral-900 ring-primary-400' : '';
  const newClass = isNew ? 'marker-pulse-ping' : '';
  const anonymizedClass = incident.isAnonymized ? 'opacity-40' : '';
  
  return L.divIcon({
    html: `<span class="marker-pulse"><span class="${colorClass} ${newClass} ${anonymizedClass}"></span><span class="marker-pulse-core ${colorClass} ${selectedClass} ${anonymizedClass}"></span></span>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const MapUpdater: React.FC<{ incidents: Incident[], mapView: { center: [number, number], zoom: number } | null }> = ({ incidents, mapView }) => {
    const map = useMap();
    useEffect(() => {
        if (mapView) {
            map.flyTo(mapView.center, mapView.zoom);
        } else if (incidents.length > 0) {
            const bounds = L.latLngBounds(incidents.map(i => [i.lat, i.lon]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        } else {
             map.setView([37.7749, -122.4194], 12); // Default view
        }
    }, [incidents, mapView, map]);
    return null;
};

const Markers: React.FC<{ incidents: Incident[], onMarkerSelect: (id: string) => void, selectedIncidentId: string | null, useClustering: boolean, newIncidentIds: Set<string> }> = ({ incidents, onMarkerSelect, selectedIncidentId, useClustering, newIncidentIds }) => {
    const map = useMap();
    const layerRef = useRef<L.MarkerClusterGroup | L.LayerGroup | null>(null);

    useEffect(() => {
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
        }

        const newLayer = useClustering ? L.markerClusterGroup() : L.layerGroup();
        
        incidents.forEach(incident => {
            const marker = L.marker([incident.lat, incident.lon], {
                icon: createSeverityIcon(incident, incident.id === selectedIncidentId, newIncidentIds.has(incident.id)),
            });

            marker.on('click', () => onMarkerSelect(incident.id));
            
            marker.bindPopup(`
                <div class="text-sm text-neutral-100 p-1">
                    <h4 class="font-bold">${incident.type}</h4>
                    <p>Severity: ${incident.severity}</p>
                    <p>${new Date(incident.timestamp).toLocaleTimeString()}</p>
                    ${incident.isAnonymized ? '<p class="text-yellow-400 text-xs">Anonymized Data</p>' : ''}
                    ${incident.media.length > 0 ? `<img src="${incident.media[0]}" alt="incident media" class="rounded-md mt-2 max-w-xs"/>` : ''}
                </div>
            `);

            newLayer.addLayer(marker);
        });

        map.addLayer(newLayer);
        layerRef.current = newLayer;

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [incidents, map, onMarkerSelect, selectedIncidentId, useClustering, newIncidentIds]);

    return null;
}

// --- Main Component ---

interface IncidentMapProps {
  incidents: Incident[];
  onMarkerSelect: (id: string | null) => void;
  selectedIncidentId: string | null;
  newIncidentIds: Set<string>;
  mapView: { center: [number, number]; zoom: number } | null;
}

const IncidentMap: React.FC<IncidentMapProps> = ({ incidents, onMarkerSelect, selectedIncidentId, newIncidentIds, mapView }) => {
    const [useClustering, setUseClustering] = useState(true);

    return (
        <div className="bg-neutral-800 rounded-lg h-full border border-neutral-700 flex flex-col min-h-[400px] lg:min-h-full relative overflow-hidden">
            <MapContainer center={[37.7749, -122.4194]} zoom={12} scrollWheelZoom={true} className="h-full w-full z-0">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <MapUpdater incidents={incidents} mapView={mapView} />
                <Markers 
                    incidents={incidents} 
                    onMarkerSelect={onMarkerSelect}
                    selectedIncidentId={selectedIncidentId}
                    useClustering={useClustering}
                    newIncidentIds={newIncidentIds}
                />
            </MapContainer>
            <div className="absolute top-3 right-3 z-10">
                <button 
                    onClick={() => setUseClustering(!useClustering)}
                    className="bg-neutral-800 p-2 rounded-md border border-neutral-600 shadow-lg hover:bg-neutral-700 transition-colors"
                    aria-label={useClustering ? "Disable Clustering" : "Enable Clustering"}
                >
                    {useClustering ? <Ungroup size={20} className="text-primary-400" /> : <Layers size={20} className="text-neutral-300" />}
                </button>
            </div>
        </div>
    );
};

export default IncidentMap;