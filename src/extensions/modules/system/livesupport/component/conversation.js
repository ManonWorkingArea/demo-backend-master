import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';

const Request = new requestClient(false);
const configs = storageManager.get('configs');
const session = storageManager.get('session');

// WebSocket connection for real-time chat
let wsConnection = null;
let wsReconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 3000;

// Event listeners for WebSocket events
const wsEventListeners = {
  new_session: [],
  new_message: [],
  status_change: [],
  connected: []
};

/**
 * WebSocket connection management
 */
const connectWebSocket = () => {
  // ป้องกันการสร้าง connection หลายตัว
  if (wsConnection && (wsConnection.readyState === WebSocket.CONNECTING || wsConnection.readyState === WebSocket.OPEN)) {
    console.log('🔌 WebSocket already connecting or connected, skipping...');
    return;
  }
  
  const hostname = getHostname();
  const wsUrl = `wss://ai-gateway.manonsanoi.workers.dev/ws?hostname=${encodeURIComponent(hostname)}`;
  
  console.log('🔌 Connecting to WebSocket:', wsUrl);
  
  try {
    // ปิด connection เดิม (ถ้ามี) ก่อนสร้างใหม่
    if (wsConnection) {
      try {
        wsConnection.close();
      } catch (closeError) {
        console.warn('⚠️ Error closing previous connection:', closeError);
      }
      wsConnection = null;
    }
    
    wsConnection = new WebSocket(wsUrl);
    
    wsConnection.onopen = (event) => {
      console.log('✅ WebSocket connected:', event);
      wsReconnectAttempts = 0;
      
      // Send initial authentication/identification if needed
      const authMessage = {
        type: 'auth',
        hostname: hostname,
        session_id: session?.current?._id || null,
        timestamp: new Date().toISOString()
      };
      
      // Check if connection is still valid before sending
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        try {
          wsConnection.send(JSON.stringify(authMessage));
          console.log('🔐 Auth message sent successfully');
        } catch (sendError) {
          console.error('❌ Failed to send auth message:', sendError);
        }
      } else {
        console.warn('⚠️ WebSocket connection not ready for auth message');
      }
    };
    
    wsConnection.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', notification);
        
        handleWebSocketMessage(notification);
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error, event.data);
      }
    };
    
    wsConnection.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      wsConnection = null;
      
      // Attempt to reconnect if not a manual close
      if (event.code !== 1000 && wsReconnectAttempts < maxReconnectAttempts) {
        wsReconnectAttempts++;
        console.log(`🔄 Attempting to reconnect WebSocket (${wsReconnectAttempts}/${maxReconnectAttempts}) in ${reconnectDelay}ms...`);
        
        setTimeout(() => {
          connectWebSocket();
        }, reconnectDelay);
      }
    };
    
    wsConnection.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      
      // ถ้า connection ยังคงใช้งานไม่ได้ ให้ทำการ cleanup
      if (wsConnection && wsConnection.readyState === WebSocket.CLOSED) {
        wsConnection = null;
      }
    };
    
    // เพิ่ม connection timeout
    const connectionTimeout = setTimeout(() => {
      if (wsConnection && wsConnection.readyState === WebSocket.CONNECTING) {
        console.warn('⚠️ WebSocket connection timeout, closing...');
        wsConnection.close();
        wsConnection = null;
      }
    }, 10000); // 10 วินาที timeout
    
    // Clear timeout เมื่อ connection สำเร็จ
    const originalOnOpen = wsConnection.onopen;
    wsConnection.onopen = (event) => {
      clearTimeout(connectionTimeout);
      if (originalOnOpen) {
        originalOnOpen(event);
      }
    };
    
    // Clear timeout เมื่อ connection ปิด
    const originalOnClose = wsConnection.onclose;
    wsConnection.onclose = (event) => {
      clearTimeout(connectionTimeout);
      if (originalOnClose) {
        originalOnClose(event);
      }
    };
    
  } catch (error) {
    console.error('❌ Failed to create WebSocket connection:', error);
    wsConnection = null;
  }
};

/**
 * Handle incoming WebSocket messages
 */
const handleWebSocketMessage = (notification) => {
  const { action, type } = notification;
  const eventType = action || type;
  
  console.log('📋 Processing WebSocket event:', eventType, notification);
  
  // Handle only new_message and new_session events
  if (eventType === 'new_message') {
    console.log('💬 Processing new_message event');
    handleNewMessage(notification);
    
    // Notify registered listeners for new_message
    if (wsEventListeners['new_message']) {
      wsEventListeners['new_message'].forEach(callback => {
        try {
          callback(notification);
        } catch (error) {
          console.error('❌ Error in WebSocket event listener:', error);
        }
      });
    }
  } else if (eventType === 'new_session') {
    console.log('🆕 Processing new_session event');
    handleNewSession(notification);
    
    // Notify registered listeners for new_session
    if (wsEventListeners['new_session']) {
      wsEventListeners['new_session'].forEach(callback => {
        try {
          callback(notification);
        } catch (error) {
          console.error('❌ Error in WebSocket event listener:', error);
        }
      });
    }
  } else {
    console.log('🚫 Ignoring WebSocket event type:', eventType, '(only processing new_message and new_session)');
  }
};

/**
 * Handle new session creation
 */
const handleNewSession = (notification) => {
  console.log('🆕 New session created:', notification);
  
  const { session_id, timestamp, from_client, user } = notification;
  
  // ตรวจสอบว่า session นี้มาจาก client หรือไม่
  const isFromClient = from_client === true || user !== undefined;
  
  console.log('📋 Session source analysis:', {
    session_id,
    from_client,
    hasUser: !!user,
    isFromClient,
    'Will show notification': isFromClient
  });
  
  // แสดงการแจ้งเตือนเฉพาะ session ที่มาจาก client เท่านั้น
  if (!isFromClient) {
    console.log('🚫 Skipping notification - session not from client');
    return;
  }
  
  // สร้าง unique key เพื่อป้องกันการประมวลผลซ้ำสำหรับ new session
  const sessionKey = `new-session-${session_id}-${timestamp || Date.now()}`;
  
  // ตรวจสอบว่าเคยประมวลผล session นี้แล้วหรือยัง
  if (typeof window !== 'undefined' && window.processedSessions) {
    if (window.processedSessions.has(sessionKey)) {
      console.log('🚫 New session already processed, skipping:', sessionKey);
      return;
    }
    // เพิ่มเข้า set ของ sessions ที่ประมวลผลแล้ว
    window.processedSessions.add(sessionKey);
    
    // ลบ sessions เก่าออกจาก memory (เก็บแค่ 50 รายการล่าสุด)
    if (window.processedSessions.size > 50) {
      const firstKey = window.processedSessions.values().next().value;
      window.processedSessions.delete(firstKey);
    }
  } else if (typeof window !== 'undefined') {
    // สร้าง Set สำหรับเก็บ processed sessions
    window.processedSessions = new Set([sessionKey]);
  }
  
  // แสดงการแจ้งเตือนสำหรับ session ใหม่จาก client
  if (typeof window !== 'undefined' && window.supportComponent) {
    const supportComponent = window.supportComponent;
    
    // แสดงการแจ้งเตือนว่ามี conversation ใหม่จาก client
    const customerName = user?.name || user?.firstname || 'ลูกค้า';
    supportComponent.showToast(`🆕 การสนทนาใหม่จาก ${customerName}`, 'success');
    console.log('📢 Showing notification for new client session');
    
    // แทนที่จะ reload ทั้งหมด ให้เพิ่ม conversation ใหม่เข้าไปแบบ smooth
    supportComponent.addNewConversationSmooth(notification);
  }
};

/**
 * Handle new message in conversation
 */
const handleNewMessage = (notification) => {
  console.log('💬 New message trigger received:', notification);
  
  const { session_id, message_id, timestamp, sender, from_client, message, content, text } = notification;
  
  // ตรวจสอบว่าข้อความมาจาก client หรือไม่ (เพื่อกรองเฉพาะข้อความจาก client)
  const isFromClient = from_client === true || sender === 'user' || sender === 'client';
  
  console.log('📋 Message source analysis:', {
    session_id,
    sender,
    from_client,
    isFromClient,
    hasMessageContent: !!(message || content || text),
    'Will show notification': isFromClient
  });
  
  // แสดงการแจ้งเตือนเฉพาะข้อความที่มาจาก client เท่านั้น
  if (!isFromClient) {
    console.log('🚫 Skipping notification - message not from client:', { sender, from_client });
    return;
  }
  
  // สร้าง unique key เพื่อป้องกันการประมวลผลซ้ำ
  const messageKey = `${session_id}-${message_id || timestamp || Date.now()}`;
  
  // ตรวจสอบว่าเคยประมวลผล message นี้แล้วหรือยัง
  if (typeof window !== 'undefined' && window.processedMessages) {
    if (window.processedMessages.has(messageKey)) {
      console.log('🚫 Message already processed, skipping:', messageKey);
      return;
    }
    // เพิ่มเข้า set ของ messages ที่ประมวลผลแล้ว
    window.processedMessages.add(messageKey);
    
    // ลบ messages เก่าออกจาก memory (เก็บแค่ 100 รายการล่าสุด)
    if (window.processedMessages.size > 100) {
      const firstKey = window.processedMessages.values().next().value;
      window.processedMessages.delete(firstKey);
    }
  } else if (typeof window !== 'undefined') {
    // สร้าง Set สำหรับเก็บ processed messages
    window.processedMessages = new Set([messageKey]);
  }
  
  if (typeof window !== 'undefined' && window.supportComponent) {
    const supportComponent = window.supportComponent;
    
    // เพียงแค่ reload active chat ถ้าเป็น conversation ที่เลือกอยู่
    if (supportComponent.selectedConversation && supportComponent.selectedConversation._id === session_id) {
      console.log('🔄 Reloading active chat for session:', session_id);
      
      // แทนที่จะ reload ทั้งหมด ให้เพิ่มเฉพาะข้อความใหม่แบบ smooth
      supportComponent.addNewMessageSmooth(session_id, notification);
      
      // แสดงการแจ้งเตือนว่ามีข้อความใหม่จาก client (แสดงเสมอ ไม่ต้องรอ document.hidden)
      const senderName = supportComponent.selectedConversation.sender || 'ลูกค้า';
      supportComponent.showToast(`💬 ข้อความใหม่จาก ${senderName}`, 'info');
      console.log('📢 Showing notification for new client message');
    } else {
      // ถ้าไม่ใช่ conversation ที่เลือกอยู่ ให้ update แค่ unread count และ preview
      supportComponent.updateConversationSmart(session_id, notification);
    }
  }
};

/**
 * Handle conversation status change (currently unused - only processing new_message events)
 */
// eslint-disable-next-line no-unused-vars
const handleStatusChange = (notification) => {
  console.log('📊 Status change received:', notification);
  
  const { session_id, status, updated_by } = notification;
  
  if (typeof window !== 'undefined' && window.supportComponent) {
    const supportComponent = window.supportComponent;
    
    // Find the conversation and update its status
    const conversation = supportComponent.conversations.find(conv => conv._id === session_id);
    if (conversation) {
      supportComponent.setConversationStatus(
        conversation,
        status,
        `Status updated remotely by ${updated_by}`,
        updated_by
      );
      
      // Show notification
      supportComponent.showToast(`สถานะการสนทนาถูกเปลี่ยนเป็น ${status}`, 'info');
    }
  }
};

/**
 * Handle connection confirmation (currently unused - only processing new_message events)
 */
// eslint-disable-next-line no-unused-vars
const handleConnectionConfirmation = (notification) => {
  console.log('✅ WebSocket connection confirmed:', notification);
  
  if (typeof window !== 'undefined' && window.supportComponent) {
    window.supportComponent.showToast('เชื่อมต่อ WebSocket สำเร็จ', 'success');
  }
};

/**
 * Disconnect WebSocket and cleanup
 */
const disconnectWebSocket = () => {
  console.log('🔌 Disconnecting WebSocket...');
  
  if (wsConnection) {
    try {
      // ปิด connection แบบ clean
      wsConnection.close(1000, 'Manual disconnect');
    } catch (error) {
      console.warn('⚠️ Error during WebSocket close:', error);
    }
    
    wsConnection = null;
  }
  
  // Reset reconnect attempts
  wsReconnectAttempts = 0;
  
  console.log('✅ WebSocket disconnected and cleaned up');
};

/**
 * Get WebSocket connection status
 */
const getWebSocketStatus = () => {
  if (!wsConnection) return 'disconnected';
  
  switch (wsConnection.readyState) {
    case WebSocket.CONNECTING: return 'connecting';
    case WebSocket.OPEN: return 'connected';
    case WebSocket.CLOSING: return 'closing';
    case WebSocket.CLOSED: return 'disconnected';
    default: return 'unknown';
  }
};

/**
 * Send message through WebSocket
 */
const sendWebSocketMessage = (message) => {
  // ตรวจสอบความถูกต้องของ message
  if (!message || typeof message !== 'object') {
    console.warn('⚠️ Invalid message format:', message);
    return false;
  }
  
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    try {
      wsConnection.send(JSON.stringify(message));
      console.log('📤 WebSocket message sent:', message);
      return true;
    } catch (sendError) {
      console.error('❌ Failed to send WebSocket message:', sendError);
      return false;
    }
  } else {
    const status = getWebSocketStatus();
    console.warn(`⚠️ WebSocket not ready (${status}), cannot send message:`, message);
    
    // ถ้า connection ปิดอยู่ ลองเชื่อมต่อใหม่
    if (status === 'disconnected') {
      console.log('🔄 Attempting to reconnect WebSocket...');
      connectWebSocket();
    }
    
    return false;
  }
};

/**
 * Get comprehensive WebSocket status report
 */
const getWebSocketReport = () => {
  const status = getWebSocketStatus();
  const report = {
    status: status,
    connected: status === 'connected',
    lastError: wsConnection ? null : 'No connection object',
    readyState: wsConnection ? wsConnection.readyState : null,
    url: wsConnection ? wsConnection.url : null,
    protocol: wsConnection ? wsConnection.protocol : null,
    extensions: wsConnection ? wsConnection.extensions : null
  };
  
  console.log('📊 WebSocket Report:', report);
  return report;
};

/**
 * Force reconnect WebSocket with cleanup
 */
const forceReconnectWebSocket = () => {
  console.log('🔄 Force reconnecting WebSocket...');
  
  // Disconnect existing connection
  disconnectWebSocket();
  
  // ล้าง processed messages และ sessions เพื่อป้องกันปัญหาเมื่อ reconnect
  if (typeof window !== 'undefined') {
    if (window.processedMessages) {
      window.processedMessages.clear();
      console.log('🧹 Cleared processed messages cache');
    }
    if (window.processedSessions) {
      window.processedSessions.clear();
      console.log('🧹 Cleared processed sessions cache');
    }
  }
  
  // Reconnect after a short delay
  setTimeout(() => {
    connectWebSocket();
  }, 1000);
};

/**
 * Clear processed message and session caches
 */
const clearProcessedCache = () => {
  if (typeof window !== 'undefined') {
    if (window.processedMessages) {
      window.processedMessages.clear();
      console.log('🧹 Cleared processed messages cache');
    }
    if (window.processedSessions) {
      window.processedSessions.clear();
      console.log('🧹 Cleared processed sessions cache');
    }
  }
};
const onWebSocketEvent = (eventType, callback) => {
  if (!wsEventListeners[eventType]) {
    wsEventListeners[eventType] = [];
  }
  wsEventListeners[eventType].push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = wsEventListeners[eventType].indexOf(callback);
    if (index > -1) {
      wsEventListeners[eventType].splice(index, 1);
    }
  };
};

// Fetch full message history for a specific conversation
const fetchConversationHistory = async (sessionId) => {
  try {
    console.log('🔍 fetchConversationHistory called with sessionId:', sessionId);
    
    if (!sessionId) {
      console.error('❌ sessionId is null/undefined in fetchConversationHistory');
      throw new Error('Session ID is required');
    }
    
    const hostname = getHostname();
    
    const aiGatewayUrl = `https://ai-gateway.manonsanoi.workers.dev/conversation/history?session_id=${sessionId}`;
    
    console.log('Fetching conversation history from AI Gateway:', {
      url: aiGatewayUrl,
      sessionId: sessionId,
      hostname: hostname
    });
    
    const response = await fetch(aiGatewayUrl, {
      method: 'GET',
      headers: {
        'X-Hostname': hostname,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`AI Gateway history request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('AI Gateway history response:', data);
    
    // แปลงข้อมูล messages จาก AI Gateway format เป็น Support component format
    if (data.success && data.messages && Array.isArray(data.messages)) {
      const convertedMessages = data.messages.map((msg, index) => {
        // Debug log เพื่อดูข้อมูลดิบ
        console.log(`Message ${index + 1}:`, {
          original_role: msg.role,
          content: msg.content,
          will_be_sender: msg.role === 'user' ? 'customer' : 'agent'
        });
        
        return {
          _id: msg.id || `msg-${sessionId}-${index}`,
          text: msg.content || msg.text,
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: msg.role === 'user' ? 'customer' : 'agent',
          read: true
        };
      });
      
      // ตรวจสอบ control_status เพื่อกำหนด mode
      let conversationMode = 'bot'; // default เป็น AI mode
      if (data.control_status && data.control_status.mode) {
        // แปลง AI Gateway mode เป็น Support component mode
        conversationMode = data.control_status.mode === 'admin' ? 'agent' : 'bot';
        console.log('Control status found:', {
          gateway_mode: data.control_status.mode,
          support_mode: conversationMode,
          last_updated: data.control_status.last_updated,
          note: data.control_status.note
        });
      }
      
      console.log(`Successfully fetched ${convertedMessages.length} messages for session ${sessionId}`);
      console.log('Final converted messages:', convertedMessages);
      
      // Return both messages and mode information
      return {
        messages: convertedMessages,
        mode: conversationMode,
        controlStatus: data.control_status || null
      };
    }
    
    // ถ้าไม่มีข้อมูลหรือ format ไม่ถูกต้อง
    console.warn('No messages found or invalid format for session:', sessionId);
    return [];
    
  } catch (error) {
    console.error('Error fetching conversation history from AI Gateway:', error);
    
    // Fallback ไปใช้วิธีเดิมหากมี
    try {
      console.log('Attempting fallback method for conversation history...');
      // ใส่ fallback logic ที่นี่หากมี
      return [];
    } catch (fallbackError) {
      console.error('Fallback method for history also failed:', fallbackError);
      return [];
    }
  }
};

/**
 * Get hostname from configuration or fallback
 */
const getHostname = () => {
  let hostname = 'myapp.example.com'; // default value
  
  console.log('🔍 getHostname() called, checking sources:', {
    'session?.hostname': session?.hostname,
    'session?.current?.hostname': session?.current?.hostname,
    'configs?.hostname': configs?.hostname,
    'configs?.host?.hostname': configs?.host?.hostname,
    'window.location.hostname': typeof window !== 'undefined' ? window.location?.hostname : 'undefined'
  });
  
  if (session?.hostname) {
    hostname = session.hostname;
    console.log('✅ Using session.hostname:', hostname);
  } else if (session?.current?.hostname) {
    hostname = session.current.hostname;
    console.log('✅ Using session.current.hostname:', hostname);
  } else if (configs?.hostname) {
    hostname = configs.hostname;
    console.log('✅ Using configs.hostname:', hostname);
  } else if (configs?.host?.hostname) {
    hostname = configs.host.hostname;
    console.log('✅ Using configs.host.hostname:', hostname);
  } else if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost') {
    hostname = window.location.hostname;
    console.log('✅ Using window.location.hostname:', hostname);
  } else {
    console.log('⚠️ Using default hostname:', hostname);
  }
  
  return hostname;
};

// Fetch a list of all conversations
const fetchConversations = async (limit = 20) => {
  try {
    const hostname = getHostname();
    
    const aiGatewayUrl = `https://ai-gateway.manonsanoi.workers.dev/conversations/all?limit=${limit}`;
    
    console.log('Fetching conversations from AI Gateway:', {
      url: aiGatewayUrl,
      hostname: hostname,
      limit: limit
    });
    
    const response = await fetch(aiGatewayUrl, {
      method: 'GET',
      headers: {
        'X-Hostname': hostname,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    console.log('📨 AI Gateway response status:', response.status, response.statusText);
    console.log('📨 AI Gateway response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI Gateway error response:', errorText);
      throw new Error(`AI Gateway request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 AI Gateway response data:', data);
    console.log('📦 Data type and structure:', {
      type: typeof data,
      isArray: Array.isArray(data),
      hasSuccess: 'success' in data,
      hasConversations: 'conversations' in data,
      hasData: 'data' in data,
      keys: Object.keys(data)
    });
    
    // ตรวจสอบว่า API ส่งกลับข้อมูลในรูปแบบที่คาดหวัง
    if (data.success && data.conversations && Array.isArray(data.conversations)) {
      console.log(`Successfully fetched ${data.conversations.length} conversations from AI Gateway`);
      // Return the raw conversations data so Support.vue can do the mapping with user info
      return {
        success: true,
        data: data.conversations
      };
    }
    
    // ถ้า API ส่งกลับ array ของ conversations โดยตรง
    if (Array.isArray(data)) {
      return {
        success: true,
        data: data
      };
    }
    
    // ถ้า API ส่งกลับ object ที่มี data property
    if (data.data && Array.isArray(data.data)) {
      return {
        success: true,
        data: data.data
      };
    }
    
    // กรณีอื่นๆ ให้ fallback ไปใช้วิธีเดิม
    console.warn('AI Gateway returned unexpected format, falling back to original method');
    const fallbackResponse = await Request.POST('conversation/query', { method: 'find', args: [{ $and: [{ unit: session.current._id }] }] }, configs.key);
    if (fallbackResponse.status === 200) {
      return {
        success: true,
        data: fallbackResponse.data
      };
    }
    throw new Error('Failed to fetch conversations from both AI Gateway and fallback method');
    
  } catch (error) {
    console.error('❌ Error fetching conversations from AI Gateway:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      response: error.response,
      status: error.status,
      url: `https://ai-gateway.manonsanoi.workers.dev/conversations/all?limit=${limit}`
    });
    
    // Fallback ไปใช้วิธีเดิม
    try {
      console.log('🔄 Attempting fallback method...');
      
      // ตรวจสอบว่ามี session และ configs หรือไม่
      if (!session || !session.current || !session.current._id) {
        console.error('❌ Session data is missing:', { session });
        throw new Error('Session data is missing - cannot proceed with fallback');
      }
      
      if (!configs || !configs.key) {
        console.error('❌ Config data is missing:', { configs });
        throw new Error('Config data is missing - cannot proceed with fallback');
      }
      
      const fallbackResponse = await Request.POST('conversation/query', { 
        method: 'find', 
        args: [{ $and: [{ unit: session.current._id }] }] 
      }, configs.key);
      
      console.log('Fallback response:', fallbackResponse);
      
      if (fallbackResponse.status === 200) {
        console.log('✅ Fallback method succeeded');
        return {
          success: true,
          data: fallbackResponse.data
        };
      }
      
      throw new Error(`Fallback method failed with status: ${fallbackResponse.status}`);
      
    } catch (fallbackError) {
      console.error('❌ Fallback method failed:', fallbackError);
      console.error('❌ Fallback error details:', {
        message: fallbackError.message,
        stack: fallbackError.stack,
        name: fallbackError.name
      });
      
      throw new Error(`Failed to fetch conversations: AI Gateway error - ${error.message}, Fallback error - ${fallbackError.message}`);
    }
  }
};

// Fetch a single conversation by ID
const fetchConversationById = async (conversationId) => {
  const response = await Request.GET(`conversation/${conversationId}`, configs.key);
  if (response.status === 200) return response.data;
  throw new Error(`Failed to fetch conversation with ID ${conversationId}`);
};

// Create a new conversation
const createConversation = async (conversationData) => {
  const response = await Request.POST('conversation', { data: { ...conversationData, unit: session.current._id } }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error('Failed to create conversation');
};

// Update an existing conversation by ID
const updateConversation = async (conversationId, updatedData) => {
  // Ensure _id is not included in the updated data
  if (updatedData._id) {
    delete updatedData._id;
  }
  const response = await Request.PUT(`conversation/${conversationId}`, { data: updatedData }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error(`Failed to update conversation with ID ${conversationId}`);
};

// Update the sender and preview data in a conversation by ID
const updateSenderInConversation = async (conversationId, newSenderName, newPreview) => {
  try {
    // Fetch the conversation by ID
    const conversation = await fetchConversationById(conversationId);
    
    if (conversation) {
      // Update the sender in the conversation itself
      conversation.sender = newSenderName;

      // Optionally update the preview if provided
      if (newPreview) {
        conversation.preview = newPreview;
      }

      // Update the conversation in the database
      const response = await updateConversation(conversationId, {
        sender: conversation.sender,
        preview: conversation.preview,
        updatedAt: new Date(), // Update the timestamp
      });
      return response;
    } else {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }
  } catch (error) {
    console.error('Error updating sender in conversation:', error.message);
    throw error;
  }
};

// Send admin reply message to AI Gateway
const sendAdminReply = async (sessionId, message) => {
  try {
    const hostname = getHostname();
    
    // ตรวจสอบข้อมูลที่ส่งมา
    if (!sessionId || !message || !message.trim()) {
      throw new Error('Session ID and message are required');
    }
    
    const aiGatewayUrl = 'https://ai-gateway.manonsanoi.workers.dev/admin/reply';
    
    const requestBody = {
      session_id: sessionId,
      message: message.trim()
    };
    
    console.log('Sending admin reply to AI Gateway:', {
      url: aiGatewayUrl,
      hostname: hostname,
      requestBody: requestBody
    });
    
    const response = await fetch(aiGatewayUrl, {
      method: 'POST',
      headers: {
        'X-Hostname': hostname,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`AI Gateway admin reply failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('AI Gateway admin reply response:', data);
    
    // ตรวจสอบผลการตอบกลับ
    if (data.success) {
      console.log(`Successfully sent admin reply for session ${sessionId}`);
      return {
        success: true,
        sessionId: sessionId,
        message: message,
        messageId: data.message_id || null,
        timestamp: data.timestamp || new Date().toISOString(),
        data: data
      };
    } else {
      throw new Error(data.message || 'Failed to send admin reply');
    }
    
  } catch (error) {
    console.error('Error sending admin reply:', error);
    throw new Error(`Failed to send admin reply: ${error.message}`);
  }
};

// Switch conversation mode between AI and Admin
const switchConversationMode = async (sessionId, mode) => {
  try {
    const hostname = getHostname();
    
    // ตรวจสอบ mode ที่ส่งมา
    if (!['ai', 'admin'].includes(mode)) {
      throw new Error('Invalid mode. Must be either "ai" or "admin"');
    }
    
    const aiGatewayUrl = `https://ai-gateway.manonsanoi.workers.dev/admin/control?session_id=${sessionId}&mode=${mode}`;
    
    console.log('Switching conversation mode:', {
      url: aiGatewayUrl,
      sessionId: sessionId,
      mode: mode,
      hostname: hostname
    });
    
    const response = await fetch(aiGatewayUrl, {
      method: 'POST',
      headers: {
        'X-Hostname': hostname,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`AI Gateway mode switch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('AI Gateway mode switch response:', data);
    
    // ตรวจสอบผลการตอบกลับ
    if (data.success) {
      console.log(`Successfully switched session ${sessionId} to ${mode} mode`);
      return {
        success: true,
        sessionId: sessionId,
        mode: mode,
        message: data.message || `Mode switched to ${mode}`,
        data: data
      };
    } else {
      throw new Error(data.message || 'Failed to switch mode');
    }
    
  } catch (error) {
    console.error('Error switching conversation mode:', error);
    throw new Error(`Failed to switch conversation mode: ${error.message}`);
  }
};

// Delete a conversation by ID
const deleteConversation = async (conversationId) => {
  const response = await Request.DELETE(`conversation/${conversationId}`, '', configs.key);
  if (response.status === 200) return response.data;
  throw new Error(`Failed to delete conversation with ID ${conversationId}`);
};

// Conversation Status Management Functions

/**
 * อัปเดตสถานะการสนทนาเป็น "solved" (แก้ไขแล้ว)
 */
const markConversationSolved = async (sessionId, adminId, notes = '', priority = 'normal', tags = []) => {
  try {
    const timestamp = Date.now();
    const conversation_status = {
      status: 'solved',
      updated_at: timestamp,
      updated_by: adminId,
      notes: notes || 'Conversation marked as solved',
      priority: priority,
      tags: Array.isArray(tags) ? tags : [],
      status_time_ago: 'just now'
    };

    const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/admin/status/solved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hostname': getHostname()
      },
      body: JSON.stringify({
        session_id: sessionId,
        admin_id: adminId,
        conversation_status: conversation_status,
        // Legacy fields for backward compatibility
        notes: notes,
        timestamp: new Date().toISOString(),
        status: 'solved'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Conversation marked as solved:', result);
    return result;
  } catch (error) {
    console.error('Error marking conversation as solved:', error);
    throw error;
  }
};

/**
 * อัปเดตสถานะการสนทนาเป็น "pending" (รอดำเนินการ)
 */
const markConversationPending = async (sessionId, adminId, notes = '', priority = 'normal', tags = []) => {
  try {
    const timestamp = Date.now();
    const conversation_status = {
      status: 'pending',
      updated_at: timestamp,
      updated_by: adminId,
      notes: notes || 'Conversation marked as pending',
      priority: priority,
      tags: Array.isArray(tags) ? tags : [],
      status_time_ago: 'just now'
    };

    const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/admin/status/pending', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hostname': getHostname()
      },
      body: JSON.stringify({
        session_id: sessionId,
        admin_id: adminId,
        conversation_status: conversation_status,
        // Legacy fields for backward compatibility
        notes: notes,
        priority: priority,
        timestamp: new Date().toISOString(),
        status: 'pending'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Conversation marked as pending:', result);
    return result;
  } catch (error) {
    console.error('Error marking conversation as pending:', error);
    throw error;
  }
};

/**
 * โอนการสนทนาไปยังทีมอื่น
 */
const transferConversation = async (sessionId, adminId, assignedTo, notes = '', priority = 'normal', tags = []) => {
  try {
    const timestamp = Date.now();
    const conversation_status = {
      status: 'transferred',
      updated_at: timestamp,
      updated_by: adminId,
      notes: notes || `Conversation transferred to ${assignedTo}`,
      priority: priority,
      tags: Array.isArray(tags) ? tags : [],
      status_time_ago: 'just now'
    };

    const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/admin/status/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hostname': getHostname()
      },
      body: JSON.stringify({
        session_id: sessionId,
        admin_id: adminId,
        assigned_to: assignedTo,
        conversation_status: conversation_status,
        // Legacy fields for backward compatibility
        notes: notes,
        timestamp: new Date().toISOString(),
        status: 'transferred'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Conversation transferred:', result);
    return result;
  } catch (error) {
    console.error('Error transferring conversation:', error);
    throw error;
  }
};

/**
 * อัปเดตสถานะการสนทนาเป็น "unread" (ยังไม่อ่าน)
 */
const markConversationUnread = async (sessionId, adminId, notes = '', priority = 'normal', tags = []) => {
  try {
    const timestamp = Date.now();
    const conversation_status = {
      status: 'unread',
      updated_at: timestamp,
      updated_by: adminId,
      notes: notes || 'Conversation marked as unread',
      priority: priority,
      tags: Array.isArray(tags) ? tags : [],
      status_time_ago: 'just now'
    };

    const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/admin/status/unread', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hostname': getHostname()
      },
      body: JSON.stringify({
        session_id: sessionId,
        admin_id: adminId,
        conversation_status: conversation_status,
        // Legacy fields for backward compatibility
        notes: notes,
        timestamp: new Date().toISOString(),
        status: 'unread'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Conversation marked as unread:', result);
    return result;
  } catch (error) {
    console.error('Error marking conversation as unread:', error);
    throw error;
  }
};

/**
 * อัปเดตสถานะการสนทนาเป็น "read" (อ่านแล้ว)
 */
const markConversationRead = async (sessionId, adminId, notes = '', priority = 'normal', tags = []) => {
  try {
    const timestamp = Date.now();
    const conversation_status = {
      status: 'read',
      updated_at: timestamp,
      updated_by: adminId,
      notes: notes || 'Conversation marked as read',
      priority: priority,
      tags: Array.isArray(tags) ? tags : [],
      status_time_ago: 'just now'
    };

    const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/admin/status/read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hostname': getHostname()
      },
      body: JSON.stringify({
        session_id: sessionId,
        admin_id: adminId,
        conversation_status: conversation_status,
        // Legacy fields for backward compatibility
        notes: notes,
        timestamp: new Date().toISOString(),
        status: 'read'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Conversation marked as read:', result);
    return result;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

/**
 * อัปเดตสถานะการสนทนาเป็น "in-progress" (กำลังดำเนินการ)
 */
const markConversationInProgress = async (sessionId, adminId, notes = '', priority = 'normal', tags = []) => {
  try {
    const timestamp = Date.now();
    const conversation_status = {
      status: 'in-progress',
      updated_at: timestamp,
      updated_by: adminId,
      notes: notes || 'Conversation marked as in progress',
      priority: priority,
      tags: Array.isArray(tags) ? tags : [],
      status_time_ago: 'just now'
    };

    const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/admin/status/in-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hostname': getHostname()
      },
      body: JSON.stringify({
        session_id: sessionId,
        admin_id: adminId,
        conversation_status: conversation_status,
        // Legacy fields for backward compatibility
        notes: notes,
        timestamp: new Date().toISOString(),
        status: 'in-progress'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Conversation marked as in progress:', result);
    return result;
  } catch (error) {
    console.error('Error marking conversation as in progress:', error);
    throw error;
  }
};

/**
 * อัปเดตสถานะการสนทนาเป็น "archived" (เก็บถาวร)
 */
const markConversationArchived = async (sessionId, adminId, notes = '', priority = 'normal', tags = []) => {
  try {
    const timestamp = Date.now();
    const conversation_status = {
      status: 'archived',
      updated_at: timestamp,
      updated_by: adminId,
      notes: notes || 'Conversation marked as archived',
      priority: priority,
      tags: Array.isArray(tags) ? tags : [],
      status_time_ago: 'just now'
    };

    const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/admin/status/archived', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hostname': getHostname()
      },
      body: JSON.stringify({
        session_id: sessionId,
        admin_id: adminId,
        conversation_status: conversation_status,
        // Legacy fields for backward compatibility
        notes: notes,
        timestamp: new Date().toISOString(),
        status: 'archived'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Conversation marked as archived:', result);
    return result;
  } catch (error) {
    console.error('Error marking conversation as archived:', error);
    throw error;
  }
};

/**
 * ดึงประวัติการเปลี่ยนแปลงสถานะ
 */
const getConversationStatusHistory = async (sessionId) => {
  try {
    const response = await fetch(`https://ai-gateway.manonsanoi.workers.dev/admin/status/history/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Hostname': getHostname()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Status history retrieved:', result);
    return result;
  } catch (error) {
    console.error('Error getting status history:', error);
    throw error;
  }
};

/**
 * อัปเดตสถานะการสนทนาแบบทั่วไป
 */
const updateConversationStatus = async (sessionId, status, data = {}) => {
  const statusMap = {
    'unread': () => markConversationUnread(sessionId, data.adminId, data.notes, data.priority, data.tags),
    'read': () => markConversationRead(sessionId, data.adminId, data.notes, data.priority, data.tags),
    'in-progress': () => markConversationInProgress(sessionId, data.adminId, data.notes, data.priority, data.tags),
    'solved': () => markConversationSolved(sessionId, data.adminId, data.notes, data.priority, data.tags),
    'pending': () => markConversationPending(sessionId, data.adminId, data.notes, data.priority, data.tags),
    'transferred': () => transferConversation(sessionId, data.adminId, data.assignedTo, data.notes, data.priority, data.tags),
    'archived': () => markConversationArchived(sessionId, data.adminId, data.notes, data.priority, data.tags),
  };

  if (!statusMap[status]) {
    throw new Error(`Unknown status: ${status}`);
  }

  return await statusMap[status]();
};

export {
  fetchConversations,
  fetchConversationHistory,
  fetchConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  updateSenderInConversation,
  switchConversationMode,
  sendAdminReply,
  // Status management functions
  markConversationUnread,
  markConversationRead,
  markConversationInProgress,
  markConversationSolved,
  markConversationPending,
  transferConversation,
  markConversationArchived,
  getConversationStatusHistory,
  updateConversationStatus,
  // Helper functions
  getHostname,
  clearProcessedCache,
  // WebSocket functions
  connectWebSocket,
  disconnectWebSocket,
  sendWebSocketMessage,
  onWebSocketEvent,
  getWebSocketStatus,
  getWebSocketReport,
  forceReconnectWebSocket
};
