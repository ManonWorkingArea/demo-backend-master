<script>
import storageManager from '@/plugins/storage';
import CustomConfirmation from '@/utils/Confirmation.vue';

export default {
    data() {
      const session = storageManager.get('session')
      return {
        // Session & Auth
        school: session.current.id,
        login: session.login,
        master: session.master,
        accessToken: storageManager.get('session','token'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        
        // Chat State
        currentChatId: null,
        currentChatTitle: '',
        messageInput: '',
        isTyping: false,
        chatSearchQuery: '',
        isConnected: true,
        connectionError: null,
        
        // Messages & Chats
        currentMessages: [],
        chatHistory: [],
        
        // UI State
        showMobileSidebar: false,
        showSettings: false,
        userClosedChat: false, // ติดตามว่าผู้ใช้ปิดแชทเองหรือไม่
        suggestions: [
          'สร้างข้อมูลลูกค้าใหม่',
          'วิเคราะห์ข้อมูลยอดขาย',
          'สร้างรายงานสรุป',
          'ช่วยตรวจสอบข้อมูล'
        ],
        
        // Confirmation
        confirmationMessage: '',
        confirmationHeader: '',
        showConfirmation: false,
        deletionData: null,
      }
    },
    components: {
      CustomConfirmation,
    },
    methods: {
      // Chat Management
      startNewChat() {
        const newChatId = Date.now();
        const newChat = {
          id: newChatId,
          title: '',
          lastMessage: '',
          createdAt: new Date(),
          messages: []
        };
        
        this.chatHistory.unshift(newChat);
        this.userClosedChat = false; // รีเซ็ตเมื่อเริ่มแชทใหม่
        this.selectChat(newChatId);
      },
      
      async selectChat(chatId) {
        this.currentChatId = chatId;
        this.userClosedChat = false; // รีเซ็ตเมื่อเลือกแชทใหม่
        const chat = this.chatHistory.find(c => c.id === chatId);
        
        if (chat) {
          this.currentChatTitle = chat.title;
          
          // ถ้ามีข้อความใน cache ให้ใช้
          if (chat.messages && chat.messages.length > 0) {
            this.currentMessages = chat.messages;
          } else {
            // โหลดข้อความจาก AI Gateway
            this.isTyping = true;
            const messages = await this.loadChatMessagesFromGateway(chatId);
            
            if (messages.length > 0) {
              this.currentMessages = messages;
              chat.messages = messages; // cache ไว้
            } else {
              this.currentMessages = [];
            }
            this.isTyping = false;
          }
          
          this.scrollToBottom();
        }
      },
      
      deleteChat(chatId) {
        this.confirmationMessage = 'คุณต้องการลบการสนทนานี้ใช่หรือไม่?';
        this.confirmationHeader = 'ยืนยันการลบ';
        this.deletionData = { type: 'chat', chatId };
        this.showConfirmation = true;
      },
      
      editChatTitle(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (chat) {
          const newTitle = prompt('แก้ไขชื่อการสนทนา:', chat.title || '');
          if (newTitle !== null) {
            chat.title = newTitle.trim() || 'แชทใหม่';
            if (this.currentChatId === chatId) {
              this.currentChatTitle = chat.title;
            }
            this.saveChatHistory();
          }
        }
      },
      
      clearChat() {
        if (this.currentChatId) {
          this.confirmationMessage = 'คุณต้องการล้างข้อความในการสนทนานี้ใช่หรือไม่?';
          this.confirmationHeader = 'ยืนยันการล้างข้อความ';
          this.deletionData = { type: 'clear', chatId: this.currentChatId };
          this.showConfirmation = true;
        }
      },

      closeCurrentChat() {
        this.currentChatId = null;
        this.currentChatTitle = '';
        this.currentMessages = [];
        this.messageInput = ''; // ล้างข้อความที่กำลังพิมพ์
        this.userClosedChat = true; // ทำเครื่องหมายว่าผู้ใช้ปิดแชทเอง
        
        // แสดง toast ข้อความแจ้งเตือน
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 2000,
          icon: 'info',
          title: 'กลับสู่หน้าหลัก',
          text: 'เลือกแชทหรือเริ่มแชทใหม่เพื่อเริ่มการสนทนา'
        });
      },
      
      async exportChat() {
        if (!this.currentChatId) {
          this.$swal({
            icon: 'warning',
            title: 'ไม่มีการสนทนา',
            text: 'กรุณาเลือกการสนทนาที่ต้องการ export'
          });
          return;
        }
        
        let messages = this.currentMessages;
        
        // ถ้าไม่มีข้อความใน cache ให้โหลดจาก AI Gateway
        if (messages.length === 0) {
          messages = await this.loadChatMessagesFromGateway(this.currentChatId);
        }
        
        if (messages.length === 0) {
          this.$swal({
            icon: 'warning',
            title: 'ไม่มีข้อความ',
            text: 'ไม่มีข้อความในการสนทนานี้ให้ export'
          });
          return;
        }
        
        const chatData = messages.map(msg => ({
          ประเภท: msg.type === 'user' ? 'ผู้ใช้' : 'AI Assistant',
          ข้อความ: msg.content,
          เวลา: new Date(msg.timestamp).toLocaleString('th-TH'),
          'Metadata': msg.metadata ? JSON.stringify(msg.metadata) : ''
        }));
        
        const csvContent = this.arrayToCSV(chatData);
        const filename = `AI_Chat_${this.currentChatTitle.replace(/[^a-zA-Z0-9ก-๙]/g, '_')}_${Date.now()}.csv`;
        this.downloadCSV(csvContent, filename);
        
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 2000,
          icon: 'success',
          title: 'Export สำเร็จ',
          text: `ดาวน์โหลดไฟล์ ${filename} แล้ว`
        });
      },
      
      // Message Handling
      async sendMessage() {
        if (!this.messageInput.trim() || this.isTyping) return;
        
        const userMessage = {
          id: Date.now(),
          type: 'user',
          content: this.messageInput.trim(),
          timestamp: new Date()
        };
        
        // Ensure we have a current chat
        if (!this.currentChatId) {
          this.startNewChat();
        }
        
        // Add user message
        this.currentMessages.push(userMessage);
        
        // Update chat title if this is the first message
        const chat = this.chatHistory.find(c => c.id === this.currentChatId);
        if (chat && !chat.title) {
          chat.title = this.messageInput.slice(0, 50) + (this.messageInput.length > 50 ? '...' : '');
          this.currentChatTitle = chat.title;
        }
        
        const messageContent = this.messageInput;
        this.messageInput = '';
        this.adjustTextareaHeight();
        this.scrollToBottom();
        
        // Send to AI
        await this.sendToAI(messageContent);
        this.saveChatHistory();
      },
      
      async sendQuickMessage(message) {
        this.messageInput = message;
        await this.sendMessage();
      },
      
      async sendToAI(message) {
        this.isTyping = true;
        
        try {
          // ใช้ AI Gateway API
          const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/bot/ask', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Session-ID': this.currentChatId ? `chat_${this.currentChatId}` : `chat_${Date.now()}`,
              'X-Hostname': window.location.hostname || 'localhost',
              'X-Long-Live': 'true',
              'X-Max-Messages': '10000',
              'X-Persona': 'rd'
            },
            body: JSON.stringify({
              question: message
            })
          });

          if (!response.ok) {
            this.isConnected = false;
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (!data.success) {
            this.isConnected = false;
            throw new Error(data.error || 'AI Gateway error');
          }

          // การเชื่อมต่อสำเร็จ
          this.isConnected = true;
          this.connectionError = null;

          const aiMessage = {
            id: Date.now(),
            type: 'assistant',
            content: data.answer,
            timestamp: new Date(),
            liked: false,
            metadata: data.metadata || {}
          };
          
          this.currentMessages.push(aiMessage);
          
          // Update last message in chat history
          const chat = this.chatHistory.find(c => c.id === this.currentChatId);
          if (chat) {
            chat.lastMessage = data.answer.slice(0, 100) + (data.answer.length > 100 ? '...' : '');
            chat.messages = this.currentMessages;
          }
          
        } catch (error) {
          console.error('Error sending message to AI Gateway:', error);
          this.isConnected = false;
          this.connectionError = error.message;
          
          const errorMessage = {
            id: Date.now(),
            type: 'assistant',
            content: `ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI Gateway: ${error.message}\n\nกรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง`,
            timestamp: new Date(),
            liked: false,
            error: true
          };
          
          this.currentMessages.push(errorMessage);
        } finally {
          this.isTyping = false;
          this.scrollToBottom();
        }
      },
      
      // Message Actions
      copyMessage(content) {
        navigator.clipboard.writeText(content).then(() => {
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 1500,
            icon: 'success',
            title: 'คัดลอกข้อความแล้ว'
          });
        });
      },
      
      async regenerateResponse(messageId) {
        const messageIndex = this.currentMessages.findIndex(m => m.id === messageId);
        if (messageIndex > 0) {
          const userMessage = this.currentMessages[messageIndex - 1].content;
          
          // Remove the AI message
          this.currentMessages.splice(messageIndex, 1);
          
          // Generate new response using AI Gateway
          await this.sendToAI(userMessage);
        }
      },
      
      likeMessage(messageId) {
        const message = this.currentMessages.find(m => m.id === messageId);
        if (message) {
          message.liked = !message.liked;
          this.saveChatHistory();
        }
      },
      
      // File Handling
      openFileUpload() {
        this.$refs.fileInput.click();
      },
      
      handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
          // Handle file upload
          console.log('Files uploaded:', files);
          this.$swal({
            icon: 'info',
            title: 'ฟีเจอร์กำลังพัฒนา',
            text: 'การอัปโหลดไฟล์จะเปิดใช้งานเร็วๆ นี้'
          });
        }
      },
      
      // Input Handling
      handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          this.sendMessage();
        }
      },
      
      adjustTextareaHeight() {
        this.$nextTick(() => {
          const textarea = this.$refs.messageTextarea;
          if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
          }
        });
      },
      
      // UI Helpers
      scrollToBottom() {
        this.$nextTick(() => {
          const container = this.$refs.chatContainer;
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        });
      },
      
      toggleMobileSidebar() {
        this.showMobileSidebar = !this.showMobileSidebar;
      },
      
      // Format & Display
      formatMessage(content) {
        // Simple markdown-like formatting
        return content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\n/g, '<br>')
          .replace(/^• (.+)$/gm, '• $1')
          .replace(/^(\d+)\. (.+)$/gm, '$1. $2');
      },
      
      formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      
      // Data Persistence
      async saveChatHistory() {
        try {
          localStorage.setItem('ai_chat_history', JSON.stringify(this.chatHistory));
        } catch (error) {
          console.error('Failed to save chat history:', error);
        }
      },
      
      async loadChatHistory() {
        try {
          // โหลดจาก localStorage ก่อน
          const saved = localStorage.getItem('ai_chat_history');
          if (saved) {
            this.chatHistory = JSON.parse(saved);
          }
          
          // ดึงข้อมูลจาก AI Gateway
          await this.loadChatHistoryFromGateway();
        } catch (error) {
          console.error('Failed to load chat history:', error);
        }
      },
      
      async loadChatHistoryFromGateway() {
        try {
          // ดึงข้อมูล all conversations จาก AI Gateway
          const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/conversations/all?limit=50', {
            method: 'GET',
            headers: {
              'X-Hostname': window.location.hostname || 'localhost'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('AI Gateway all conversations:', data);
            
            if (data.success && data.conversations) {
              // แปลงข้อมูลจาก AI Gateway เป็นรูปแบบของ chatHistory
              const gatewayChats = data.conversations.map(conv => {
                // แยก session_id ให้เป็น chatId
                let chatId = conv.session_id;
                if (chatId.startsWith('chat_')) {
                  chatId = chatId.substring(5); // ตัด 'chat_' ออก
                }
                
                return {
                  id: chatId,
                  title: this.extractTitleFromMessage(conv.last_user_message?.content || 'แชทใหม่'),
                  lastMessage: conv.last_user_message?.content?.slice(0, 100) || '',
                  createdAt: new Date(conv.last_message_timestamp),
                  messages: [], // จะโหลดตอน select chat
                  messageCount: conv.message_count || 0,
                  isFromGateway: true,
                  sessionId: conv.session_id // เก็บ original session_id ไว้
                };
              });
              
              console.log('Processed gateway chats:', gatewayChats);
              
              // รวมกับข้อมูลใน localStorage
              this.mergeWithLocalHistory(gatewayChats);
              
              // อัปเดต connection status
              this.isConnected = true;
              this.connectionError = null;
            }
          } else {
            console.error('Failed to load from AI Gateway:', response.status);
            this.isConnected = false;
          }
        } catch (error) {
          console.error('Failed to load from AI Gateway:', error);
          this.isConnected = false;
          this.connectionError = error.message;
        }
      },
      
      extractTitleFromMessage(message) {
        // สร้าง title จากข้อความแรก
        if (!message) return 'แชทใหม่';
        
        const cleanMessage = message.trim();
        if (cleanMessage.length <= 50) return cleanMessage;
        
        // หาจุดหยุดที่เหมาะสม
        const sentences = cleanMessage.split(/[.!?]/);
        if (sentences[0] && sentences[0].length <= 50) {
          return sentences[0].trim();
        }
        
        return cleanMessage.slice(0, 47) + '...';
      },
      
      mergeWithLocalHistory(gatewayChats) {
        const localChatIds = this.chatHistory.map(chat => String(chat.id));
        
        gatewayChats.forEach(gatewayChat => {
          const gatewayId = String(gatewayChat.id);
          if (!localChatIds.includes(gatewayId)) {
            this.chatHistory.push(gatewayChat);
          }
        });
        
        // เรียงตามวันที่ล่าสุด
        this.chatHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      },
      
      async loadChatMessagesFromGateway(chatId) {
        try {
          // ใช้ original session_id หรือสร้างใหม่
          const chat = this.chatHistory.find(c => c.id === chatId);
          const sessionId = chat?.sessionId || `chat_${chatId}`;
          
          console.log('Loading messages for session:', sessionId);
          
          const response = await fetch(`https://ai-gateway.manonsanoi.workers.dev/conversation/history?session_id=${sessionId}`, {
            method: 'GET',
            headers: {
              'X-Hostname': window.location.hostname || 'localhost'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Chat history response:', data);
            
            if (data.success && data.messages && data.messages.length > 0) {
              // แปลงข้อมูลจาก AI Gateway
              const messages = data.messages.map(msg => ({
                id: msg.id || Date.now() + Math.random(),
                type: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content,
                timestamp: new Date(msg.timestamp),
                liked: false,
                metadata: msg.metadata || {}
              }));
              
              console.log('Processed messages:', messages);
              
              // อัปเดต connection status
              this.isConnected = true;
              this.connectionError = null;
              
              return messages;
            } else {
              console.log('No messages found for session:', sessionId);
            }
          } else {
            console.error('Failed to load messages:', response.status);
            this.isConnected = false;
          }
        } catch (error) {
          console.error('Failed to load messages from AI Gateway:', error);
          this.isConnected = false;
          this.connectionError = error.message;
        }
        
        return [];
      },
      
      // Confirmation Handlers
      handleConfirmation() {
        if (this.deletionData) {
          if (this.deletionData.type === 'chat') {
            this.confirmDeleteChat();
          } else if (this.deletionData.type === 'clear') {
            this.confirmClearChat();
          }
        }
      },
      
      async confirmDeleteChat() {
        const { chatId } = this.deletionData;
        
        try {
          // หา session_id ที่ถูกต้อง
          const chat = this.chatHistory.find(c => c.id === chatId);
          const sessionId = chat?.sessionId || `chat_${chatId}`;
          
          console.log('Deleting chat with session_id:', sessionId);
          
          // ลบจาก AI Gateway
          const response = await fetch(`https://ai-gateway.manonsanoi.workers.dev/conversation/delete?session_id=${sessionId}`, {
            method: 'POST',
            headers: {
              'X-Hostname': window.location.hostname || 'localhost'
            }
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Chat deleted from AI Gateway successfully:', result);
            
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 2000,
              icon: 'success',
              title: 'ลบแชทสำเร็จ',
              text: 'ลบการสนทนาจาก AI Gateway แล้ว'
            });
          } else {
            console.error('Failed to delete from AI Gateway:', response.status);
          }
        } catch (error) {
          console.error('Failed to delete from AI Gateway:', error);
          
          this.$swal({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถลบจาก AI Gateway ได้ แต่จะลบจาก local storage'
          });
        }
        
        // ลบจาก local history เสมอ
        this.chatHistory = this.chatHistory.filter(c => c.id !== chatId);
        
        if (this.currentChatId === chatId) {
          this.currentChatId = null;
          this.currentChatTitle = '';
          this.currentMessages = [];
        }
        
        this.saveChatHistory();
        this.handleConfirmCancel();
      },
      
      async confirmClearChat() {
        const { chatId } = this.deletionData;
        
        try {
          // ลบจาก AI Gateway
          const sessionId = `chat_${chatId}`;
          const response = await fetch(`https://ai-gateway.manonsanoi.workers.dev/conversation/delete?session_id=${sessionId}`, {
            method: 'POST',
            headers: {
              'X-Hostname': window.location.hostname || 'localhost'
            }
          });

          if (response.ok) {
            console.log('Chat cleared from AI Gateway successfully');
          }
        } catch (error) {
          console.error('Failed to clear from AI Gateway:', error);
        }
        
        // ล้างข้อความใน local history
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (chat) {
          chat.messages = [];
          chat.lastMessage = '';
        }
        
        if (this.currentChatId === chatId) {
          this.currentMessages = [];
        }
        
        this.saveChatHistory();
        this.handleConfirmCancel();
      },
      
      handleConfirmCancel() {
        this.deletionData = null;
        this.confirmationMessage = '';
        this.confirmationHeader = '';
        this.showConfirmation = false;
      },
      
      // Utility Functions
      arrayToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        
        return csvContent;
      },
      
      downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    },
    async mounted() {
      await this.loadChatHistory();
      
      // Auto-adjust textarea height
      this.$watch('messageInput', () => {
        this.adjustTextareaHeight();
      });
      
      // เริ่มต้นด้วยหน้า welcome เสมอ - ไม่เปิด chat อัตโนมัติ
      // ผู้ใช้ต้องเลือกแชทเองหรือเริ่มแชทใหม่
    },
    computed: {
      // Chat History Categories
      todayChats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.chatHistory.filter(chat => {
          const chatDate = new Date(chat.createdAt);
          chatDate.setHours(0, 0, 0, 0);
          return chatDate.getTime() === today.getTime();
        });
      },
      
      yesterdayChats() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        return this.chatHistory.filter(chat => {
          const chatDate = new Date(chat.createdAt);
          chatDate.setHours(0, 0, 0, 0);
          return chatDate.getTime() === yesterday.getTime();
        });
      },
      
      weekChats() {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        return this.chatHistory.filter(chat => {
          const chatDate = new Date(chat.createdAt);
          return chatDate >= weekAgo && chatDate < yesterday;
        });
      },
      
      olderChats() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return this.chatHistory.filter(chat => {
          const chatDate = new Date(chat.createdAt);
          return chatDate < weekAgo;
        });
      }
    }
};
</script>

<template>
  <div class="flex h-screen bg-gray-100 ai-chat-container">
    <!-- Chat History Sidebar -->
    <div class="hidden lg:flex lg:w-80 lg:flex-col bg-gray-900 border-r border-gray-700">
      <div class="flex flex-col h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <i class="fas fa-robot text-white text-sm"></i>
            </div>
            <h1 class="text-lg font-semibold text-white">AI Assistant</h1>
          </div>
          <button 
            @click="startNewChat" 
            class="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            title="เริ่มแชทใหม่"
          >
            <i class="fas fa-plus text-sm"></i>
          </button>
        </div>

        <!-- Search Chats -->
        <div class="px-4 py-3 border-b border-gray-700">
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
            <input 
              type="text" 
              v-model="chatSearchQuery" 
              placeholder="ค้นหาการสนทนา..." 
              class="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-white placeholder-gray-400"
            />
          </div>
        </div>

        <!-- Chat History List -->
        <div class="flex-1 overflow-y-auto px-4 py-2">
          <div class="space-y-2">
            <!-- Today -->
            <div class="mb-4">
              <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">วันนี้</h3>
              <div class="space-y-1">
                <div 
                  v-for="chat in todayChats" 
                  :key="chat.id"
                  @click="selectChat(chat.id)"
                  class="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors duration-200 group chat-item"
                  :class="{ 
                    'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md': currentChatId === chat.id,
                    'text-gray-300 hover:bg-gray-800': currentChatId !== chat.id
                  }"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{{ chat.title || 'แชทใหม่' }}</p>
                    <p class="text-xs opacity-75 truncate">{{ chat.lastMessage }}</p>
                  </div>
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click.stop="editChatTitle(chat.id)"
                      class="p-1 rounded hover:bg-gray-700 transition-colors"
                    >
                      <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button 
                      @click.stop="deleteChat(chat.id)"
                      class="p-1 rounded hover:bg-gray-700 transition-colors text-red-400"
                    >
                      <i class="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Yesterday -->
            <div class="mb-4" v-if="yesterdayChats.length > 0">
              <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">เมื่อวาน</h3>
              <div class="space-y-1">
                <div 
                  v-for="chat in yesterdayChats" 
                  :key="chat.id"
                  @click="selectChat(chat.id)"
                  class="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors duration-200 group chat-item"
                  :class="{ 
                    'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md': currentChatId === chat.id,
                    'text-gray-300 hover:bg-gray-800': currentChatId !== chat.id
                  }"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{{ chat.title || 'แชทใหม่' }}</p>
                    <p class="text-xs opacity-75 truncate">{{ chat.lastMessage }}</p>
                  </div>
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click.stop="editChatTitle(chat.id)"
                      class="p-1 rounded hover:bg-gray-700 transition-colors"
                    >
                      <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button 
                      @click.stop="deleteChat(chat.id)"
                      class="p-1 rounded hover:bg-gray-700 transition-colors text-red-400"
                    >
                      <i class="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Previous 7 days -->
            <div class="mb-4" v-if="weekChats.length > 0">
              <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">7 วันที่แล้ว</h3>
              <div class="space-y-1">
                <div 
                  v-for="chat in weekChats" 
                  :key="chat.id"
                  @click="selectChat(chat.id)"
                  class="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors duration-200 group chat-item"
                  :class="{ 
                    'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md': currentChatId === chat.id,
                    'text-gray-300 hover:bg-gray-800': currentChatId !== chat.id
                  }"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{{ chat.title || 'แชทใหม่' }}</p>
                    <p class="text-xs opacity-75 truncate">{{ chat.lastMessage }}</p>
                  </div>
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click.stop="editChatTitle(chat.id)"
                      class="p-1 rounded hover:bg-gray-700 transition-colors"
                    >
                      <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button 
                      @click.stop="deleteChat(chat.id)"
                      class="p-1 rounded hover:bg-gray-700 transition-colors text-red-400"
                    >
                      <i class="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Older -->
            <div class="mb-4" v-if="olderChats.length > 0">
              <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">เก่ากว่านั้น</h3>
              <div class="space-y-1">
                <div 
                  v-for="chat in olderChats" 
                  :key="chat.id"
                  @click="selectChat(chat.id)"
                  class="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors duration-200 group chat-item"
                  :class="{ 
                    'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md': currentChatId === chat.id,
                    'text-gray-300 hover:bg-gray-800': currentChatId !== chat.id
                  }"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{{ chat.title || 'แชทใหม่' }}</p>
                    <p class="text-xs opacity-75 truncate">{{ chat.lastMessage }}</p>
                  </div>
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click.stop="editChatTitle(chat.id)"
                      class="p-1 rounded hover:bg-gray-700 transition-colors"
                    >
                      <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button 
                      @click.stop="deleteChat(chat.id)"
                      class="p-1 rounded hover:bg-gray-700 transition-colors text-red-400"
                    >
                      <i class="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Knowledge Base Quick Access -->
        <div class="px-4 py-3 border-t border-gray-700">
          <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Knowledge Base</h3>
          <div class="space-y-2">
            <router-link to="/ai/knowledge-base" class="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors group">
              <i class="fas fa-database text-sm"></i>
              <span class="text-sm">คลังความรู้</span>
              <i class="fas fa-arrow-right text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </router-link>
            <router-link to="/ai/knowledge-base/upload" class="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors group">
              <i class="fas fa-cloud-upload-alt text-sm"></i>
              <span class="text-sm">อัพโหลดเอกสาร</span>
              <i class="fas fa-arrow-right text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </router-link>
            <router-link to="/ai/knowledge-base/analytics" class="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors group">
              <i class="fas fa-chart-line text-sm"></i>
              <span class="text-sm">รายงานการใช้งาน</span>
              <i class="fas fa-arrow-right text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </router-link>
          </div>
        </div>

        <!-- User Profile -->
        <div class="px-4 py-4 border-t border-gray-700">
          <div class="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-white text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ session?.current?.name || 'ผู้ใช้' }}</p>
              <p class="text-xs text-gray-400">Online</p>
            </div>
            <button class="p-2 text-gray-400 hover:text-white transition-colors">
              <i class="fas fa-cog text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col min-w-0 bg-white">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <button 
            @click="toggleMobileSidebar" 
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-bars"></i>
          </button>
          <h1 class="text-lg font-semibold text-gray-900">AI Assistant</h1>
          <button 
            @click="startNewChat"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>

        <!-- Chat Header -->
      <div class="hidden lg:flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <i class="fas fa-robot text-white"></i>
          </div>
          <div>
            <h1 class="text-lg font-semibold text-gray-900">
              {{ currentChatId && currentChatTitle ? currentChatTitle : 'AI Assistant - หน้าหลัก' }}
            </h1>
            <p class="text-sm text-gray-500">
              <span v-if="currentChatId && isConnected" class="flex items-center gap-1">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                เชื่อมต่อ AI Gateway แล้ว
              </span>
              <span v-else-if="currentChatId && !isConnected" class="flex items-center gap-1">
                <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                ไม่สามารถเชื่อมต่อ AI Gateway
              </span>
              <span v-else class="text-gray-600 flex items-center gap-1">
                <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                พร้อมใช้งาน - เลือกแชทหรือเริ่มแชทใหม่
              </span>
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Controls แสดงเฉพาะเมื่อมี chat ที่เปิดอยู่ -->
          <div v-if="currentChatId" class="flex items-center gap-2">
            <button 
              @click="closeCurrentChat"
              class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shadow-sm"
              title="ปิดแชทและกลับหน้าหลัก"
            >
              <i class="fas fa-times"></i>
            </button>
            <button 
              @click="clearChat"
              class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shadow-sm"
              title="ล้างการสนทนา"
            >
              <i class="fas fa-broom"></i>
            </button>
            <button 
              @click="exportChat"
              class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shadow-sm"
              title="ส่งออกการสนทนา"
            >
              <i class="fas fa-download"></i>
            </button>
          </div>
          
          <!-- Settings แสดงเสมอ -->
          <button 
            @click="showSettings = true"
            class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shadow-sm"
            title="ตั้งค่า"
          >
            <i class="fas fa-cog"></i>
          </button>
          
          <!-- Start New Chat Button - แสดงเมื่อไม่มี chat -->
          <button 
            v-if="!currentChatId"
            @click="startNewChat"
            class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
            title="เริ่มแชทใหม่"
          >
            <i class="fas fa-plus mr-2"></i>เริ่มแชทใหม่
          </button>
        </div>
      </div>

      <!-- Chat Messages Area -->
      <div class="flex-1 overflow-y-auto px-4 lg:px-6 py-4" ref="chatContainer">
        <!-- Welcome Message -->
        <div v-if="!currentChatId || currentMessages.length === 0" class="h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto p-6">
          <div class="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl animate-pulse">
            <i class="fas fa-robot text-white text-3xl"></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-4">สวัสดี! ยินดีต้อนรับสู่ AI Assistant</h1>
          <p class="text-gray-600 mb-8 text-xl leading-relaxed">ฉันพร้อมช่วยเหลือคุณในการสร้างข้อมูล วิเคราะห์ข้อมูล และตอบคำถามต่างๆ</p>
          
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
            <p class="text-blue-800 font-medium mb-2">💡 วิธีเริ่มต้น</p>
            <p class="text-blue-700 text-sm">เลือกแชทจากแถบด้านซ้าย หรือกดปุ่ม "+" เพื่อเริ่มการสนทนาใหม่</p>
          </div>
          
          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <button 
              @click="sendQuickMessage('สร้างข้อมูลใหม่')"
              class="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-all duration-200 group shadow-sm hover:shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <i class="fas fa-plus text-white text-sm"></i>
                </div>
                <div class="text-left">
                  <p class="font-medium text-gray-900">สร้างข้อมูลใหม่</p>
                  <p class="text-sm text-gray-600">เริ่มสร้าง dataset</p>
                </div>
              </div>
            </button>
            
            <button 
              @click="sendQuickMessage('วิเคราะห์ข้อมูล')"
              class="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all duration-200 group shadow-sm hover:shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <i class="fas fa-chart-bar text-white text-sm"></i>
                </div>
                <div class="text-left">
                  <p class="font-medium text-gray-900">วิเคราะห์ข้อมูล</p>
                  <p class="text-sm text-gray-600">วิเคราะห์และสร้างกราф</p>
                </div>
              </div>
            </button>
            
            <router-link 
              to="/ai/knowledge-base"
              class="block p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-all duration-200 group shadow-sm hover:shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <i class="fas fa-database text-white text-sm"></i>
                </div>
                <div class="text-left">
                  <p class="font-medium text-gray-900">จัดการคลังความรู้</p>
                  <p class="text-sm text-gray-600">ระบบจัดการเอกสารด้วย AI</p>
                </div>
                <div class="ml-auto">
                  <i class="fas fa-arrow-right text-gray-400 group-hover:text-indigo-500 transition-colors"></i>
                </div>
              </div>
            </router-link>
            
            <button 
              @click="sendQuickMessage('ช่วยเหลือทั่วไป')"
              class="p-4 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 hover:border-amber-300 transition-all duration-200 group shadow-sm hover:shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <i class="fas fa-question-circle text-white text-sm"></i>
                </div>
                <div class="text-left">
                  <p class="font-medium text-gray-900">ช่วยเหลือทั่วไป</p>
                  <p class="text-sm text-gray-600">ถามคำถามอื่นๆ</p>
                </div>
              </div>
            </button>

            <!-- Knowledge Management Card -->
            <router-link 
              to="/ai/knowledge-base"
              class="group p-4 bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-lg"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <i class="fas fa-database text-white text-sm"></i>
                </div>
                <div class="text-left flex-1">
                  <p class="font-medium text-gray-900">คลังความรู้ AI</p>
                  <p class="text-sm text-gray-600">จัดการเอกสารด้วย AI</p>
                </div>
                <i class="fas fa-arrow-right text-gray-400 group-hover:text-indigo-500 transition-colors"></i>
              </div>
            </router-link>

            <!-- AI Upload Quick Access -->
            <router-link 
              to="/ai/knowledge-base/upload"
              class="group p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <i class="fas fa-cloud-upload-alt text-white text-sm"></i>
                </div>
                <div class="text-left flex-1">
                  <p class="font-medium text-gray-900">อัพโหลด & ประมวลผล AI</p>
                  <p class="text-sm text-gray-600">อัพโหลดเอกสารให้ AI ประมวลผล</p>
                </div>
                <i class="fas fa-arrow-right text-gray-400 group-hover:text-purple-500 transition-colors"></i>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Chat Messages -->
        <div v-else class="space-y-6 max-w-4xl mx-auto">
          <div 
            v-for="message in currentMessages" 
            :key="message.id"
            class="flex gap-4"
            :class="{ 'flex-row-reverse': message.type === 'user' }"
          >
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="message.type === 'user' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'"
              >
                <i 
                  :class="message.type === 'user' ? 'fas fa-user' : 'fas fa-robot'"
                  class="text-white text-sm"
                ></i>
              </div>
            </div>

            <!-- Message Content -->
            <div 
              class="flex-1 max-w-2xl"
              :class="message.type === 'user' ? 'text-right' : 'text-left'"
            >
              <div 
                class="inline-block px-4 py-3 rounded-2xl"
                :class="message.type === 'user' 
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white' 
                  : 'bg-gray-50 text-gray-900 border border-gray-200'"
              >
                <div class="whitespace-pre-wrap" v-html="formatMessage(message.content)"></div>
                
                <!-- Message Actions -->
                <div 
                  v-if="message.type === 'assistant'" 
                  class="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200"
                >
                  <button 
                    @click="copyMessage(message.content)"
                    class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <i class="fas fa-copy mr-1"></i>คัดลอก
                  </button>
                  <button 
                    @click="regenerateResponse(message.id)"
                    class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <i class="fas fa-redo mr-1"></i>สร้างใหม่
                  </button>
                  <button 
                    @click="likeMessage(message.id)"
                    class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    :class="{ 'text-green-600': message.liked }"
                  >
                    <i class="fas fa-thumbs-up mr-1"></i>ถูกใจ
                  </button>
                </div>
              </div>
              
              <!-- Timestamp -->
              <div 
                class="text-xs text-gray-500 mt-1"
                :class="message.type === 'user' ? 'text-right' : 'text-left'"
              >
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="flex gap-4">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <i class="fas fa-robot text-white text-sm"></i>
              </div>
            </div>
            <div class="flex-1">
              <div class="inline-block px-4 py-3 bg-gray-100 rounded-2xl">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input Area -->
      <div class="border-t border-gray-200 bg-white px-4 lg:px-6 py-4">
        <div class="max-w-4xl mx-auto">
          <!-- Suggestions (if any) -->
          <div v-if="suggestions.length > 0" class="mb-4">
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="suggestion in suggestions" 
                :key="suggestion"
                @click="sendQuickMessage(suggestion)"
                class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>

          <!-- Input Form -->
          <form @submit.prevent="sendMessage" class="relative">
            <div class="flex items-end gap-2">
              <!-- Attachment Button -->
              <button 
                type="button"
                @click="openFileUpload"
                class="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="แนบไฟล์"
              >
                <i class="fas fa-paperclip"></i>
              </button>

              <!-- Message Input -->
              <div class="flex-1 relative">
                <textarea
                  v-model="messageInput"
                  @keydown="handleKeyDown"
                  placeholder="พิมพ์ข้อความของคุณที่นี่..."
                  rows="1"
                  ref="messageTextarea"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                  :disabled="isTyping"
                ></textarea>
                
                <!-- Send Button -->
                <button 
                  type="submit"
                  :disabled="!messageInput.trim() || isTyping"
                  class="absolute right-2 bottom-2 p-2 rounded-full transition-colors"
                  :class="messageInput.trim() && !isTyping 
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                >
                  <i class="fas fa-paper-plane text-sm"></i>
                </button>
              </div>
            </div>

            <!-- File Upload Area (Hidden) -->
            <input 
              ref="fileInput"
              type="file"
              multiple
              accept=".txt,.pdf,.doc,.docx,.json,.csv"
              @change="handleFileUpload"
              class="hidden"
            />
          </form>

          <!-- Footer -->
          <div class="text-center mt-2">
            <p class="text-xs text-gray-500">
              AI สามารถทำผิดพลาดได้ กรุณาตรวจสอบข้อมูลที่สำคัญ
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="showMobileSidebar" 
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="toggleMobileSidebar"
    >
      <div 
        class="w-80 h-full bg-gray-900 transform transition-transform duration-300"
        @click.stop
      >
        <!-- Mobile Sidebar Content (same as desktop sidebar) -->
        <div class="flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between px-4 py-4 border-b border-gray-700">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-robot text-white text-sm"></i>
              </div>
              <h1 class="text-lg font-semibold text-white">AI Assistant</h1>
            </div>
            <button 
              @click="toggleMobileSidebar"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Search Chats -->
          <div class="px-4 py-3 border-b border-gray-700">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input 
                type="text" 
                v-model="chatSearchQuery" 
                placeholder="ค้นหาการสนทนา..." 
                class="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-white placeholder-gray-400"
              />
            </div>
          </div>

          <!-- Chat History List -->
          <div class="flex-1 overflow-y-auto px-4 py-2">
            <div class="space-y-2">
              <!-- Today -->
              <div class="mb-4">
                <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">วันนี้</h3>
                <div class="space-y-1">
                  <div 
                    v-for="chat in todayChats" 
                    :key="chat.id"
                    @click="selectChat(chat.id); toggleMobileSidebar()"
                    class="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors duration-200 group"
                    :class="{ 
                      'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md': currentChatId === chat.id,
                      'text-gray-300 hover:bg-gray-800': currentChatId !== chat.id
                    }"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate">{{ chat.title || 'แชทใหม่' }}</p>
                      <p class="text-xs opacity-75 truncate">{{ chat.lastMessage }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Yesterday -->
              <div class="mb-4" v-if="yesterdayChats.length > 0">
                <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">เมื่อวาน</h3>
                <div class="space-y-1">
                  <div 
                    v-for="chat in yesterdayChats" 
                    :key="chat.id"
                    @click="selectChat(chat.id); toggleMobileSidebar()"
                    class="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors duration-200"
                    :class="{ 
                      'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md': currentChatId === chat.id,
                      'text-gray-300 hover:bg-gray-800': currentChatId !== chat.id
                    }"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate">{{ chat.title || 'แชทใหม่' }}</p>
                      <p class="text-xs opacity-75 truncate">{{ chat.lastMessage }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- User Profile -->
          <div class="px-4 py-4 border-t border-gray-700">
            <div class="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <i class="fas fa-user text-white text-sm"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ session?.current?.name || 'ผู้ใช้' }}</p>
                <p class="text-xs text-gray-400">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <custom-confirmation
      v-if="showConfirmation"
      :message="confirmationMessage"
      :header="confirmationHeader"
      @confirm="handleConfirmation"
      @cancel="handleConfirmCancel"
    />
  </div>
</template>

<style scoped>
/* AI Chat Container */
.ai-chat-container {
  height: calc(100vh - 196px);
  max-height: calc(100vh - 196px);
  overflow: hidden;
}

/* Chat item hover effects */
.chat-item {
  position: relative;
  overflow: hidden;
}

.chat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: transparent;
  transition: background-color 0.2s ease-in-out;
}

.chat-item:hover::before {
  background: rgba(59, 130, 246, 0.3);
}

.chat-item.bg-gradient-to-br::before {
  background: #ffffff;
}

/* Custom scrollbar for chat areas */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.8);
}

/* Dark scrollbar for dark sidebar */
.bg-gray-900 .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.bg-gray-900 .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.8);
}

/* Message animations */
.message-enter-active {
  transition: all 0.3s ease-out;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* Typing indicator animation */
@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1.5s infinite;
}

/* Quick action cards hover effect */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Gradient backgrounds */
.bg-gradient-to-r {
  background: linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to));
}

/* Message bubble styles */
.message-bubble {
  position: relative;
  word-wrap: break-word;
  max-width: 100%;
}

.message-bubble::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
}

/* User message bubble tail */
.user-message::before {
  right: -8px;
  top: 12px;
  border-left: 8px solid #3b82f6;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}

/* AI message bubble tail */
.ai-message::before {
  left: -8px;
  top: 12px;
  border-right: 8px solid #f3f4f6;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}

/* Input focus styles */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.3s ease-in-out;
}

/* Button hover effects */
.btn-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  transition: all 0.2s ease-in-out;
}

.btn-gradient:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Mobile sidebar animation */
.mobile-sidebar-enter-active,
.mobile-sidebar-leave-active {
  transition: transform 0.3s ease-out;
}

.mobile-sidebar-enter-from {
  transform: translateX(-100%);
}

.mobile-sidebar-leave-to {
  transform: translateX(-100%);
}

/* Welcome screen animations */
.welcome-card {
  transition: all 0.3s ease-out;
}

.welcome-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Avatar animations */
.avatar-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* Message action buttons */
.message-actions {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

/* Status indicators */
.status-online {
  position: relative;
}

.status-online::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
}

/* Suggestion chips */
.suggestion-chip {
  transition: all 0.2s ease-in-out;
}

.suggestion-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Loading states */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Chat search input */
.search-input {
  background: rgba(31, 41, 55, 0.5);
  backdrop-filter: blur(10px);
}

.search-input:focus {
  background: rgba(31, 41, 55, 0.8);
}

/* Message timestamp */
.message-timestamp {
  font-size: 0.75rem;
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;
}

.message-bubble:hover .message-timestamp {
  opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .ai-chat-container {
    height: calc(100vh - 60px);
  }
}

@media (max-width: 768px) {
  .ai-chat-container {
    height: calc(100vh - 56px);
  }
  
  .chat-messages {
    padding: 1rem 0.75rem;
  }
  
  .message-bubble {
    max-width: 85%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .dark-mode .bg-white {
    background-color: #1f2937;
  }
  
  .dark-mode .text-gray-900 {
    color: #f9fafb;
  }
  
  .dark-mode .border-gray-200 {
    border-color: #374151;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .chat-item:hover {
    background-color: #000;
    color: #fff;
  }
  
  .message-bubble {
    border: 2px solid currentColor;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .chat-sidebar,
  .mobile-sidebar,
  .message-actions,
  button {
    display: none !important;
  }
  
  .chat-messages {
    background: white !important;
    color: black !important;
  }
  
  .message-bubble {
    border: 1px solid #ccc !important;
    background: white !important;
    color: black !important;
  }
}

/* Line clamp fix for compatibility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

/* Utility classes */
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.text-gradient {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Chat input area */
.chat-input-area {
  background: linear-gradient(to top, #ffffff, #f9fafb);
}

/* Message content formatting */
.message-content {
  line-height: 1.5;
}

.message-content strong {
  font-weight: 600;
  color: inherit;
}

.message-content em {
  font-style: italic;
  color: inherit;
}

.message-content ul, .message-content ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.message-content li {
  margin: 0.25rem 0;
}

/* Code formatting in messages */
.message-content code {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875em;
}

.message-content pre {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.message-content pre code {
  background: none;
  padding: 0;
}

/* Quick action grid */
.quick-actions-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

@media (max-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}

/* Chat header gradient */
.chat-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* Sidebar gradient */
.sidebar-dark {
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
}

/* Message time formatting */
.message-time {
  font-size: 0.75rem;
  color: rgba(107, 114, 128, 0.8);
  font-weight: 400;
}

/* Interactive elements */
.interactive:hover {
  transform: scale(1.02);
  transition: transform 0.1s ease-out;
}

.interactive:active {
  transform: scale(0.98);
}

/* Notification badge */
.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.25rem;
  border-radius: 9999px;
  min-width: 1rem;
  text-align: center;
}
</style>