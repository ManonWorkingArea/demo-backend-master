<script>
import Loader from '@/interface/template/Loader.vue';
import NotificationPanel from './NotificationPanel.vue';
import ConnectionGatewayService from './ConnectionGatewayService.js';
import NotificationService from './NotificationService.js';

export default {
    name: 'ClientTestPanel',
    data() {
        return {
            PageName: 'Client Test Panel',
            PageIcon: 'desktop',
            loading_sources: false,
            
            // Service instance
            gatewayService: ConnectionGatewayService,
            notificationService: NotificationService,
            
            // Reactive notifications for auto-remove
            reactiveNotifications: [],
            
            // Client Configuration
            clientConfig: {
                tenantId: '',
                clientId: '',  // จะถูกสร้างใน mounted()
                subdomain: '',
                autoReconnect: true
            },
            
            // Connection Status
            connectionStatus: 'disconnected',
            lastConnected: null,
            connectionAttempts: 0,
            useRealConnection: false, // Toggle between simulation and real connection
            
            // Persistence & Heartbeat
            shouldAutoReconnect: false,
            heartbeatInterval: null,
            connectionPersistKey: 'client-connection-state',
            
            // WebSocket Connection
            webSocketConnection: null,
            
            // Received Commands
            receivedCommands: [],
            recentCommandKeys: new Set(), // ป้องกัน command ซ้ำ
            commandDuplicateWindow: 1000, // ลดเหลือ 1 วินาที
            
            // Test Commands for Manual Testing
            testCommands: [],
            
            // Client Logs
            clientLogs: [],
            
            // Performance Metrics
            metrics: {
                messagesReceived: 0,
                averageLatency: 0,
                reconnectCount: 0,
                uptime: 0
            },
            
            // UI State
            showCommandDetail: null,
            selectedTenant: '',
            autoScroll: true,
            
            // Available Tenants for Testing
            availableTenants: [],
            
            // Health Monitoring (Client-side)
            clientHealthMonitoring: {
                enabled: true,
                lastHealthCheck: null,
                healthStatus: 'unknown',
                healthData: {
                    clientId: '',
                    tenantId: '',
                    connectionHealth: {
                        status: 'disconnected',
                        uptime: 0,
                        stability: 0,
                        latency: 0
                    },
                    performanceMetrics: {
                        messagesReceived: 0,
                        messagesSent: 0,
                        errorCount: 0,
                        errorRate: 0
                    },
                    resourceUsage: {
                        memoryUsage: 0,
                        cpuUsage: 0
                    }
                },
                issues: []
            }
        }
    },
    components: {
        Loader,
        NotificationPanel
    },
    methods: {
        // Connection Management
        async connectToGateway() {
            if (this.connectionStatus === 'connected') {
                this.addLog('warning', 'Already connected to gateway');
                return;
            }
            
            if (!this.selectedTenant) {
                this.addLog('error', 'Please select a tenant first');
                alert('กรุณาเลือก Tenant ก่อนเชื่อมต่อ');
                return;
            }
            
            try {
                this.connectionStatus = 'connecting';
                this.connectionAttempts++;
                
                // Update client config with selected tenant
                this.updateClientConfigForTenant();
                
                // Use service to register client
                const clientData = {
                    clientId: this.clientConfig.clientId,
                    tenantId: this.selectedTenant,
                    subdomain: this.clientConfig.subdomain,
                    wsUrl: this.gatewayService.generateWebSocketUrl(this.clientConfig.subdomain),
                    isConnecting: true,
                    timestamp: new Date(),
                    userAgent: navigator.userAgent,
                    ipAddress: 'simulated-ip'
                };
                
                // Connect to real WebSocket
                await this.connectToWebSocket();
                
                // Register with service
                this.gatewayService.registerClient(clientData);
                
                this.connectionStatus = 'connected';
                this.lastConnected = new Date();
                this.shouldAutoReconnect = true;
                this.addLog('success', `Connected to gateway as ${this.clientConfig.clientId} on tenant ${this.selectedTenant}`);
                
                // Notify Gateway about connection - ส่งหลังจากเชื่อมต่อสำเร็จ
                this.notifyGatewayConnection(true);
                
                // Start heartbeat
                this.startHeartbeat();
                
                // Save connection state
                this.saveConnectionState();
                
                this.startUptimeCounter();
                
                // Update client health data after successful connection
                this.updateClientHealthData();
                
            } catch (error) {
                this.connectionStatus = 'error';
                this.addLog('error', `Connection failed: ${error.message}`);
                
                // Update health data on error
                this.updateClientHealthData();
            }
        },
        
        async connectToWebSocket() {
            // ใช้ service เพื่อสร้าง WebSocket URL ที่ถูกต้อง
            const wsUrl = this.gatewayService.generateWebSocketUrl(this.selectedTenant);
            
            this.addLog('info', `Connecting to: ${wsUrl}`);
            
            try {
                // Real WebSocket connection
                const ws = new WebSocket(wsUrl);
                
                return new Promise((resolve, reject) => {
                    ws.onopen = () => {
                        this.addLog('success', 'WebSocket connection established');
                        resolve();
                    };
                    
                    ws.onmessage = (event) => {
                        try {
                            const command = JSON.parse(event.data);
                            // เพิ่ม source เพื่อระบุว่ามาจาก WebSocket
                            const commandWithSource = {
                                ...command,
                                source: 'websocket',
                                timestamp: command.timestamp || Date.now()
                            };
                            this.receiveCommand(commandWithSource);
                        } catch (error) {
                            this.addLog('error', `Failed to parse WebSocket message: ${error.message}`);
                        }
                    };
                    
                    ws.onclose = () => {
                        this.addLog('info', 'WebSocket connection closed');
                        this.connectionStatus = 'disconnected';
                    };
                    
                    ws.onerror = () => {
                        this.addLog('error', 'WebSocket connection error');
                        reject(new Error('WebSocket connection failed'));
                    };
                    
                    // Store websocket instance
                    this.webSocketConnection = ws;
                    
                    // Timeout after 10 seconds
                    setTimeout(() => {
                        if (ws.readyState !== WebSocket.OPEN) {
                            ws.close();
                            reject(new Error('Connection timeout'));
                        }
                    }, 10000);
                });
            } catch (error) {
                this.addLog('error', `Failed to create WebSocket: ${error.message}`);
                throw error;
            }
        },
        
        disconnect() {
            if (this.connectionStatus !== 'connected') return;
            
            // Notify Gateway about disconnection first
            this.notifyGatewayConnection(false);
            
            // Unregister from service
            this.gatewayService.unregisterClient(this.clientConfig.clientId, this.selectedTenant);
            
            this.connectionStatus = 'disconnected';
            this.shouldAutoReconnect = false;
            
            // Close WebSocket connection
            if (this.webSocketConnection) {
                this.webSocketConnection.close();
                this.webSocketConnection = null;
            }
            
            // Clear heartbeat
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
            
            this.addLog('info', 'Disconnected from gateway');
            
            // Save disconnected state
            this.saveConnectionState();
            
            // Update health data after disconnection
            this.updateClientHealthData();
        },
        
        // Command Handling
        receiveCommand(command) {
            // สร้าง unique key สำหรับ command
            const commandKey = this.generateCommandKey(command);
            
            // ตรวจสอบว่าเป็น command ซ้ำหรือไม่
            if (this.recentCommandKeys.has(commandKey)) {
                console.log(`🚫 Duplicate command prevented: ${commandKey} (source: ${command.source || 'unknown'})`);
                // ยังแสดง notification แต่ไม่เพิ่มเข้า receivedCommands
                // this.notificationManager.createNotification(command); // ปิดเพื่อไม่ให้ notification ซ้ำ
                return;
            }
            
            // เพิ่ม command key เข้า Set
            this.recentCommandKeys.add(commandKey);
            setTimeout(() => {
                this.recentCommandKeys.delete(commandKey);
            }, this.commandDuplicateWindow);
            
            // เพิ่มเข้า receivedCommands เฉพาะ command ที่ไม่ซ้ำ
            this.receivedCommands.unshift(command);
            this.metrics.messagesReceived++;
            
            // Update average latency
            this.updateLatencyMetrics(command.latency || 0);
            
            this.addLog('command', `Received ${command.type} from ${command.source || 'unknown'}: ${JSON.stringify(command.payload)}`);
            
            // Create notification using NotificationService (ป้องกันการแจ้งเตือนซ้ำ)
            this.notificationService.createNotification(command);
            
            // Sync reactive notifications
            this.syncReactiveNotifications();
            
            // Execute command based on type (ไม่สร้าง notification ซ้ำ)
            this.executeCommand(command);
            
            // Notify test page about message received
            const event = new CustomEvent('client-message-received', {
                detail: command
            });
            window.dispatchEvent(event);
            
            // Keep only last 50 commands
            if (this.receivedCommands.length > 50) {
                this.receivedCommands = this.receivedCommands.slice(0, 50);
            }
        },
        
        executeCommand(command) {
            switch (command.type) {
                case 'notification':
                    // NotificationManager จัดการแล้ว ไม่ต้องทำซ้ำ
                    this.addLog('notification', `📢 Notification handled by NotificationManager`);
                    break;
                case 'quiz':
                    this.handleQuiz(command.payload);
                    break;
                case 'assignment':
                    this.handleAssignment(command.payload);
                    break;
                case 'message':
                    this.handleMessage(command.payload);
                    break;
                case 'update':
                    this.handleUpdate(command.payload);
                    break;
                case 'test':
                    this.handleTest(command.payload);
                    break;
                default:
                    this.addLog('info', `📦 Command received: ${command.type} - ${JSON.stringify(command.payload).substring(0, 100)}...`);
                    // แสดงข้อมูลทั่วไปแทนการแสดง warning
                    this.handleGenericCommand(command);
            }
        },
        
        showNotification(payload) {
            // ฟังก์ชันนี้ถูกแทนที่ด้วย NotificationService แล้ว
            // เก็บไว้เผื่อใช้สำหรับการแจ้งเตือนพิเศษที่ไม่ใช่ command
            this.addLog('notification', `📢 ${payload.title || 'Notification'}: ${payload.message || 'No message'}`);
            console.warn('showNotification() is deprecated. Use NotificationService.createNotification() instead.');
        },
        
        handleQuiz(payload) {
            this.addLog('quiz', `📝 New Quiz: ${payload.title} (${payload.questions} questions, ${payload.timeLimit} minutes)`);
        },
        
        handleAssignment(payload) {
            this.addLog('assignment', `📋 Assignment: ${payload.title} (Due: ${payload.dueDate})`);
        },
        
        handleMessage(payload) {
            const urgentFlag = payload.urgent ? '🚨 URGENT: ' : '';
            this.addLog('message', `💬 ${urgentFlag}From ${payload.from}: ${payload.message}`);
        },
        
        handleUpdate(payload) {
            this.addLog('update', `🔄 Update ${payload.component}: ${payload.action}`);
        },
        
        handleTest(payload) {
            this.addLog('test', `🧪 Test command: ${payload.message || JSON.stringify(payload)}`);
        },
        
        handleGenericCommand(command) {
            // จัดการคำสั่งทั่วไปที่ไม่มี handler เฉพาะ
            const { type, payload } = command;
            
            // แสดงข้อมูลหลักของคำสั่ง
            let message = '';
            if (payload.message) {
                message = payload.message;
            } else if (payload.title) {
                message = payload.title;
            } else if (payload.action) {
                message = payload.action;
            } else {
                message = 'Command received';
            }
            
            // แสดงข้อมูลเพิ่มเติมตามประเภท
            let details = '';
            if (payload.title && payload.message && payload.title !== payload.message) {
                details = ` (${payload.title})`;
            }
            if (payload.urgent) {
                details += ' 🚨 URGENT';
            }
            if (payload.priority && payload.priority !== 'normal') {
                details += ` [${payload.priority.toUpperCase()}]`;
            }
            
            this.addLog('command', `📨 ${type.toUpperCase()}: ${message}${details}`);
            
            // อัปเดตสถิติ
            this.updateClientHealthData();
        },
        
        // Handle commands from Gateway
        handleGatewayCommand(event) {
            const command = event.detail;
            if (this.connectionStatus === 'connected') {
                // เพิ่ม source เพื่อระบุว่ามาจาก Gateway event
                const commandWithSource = {
                    ...command,
                    source: 'gateway-event',
                    timestamp: command.timestamp || Date.now()
                };
                this.receiveCommand(commandWithSource);
            }
        },
        
        // Handle specific commands targeted to this client
        handleSpecificCommand(event) {
            const command = event.detail;
            
            // Check if this command is targeted to this specific client
            if (command.targetClientId === this.clientConfig.clientId && 
                command.targetTenantId === this.selectedTenant && 
                this.connectionStatus === 'connected') {
                
                this.addLog('info', `📨 Received DIRECT command: ${command.type}`);
                const commandWithSource = {
                    ...command,
                    isDirect: true,
                    directMessage: true,
                    source: 'specific-event',
                    timestamp: command.timestamp || Date.now()
                };
                this.receiveCommand(commandWithSource);
            }
        },
        
        // Handle forced disconnection from Gateway
        handleForceDisconnect(event) {
            const disconnectData = event.detail;
            if (disconnectData.clientId === this.clientConfig.clientId && 
                disconnectData.tenantId === this.selectedTenant) {
                this.addLog('warning', `Force disconnected by admin: ${disconnectData.reason}`);
                this.disconnect();
            }
        },
        
        // Handle refresh request from Gateway
        handleRefreshRequest() {
            if (this.connectionStatus === 'connected') {
                // Send heartbeat immediately to refresh Gateway's client list
                this.sendHeartbeat();
                this.addLog('info', '📡 Responded to Gateway refresh request');
            }
        },
        
        // Handle tenant list updates from Gateway
        handleTenantListUpdate(event) {
            const updateData = event.detail;
            this.addLog('info', `📢 Tenant list update: ${updateData.action}`);
            
            switch (updateData.action) {
                case 'create':
                    this.handleTenantCreated(updateData.data.tenant);
                    break;
                case 'update':
                    this.handleTenantUpdated(updateData.data.tenant);
                    break;
                case 'delete':
                    this.handleTenantDeleted(updateData.data.tenantId);
                    break;
            }
        },
        
        // Handle tenant created
        handleTenantCreated(tenant) {
            // Add new tenant to available list if not exists
            const existingIndex = this.availableTenants.findIndex(t => t.id === tenant.id);
            if (existingIndex === -1) {
                this.availableTenants.push({
                    id: tenant.id,
                    name: tenant.name,
                    subdomain: tenant.id
                });
                this.addLog('success', `✅ New tenant added: ${tenant.name}`);
            }
        },
        
        // Handle tenant updated
        handleTenantUpdated(tenant) {
            // Update existing tenant in list
            const existingIndex = this.availableTenants.findIndex(t => t.id === tenant.id);
            if (existingIndex !== -1) {
                this.availableTenants[existingIndex] = {
                    id: tenant.id,
                    name: tenant.name,
                    subdomain: tenant.id
                };
                this.addLog('info', `🔄 Tenant updated: ${tenant.name}`);
            }
        },
        
        // Handle tenant deleted
        handleTenantDeleted(tenantId) {
            this.addLog('tenant_deleted', `🗑️ Tenant deleted: ${tenantId}`);
            this.loadAvailableTenants();
        },
        
        // Handle notifications updated (สำหรับ auto-remove)
        handleNotificationsUpdated() {
            // Sync reactive notifications
            this.syncReactiveNotifications();
            console.log('🔄 Notifications updated, syncing reactive array');
        },
        
        // Sync reactive notifications with NotificationManager
        syncReactiveNotifications() {
            this.reactiveNotifications = this.notificationService.getNotifications();
        },
        
        // Setup reactive notifications with NotificationService
        setupReactiveNotifications() {
            // Register callback for reactive updates
            this.notificationService.onReactiveUpdate(() => {
                this.syncReactiveNotifications();
            });
            
            // Listen to NotificationService events
            this.notificationService.on('notification-created', (data) => {
                this.addLog('notification', `📢 Notification created via service: ${data.notification.title}`);
            });
            
            this.notificationService.on('notification-removed', (data) => {
                this.addLog('notification', `🗑️ Notification removed via service: ${data.id}`);
            });
            
            this.notificationService.on('notifications-cleared', (data) => {
                this.addLog('notification', `🧹 All notifications cleared via service (${data.count})`);
            });
        },
        
        // Heartbeat Methods
        startHeartbeat() {
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
            }
            
            // Send heartbeat every 30 seconds
            this.heartbeatInterval = setInterval(() => {
                if (this.connectionStatus === 'connected') {
                    this.sendHeartbeat();
                }
            }, 30000);
            
            // Send initial heartbeat
            this.sendHeartbeat();
        },
        
        sendHeartbeat() {
            if (this.connectionStatus !== 'connected') return;
            
            const heartbeatData = {
                clientId: this.clientConfig.clientId,
                tenantId: this.selectedTenant,
                timestamp: new Date(),
                status: 'connected',
                ipAddress: 'Simulated IP',
                userAgent: navigator.userAgent,
                metrics: this.metrics
            };
            
            // Update client in service
            this.gatewayService.updateClientLastSeen(this.clientConfig.clientId, this.selectedTenant);
            
            // Emit heartbeat to Gateway
            const heartbeatEvent = new CustomEvent('client-heartbeat', {
                detail: heartbeatData
            });
            window.dispatchEvent(heartbeatEvent);
        },
        
        // Connection State Persistence
        saveConnectionState() {
            try {
                const state = {
                    selectedTenant: this.selectedTenant,
                    clientConfig: this.clientConfig,
                    shouldAutoReconnect: this.shouldAutoReconnect,
                    connectionStatus: this.connectionStatus,
                    lastConnected: this.lastConnected,
                    timestamp: new Date()
                };
                
                localStorage.setItem(this.connectionPersistKey, JSON.stringify(state));
            } catch (error) {
                console.error('Failed to save connection state:', error);
            }
        },
        
        loadConnectionState() {
            try {
                const savedState = localStorage.getItem(this.connectionPersistKey);
                if (savedState) {
                    const state = JSON.parse(savedState);
                    
                    // Check if state is not too old (max 30 minutes)
                    const stateAge = new Date() - new Date(state.timestamp);
                    if (stateAge < 1800000) { // 30 minutes in milliseconds
                        this.selectedTenant = state.selectedTenant || this.selectedTenant;
                        this.clientConfig = { ...this.clientConfig, ...state.clientConfig };
                        this.shouldAutoReconnect = state.shouldAutoReconnect || false;
                        
                        // Auto-reconnect if it was connected before
                        if (state.connectionStatus === 'connected' && this.shouldAutoReconnect) {
                            this.addLog('info', '🔄 Auto-reconnecting from previous session...');
                            setTimeout(() => {
                                this.connectToGateway();
                            }, 1000);
                        }
                        
                        this.addLog('system', 'Connection state restored from local storage');
                    } else {
                        this.addLog('system', 'Saved connection state too old, starting fresh');
                    }
                }
            } catch (error) {
                console.error('Failed to load connection state:', error);
                this.addLog('error', 'Failed to restore previous connection state');
            }
        },
        
        // Toggle auto-reconnect
        toggleAutoReconnect() {
            this.shouldAutoReconnect = !this.shouldAutoReconnect;
            this.saveConnectionState();
            this.addLog('info', `Auto-reconnect ${this.shouldAutoReconnect ? 'enabled' : 'disabled'}`);
        },
        
        // Manual Testing
        sendTestCommand(command) {
            // Simulate sending command back to test bidirectional communication
            this.addLog('response', `Sent response for ${command.type}`);
        },
        
        // Connection Management Helpers
        updateClientConfigForTenant() {
            const tenant = this.availableTenants.find(t => t.id === this.selectedTenant);
            if (tenant) {
                this.clientConfig.tenantId = this.selectedTenant;
                this.clientConfig.subdomain = tenant.id;
            }
        },
        
        notifyGatewayConnection(isConnecting) {
            const tenant = this.availableTenants.find(t => t.id === this.selectedTenant);
            const connectionData = {
                clientId: this.clientConfig.clientId,
                tenantId: this.selectedTenant,
                subdomain: tenant.id,
                wsUrl: `wss://${tenant.id}.connection-gateway.manonsanoi.workers.dev/ws`,
                isConnecting: isConnecting,
                timestamp: new Date(),
                userAgent: navigator.userAgent,
                ipAddress: 'simulated-ip'
            };
            
            // Send to Gateway via custom event
            const event = new CustomEvent('client-connection-update', {
                detail: connectionData
            });
            window.dispatchEvent(event);
            
            this.addLog('info', `${isConnecting ? 'Notified' : 'Disconnected from'} Gateway about connection status`);
        },
        
        // Tenant Management
        changeTenant(tenantId) {
            if (this.connectionStatus === 'connected') {
                this.addLog('warning', 'Cannot change tenant while connected. Disconnecting first...');
                this.disconnect();
            }
            
            const tenant = this.availableTenants.find(t => t.id === tenantId);
            if (tenant) {
                this.selectedTenant = tenantId;
                this.addLog('info', `Selected tenant: ${tenant.name} (${tenant.id})`);
            }
        },
        
        // Load available tenants from service
        async loadAvailableTenants() {
            try {
                // Fetch tenants from service/Cloudflare
                const tenants = await this.gatewayService.fetchAllTenants();
                this.availableTenants = tenants.map(tenant => ({
                    id: tenant.id,
                    name: tenant.name,
                    subdomain: tenant.id // Use id as subdomain for compatibility
                }));
                
                this.addLog('system', `Loaded ${this.availableTenants.length} available tenants`);
            } catch (error) {
                console.error('Failed to load available tenants:', error);
                this.addLog('error', 'ไม่สามารถโหลดรายการ tenant ได้');
                // Set empty array as fallback
                this.availableTenants = [];
            }
        },
        
        // Utilities
        addLog(type, message) {
            // Use service for logging
            this.gatewayService.addLog(type, message);
            
            // Update local logs
            this.clientLogs = this.gatewayService.getRecentLogs(100);
            
            // เพิ่มสถิติการป้องกันการซ้ำใน console
            if (type === 'notification' && this.notificationManager) {
                const stats = this.notificationService.getStatistics();
                if (stats.prevented > 0) {
                    console.log(`🛡️ Duplicate prevention stats: ${stats.prevented} prevented (${stats.rate.toFixed(1)}% prevention rate)`);
                }
            }
            
            // Auto scroll to bottom if enabled
            if (this.autoScroll) {
                this.$nextTick(() => {
                    const logContainer = this.$refs.logContainer;
                    if (logContainer) {
                        logContainer.scrollTop = 0;
                    }
                });
            }
        },
        
        updateLatencyMetrics(latency) {
            const currentAvg = this.metrics.averageLatency;
            const count = this.metrics.messagesReceived;
            this.metrics.averageLatency = ((currentAvg * (count - 1)) + latency) / count;
        },
        
        startUptimeCounter() {
            const startTime = Date.now();
            const updateUptime = () => {
                if (this.connectionStatus === 'connected') {
                    this.metrics.uptime = Math.floor((Date.now() - startTime) / 1000);
                    setTimeout(updateUptime, 1000);
                }
            };
            updateUptime();
        },
        
        clearLogs() {
            // ใช้ service method แทน
            this.gatewayService.clearLogs();
            this.clientLogs = this.gatewayService.getRecentLogs(100);
        },
        
        clearCommands() {
            this.receivedCommands = [];
        },
        
        formatDate(date) {
            // ใช้ service method แทน
            return this.gatewayService.formatDate(date);
        },
        
        formatUptime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
        
        getLogTypeColor(type) {
            switch (type) {
                case 'success': return 'text-green-600 bg-green-50';
                case 'error': return 'text-red-600 bg-red-50';
                case 'warning': return 'text-yellow-600 bg-yellow-50';
                case 'command': return 'text-blue-600 bg-blue-50';
                case 'notification': return 'text-purple-600 bg-purple-50';
                case 'quiz': return 'text-indigo-600 bg-indigo-50';
                case 'assignment': return 'text-pink-600 bg-pink-50';
                case 'message': return 'text-teal-600 bg-teal-50';
                case 'update': return 'text-orange-600 bg-orange-50';
                case 'test': return 'text-cyan-600 bg-cyan-50';
                case 'health_check': return 'text-red-500 bg-red-50';
                case 'health_report': return 'text-blue-500 bg-blue-50';
                case 'export': return 'text-green-500 bg-green-50';
                case 'response': return 'text-gray-600 bg-gray-50';
                default: return 'text-gray-600 bg-gray-50';
            }
        },
        
        getConnectionStatusColor() {
            // ใช้ service method แทน
            return this.gatewayService.getConnectionStatusColor(this.connectionStatus);
        },
        
        // Refresh tenants list
        async refreshTenantList() {
            this.addLog('info', '🔄 Refreshing tenant list...');
            try {
                await this.loadAvailableTenants();
                this.addLog('success', '✅ Tenant list refreshed successfully');
                
                // ใช้ service เพื่อตรวจสอบ connection health
                const healthCheck = this.gatewayService.checkConnectionHealth();
                this.addLog('system', `🔍 Health check: ${healthCheck.totalClients} clients, removed ${healthCheck.staleClientsRemoved} stale connections`);
                
            } catch (error) {
                this.addLog('error', `❌ Failed to refresh tenant list: ${error.message}`);
            }
            
            // ============================================
            // Client Health Monitoring Methods
            // ============================================
            
            // Start client health monitoring
            this.startClientHealthMonitoring();
        },
        
        // ============================================
        // Client Health Monitoring Methods
        // ============================================
        
        // Start client health monitoring
        startClientHealthMonitoring() {
            if (!this.clientHealthMonitoring.enabled) return;
            
            this.addLog('system', '🏥 Starting client health monitoring...');
            this.updateClientHealthData();
        },
        
        // Update client health data
        updateClientHealthData() {
            this.clientHealthMonitoring.lastHealthCheck = new Date();
            
            // Update basic health data
            this.clientHealthMonitoring.healthData.clientId = this.clientConfig.clientId;
            this.clientHealthMonitoring.healthData.tenantId = this.selectedTenant;
            
            // Connection health
            this.clientHealthMonitoring.healthData.connectionHealth = {
                status: this.connectionStatus,
                uptime: this.metrics.uptime,
                stability: this.calculateConnectionStability(),
                latency: this.metrics.averageLatency
            };
            
            // Performance metrics
            const serviceStats = this.gatewayService.getStatistics();
            this.clientHealthMonitoring.healthData.performanceMetrics = {
                messagesReceived: this.metrics.messagesReceived,
                messagesSent: serviceStats.commandsSent || 0,
                errorCount: this.calculateErrorCount(),
                errorRate: this.calculateErrorRate()
            };
            
            // Resource usage (simulated)
            this.clientHealthMonitoring.healthData.resourceUsage = {
                memoryUsage: Math.random() * 50 + 10, // 10-60%
                cpuUsage: Math.random() * 30 + 5 // 5-35%
            };
            
            // Determine overall health status
            this.clientHealthMonitoring.healthStatus = this.calculateHealthStatus();
            
            // Check for issues
            this.checkForHealthIssues();
            
            this.addLog('health_check', `🔍 Client health updated: ${this.clientHealthMonitoring.healthStatus}`);
        },
        
        // Calculate connection stability
        calculateConnectionStability() {
            if (this.connectionStatus !== 'connected') return 0;
            
            const totalAttempts = this.connectionAttempts;
            const successRate = totalAttempts > 0 ? ((totalAttempts - this.metrics.reconnectCount) / totalAttempts) * 100 : 100;
            return Math.max(0, Math.min(100, successRate));
        },
        
        // Calculate error count
        calculateErrorCount() {
            // Count errors from logs
            return this.clientLogs.filter(log => log.type === 'error').length;
        },
        
        // Calculate error rate
        calculateErrorRate() {
            const totalMessages = this.metrics.messagesReceived;
            const errorCount = this.calculateErrorCount();
            if (totalMessages === 0) return 0;
            return (errorCount / totalMessages) * 100;
        },
        
        // Calculate overall health status
        calculateHealthStatus() {
            const connection = this.clientHealthMonitoring.healthData.connectionHealth;
            const performance = this.clientHealthMonitoring.healthData.performanceMetrics;
            const resource = this.clientHealthMonitoring.healthData.resourceUsage;
            
            // Check for critical issues
            if (connection.status === 'error' || performance.errorRate > 20) {
                return 'unhealthy';
            }
            
            // Check for warnings
            if (connection.status === 'disconnected' || 
                performance.errorRate > 10 || 
                resource.memoryUsage > 80 || 
                resource.cpuUsage > 70) {
                return 'warning';
            }
            
            // All good
            return 'healthy';
        },
        
        // Check for health issues
        checkForHealthIssues() {
            const issues = [];
            const connection = this.clientHealthMonitoring.healthData.connectionHealth;
            const performance = this.clientHealthMonitoring.healthData.performanceMetrics;
            const resource = this.clientHealthMonitoring.healthData.resourceUsage;
            
            // Connection issues
            if (connection.status === 'disconnected') {
                issues.push('Client is disconnected');
            } else if (connection.status === 'error') {
                issues.push('Connection error detected');
            }
            
            if (connection.stability < 80) {
                issues.push(`Low connection stability: ${connection.stability.toFixed(1)}%`);
            }
            if (connection.latency > 500) {
                issues.push(`High latency: ${connection.latency.toFixed(0)}ms`);
            }
            
            // Performance issues
            if (performance.errorRate > 10) {
                issues.push(`High error rate: ${performance.errorRate.toFixed(1)}%`);
            }
            
            // Resource issues
            if (resource.memoryUsage > 80) {
                issues.push(`High memory usage: ${resource.memoryUsage.toFixed(1)}%`);
            }
            
            if (resource.cpuUsage > 70) {
                issues.push(`High CPU usage: ${resource.cpuUsage.toFixed(1)}%`);
            }
            
            this.clientHealthMonitoring.issues = issues;
        },
        
        // Get health status report
        getHealthReport() {
            // ใช้ service เพื่อดึงข้อมูล client
            const serviceClient = this.gatewayService.getClient(this.clientConfig.clientId, this.selectedTenant);
            
            return {
                timestamp: new Date().toISOString(),
                clientId: this.clientConfig.clientId,
                tenantId: this.selectedTenant,
                healthStatus: this.clientHealthMonitoring.healthStatus,
                healthData: this.clientHealthMonitoring.healthData,
                issues: this.clientHealthMonitoring.issues,
                connectionConfig: this.clientConfig,
                metrics: this.metrics,
                serviceClientData: serviceClient  // เพิ่มข้อมูลจาก service
            };
        },
        
        // Export client health report
        exportClientHealthReport() {
            const report = this.getHealthReport();
            
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `client-health-report-${this.clientConfig.clientId}-${new Date().toISOString().slice(0, 19)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.addLog('export', '📄 Client health report exported');
        },
        
        // Send health data to Host/Gateway (in real app, this would be sent via WebSocket)
        sendHealthDataToGateway() {
            if (this.connectionStatus !== 'connected') return;
            
            const healthData = this.getHealthReport();
            
            // Emit health data to Gateway
            const event = new CustomEvent('client-health-update', {
                detail: healthData
            });
            window.dispatchEvent(event);
            
            this.addLog('health_report', '📊 Health data sent to Gateway');
        },
        
        // Get health status color (reused from Host.vue)
        getHealthStatusColor(status) {
            switch (status) {
                case 'healthy': return 'text-green-600 bg-green-100';
                case 'warning': return 'text-yellow-600 bg-yellow-100';
                case 'unhealthy': return 'text-red-600 bg-red-100';
                case 'error': return 'text-gray-600 bg-gray-100';
                default: return 'text-gray-600 bg-gray-100';
            }
        },
        
        // สร้าง unique key สำหรับ command เพื่อป้องกันการซ้ำ
        generateCommandKey(command) {
            const payload = command.payload || {};
            // สำหรับ commands ใช้ timestamp เพื่อให้ส่งซ้ำได้ในเวลาต่างกัน
            const timestamp = command.timestamp || Date.now();
            const source = command.source || 'unknown';
            const contentKey = `${command.type}_${payload.title || ''}_${payload.message || ''}_${source}_${timestamp}`;
            return contentKey.replace(/\s+/g, '_').substring(0, 150);
        },
        
        // ============================================
        // Client Health Monitoring Methods
        // ============================================
        
        // Notification Panel Handlers
        handleRemoveNotification(id) {
            this.notificationService.removeNotification(id);
        },
        
        handleClearAllNotifications() {
            this.notificationService.clearAllNotifications();
        },
        
        // Reset duplicate protection (สำหรับการทดสอบ)
        resetDuplicateProtection() {
            this.notificationService.resetDuplicateProtection();
            this.recentCommandKeys.clear();
            this.addLog('system', '🔄 Duplicate protection reset - can now receive identical commands');
        },
    },
    
    mounted() {
        // สร้าง clientId ด้วย service method
        this.clientConfig.clientId = this.gatewayService.generateClientId('client');
        
        this.addLog('info', 'Client test panel initialized');
        
        // Listen for commands from Gateway
        window.addEventListener('gateway-command', this.handleGatewayCommand);
        
        // Listen for specific commands targeted to this client
        window.addEventListener('gateway-command-specific', this.handleSpecificCommand);
        
        // Listen for forced disconnection from Gateway
        window.addEventListener('force-client-disconnect', this.handleForceDisconnect);
        
        // Listen for refresh requests from Gateway
        window.addEventListener('gateway-refresh-request', this.handleRefreshRequest);
        
        // Listen for tenant list updates from Gateway
        window.addEventListener('tenant-list-update', this.handleTenantListUpdate);
        
        // Listen for notification updates (สำหรับ auto-remove)
        window.addEventListener('notifications-updated', this.handleNotificationsUpdated);
        
        // Load available tenants from service
        this.loadAvailableTenants();
        
        // Load persisted connection state
        this.loadConnectionState();
        
        // Start client health monitoring
        this.startClientHealthMonitoring();
        
        // Setup reactive notifications with NotificationService
        this.setupReactiveNotifications();
        
        // Initial sync of notifications
        this.syncReactiveNotifications();
    },
    
    beforeUnmount() {
        this.disconnect();
        
        // Remove event listeners
        window.removeEventListener('gateway-command', this.handleGatewayCommand);
        window.removeEventListener('gateway-command-specific', this.handleSpecificCommand);
        window.removeEventListener('force-client-disconnect', this.handleForceDisconnect);
        window.removeEventListener('gateway-refresh-request', this.handleRefreshRequest);
        window.removeEventListener('tenant-list-update', this.handleTenantListUpdate);
        window.removeEventListener('notifications-updated', this.handleNotificationsUpdated);
        
        // Save connection state before unmount
        this.saveConnectionState();
        
        // Clear heartbeat interval
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
    }
};
</script>

<template>
    <div v-if="loading_sources" class="text-center py-8">
        <Loader/>
    </div>

    <!-- Notification Panel -->
    <NotificationPanel 
        :notifications="reactiveNotifications"
        :max-visible="5"
        @remove-notification="handleRemoveNotification"
        @clear-all="handleClearAllNotifications" />

    <div class="flex-1 bg-gray-50 pt-2 pb-4" v-if="!loading_sources">
        <div class="mx-auto max-w-6xl px-4">
            
            <!-- Compact Header -->
            <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-green-100 rounded-lg">
                            <font-awesome-icon :icon="['fas', PageIcon]" class="text-green-600 text-lg"/>
                        </div>
                        <div>
                            <h1 class="text-xl font-semibold text-gray-900">Client Test Panel</h1>
                            <p class="text-sm text-gray-600">ทดสอบการเชื่อมต่อ Gateway</p>
                        </div>
                    </div>
                    
                    <!-- Connection Controls -->
                    <div class="flex items-center space-x-2">
                        <div class="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium"
                             :class="getConnectionStatusColor()">
                            <div class="w-2 h-2 rounded-full"
                                 :class="connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-gray-400'"></div>
                            {{ connectionStatus }}
                        </div>
                        
                        <button v-if="connectionStatus === 'disconnected'" 
                                @click="connectToGateway" 
                                class="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm transition-colors">
                            <font-awesome-icon :icon="['fas', 'play']" class="mr-1"/>
                            เชื่อมต่อ
                        </button>
                        <button v-else-if="connectionStatus === 'connected'" 
                                @click="disconnect" 
                                class="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 text-sm transition-colors">
                            <font-awesome-icon :icon="['fas', 'stop']" class="mr-1"/>
                            ตัดการเชื่อมต่อ
                        </button>
                        <button v-else disabled 
                                class="bg-gray-400 text-white px-3 py-1.5 rounded-lg cursor-not-allowed text-sm">
                            <font-awesome-icon :icon="['fas', 'spinner']" class="mr-1 fa-spin"/>
                            เชื่อมต่อ...
                        </button>
                    </div>
                </div>
            </div>

            <!-- Configuration & Stats -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                
                <!-- Client Config -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <font-awesome-icon :icon="['fas', 'cog']" class="text-gray-500 mr-2"/>
                        Configuration
                    </h3>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-700 mb-1">
                                Tenant <span class="text-red-500">*</span>
                            </label>
                            <div class="flex space-x-1">
                                <select v-model="selectedTenant" 
                                        @change="changeTenant(selectedTenant)"
                                        :disabled="connectionStatus === 'connected'"
                                        class="flex-1 text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5">
                                    <option value="">เลือก Tenant</option>
                                    <option v-for="tenant in availableTenants" :key="tenant.id" :value="tenant.id">
                                        {{ tenant.name }}
                                    </option>
                                </select>
                                <button @click="refreshTenantList"
                                        class="px-2 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs">
                                    <font-awesome-icon :icon="['fas', 'sync-alt']"/>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-700 mb-1">Client ID</label>
                            <input v-model="clientConfig.clientId" 
                                   type="text" 
                                   :disabled="connectionStatus === 'connected'"
                                   class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5">
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <font-awesome-icon :icon="['fas', 'chart-line']" class="text-gray-500 mr-2"/>
                        Statistics
                    </h3>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="text-center">
                            <div class="text-lg font-bold text-blue-600">{{ metrics.messagesReceived }}</div>
                            <div class="text-xs text-gray-500">Messages</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-orange-600">{{ Math.round(metrics.averageLatency) }}ms</div>
                            <div class="text-xs text-gray-500">Latency</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-purple-600">{{ formatUptime(metrics.uptime) }}</div>
                            <div class="text-xs text-gray-500">Uptime</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-gray-600">{{ connectionAttempts }}</div>
                            <div class="text-xs text-gray-500">Attempts</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <font-awesome-icon :icon="['fas', 'bolt']" class="text-gray-500 mr-2"/>
                        Quick Actions
                    </h3>
                    <div class="space-y-2">
                        <button @click="toggleAutoReconnect" 
                                class="w-full text-left px-3 py-2 rounded text-sm transition-colors"
                                :class="shouldAutoReconnect ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'">
                            <font-awesome-icon :icon="['fas', 'sync-alt']" class="mr-2"/>
                            Auto-Reconnect
                            <span v-if="shouldAutoReconnect" class="float-right text-xs">ON</span>
                        </button>
                        <button @click="sendHeartbeat" 
                                :disabled="connectionStatus !== 'connected'"
                                class="w-full text-left px-3 py-2 rounded text-sm bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <font-awesome-icon :icon="['fas', 'heartbeat']" class="mr-2"/>
                            Send Heartbeat
                        </button>

                    </div>
                </div>
            </div>

            <!-- Client Health Monitoring -->
            <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center justify-between">
                    <div class="flex items-center">
                        <font-awesome-icon :icon="['fas', 'heartbeat']" class="text-red-500 mr-2"/>
                        Client Health Status
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="px-2 py-1 rounded-full text-xs font-medium"
                             :class="getHealthStatusColor(clientHealthMonitoring.healthStatus)">
                            {{ clientHealthMonitoring.healthStatus.toUpperCase() }}
                        </div>
                        <button @click="updateClientHealthData" 
                                class="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100">
                            <font-awesome-icon :icon="['fas', 'sync-alt']" class="mr-1"/>
                            Update
                        </button>
                    </div>
                </h3>
                
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    
                    <!-- Connection Health -->
                    <div class="bg-gray-50 rounded-lg p-3">
                        <h4 class="text-xs font-medium text-gray-700 mb-2 flex items-center">
                            <font-awesome-icon :icon="['fas', 'wifi']" class="text-gray-500 mr-1"/>
                            Connection
                        </h4>
                        <div class="space-y-1 text-xs">
                            <div class="flex justify-between">
                                <span>Status:</span>
                                <span class="font-medium" :class="connectionStatus === 'connected' ? 'text-green-600' : 'text-gray-600'">
                                    {{ clientHealthMonitoring.healthData.connectionHealth.status }}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span>Uptime:</span>
                                <span class="font-medium">{{ formatUptime(clientHealthMonitoring.healthData.connectionHealth.uptime * 1000) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Stability:</span>
                                <span class="font-medium" :class="clientHealthMonitoring.healthData.connectionHealth.stability > 80 ? 'text-green-600' : 'text-yellow-600'">
                                    {{ clientHealthMonitoring.healthData.connectionHealth.stability.toFixed(1) }}%
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span>Latency:</span>
                                <span class="font-medium" :class="clientHealthMonitoring.healthData.connectionHealth.latency < 200 ? 'text-green-600' : 'text-yellow-600'">
                                    {{ Math.round(clientHealthMonitoring.healthData.connectionHealth.latency) }}ms
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Performance Metrics -->
                    <div class="bg-gray-50 rounded-lg p-3">
                        <h4 class="text-xs font-medium text-gray-700 mb-2 flex items-center">
                            <font-awesome-icon :icon="['fas', 'chart-line']" class="text-gray-500 mr-1"/>
                            Performance
                        </h4>
                        <div class="space-y-1 text-xs">
                            <div class="flex justify-between">
                                <span>Messages RX:</span>
                                <span class="font-medium text-blue-600">{{ clientHealthMonitoring.healthData.performanceMetrics.messagesReceived }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Messages TX:</span>
                                <span class="font-medium text-purple-600">{{ clientHealthMonitoring.healthData.performanceMetrics.messagesSent }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Errors:</span>
                                <span class="font-medium text-red-600">{{ clientHealthMonitoring.healthData.performanceMetrics.errorCount }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Error Rate:</span>
                                <span class="font-medium" :class="clientHealthMonitoring.healthData.performanceMetrics.errorRate < 5 ? 'text-green-600' : 'text-red-600'">
                                    {{ clientHealthMonitoring.healthData.performanceMetrics.errorRate.toFixed(1) }}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Resource Usage -->
                    <div class="bg-gray-50 rounded-lg p-3">
                        <h4 class="text-xs font-medium text-gray-700 mb-2 flex items-center">
                            <font-awesome-icon :icon="['fas', 'microchip']" class="text-gray-500 mr-1"/>
                            Resources
                        </h4>
                        <div class="space-y-1 text-xs">
                            <div class="flex justify-between">
                                <span>Memory:</span>
                                <span class="font-medium" :class="clientHealthMonitoring.healthData.resourceUsage.memoryUsage < 70 ? 'text-green-600' : 'text-yellow-600'">
                                    {{ clientHealthMonitoring.healthData.resourceUsage.memoryUsage.toFixed(1) }}%
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span>CPU:</span>
                                <span class="font-medium" :class="clientHealthMonitoring.healthData.resourceUsage.cpuUsage < 50 ? 'text-green-600' : 'text-yellow-600'">
                                    {{ clientHealthMonitoring.healthData.resourceUsage.cpuUsage.toFixed(1) }}%
                                </span>
                            </div>
                            <div class="col-span-2">
                                <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                    <div class="h-1.5 rounded-full transition-all duration-300"
                                         :class="clientHealthMonitoring.healthData.resourceUsage.memoryUsage < 70 ? 'bg-green-500' : 'bg-yellow-500'"
                                         :style="`width: ${clientHealthMonitoring.healthData.resourceUsage.memoryUsage}%`"></div>
                                </div>
                                <div class="text-xs text-gray-500 mt-1">Memory Usage</div>
                            </div>
                        </div>
                    </div>

                    <!-- Health Actions -->
                    <div class="bg-gray-50 rounded-lg p-3">
                        <h4 class="text-xs font-medium text-gray-700 mb-2 flex items-center">
                            <font-awesome-icon :icon="['fas', 'tools']" class="text-gray-500 mr-1"/>
                            Actions
                        </h4>
                        <div class="space-y-2">
                            <button @click="sendHealthDataToGateway" 
                                    :disabled="connectionStatus !== 'connected'"
                                    class="w-full px-2 py-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                <font-awesome-icon :icon="['fas', 'upload']" class="mr-1"/>
                                Send to Gateway
                            </button>
                            <button @click="exportClientHealthReport" 
                                    class="w-full px-2 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100">
                                <font-awesome-icon :icon="['fas', 'download']" class="mr-1"/>
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Health Issues -->
                <div v-if="clientHealthMonitoring.issues.length > 0" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 class="text-sm font-medium text-red-800 mb-2 flex items-center">
                        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mr-2"/>
                        Health Issues ({{ clientHealthMonitoring.issues.length }})
                    </h4>
                    <ul class="list-disc list-inside text-sm text-red-700 space-y-1">
                        <li v-for="issue in clientHealthMonitoring.issues" :key="issue">{{ issue }}</li>
                    </ul>
                </div>

                <!-- Health Data Summary -->
                <div class="mt-4 text-xs text-gray-500 flex justify-between items-center">
                    <span>
                        Last Health Check: {{ clientHealthMonitoring.lastHealthCheck ? new Date(clientHealthMonitoring.lastHealthCheck).toLocaleString('th-TH') : 'Never' }}
                    </span>
                    <span>
                        Client ID: {{ clientHealthMonitoring.healthData.clientId || 'N/A' }}
                    </span>
                </div>
            </div>

            <!-- Logs & Commands -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                <!-- Commands -->
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-sm font-medium text-gray-900 flex items-center">
                            <font-awesome-icon :icon="['fas', 'terminal']" class="text-gray-500 mr-2"/>
                            Commands ({{ receivedCommands.length }})
                        </h3>
                        <button @click="clearCommands" 
                                class="text-red-600 hover:text-red-800 text-xs">
                            Clear
                        </button>
                    </div>
                    <div class="max-h-80 overflow-y-auto">
                        <div v-if="receivedCommands.length === 0" class="text-center py-8 text-gray-500 text-sm">
                            ยังไม่มีคำสั่ง
                        </div>
                        <div v-else class="divide-y divide-gray-100">
                            <div v-for="command in receivedCommands.slice(0, 10)" :key="command.id" 
                                 class="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                 @click="showCommandDetail = command">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center space-x-2">
                                            <span class="font-medium text-gray-900 text-sm">{{ command.type }}</span>
                                            <span v-if="command.isDirect" class="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                                DIRECT
                                            </span>
                                            <span v-if="command.latency" class="text-xs text-gray-500">
                                                {{ Math.round(command.latency) }}ms
                                            </span>
                                        </div>
                                        <div class="text-xs text-gray-600 truncate mt-1">
                                            {{ JSON.stringify(command.payload) }}
                                        </div>
                                    </div>
                                    <span class="text-xs text-gray-400 ml-2">
                                        {{ new Date(command.timestamp).toLocaleTimeString('th-TH') }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Logs -->
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-sm font-medium text-gray-900 flex items-center">
                            <font-awesome-icon :icon="['fas', 'list']" class="text-gray-500 mr-2"/>
                            Activity Logs
                        </h3>
                        <div class="flex items-center space-x-3">
                            <label class="flex items-center text-xs">
                                <input v-model="autoScroll" type="checkbox" class="rounded border-gray-300 mr-1 w-3 h-3">
                                Auto Scroll
                            </label>
                            <button @click="clearLogs" 
                                    class="text-red-600 hover:text-red-800 text-xs">
                                Clear
                            </button>
                        </div>
                    </div>
                    <div ref="logContainer" class="max-h-80 overflow-y-auto">
                        <div v-if="clientLogs.length === 0" class="text-center py-8 text-gray-500 text-sm">
                            ยังไม่มี logs
                        </div>
                        <div v-else class="divide-y divide-gray-100">
                            <div v-for="log in clientLogs.slice(0, 15)" :key="log.id" 
                                 class="px-3 py-2 text-xs"
                                 :class="getLogTypeColor(log.type)">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1 min-w-0">
                                        <span class="font-medium">[{{ log.type.toUpperCase() }}]</span>
                                        <span class="ml-2">{{ log.message }}</span>
                                    </div>
                                    <span class="text-gray-500 ml-2 opacity-75">
                                        {{ new Date(log.timestamp).toLocaleTimeString('th-TH') }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Simplified Command Detail Modal -->
    <div v-if="showCommandDetail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">{{ showCommandDetail.type }} Command</h3>
                <button @click="showCommandDetail = null" class="text-gray-400 hover:text-gray-600">
                    <font-awesome-icon :icon="['fas', 'times']"/>
                </button>
            </div>
            
            <div class="p-4 overflow-y-auto">
                <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                        <span class="font-medium text-gray-700">Type:</span>
                        <span class="ml-2">{{ showCommandDetail.type }}</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700">Time:</span>
                        <span class="ml-2">{{ formatDate(showCommandDetail.timestamp) }}</span>
                    </div>
                    <div v-if="showCommandDetail.latency">
                        <span class="font-medium text-gray-700">Latency:</span>
                        <span class="ml-2">{{ Math.round(showCommandDetail.latency) }}ms</span>
                    </div>
                    <div v-if="showCommandDetail.isDirect">
                        <span class="font-medium text-gray-700">Direct:</span>
                        <span class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Yes</span>
                    </div>
                </div>
                
                <div>
                    <div class="font-medium text-gray-700 mb-2">Payload:</div>
                    <pre class="text-sm bg-gray-50 p-3 rounded border overflow-x-auto">{{ JSON.stringify(showCommandDetail.payload, null, 2) }}</pre>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Component specific styles */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>