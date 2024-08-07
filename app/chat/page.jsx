"use client";

import { useState, useRef, useEffect } from 'react';
import { TextField, Typography, Box, AppBar, Toolbar, Button, Stack, IconButton, Fab } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import SendIcon from '@mui/icons-material/Send';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signOut } from '../firebase/config'; // Correctly import signOut

export default function Home() {
  const [user] = useAuthState(auth);
  const [message, setMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  // Effect to handle redirection when not signed in
  useEffect(() => {
    if (user === null && sessionStorage.getItem('user') === null) {
      router.push('/sign-in');
    }
  }, [user, router]);

  const sendMessage = async () => {
    if (message.trim()) {
      const newMessage = { role: 'user', content: message };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      setMessage('');

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

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" color="inherit" style={{ flexGrow: 1 }}>
            Chat-Support
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
        <Typography
          variant="h1"
          component="h1"
          style={{ color: "#1976d2" }}
        >
          Headstarter Chatbot
        </Typography>

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
