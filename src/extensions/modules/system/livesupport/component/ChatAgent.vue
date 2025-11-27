<template>
    <div class="live-chat-widget">
      <div v-if="!isChatOpen" class="chat-head" @click="toggleChat">
        <span class="chat-icon"><font-awesome-icon :icon="['fas','comment-dots']" class="text-white"/></span>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
      </div>
      <div v-if="isChatOpen" class="chat-box">
        <div class="chat-header">
          <h3>Chat with {{ selectedConversation.sender }}</h3>
          <button class="close-button" @click="toggleChat">X</button>
        </div>
        <div class="chat-content" ref="chatContent">
          <div
            v-for="message in selectedConversation.message"
            :key="message.id"
            class="chat-message"
            :class="message.sender === 'agent' ? 'agent-bubble' : 'customer-bubble'"
          >
            <p class="message-text">{{ message.text }}</p>
            <span class="timestamp">{{ message.time }}</span>
          </div>
        </div>
        <div class="chat-input">
          <input
            v-model="newMessage"
            placeholder="Type a message..."
            @keyup.enter="sendMessage"
          />
          <button class="send-button" @click="sendMessage">Send</button>
        </div>
      </div>
    </div>
  </template>
  
  
  <script>
  export default {
    props: {
      conversations: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        isChatOpen: false,
        newMessage: '',
        selectedConversation: this.getConversationBySender('Customer 1'), // Default to Customer 1's conversation
        unreadCount: 0, // Counter for unread messages
      };
    },
    watch: {
      'selectedConversation.message': {
        handler() {
          if (!this.isChatOpen) {
            this.unreadCount += 1;
          }
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        },
        deep: true,
      },
    },
    methods: {
      toggleChat() {
        this.isChatOpen = !this.isChatOpen;
        if (this.isChatOpen) {
          this.unreadCount = 0; // Clear unread messages count when chat is opened
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      },
      sendMessage() {
        if (this.newMessage.trim() && this.selectedConversation) {
          this.selectedConversation.message.push({
            id: this.selectedConversation.message.length + 1,
            text: this.newMessage,
            time: new Date().toLocaleTimeString(),
            sender: 'customer', // Mark the sender as 'customer' when sending from this component
          });
          this.newMessage = '';
        }
      },
      getConversationBySender(senderName) {
        return this.conversations.find(
          (conversation) => conversation.sender === senderName
        ) || this.conversations[0];
      },
      scrollToBottom() {
        const chatContent = this.$refs.chatContent;
        if (chatContent) {
          chatContent.scrollTop = chatContent.scrollHeight;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* General Styles */
  .live-chat-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  }
  
  .chat-head {
    background-color: #007bff;
    color: white;
    padding: 15px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 60px; /* Ensure width and height are equal */
    height: 60px; /* Ensure width and height are equal */
  }
  
  .chat-icon {
    font-size: 1.5rem;
  }
  
  .unread-badge {
    background-color: red;
    color: white;
    border-radius: 50%;
    padding: 4px 8px;
    font-size: 0.75rem;
    position: absolute;
    top: -5px;
    right: -5px;
  }
  
  /* Chat box styles */
  .chat-box {
    width: 300px;
    max-height: 400px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .chat-header {
    padding: 10px;
    background-color: #007bff;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .chat-content {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    background-color: #f5f5f5;
  }
  
  .chat-message {
    max-width: 70%;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
  }
  
  .agent-bubble {
    background-color: #f5f5f5;
    align-self: flex-start;
  }
  
  .customer-bubble {
    background-color: #e0ffe0;
    align-self: flex-end;
  }
  
  .message-text {
    margin: 0;
  }
  
  .timestamp {
    font-size: 0.75rem;
    color: #666;
    margin-top: 5px;
    display: block;
    text-align: right;
  }
  
  /* Input Styles */
  .chat-input {
    padding: 10px;
    display: flex;
    align-items: center;
    background-color: #f9f9f9;
  }
  
  .chat-input input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    outline: none;
  }
  
  .send-button {
    background-color: #007bff;
    color: white;
    padding: 8px 16px;
    border: none;
    margin-left: 8px;
    cursor: pointer;
  }
  </style>
  