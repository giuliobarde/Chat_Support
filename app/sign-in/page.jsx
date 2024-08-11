"use client";

import Alert from '@mui/material/Alert';
import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Link, AppBar, Toolbar, IconButton, InputAdornment, IconButton as MuiIconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { signInUser } from '../firebaseService';

const SignIn = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { identifier, password } = formData;
        try {
            const res = await signInUser(identifier, password);
            console.log('User signed in:', res);
            router.push('/chat');
        } catch (error) {
            console.error(error);
            setError("Error signing in. Please check your credentials.");
        }
    };

    const handleSignUpRedirect = () => {
        router.push('/sign-up');
    };

    const handleRedirectHome = () => {
        router.push('/');
    };

    const handlePasswordVisibilityToggle = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <>
            <AppBar position="fixed" sx={{ top: 0, width: '100%', zIndex: 1000 }}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, color: 'white' }}
                    >
                        Eagle-Support
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleRedirectHome}
                    >
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container maxWidth="sm" sx={{ mt: 8, pt: 8 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h4" gutterBottom>
                        Sign In
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="identifier"
                            label="Email Address or Username"
                            name="identifier"
                            autoComplete="identifier"
                            autoFocus
                            value={formData.identifier}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <MuiIconButton
                                            onClick={handlePasswordVisibilityToggle}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </MuiIconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        <Link href="#" variant="body2" onClick={handleSignUpRedirect}>
                            {"Don't have an account? Sign Up"}
                        </Link>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default SignIn;
