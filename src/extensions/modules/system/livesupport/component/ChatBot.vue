<template>
  <div class="live-chat-widget">
    <div v-if="!isChatOpen" class="chat-head" @click="toggleChat">
      <span class="chat-icon"><font-awesome-icon :icon="['fas','comment-dots']" class="text-white"/></span>
      <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
    </div>
    <div v-if="isChatOpen" class="chat-box">
      <div class="chat-header">
        <h3>Chat with Bot</h3>
        <button class="close-button" @click="minimizeChat">X</button>
      </div>
      <div class="chat-content" ref="chatContent">
        <div
          v-for="message in chatMessages"
          :key="message.id"
          class="chat-message"
          :class="message.sender === 'agent' ? 'agent-bubble' : 'customer-bubble'"
        >
          <p class="message-text">{{ message.text }}</p>
          <span class="timestamp">{{ message.time }}</span>
          <div v-if="message.choices" class="choices">
            <button
              v-for="choice in message.choices"
              :key="choice"
              @click="handleChoiceClick(choice)"
              class="choice-button"
            >
              {{ choice }}
            </button>
          </div>
        </div>
        <!-- Close Conversation Button -->
        <div v-if="isEndConversation" class="close-conversation">
          <button @click="handleCloseButtonClick" class="close-conversation-button">End Conversation</button>
        </div>
      </div>
      <div class="chat-input" v-if="!isEndConversation">
        <input
          v-model="newMessage"
          placeholder="Type a message..."
          @focus="handleFocus"
          @keyup.enter="sendMessage"
        />
        <button class="send-button" @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { chatFlow, processChatStep, generateSummary } from './chatFlowHandler';

export default {
  data() {
    return {
      isChatOpen: false,
      newMessage: '',
      chatMessages: [],
      currentStepIndex: 0,
      context: {},
      unreadCount: 0,
      chatFlow: chatFlow,
      chatSummary: null,  // Variable to store the chat summary
      isEndConversation: false,  // Track if conversation has ended
      showCloseButton: false,    // Control visibility of the close button
    };
  },
  methods: {
    toggleChat() {
      this.isChatOpen = !this.isChatOpen;
      if (this.isChatOpen) {
        this.startNewChat(); // Start a new chat when the chat is opened
      }
      this.unreadCount = 0;
    },
    minimizeChat() {
      this.isChatOpen = false; // Simply minimize the chat box without resetting anything
    },
    closeChat() {
      this.isChatOpen = false; // Hide the chat box and reset the conversation
      this.resetChat();
    },
    handleCloseButtonClick() {
      this.isChatOpen = false; // Close the chat box and go back to the chat head
      this.resetChat();  // Reset chat state
    },
    startNewChat() {
      if (this.currentStepIndex === 0 && this.chatMessages.length === 0) {
        let initialMessage = this.chatFlow[0].message;
        initialMessage = initialMessage.replace(/\[context\.(\w+)\]/g, (_, key) => this.context[key] || '');

        this.addBotMessage(initialMessage); // Send the first message
      }
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    resetChat() {
      this.newMessage = '';
      this.chatMessages = [];
      this.currentStepIndex = 0;
      this.context = {};
      this.chatSummary = null;  // Reset the summary
      this.isEndConversation = false; // Reset the end of conversation state
      this.showCloseButton = false; // Reset the close button visibility
    },
    handleFocus() {
      // Handle any focus-related actions if necessary
    },
    handleChoiceClick(choice) {
      this.newMessage = choice;
      this.sendMessage();
    },
    async sendMessage() {
      if (this.newMessage.trim()) {
        const clientMessage = this.newMessage.trim();

        // Clear the input field immediately after capturing the client's message
        this.newMessage = '';

        // Add the customer's message to the chat
        this.addCustomerMessage(clientMessage);

        // Process the chat step
        const { nextObjective, message, choices, end } = processChatStep(
          clientMessage,
          this.chatFlow[this.currentStepIndex].objective,
          this.context,
          this.chatFlow
        );

        // Update the current step index
        const nextStepIndex = this.chatFlow.findIndex(step => step.objective === nextObjective);
        if (nextStepIndex >= 0) {
          this.currentStepIndex = nextStepIndex;
        }

        // Show the bot's typing effect and message
        await this.showThinkingEffect(message, choices);

        // Handle end of conversation
        if (end) {
          this.chatSummary = generateSummary(this.context, this.chatFlow);
          this.isEndConversation = true; // Set the end conversation state to true

          // Show the Close Conversation button after the last message is shown
          setTimeout(() => {
            this.showCloseButton = true;
          }, 1500); // Delay to allow the last message to display
        }
      }
    },
    addCustomerMessage(text) {
      this.chatMessages.push({
        id: this.chatMessages.length + 1,
        text: text,
        time: new Date().toLocaleTimeString(),
        sender: 'customer',
      });
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    showThinkingEffect(text, choices) {
      return new Promise((resolve) => {
        let typingMessage = '';
        let typingStep = 0;

        if (this.typingInterval) {
          clearInterval(this.typingInterval);
        }

        this.typingInterval = setInterval(() => {
          typingStep++;
          typingMessage = '.'.repeat(typingStep) + ' Thinking';
          if (typingStep > 4) typingStep = 1;
          this.updateTypingMessage(typingMessage);
        }, 300);

        setTimeout(() => {
          clearInterval(this.typingInterval);
          this.removeTypingMessage();
          this.addBotMessage(text, choices);
          resolve(); // Resolve the promise when the function is complete
        }, 1000);
      });
    },
    updateTypingMessage(message) {
      if (this.chatMessages[this.chatMessages.length - 1]?.sender === 'agent') {
        this.chatMessages[this.chatMessages.length - 1].text = message;
      } else {
        this.chatMessages.push({
          id: this.chatMessages.length + 1,
          text: message,
          time: new Date().toLocaleTimeString(),
          sender: 'agent',
        });
      }
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    removeTypingMessage() {
      if (this.chatMessages[this.chatMessages.length - 1]?.text.includes('Thinking')) {
        this.chatMessages.pop();
      }
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    addBotMessage(text, choices = null) {
      const messages = Array.isArray(text) ? text : [text];
      messages.forEach(message => {
        this.chatMessages.push({
          id: this.chatMessages.length + 1,
          text: message,
          time: new Date().toLocaleTimeString(),
          sender: 'agent',
          choices: choices,
        });
      });
      this.$nextTick(() => {
        this.scrollToBottom();
      });
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
  width: 60px;
  height: 60px;
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

.choices {
  margin-top: 10px;
}

.choice-button {
  margin-right: 10px;
  padding: 5px 10px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.choice-button:hover {
  background-color: #0056b3;
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

.close-conversation {
  text-align: center;
  margin-top: 10px;
}

.close-conversation-button {
  background-color: #ff4d4f;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.close-conversation-button:hover {
  background-color: #ff7875;
}
</style>
