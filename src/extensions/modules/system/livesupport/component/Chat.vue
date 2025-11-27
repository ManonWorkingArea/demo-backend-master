<template>
    <div class="live-chat-widget">

      <div v-if="!isChatOpen" class="chat-head" @click="toggleChat">
        <span class="chat-icon">
          <font-awesome-icon :icon="['fas', 'comment-dots']" class="text-white" />
        </span>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
      </div>

      <div v-if="isChatOpen" class="chat-box">

        <div class="chat-header">
          <h3 v-if="isAgentMode">Chat with Agent</h3>
          <h3 v-else>Chat with Bot</h3>
          <button class="close-button" @click="minimizeChat">
            <font-awesome-icon :icon="['fas', 'circle-xmark']" class="text-white text-lg" />
          </button>
        </div>

        <div class="chat-content" ref="chatContent">
          <template v-if="conversation && conversation.message">
            <div
              v-for="message in conversation.message"
              :key="message.id"
              class="chat-message"
              :class="message.sender != 'customer' ? 'agent-bubble' : 'customer-bubble'"
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
          </template>
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
            class="text-sm"
          />
          <button class="send-button text-sm" @click="sendMessage"><font-awesome-icon :icon="['fas', 'paper-plane']" class="text-white mr-2" /> Send</button>
        </div>

      </div>

    </div>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import { generateCustomMessage } from './ai.js';

  import { getAblyChannel, subscribeToMessages, publishMessage } from '@/services/ably';
  import { chatFlow, processChatStep, generateSummary } from './chatFlowHandler';
  import { fetchConversationById, createConversation, updateConversation, updateSenderInConversation } from './conversation';

  export default {
    data() {
      return {
        isAgentMode: false,
        isChatOpen: false,
        newMessage: '',
        currentStepIndex: 0,
        context: {},
        unreadCount: 0,
        chatFlow: chatFlow,
        chatSummary: null,
        isEndConversation: false,
        showCloseButton: false,
        conversation: null,
        conversationID: storageManager.get('conversationID'),
        session: storageManager.get('session'),
        originalTitle:'',
      };
    },
    mounted() {
      this.initializeConversationOnLoad();
      this.subscribeToHostChannel(this.session.current._id, this.handleHostMessages);
      this.subscribeToConversationChannel(this.conversationID, this.handleConversationMessages);
    },
    methods: {
      subscribeToHostChannel(hostId, handleHostMessages) {
        const hostChannel = getAblyChannel(`host-${hostId}`);
        subscribeToMessages(hostChannel, (msg) => {
          handleHostMessages(msg);
        });
      },
      subscribeToConversationChannel(conversationId, handleConversationMessages) {
        const conversationChannel = getAblyChannel(`conversation-${conversationId}`);
        subscribeToMessages(conversationChannel, (msg) => {
          handleConversationMessages(msg);
        });
      },
      async publishToHostChannel(hostId, messageType, messageData) {
        const hostChannel = getAblyChannel(`host-${hostId}`);
        try {
          await publishMessage(hostChannel, {
            type: messageType,
            data: messageData,
          });
        } catch (error) {
          console.error(error);
        }
      },
      async publishToConversationChannel(conversationId, messageType, messageData) {
        const conversationChannel = getAblyChannel(`conversation-${conversationId}`);
        try {
          await publishMessage(conversationChannel, {
            type: messageType,
            data: messageData,
          });
        } catch (error) {
          console.error(error);
        }
      },
      handleHostMessages(msg) {
        if (msg.data && msg.data.type === 'conversation_update') {
          //this.loadConversation(msg.data.conversationId);
        }
      },
      handleConversationMessages(msg) {
        if (msg.data && msg.data.type === 'agent_reply') {
          this.initializeConversation();
          this.startTitleFlashing();
          setTimeout(() => {
            this.stopTitleFlashing();
          }, 2000);
        }
      },
      startTitleFlashing() {
        if (this.titleInterval) return;
        this.originalTitle = document.title;
        let flashTitle = 'New Message!';
        let isOriginalTitle = true;
        this.titleInterval = setInterval(() => {
          document.title = isOriginalTitle ? flashTitle : this.originalTitle;
          isOriginalTitle = !isOriginalTitle;
        }, 500);
      },
      stopTitleFlashing() {
        if (this.titleInterval) {
          clearInterval(this.titleInterval);
          this.titleInterval = null;
          document.title = this.originalTitle
        }
      },
      async initializeConversationOnLoad() {
        if (this.conversationID) {
          await this.initializeConversation();
          this.isChatOpen = true;
        }
      },
      async toggleChat() {
        this.isChatOpen = !this.isChatOpen;

        if (this.isChatOpen) {
          await this.initializeConversation();
        }
      },
      async initializeConversation() {
        try {
          if (this.conversationID) {
            const conversation = await fetchConversationById(this.conversationID);
            if (conversation) {
              this.conversation = conversation;
              this.currentStepIndex = conversation.currentStepIndex || 0;
              this.isChatOpen = true;
              this.isAgentMode = conversation.mode === 'agent';
              this.resumeChatProcess();
            } else {
              console.error('Conversation not found');
            }
          } else {
            await this.startNewChat();
          }
          this.scrollToBottom();
        } catch (error) {
          console.error(error.message);
        }
      },
      async startNewChat() {
        try {
          const newConversationData = {
            sender: this.isAgentMode ? 'agent' : 'bot',
            preview: '',
            mode: 'bot',
            status: 'active',
            message: [],
            unreadCount: 0,
            lastUpdate: new Date(),
            currentStepIndex: 0,
          };

          const newConversation = await createConversation(newConversationData);
          if (newConversation && newConversation._id) {
            this.conversationID = newConversation._id;
            storageManager.set('conversationID', this.conversationID);
            this.conversation = newConversation;
            this.startChatbotProcess();
          } else {
            throw new Error('Failed to create a new conversation');
          }
        } catch (error) {
          console.error(error.message);
        }
      },
      async startChatbotProcess() { 
        const nextStepData = this.chatFlow[0];
        let persona = `You are "Peter AI Assis," a polite and knowledgeable AI support agent for an E-Learning platform. Your goal is to provide clear, helpful responses, adapting to the user's language and tone.`;
        let promptMessage = `${persona} Fulfill the objective: "${nextStepData?.prompt}".`;
        let sender = 'bot';
        
        await this.showThinkingEffect('...', null, null, sender, '', true);
        const nextMessage = await generateCustomMessage(promptMessage);
        await this.showThinkingEffect(nextMessage, nextStepData?.objective, null, sender);
        this.addBotMessage(nextMessage, nextStepData?.objective);
      },
      resumeChatProcess() {
        if (this.isEndConversation) {
          return;
        }

        const currentObjective = this.chatFlow[this.currentStepIndex]?.objective;
        const lastMessage = this.getLastUserResponse();

        if (lastMessage && this.conversation.lastProcessedMessageId !== lastMessage.id) {
          const { nextObjective, message: botResponse, choices, end } = processChatStep(
            lastMessage.text,
            currentObjective,
            this.context,
            this.chatFlow
          );

          if (nextObjective && nextObjective !== currentObjective) {
            this.currentStepIndex = this.chatFlow.findIndex(step => step.objective === nextObjective);
            this.addBotMessage(botResponse, nextObjective, choices);
          }

          if (end) {
            this.chatSummary = generateSummary(this.context, this.chatFlow);
            this.isEndConversation = true;
          }

          this.conversation.lastProcessedMessageId = lastMessage.id;
          this.saveConversation();
        }
      },
      getLastUserResponse() {
        const lastCustomerMessage = this.conversation.message.slice().reverse().find(msg => msg.sender === 'customer');
        return lastCustomerMessage ? lastCustomerMessage.text : '';
      },
      async sendMessage() {
        if (this.newMessage.trim()) {
          const clientMessage = this.newMessage.trim();
          this.newMessage = '';
          this.addCustomerMessage(clientMessage);

          if (!this.isAgentMode) {
            await this.handleBotMessage(clientMessage);
          }

          // Example: Notify the host about a conversation update
          this.publishToHostChannel(this.session.current._id, 'conversation_update', {
            conversationId: this.conversationID,
            updateInfo: 'New message received',
          });

          // Example: Send a reply message to a specific conversation
          this.publishToConversationChannel(this.conversationID, 'client_reply', {
            text: 'Thank you for your message. How can I assist you further?',
            timestamp: new Date().toISOString(),
          });

          this.updateConversationPreview();
        }
      },
      handleAgentMessage(message) {
        this.conversation.message.push({
          id: this.conversation.message.length + 1,
          text: message,
          time: new Date().toLocaleTimeString(),
          sender: 'customer',
        });
        this.saveConversation();
        this.scrollToBottom();
      },
      async renameSenderInConversation(newSenderName) {
        if (this.conversationID && newSenderName) {
          try {
            await updateSenderInConversation(this.conversationID, newSenderName);
            await this.initializeConversation();
            console.log('Sender name updated successfully');
          } catch (error) {
            console.error(error.message);
          }
        }
      },
      async handleBotMessage(message) {
          if (this.isAgentMode) return;

          let sender = this.isAgentMode ? 'agent' : 'bot';

          // Show the typing effect while waiting for the API response
          await this.showThinkingEffect('...', null, null, sender,'',true);

          // Now call the processChatStep to get the bot response
          const { nextObjective, message: botResponse, choices, end, rename } = await processChatStep(
              message,
              this.chatFlow[this.currentStepIndex]?.objective || '',
              this.context,
              this.chatFlow
          );

          if (rename) {
              await this.renameSenderInConversation(rename);
          }

          const nextStepIndex = this.chatFlow.findIndex(step => step.objective === nextObjective);
          if (nextStepIndex >= 0) {
              this.currentStepIndex = nextStepIndex;
          }

          // Update the UI with the bot's response after getting the data from the API
          await this.showThinkingEffect(botResponse, nextObjective, choices, sender);

          if (end) {
              this.chatSummary = generateSummary(this.context, this.chatFlow);
              this.isEndConversation = true;
              setTimeout(() => {
                  this.showCloseButton = true;
              }, 1500);
          }
      },
      addCustomerMessage(text) {
        const newMessage = {
          id: new Date().getTime(), // Unique ID based on timestamp
          text: text,
          time: new Date().toLocaleTimeString(),
          sender: 'customer',
        };

        this.conversation.message.push(newMessage);
        this.saveConversation();
        this.scrollToBottom();
      },
      async showThinkingEffect(text, objective, choices, sender, prefix = " Typing", loop = false) {
        return new Promise((resolve) => {
            let typingMessage = '';
            let typingStep = 0;

            if (this.typingInterval) {
                clearInterval(this.typingInterval);
            }

            this.typingInterval = setInterval(() => {
                typingStep++;
                typingMessage = '.'.repeat(typingStep) + prefix;
                if (typingStep > 4) typingStep = 1;
                this.updateTypingMessage(typingMessage);
            }, 300);

            if (!loop) {
                setTimeout(() => {
                    clearInterval(this.typingInterval);
                    this.removeTypingMessage();
                    this.addBotMessage(text, objective, choices, sender);
                    this.scrollToBottom();
                    resolve();
                }, 1000);
            } else {
                // If loop is true, resolve immediately, leaving the typing effect running
                resolve();
            }
        });
    },
      addBotMessage(text, objective, choices = null, sender = 'bot') {
        if (this.isAgentMode) return;

        const messages = Array.isArray(text) ? text : [text];
        messages.forEach(message => {
          const existingMessage = this.conversation.message.find(
            msg => msg.text === message && msg.objective === objective
          );

          if (!existingMessage) {
            const newMessage = {
              id: this.conversation.message.length + 1,
              text: message,
              time: new Date().toLocaleTimeString(),
              sender: sender,
              choices: choices,
              objective: objective,
            };

            this.conversation.message.push(newMessage);
            this.conversation.currentStepIndex = this.currentStepIndex;
            this.saveConversation();
          } else {
            console.warn('Duplicate.');
          }
        });

        this.scrollToBottom();
      },
      updateTypingMessage(message) {
        if (this.conversation.message[this.conversation.message.length - 1]?.sender === 'agent') {
          this.conversation.message[this.conversation.message.length - 1].text = message;
        } else {
          this.conversation.message.push({
            id: this.conversation.message.length + 1,
            text: message,
            time: new Date().toLocaleTimeString(),
            sender: 'agent',
          });
        }
        this.scrollToBottom();
      },
      removeTypingMessage() {
        const lastMessage = this.conversation.message[this.conversation.message.length - 1];

        if (lastMessage) {
          const typingPatterns = [
            /.*Typing\.*$/,
            /.*\.\sTyping\s\.\.\.$/,
            /.*\.\.\.\sTyping\s\.$/,
            /.*\.\.\.\sTyping$/,
            /.*Typing\s\.\.\.$/,
            /.*Typing\s\.\.$/,
            /.*Typing\s\.$/,
          ];

          const isTypingMessage = typingPatterns.some(pattern => pattern.test(lastMessage.text));

          if (isTypingMessage) {
            this.conversation.message.pop();
          }
        }

        this.scrollToBottom();
      },
      updateConversationPreview() {
        if (this.conversation) {
          const lastMessage = this.conversation.message[this.conversation.message.length - 1];
          this.conversation.preview = lastMessage.text;
          this.conversation.lastUpdate = new Date();
          this.saveConversation();
        }
      },
      scrollToBottom() {
        this.$nextTick(() => {
          const chatContent = this.$refs.chatContent;
          if (chatContent) {
            chatContent.scrollTop = chatContent.scrollHeight;
          }
        });
      },
      async saveConversation() {
        try {
          if (this.conversationID && this.conversation) {
            const lastSavedMessage = this.conversation.message[this.conversation.message.length - 1];
            // Skip saving if the message text is '...'
            if (lastSavedMessage.text === '...') {
              console.warn('Skipping save for typing indicator.');
              return;
            }
            const duplicateMessages = this.conversation.message.filter(
                msg => msg.text === lastSavedMessage.text && msg.time === lastSavedMessage.time
            );
            if (duplicateMessages.length > 1) {
              console.warn('Duplicate.');
              return;
            }
            await updateConversation(this.conversationID, this.conversation);
          }
        } catch (error) {
          console.error(error.message);
        }
      },
      minimizeChat() {
        this.isChatOpen = false;
      },
      handleCloseButtonClick() {
        this.isChatOpen = false;
        this.resetChat();
      },
      resetChat() {
        this.newMessage = '';
        this.currentStepIndex = 0;
        this.context = {};
        this.chatSummary = null;
        this.isEndConversation = false;
        this.showCloseButton = false;

        if (this.conversation) {
          this.conversation.status = 'resolved';
          this.conversation.preview = 'Conversation ended';
          this.conversation.lastUpdate = new Date();
          this.saveConversation();
        }
      },
      handleChoiceClick(choice) {
        this.newMessage = choice;
        this.sendMessage();
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
  max-height: 500px;
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

    display: flex;
    flex-direction: column;
    gap: 12px;

  overflow-y: auto;
  background-color: #f5f5f5;
  font-size: 14px;
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
  