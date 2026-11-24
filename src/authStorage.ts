import type { AuthUser } from './types';

const STORAGE_KEY = 'placesAppAuth';

export function loadAuth(): AuthUser | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as AuthUser;
        if (
            typeof parsed?.ID === 'number' &&
            typeof parsed?.Name === 'string' &&
            typeof parsed?.Token === 'string' &&
            parsed.Token.length > 0
        ) {
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
}

export function saveAuth(user: AuthUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
    localStorage.removeItem(STORAGE_KEY);
}
