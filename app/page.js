"use client";

import { Box, TextField, Button, Stack } from '@mui/material';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    if (message.trim()) {
      const updatedMessages = [...messages, { role: 'user', content: message }];

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
          console.log('Received chunk:', chunk); // Log each chunk of data
          console.log('Accumulated result:', result); // Log the accumulated result

          // Update messages with the accumulated result
          setMessages([...updatedMessages, { role: 'assistant', content: result }]);
        }

      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setMessage(''); // Clear the input after sending
      }
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack 
        direction="column" 
        width="500px" 
        height="700px"
        border="1px solid black"
        p={2}
        spacing={2}
      >
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto">
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.role === "assistant" ? "flex-start" : "flex-end"}
            >
              <Box
                bgcolor={msg.role === "assistant" ? "primary.main" : "secondary.main"}
                color="white"
                borderRadius={16}
                p={3}
              >
                {msg.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField 
            label="Message" 
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
