"use client";

import { Box, TextField, IconButton, Stack, Fab, Typography } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import MessageIcon from '@mui/icons-material/Message'; // Import an icon for the button
import SendIcon from '@mui/icons-material/Send'; // Import an icon for the send button

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);

  const [message, setMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (message.trim()) {
      // Add the user's message to the chat immediately
      const newMessage = { role: 'user', content: message };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      // Clear the text field
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
      event.preventDefault(); // Prevent the default behavior of the Enter key
      sendMessage();
    }
  };

  // Scroll to the bottom of the messages container whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
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
            {/* This empty box will be used to scroll into view */}
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
              onKeyDown={handleKeyDown} // Add key down handler
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
  );
}
