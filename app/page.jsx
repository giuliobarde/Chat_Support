import Alert from '@mui/material/Alert';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const LandingPage = () => {
  return (
    <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        padding={2}
    >
      <Button
        variant="contained"
        color="primary"
        size="large"
        href="/sign-in"
        sx={{ padding: '16px 32px', fontSize: '1.25rem' }}
      >
        Sign In
      </Button>
    </Box>
  );
};

export default LandingPage;
