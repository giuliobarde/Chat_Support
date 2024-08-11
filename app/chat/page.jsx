"use client";

import { useState, useRef, useEffect } from 'react';
import { TextField, Typography, Box, AppBar, Toolbar, Button, Stack, IconButton, Fab, Card, CardMedia, CardContent } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import SendIcon from '@mui/icons-material/Send';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signOut } from '../firebase/config';
import { fetchUsername } from "../firebaseService";

// Custom loading dots CSS
const loadingDotStyle = `
  .loading-dots {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loading-dot {
    width: 10px;
    height: 10px;
    margin: 0 3px;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    animation: dot-flashing 1.5s infinite linear;
  }
  .loading-dot:nth-child(2) {
    animation-delay: 0.3s;
  }
  .loading-dot:nth-child(3) {
    animation-delay: 0.6s;
  }
  @keyframes dot-flashing {
    0% { background-color: rgba(0, 0, 0, 0.6); }
    50% { background-color: rgba(0, 0, 0, 1); }
    100% { background-color: rgba(0, 0, 0, 0.6); }
  }
`;

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  // Effect to handle redirection when not signed in
  useEffect(() => {
    if (user === null && sessionStorage.getItem('user') === null) {
      router.push('/sign-in');
    }
  }, [user, router]);

  const [states, setStates] = useState([]);
  const [message, setMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [username, setUsername] = useState('');

  // Fetch and set the username when the user changes
  useEffect(() => {
    const fetchAndSetUsername = async () => {
      if (user) {
        const fetchedUsername = await fetchUsername(user);
        if (fetchedUsername) {
          setUsername(fetchedUsername);
        }
      }
    };
    fetchAndSetUsername();
  }, [user]);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const messagesEndRef = useRef(null);

  // Update the initial message when username changes
  useEffect(() => {
    if (username) {
      setMessages([
        {
          role: "assistant",
          content: `Hi ${username}! I'm the USA support assistant. How can I help you today`,
        },
      ]);
    }
  }, [username]);

  useEffect(() => {
    // Fetch the states data from the JSON file
    const fetchStatesData = async () => {
      try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStates(data);
      } catch (error) {
        console.error('Error fetching states data:', error);
      }
    };

    fetchStatesData();
  }, []);

  const sendMessage = async () => {
    if (message.trim()) {
      const newMessage = { role: 'user', content: message };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      setMessage('');
      setLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: updatedMessages }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', response.status, response.statusText, errorText);
          throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          result += chunk;
          console.log('Received chunk:', chunk);
          console.log('Accumulated result:', result);

          setMessages([...updatedMessages, { role: 'assistant', content: result }]);
        }

      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem('user');
      router.push('/sign-in');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleExpandClick = (stateName) => {
    setExpandedState(expandedState === stateName ? null : stateName)
  }

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" color="inherit" style={{ flexGrow: 1 }}>
          Eagle-Support: The USA Chatbot
          </Typography>
           <Button 
            variant="contained" 
            onClick={handleSignOut}
            color="primary"
          >
            Log out
          </Button> 
        </Toolbar>
      </AppBar>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <Box 
          width = "100%"
          display = "flex"
          flexWrap = "wrap"
          flexDirection = "row"
          justifyContent = "center"
          p={2}
          sx={{overflowX: 'auto'}}
        >
          {states.map((state, index) => (
            <Card key={index} sx={{ width: '300px', mb: 2, position: 'relative', mx: 1 }}>
              <CardMedia
                component="img"
                height="200"
                image={state.state_flag_url}
                alt={`${state.state} Flag`}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="body2"><strong>Admission Date:</strong> {state.admission_date}</Typography>
                <Typography variant="body2"><strong>Capital City:</strong> {state.capital_city}</Typography>
                <Typography variant="body2"><strong>Population:</strong> {state.population.toLocaleString()} (Rank: {state.population_rank})</Typography>
                <Typography variant="body2"><strong>Official Website:</strong> <a href={state.website} target="_blank" rel="noopener noreferrer">{state.website}</a></Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {showChat && (
          <Box
            width="400px"
            height="500px"
            border="1px solid black"
            display="flex"
            flexDirection="column"
            position="absolute"
            bottom="80px"
            right="16px"
            bgcolor="background.paper"
            borderRadius={4}
            overflow="hidden"
            boxShadow={3}
          >
            <Stack
              direction="column"
              spacing={2}
              flexGrow={1}
              overflow="auto"
              p={2}
              style={{ paddingBottom: '72px' }}
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={msg.role === "assistant" ? "flex-start" : "flex-end"}
                >
                  <Box
                    bgcolor={msg.role === "assistant" ? "primary.main" : "secondary.main"}
                    color="white"
                    borderRadius={8}
                    p={2}
                  >
                    {msg.content}
                  </Box>
                </Box>
              ))}
              <Box ref={messagesEndRef} />
            </Stack>
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              p={2}
              bgcolor="background.paper"
              borderRadius="0 0 4px 4px"
              display="flex"
              alignItems="center"
            >
              <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      color="primary"
                      onClick={sendMessage}
                      edge="end"
                      style={{ borderRadius: '50%' }}
                    >
                      <SendIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </Box>
        )}
        <Fab
          color="primary"
          aria-label="toggle chat"
          onClick={() => setShowChat(!showChat)}
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            borderRadius: '50%',
          }}
        >
          <MessageIcon />
        </Fab>
      </Box>
    </>
  );
}
