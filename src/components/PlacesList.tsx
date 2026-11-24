import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ListGroup from 'react-bootstrap/ListGroup';
import type { AuthUser, Place } from '../types';

type Props = {
    places: Place[];
    selectedID: number | null;
    user: AuthUser | null;
    onSelect: (id: number) => void;
    onEdit: (place: Place) => void;
    onDelete: (place: Place) => void;
};

const PlacesList = ({
    places,
    selectedID,
    user,
    onSelect,
    onEdit,
    onDelete,
}: Props) => {
    if (places.length === 0) {
        return (
            <p className="text-muted mb-0 small">
                No places in the current map view.
            </p>
        );
    }

    return (
        <ListGroup className="places-list">
            {places.map((p) => {
                const isOwner = user?.ID === p.UserID;
                return (
                    <ListGroup.Item
                        key={p.ID}
                        action
                        active={p.ID === selectedID}
                        onClick={() => onSelect(p.ID)}
                        className="d-flex flex-column gap-1"
                    >
                        <div className="d-flex justify-content-between align-items-start gap-2">
                            <span className="fw-semibold">{p.Name}</span>
                            {isOwner && (
                                <ButtonGroup
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Button
                                        variant={
                                            p.ID === selectedID
                                                ? 'light'
                                                : 'outline-primary'
                                        }
                                        onClick={() => onEdit(p)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant={
                                            p.ID === selectedID
                                                ? 'light'
                                                : 'outline-danger'
                                        }
                                        onClick={() => onDelete(p)}
                                    >
                                        Delete
                                    </Button>
                                </ButtonGroup>
                            )}
                        </div>
                        <small className={p.ID === selectedID ? '' : 'text-muted'}>
                            {p.Latitude.toFixed(4)}, {p.Longitude.toFixed(4)}
                        </small>
                    </ListGroup.Item>
                );
            })}
        </ListGroup>
    );
};

export default PlacesList;
