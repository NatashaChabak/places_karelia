import { useState, type FormEvent } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';
import type { Place } from '../types';

export type PlaceDraft = {
    name: string;
    latitude: number;
    longitude: number;
};

type Props = {
    mode: 'add' | 'edit';
    initial?: Place | null;
    draftCoords?: { latitude: number; longitude: number } | null;
    busy: boolean;
    error: string | null;
    onSubmit: (draft: PlaceDraft) => void;
    onCancel: () => void;
};

const PlaceForm = ({
    mode,
    initial,
    draftCoords,
    busy,
    error,
    onSubmit,
    onCancel,
}: Props) => {
    const [name, setName] = useState(initial?.Name ?? '');
    const [latitude, setLatitude] = useState(
        String(initial?.Latitude ?? draftCoords?.latitude ?? 62.59),
    );
    const [longitude, setLongitude] = useState(
        String(initial?.Longitude ?? draftCoords?.longitude ?? 29.77),
    );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const lat = Number(latitude);
        const lng = Number(longitude);
        if (!name.trim() || Number.isNaN(lat) || Number.isNaN(lng)) return;
        onSubmit({ name: name.trim(), latitude: lat, longitude: lng });
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Stack gap={2}>
                <h2 className="h6 mb-0">
                    {mode === 'add' ? 'Add place' : 'Edit place'}
                </h2>
                {mode === 'add' && (
                    <p className="small text-muted mb-0">
                        Tip: click the map to fill coordinates.
                    </p>
                )}
                {error && (
                    <Alert variant="danger" className="py-2 mb-0">
                        {error}
                    </Alert>
                )}
                <Form.Group controlId="placeName">
                    <Form.Label className="mb-1">Name</Form.Label>
                    <Form.Control
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="placeLat">
                    <Form.Label className="mb-1">Latitude</Form.Label>
                    <Form.Control
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="placeLng">
                    <Form.Label className="mb-1">Longitude</Form.Label>
                    <Form.Control
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        required
                    />
                </Form.Group>
                <Stack direction="horizontal" gap={2}>
                    <Button type="submit" variant="success" disabled={busy}>
                        {busy
                            ? 'Saving…'
                            : mode === 'add'
                                ? 'Create'
                                : 'Save'}
                    </Button>
                    {mode === 'edit' && (
                        <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={onCancel}
                            disabled={busy}
                        >
                            Cancel
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Form>
    );
};

export default PlaceForm;
