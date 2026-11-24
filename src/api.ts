import type { AuthUser, Place, PlaceInput } from './types';

const baseUrl = () => import.meta.env.VITE_SERVER_URL as string;

async function readError(res: Response): Promise<string> {
    try {
        const body = (await res.json()) as { message?: string };
        return body.message ?? res.statusText;
    } catch {
        return res.statusText || 'Request failed';
    }
}

export async function fetchPlaces(): Promise<Place[]> {
    const res = await fetch(`${baseUrl()}/api/places`);
    if (!res.ok) throw new Error(await readError(res));
    return res.json() as Promise<Place[]>;
}

export async function registerUser(
    name: string,
    password: string,
): Promise<{ ID: number; Name: string }> {
    const res = await fetch(`${baseUrl()}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
    });
    if (!res.ok) throw new Error(await readError(res));
    return res.json() as Promise<{ ID: number; Name: string }>;
}

export async function loginUser(
    name: string,
    password: string,
): Promise<AuthUser> {
    const res = await fetch(`${baseUrl()}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
    });
    if (!res.ok) throw new Error(await readError(res));
    const user = (await res.json()) as AuthUser;
    if (!user.Token) throw new Error('Login response missing token');
    return user;
}

function authHeaders(token: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export async function createPlace(
    place: PlaceInput,
    token: string,
): Promise<void> {
    const res = await fetch(`${baseUrl()}/api/places`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(place),
    });
    if (!res.ok) throw new Error(await readError(res));
}

export async function updatePlace(
    id: number,
    place: PlaceInput,
    token: string,
): Promise<void> {
    const res = await fetch(`${baseUrl()}/api/places/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(place),
    });
    if (!res.ok) throw new Error(await readError(res));
}

export async function deletePlace(id: number, token: string): Promise<void> {
    const res = await fetch(`${baseUrl()}/api/places/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await readError(res));
}
