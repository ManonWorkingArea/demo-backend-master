<template>
    <div>
      <h1>Admin Chat</h1>
      <div class="chat-box">
        <!-- Display chat messages here -->
      </div>
      <button @click="sendMessage">Send Message</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        messages: [],
      };
    },
    methods: {
      sendMessage() {
        // Define the message data
        const messageData = {
          data: {
            message: 'hello world',
          },
          name: 'my-event',
          channel: 'my-channel',
        };
  
        // Define the headers and authentication parameters
        const headers = new Headers({
          'Content-Type': 'application/json',
        });
  
        const authParams = new URLSearchParams({
          auth_key: '5389701e908eb3724318',
          auth_timestamp: Math.floor(Date.now() / 1000).toString(),
          auth_version: '1.0',
          auth_signature: '15e6bfbffee63c3347d76d314e56b55826df080ff0b35fb1c90452dfb8e0d8a0',
          body_md5: '2c99321eeba901356c4c7998da9be9e0',
        });
  
        // Make the API request using fetch
        fetch(`https://api-ap1.pusher.com/apps/1729042/events?${authParams.toString()}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(messageData),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Message sent successfully', data);
          })
          .catch((error) => {
            console.error('Error sending message', error);
          });
      },
    },
  };
  </script>
  