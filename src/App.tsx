import { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import {
    createPlace,
    deletePlace,
    fetchPlaces,
    updatePlace,
} from './api';
import { clearAuth, loadAuth, saveAuth } from './authStorage';
import AuthPanel from './components/AuthPanel';
import PlaceForm, { type PlaceDraft } from './components/PlaceForm';
import PlacesList from './components/PlacesList';
import PlacesMap from './components/PlacesMap';
import type { AuthUser, Place } from './types';
import './App.css';

type MapBounds = {
    south: number;
    west: number;
    north: number;
    east: number;
};

const App = () => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedID, setSelectedID] = useState<number | null>(null);
    const [user, setUser] = useState<AuthUser | null>(() => loadAuth());
    const [bounds, setBounds] = useState<MapBounds | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState<Place | null>(null);
    const [formNonce, setFormNonce] = useState(0);
    const [draftCoords, setDraftCoords] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const refreshPlaces = useCallback(async () => {
        try {
            const data = await fetchPlaces();
            setPlaces(data);
            setLoadError(null);
        } catch (err) {
            setLoadError(
                err instanceof Error ? err.message : 'Failed to load places',
            );
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await fetchPlaces();
                if (!cancelled) {
                    setPlaces(data);
                    setLoadError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(
                        err instanceof Error
                            ? err.message
                            : 'Failed to load places',
                    );
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const visiblePlaces = useMemo(() => {
        if (!bounds) return places;
        return places.filter(
            (p) =>
                p.Latitude >= bounds.south &&
                p.Latitude <= bounds.north &&
                p.Longitude >= bounds.west &&
                p.Longitude <= bounds.east,
        );
    }, [places, bounds]);

    const handleLogin = (authUser: AuthUser) => {
        saveAuth(authUser);
        setUser(authUser);
        setFormError(null);
    };

    const handleLogout = () => {
        clearAuth();
        setUser(null);
        setEditing(null);
        setFormError(null);
    };

    const handleSelect = (id: number) => {
        setSelectedID(id);
    };

    const handleBoundsChange = useCallback((next: MapBounds) => {
        setBounds(next);
    }, []);

    const handleMapClick = (lat: number, lng: number) => {
        if (!user || editing) return;
        setDraftCoords({
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
        });
    };

    const handleCreate = async (draft: PlaceDraft) => {
        if (!user) return;
        setBusy(true);
        setFormError(null);
        try {
            await createPlace(
                {
                    name: draft.name,
                    userId: user.ID,
                    latitude: draft.latitude,
                    longitude: draft.longitude,
                },
                user.Token,
            );
            setDraftCoords(null);
            setFormNonce((n) => n + 1);
            await refreshPlaces();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Create failed');
        } finally {
            setBusy(false);
        }
    };

    const handleUpdate = async (draft: PlaceDraft) => {
        if (!user || !editing) return;
        setBusy(true);
        setFormError(null);
        try {
            await updatePlace(
                editing.ID,
                {
                    name: draft.name,
                    userId: user.ID,
                    latitude: draft.latitude,
                    longitude: draft.longitude,
                },
                user.Token,
            );
            setEditing(null);
            await refreshPlaces();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (place: Place) => {
        if (!user) return;
        if (!window.confirm(`Delete "${place.Name}"?`)) return;
        setBusy(true);
        setFormError(null);
        try {
            await deletePlace(place.ID, user.Token);
            if (selectedID === place.ID) setSelectedID(null);
            if (editing?.ID === place.ID) setEditing(null);
            await refreshPlaces();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Delete failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="app-shell">
            <Navbar className="app-header px-3" expand="lg">
                <Container fluid className="px-0">
                    <Navbar.Brand>Places</Navbar.Brand>
                    <span className="small opacity-75 d-none d-sm-inline">
                        {user
                            ? `${visiblePlaces.length} on screen · signed in`
                            : `${visiblePlaces.length} on screen · guest`}
                    </span>
                </Container>
            </Navbar>

            <div className="app-body">
                <aside className="app-sidebar">
                    <div className="section-card">
                        <h2 className="h6 mb-3">Account</h2>
                        <AuthPanel
                            user={user}
                            onLogin={handleLogin}
                            onLogout={handleLogout}
                        />
                    </div>

                    {user && (
                        <div className="section-card">
                            <PlaceForm
                                key={
                                    editing
                                        ? `edit-${editing.ID}`
                                        : `add-${formNonce}-${draftCoords?.latitude ?? 'x'}-${draftCoords?.longitude ?? 'y'}`
                                }
                                mode={editing ? 'edit' : 'add'}
                                initial={editing}
                                draftCoords={draftCoords}
                                busy={busy}
                                error={formError}
                                onSubmit={editing ? handleUpdate : handleCreate}
                                onCancel={() => {
                                    setEditing(null);
                                    setFormError(null);
                                }}
                            />
                        </div>
                    )}

                    <div className="section-card flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h2 className="h6 mb-0">Places on map</h2>
                            <small className="text-muted">
                                {visiblePlaces.length}/{places.length}
                            </small>
                        </div>
                        {loadError && (
                            <Alert variant="warning" className="py-2">
                                {loadError}
                            </Alert>
                        )}
                        <PlacesList
                            places={visiblePlaces}
                            selectedID={selectedID}
                            user={user}
                            onSelect={handleSelect}
                            onEdit={(place) => {
                                setEditing(place);
                                setFormError(null);
                                setSelectedID(place.ID);
                            }}
                            onDelete={(place) => {
                                void handleDelete(place);
                            }}
                        />
                    </div>
                </aside>

                <main className="app-map-pane">
                    <PlacesMap
                        places={visiblePlaces}
                        selectedID={selectedID}
                        pickMode={Boolean(user) && !editing}
                        onSelect={handleSelect}
                        onBoundsChange={handleBoundsChange}
                        onMapClick={handleMapClick}
                    />
                </main>
            </div>
        </div>
    );
};

export default App;
