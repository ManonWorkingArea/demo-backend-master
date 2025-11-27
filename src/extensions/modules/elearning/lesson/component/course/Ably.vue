<template>
  <div class="send-message-component">
    <div class="message-input">
      <h3 class="text-lg font-bold text-black pb-3">Custom Client Command</h3>
      <p class="text-sm mb-3">
        <!-- Command Descriptions -->
        <strong>clear()</strong>: Clear terminal text.<br>
        <strong>reload()</strong>: Reloads the page.<br>
        <strong>reload(userID)</strong>: Confirms if the specified user ID is active on the page.<br>
        <strong>logout(userID)</strong>: Logs out and redirects to the homepage if the user ID matches.<br>
        <strong>call()</strong>: Responds with the current user's activity on the page.<br>
        <strong>call(userID)</strong>: Confirms if the specified user ID is active on the page.<br>
        <strong>lock(userID, message)</strong>: Locks the screen with an optional message if the user ID matches.<br>
        <strong>device(userID)</strong>: Responds with the browser's name and user agent if the user ID matches.<br>
        <strong>route(userID, routePath)</strong>: Navigates to the specified route if the user ID matches.<br>
        <strong>alert(*, message)</strong>: Navigates to the specified route if the user ID matches.<br>
        <strong>alert(userID, message)</strong>: Navigates to the specified route if the user ID matches.<br>
      </p>
      <input v-model="messageText" placeholder="Enter command" @keypress.enter="handleInput" />
    </div>
    <div class="terminal-panel">
      <pre v-html="formattedResponseDataWithLineNumbers"></pre>
    </div>
  </div>
</template>

<script>
import { getAblyChannel, publishMessage, subscribeToMessages, unsubscribeFromMessages } from '@/services/ably';
import storageManager from '@/plugins/storage';

export default {
  name: 'SendMessageComponent',
  data() {
    const session = storageManager.get('session')
    const configs = storageManager.get("configs");
    
    return {
      messageText: '',
      configs: configs,
      session: session,
      responseData: [],
      ablyChannel: getAblyChannel(session.current._id) // Initialize ablyChannel here
    };
  },
  computed: {
    formattedResponseData() {
      return this.responseData.map(data => `Text: ${data.text}`).join('\n');
    },
    formattedResponseDataWithLineNumbers() {
      return this.responseData.map((data, index) => `<span class="line-number">${index + 1}</span>: ${data.text}`).join('\n');
    }
  },
  methods: {
    async sendMessage() {
      const message = { sender: 'host', session: this.session.current._id, text: this.messageText };
      try {
        await publishMessage(this.ablyChannel, message);
        console.log('Message sent successfully');
        this.messageText = '';
      } catch (error) {
        console.error('Failed to send message:', error);
        this.responseData.unshift({ sender: 'error', text: error.message });
      }
    },
    clearMessages() {
      this.responseData = [];
    },
    handleIncomingMessage(msg) {
      if (msg.data && msg.data.sender === 'client') {
        this.responseData.unshift(msg.data);
      }
    },
    handleInput() {
      if (this.messageText.trim().toLowerCase() === 'clear()') {
        this.clearMessages();
      } else {
        this.sendMessage();
      }
    }
  },
  mounted() {
    subscribeToMessages(this.ablyChannel, this.handleIncomingMessage);
  },
  beforeUnmount() {
    unsubscribeFromMessages(this.ablyChannel);
  }
};
</script>

<style scoped>
.send-message-component {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f9f9f9;
}

input {
  padding: 10px;
  margin-bottom: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}

button {
  padding: 10px 20px;
  margin: 5px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.terminal-panel {
  margin-top: 20px;
  padding: 10px;
  width: 100%;
  height: 400px;
  background-color: #1e1e1e;
  color: #00ff00;
  font-family: 'Courier New', Courier, monospace;
  border-radius: 4px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-size: 12px;
}

.line-number {
  color: #888;
}
</style>
