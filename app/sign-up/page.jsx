"use client";

import Alert from '@mui/material/Alert';
import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Link, AppBar, Toolbar, IconButton, InputAdornment, IconButton as MuiIconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { signUpUser } from '../firebaseService';

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
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
        const { username, email, password, confirmPassword } = formData;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const res = await signUpUser(username, email, password);
            console.log({ res });
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
            });
            router.push('/chat');
        } catch (e) {
            console.error(e);
            setError("Error signing up. Please try again.");
        }
    };

    const handleSignUpRedirect = () => {
        router.push('/sign-in');
    };

    const handlePasswordVisibilityToggle = () => {
        setShowPassword((prev) => !prev);
    };

    const handleConfirmPasswordVisibilityToggle = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    return (
        <>
            <AppBar position="fixed" sx={{ top: 0, width: '100%', zIndex: 1000 }}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, color: 'white' }}
                    >
                        Chat-Support
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={() => router.push('/')}
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
                        Sign Up
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
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
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            autoComplete="confirm-password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <MuiIconButton
                                            onClick={handleConfirmPasswordVisibilityToggle}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                            Sign Up
                        </Button>
                        <Link href="#" variant="body2" onClick={handleSignUpRedirect}>
                            {"Already have an account? Sign In"}
                        </Link>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default SignUp;
