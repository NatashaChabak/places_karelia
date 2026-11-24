import { useEffect, useMemo, useRef } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Place } from '../types';

// Fix default Leaflet marker assets under Vite
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const defaultIcon = new L.Icon.Default();

const selectedIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [30, 48],
    iconAnchor: [15, 48],
    popupAnchor: [1, -40],
    shadowSize: [48, 48],
    className: 'selected-marker',
});

type Bounds = {
    south: number;
    west: number;
    north: number;
    east: number;
};

type Props = {
    places: Place[];
    selectedID: number | null;
    pickMode: boolean;
    onSelect: (id: number) => void;
    onBoundsChange: (bounds: Bounds) => void;
    onMapClick: (lat: number, lng: number) => void;
};

function BoundsWatcher({
    onBoundsChange,
}: {
    onBoundsChange: (bounds: Bounds) => void;
}) {
    const map = useMap();

    useEffect(() => {
        const emit = () => {
            const b = map.getBounds();
            onBoundsChange({
                south: b.getSouth(),
                west: b.getWest(),
                north: b.getNorth(),
                east: b.getEast(),
            });
        };
        emit();
        map.on('moveend', emit);
        map.on('zoomend', emit);
        return () => {
            map.off('moveend', emit);
            map.off('zoomend', emit);
        };
    }, [map, onBoundsChange]);

    return null;
}

function MapClickHandler({
    enabled,
    onMapClick,
}: {
    enabled: boolean;
    onMapClick: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            if (enabled) onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function FocusSelected({
    place,
}: {
    place: Place | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (!place) return;
        map.panTo([place.Latitude, place.Longitude], { animate: true });
    }, [map, place]);

    return null;
}

function SelectableMarker({
    place,
    selected,
    onSelect,
}: {
    place: Place;
    selected: boolean;
    onSelect: (id: number) => void;
}) {
    const markerRef = useRef<L.Marker | null>(null);
    const eventHandlers = useMemo(
        () => ({
            click: () => onSelect(place.ID),
        }),
        [onSelect, place.ID],
    );

    useEffect(() => {
        const marker = markerRef.current;
        if (!marker) return;
        if (selected) marker.openPopup();
        else marker.closePopup();
    }, [selected]);

    return (
        <Marker
            ref={markerRef}
            position={[place.Latitude, place.Longitude]}
            icon={selected ? selectedIcon : defaultIcon}
            eventHandlers={eventHandlers}
            zIndexOffset={selected ? 1000 : 0}
        >
            <Popup>
                <strong>{place.Name}</strong>
                <br />
                {place.Latitude.toFixed(4)}, {place.Longitude.toFixed(4)}
            </Popup>
        </Marker>
    );
}

const PlacesMap = ({
    places,
    selectedID,
    pickMode,
    onSelect,
    onBoundsChange,
    onMapClick,
}: Props) => {
    const selectedPlace =
        places.find((p) => p.ID === selectedID) ?? null;

    return (
        <MapContainer
            className="places-map"
            center={[62.59, 29.77]}
            zoom={13}
            scrollWheelZoom
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <BoundsWatcher onBoundsChange={onBoundsChange} />
            <MapClickHandler enabled={pickMode} onMapClick={onMapClick} />
            <FocusSelected place={selectedPlace} />
            {places.map((p) => (
                <SelectableMarker
                    key={p.ID}
                    place={p}
                    selected={p.ID === selectedID}
                    onSelect={onSelect}
                />
            ))}
        </MapContainer>
    );
};

export default PlacesMap;
