import { useState, type FormEvent } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';
import { loginUser, registerUser } from '../api';
import type { AuthUser } from '../types';

type Props = {
    user: AuthUser | null;
    onLogin: (user: AuthUser) => void;
    onLogout: () => void;
};

const AuthPanel = ({ user, onLogin, onLogout }: Props) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    if (user) {
        return (
            <Stack gap={2}>
                <div>
                    Signed in as <strong>{user.Name}</strong>
                </div>
                <Button variant="outline-secondary" size="sm" onClick={onLogout}>
                    Log out
                </Button>
            </Stack>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setInfo(null);
        setBusy(true);
        try {
            if (mode === 'register') {
                await registerUser(name.trim(), password);
                const loggedIn = await loginUser(name.trim(), password);
                onLogin(loggedIn);
                setInfo('Account created and signed in.');
            } else {
                const loggedIn = await loginUser(name.trim(), password);
                onLogin(loggedIn);
            }
            setPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack gap={2}>
            <ButtonGroup size="sm">
                <Button
                    variant={mode === 'login' ? 'primary' : 'outline-primary'}
                    onClick={() => setMode('login')}
                >
                    Login
                </Button>
                <Button
                    variant={mode === 'register' ? 'primary' : 'outline-primary'}
                    onClick={() => setMode('register')}
                >
                    Register
                </Button>
            </ButtonGroup>

            {error && (
                <Alert variant="danger" className="py-2 mb-0">
                    {error}
                </Alert>
            )}
            {info && (
                <Alert variant="success" className="py-2 mb-0">
                    {info}
                </Alert>
            )}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2" controlId="authName">
                    <Form.Label className="mb-1">Username</Form.Label>
                    <Form.Control
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="username"
                    />
                </Form.Group>
                <Form.Group className="mb-2" controlId="authPassword">
                    <Form.Label className="mb-1">Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={
                            mode === 'login' ? 'current-password' : 'new-password'
                        }
                    />
                </Form.Group>
                <Button type="submit" variant="primary" disabled={busy} className="w-100">
                    {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}
                </Button>
            </Form>
        </Stack>
    );
};

export default AuthPanel;
