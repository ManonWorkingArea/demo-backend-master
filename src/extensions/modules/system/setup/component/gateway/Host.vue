<script>
import { useRoute } from 'vue-router'
import Loader from '@/interface/template/Loader.vue';
import NotificationPanel from './NotificationPanel.vue';
import ConnectionGatewayService from './ConnectionGatewayService.js';
import NotificationService from './NotificationService.js';

export default {
    name: 'ConnectionGateway',
    data() {
        const route = useRoute();
        return {
            PageName: route.meta.title || 'Connection Gateway',
            PageIcon: route.meta.icon || 'network-wired',
            PagePath: route.meta.path,
            ParentName: route.meta.parent,
            ParentPage: route.meta.page,
            loading_sources: false,
            
            // Service instance
            gatewayService: ConnectionGatewayService,
            notificationService: NotificationService,
            
            // Reactive notifications for Host
            reactiveNotifications: [],
            
            // Durable Object Configuration
            tenants: [],
            selectedTenant: null,
            newTenant: {
                subdomain: '',
                name: '',
                status: 'active',
                industry: 'general',
                plan: 'free',
                maxUsers: 100,
                features: []
            },
            
            // Connection Management
            connections: [],
            onlineClients: [], // Real-time client connections
            commands: [],
            
            // WebSocket Configuration
            wsConfig: {
                endpoint: '',
                protocol: 'wss',
                reconnectInterval: 5000,
                maxReconnectAttempts: 5
            },
            
            // Real-time Status
            connectionStatus: 'disconnected',
            connectedClients: 0,
            
            // Command Interface
            commandForm: {
                type: '',
                message: '',
                title: '',
                target: 'all',
                priority: 'normal',
                urgent: false,
                // Additional fields for specific command types
                questions: 10,
                timeLimit: 30,
                dueDate: '',
                component: 'system',
                version: '1.0.0',
                loading: false
            },
            
            // Monitoring
            logs: [],
            statistics: {
                totalTenants: 0,
                activeConnections: 0,
                commandsSent: 0,
                messagesReceived: 0
            },
            
            // Use Cases
            useCases: [],
            
            // Modal States
            showTenantModal: false,
            showCommandModal: false,
            showLogsModal: false,
            showClientsModal: false,
            showEditTenantModal: false,
            showHealthModal: false,
            showMetricsModal: false,
            
            // Client Selection
            selectedClient: null,
            editingTenant: null,
            
            // Refresh State
            isRefreshing: false,
            
            // Real-time WebSocket Status
            webSocketStatus: 'disconnected',
            realTimeEnabled: false,
            lastWebSocketUpdate: null,
            
            // Auto-reconnect settings
            autoReconnect: {
                enabled: true,
                attempts: 0,
                maxAttempts: 5,
                timeout: null,
                backoffDelay: 5000, // Start with 5 seconds
                maxDelay: 30000, // Max 30 seconds
                isReconnecting: false
            },
            
            // Health Monitoring System
            healthMonitoring: {
                enabled: true,
                interval: 30000, // 30 seconds
                lastCheck: null,
                checkInterval: null,
                alerts: [],
                globalHealth: {
                    status: 'unknown',
                    timestamp: null,
                    summary: {
                        totalTenants: 0,
                        healthyTenants: 0,
                        warningTenants: 0,
                        unhealthyTenants: 0,
                        totalConnections: 0,
                        totalErrors: 0,
                        globalErrorRate: 0
                    },
                    tenants: []
                },
                tenantHealth: new Map(), // tenant health cache
                metrics: {
                    systemUptime: 0,
                    totalMessagesProcessed: 0,
                    averageResponseTime: 0,
                    memoryUsage: {
                        total: 0,
                        used: 0,
                        percentage: 0
                    }
                }
            }
        }
    },
    components: {
        Loader,
        NotificationPanel,
    },
    computed: {
        // Safe method to get clients count for tenant
        safeGetClientCount() {
            return (tenantId) => {
                if (!tenantId || tenantId === undefined || tenantId === null) {
                    console.warn('safeGetClientCount called with invalid tenantId:', tenantId);
                    return 0;
                }
                try {
                    const count = this.getClientsForTenant(tenantId).length;
                    console.log(`safeGetClientCount(${tenantId}): ${count}`);
                    return count;
                } catch (error) {
                    console.error(`Error in safeGetClientCount for tenant ${tenantId}:`, error);
                    return 0;
                }
            };
        }
    },
    methods: {
        // ลบ initializeGateway method เพราะไม่ใช้แล้ว - ทำงานตรงใน mounted เหมือน Client.vue
        
        // ============================================
        // Notification System Methods
        // ============================================
        
        // Setup reactive notifications with NotificationService
        setupReactiveNotifications() {
            // Register callback for reactive updates
            this.notificationService.onReactiveUpdate(() => {
                this.syncReactiveNotifications();
            });
            
            // Listen to NotificationService events
            this.notificationService.on('notification-created', (data) => {
                this.addLog('notification', `📢 Host notification created: ${data.notification.title}`);
            });
            
            this.notificationService.on('notification-removed', (data) => {
                this.addLog('notification', `🗑️ Host notification removed: ${data.id}`);
            });
            
            this.notificationService.on('notifications-cleared', (data) => {
                this.addLog('notification', `🧹 All host notifications cleared (${data.count})`);
            });
        },
        
        // Sync reactive notifications with NotificationService
        syncReactiveNotifications() {
            this.reactiveNotifications = this.notificationService.getNotifications();
        },
        
        // Notification Panel Handlers
        handleRemoveNotification(id) {
            this.notificationService.removeNotification(id);
        },
        
        handleClearAllNotifications() {
            this.notificationService.clearAllNotifications();
        },
        
        // Create host-specific notifications
        createHostNotification(type, title, message, options = {}) {
            const command = {
                type: 'notification',
                payload: {
                    type: type,
                    title: title,
                    message: message,
                    timestamp: Date.now(),
                    source: 'host',
                    priority: options.priority || 'normal',
                    urgent: options.urgent || false,
                    icon: options.icon || this.getNotificationIcon(type)
                },
                timestamp: Date.now(),
                source: 'host'
            };
            
            return this.notificationService.createNotification(command, options);
        },
        
        // Get notification icon based on type
        getNotificationIcon(type) {
            switch (type) {
                case 'connection': return '🔗';
                case 'tenant': return '🏢';
                case 'client': return '👤';
                case 'health': return '🏥';
                case 'system': return '⚙️';
                case 'realtime': return '⚡';
                case 'error': return '❌';
                case 'success': return '✅';
                case 'warning': return '⚠️';
                case 'info': return 'ℹ️';
                default: return '📢';
            }
        },
        
        async loadTenants() {
            try {
                this.addLog('info', '🔄 กำลังโหลด tenant list จาก Cloudflare...');
                console.log('Starting loadTenants...');
                
                // Fetch tenants from service/Cloudflare - ใช้วิธีเดียวกับ Client.vue
                const tenants = await this.gatewayService.fetchAllTenants();
                console.log('fetchAllTenants result:', tenants);
                
                // Use fetchAllTenants result directly (like Client.vue does)
                if (tenants && Array.isArray(tenants)) {
                    this.tenants = tenants.map(tenant => ({
                        id: String(tenant.id || tenant.tenantId), // Ensure ID is string
                        tenantId: String(tenant.id || tenant.tenantId),
                        name: tenant.name || String(tenant.id || tenant.tenantId),
                        subdomain: String(tenant.id || tenant.tenantId),
                        status: tenant.status || 'active',
                        connections: 0, // Will be updated by real-time events
                        lastActivity: tenant.lastActivity || new Date(),
                        createdAt: tenant.createdAt || tenant.metadata?.createdAt || new Date(),
                        metadata: tenant.metadata || {},
                        config: tenant.config || {}
                    }));
                } else {
                    // Fallback to empty array like Client.vue
                    this.tenants = [];
                }
                
                console.log('Final loaded tenants:', this.tenants);
                
                this.addLog('success', `✅ โหลด tenant list สำเร็จ: ${this.tenants.length} tenant(s)`);
                
                // Create success notification
                this.createHostNotification(
                    'tenant',
                    'Tenants Loaded Successfully',
                    `Successfully loaded ${this.tenants.length} tenant(s) from Cloudflare`,
                    { priority: 'normal', icon: '🏢' }
                );
                
                // Force update statistics
                this.updateStatistics();
                
            } catch (error) {
                console.error('Failed to load tenants:', error);
                this.addLog('error', `❌ ไม่สามารถโหลดรายการ tenant ได้: ${error.message}`);
                
                // Create error notification
                this.createHostNotification(
                    'error',
                    'Failed to Load Tenants',
                    `Error loading tenants: ${error.message}`,
                    { priority: 'high', urgent: true }
                );
                
                // Set empty array as fallback (like Client.vue)
                this.tenants = [];
            }
        },
        
        async loadConnections() {
            // Load connections from service
            this.connections = [];
        },
        
        async createTenant() {
            if (!this.newTenant.subdomain || !this.newTenant.name) {
                alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }
            
            try {
                const tenant = {
                    id: this.newTenant.subdomain, // Use subdomain as ID
                    name: this.newTenant.name,
                    status: this.newTenant.status || 'active',
                    config: {
                        theme: 'light',
                        features: this.newTenant.features || [],
                        maxUsers: this.newTenant.maxUsers || 100,
                        timezone: 'Asia/Bangkok'
                    },
                    metadata: {
                        plan: this.newTenant.plan || 'free',
                        industry: this.newTenant.industry || 'general',
                        createdAt: new Date().toISOString()
                    }
                };
                
                // Use service to register tenant (now async)
                await this.gatewayService.registerTenant(tenant);
                
                this.addLog('success', `Tenant ${tenant.name} สร้างสำเร็จ`);
                
                // Create tenant creation notification
                this.createHostNotification(
                    'tenant',
                    'Tenant Created Successfully',
                    `New tenant "${tenant.name}" has been created and is ready for use`,
                    { priority: 'normal', icon: '🏢' }
                );
                
                // Close modal and refresh
                this.showTenantModal = false;
                this.resetNewTenant();
                this.loadTenants();
                
            } catch (error) {
                this.addLog('error', `ไม่สามารถสร้าง tenant ได้: ${error.message}`);
                
                // Create tenant creation error notification
                this.createHostNotification(
                    'error',
                    'Failed to Create Tenant',
                    `Error creating tenant "${this.newTenant.name}": ${error.message}`,
                    { priority: 'high', urgent: true, icon: '❌' }
                );
                
                alert(`ไม่สามารถสร้าง tenant ได้: ${error.message}`);
            }
        },
        
        async sendCommand() {
            if (!this.commandForm.type || !this.commandForm.message.trim() || !this.commandForm.target) {
                alert('กรุณากรอกข้อมูลคำสั่งให้ครบถ้วน');
                return;
            }
            
            try {
                this.commandForm.loading = true;
                
                // Create payload based on command type
                let payload = {};
                
                switch (this.commandForm.type) {
                    case 'notification':
                        payload = {
                            title: this.commandForm.title || 'แจ้งเตือน',
                            message: this.commandForm.message,
                            urgent: this.commandForm.urgent || false
                        };
                        break;
                    case 'message':
                        payload = {
                            from: 'Admin',
                            message: this.commandForm.message,
                            urgent: this.commandForm.urgent || false
                        };
                        break;
                    case 'quiz':
                        payload = {
                            title: this.commandForm.title || 'แบบทดสอบใหม่',
                            message: this.commandForm.message,
                            questions: this.commandForm.questions || 10,
                            timeLimit: this.commandForm.timeLimit || 30
                        };
                        break;
                    case 'assignment':
                        payload = {
                            title: this.commandForm.title || 'งานใหม่',
                            message: this.commandForm.message,
                            dueDate: this.commandForm.dueDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
                        };
                        break;
                    case 'update':
                        payload = {
                            component: this.commandForm.component || 'system',
                            action: this.commandForm.message,
                            version: this.commandForm.version || '1.0.0'
                        };
                        break;
                    default:
                        payload = { message: this.commandForm.message };
                }
                
                // Create command object
                const command = {
                    type: this.commandForm.type,
                    payload: payload,
                    metadata: {
                        priority: this.commandForm.priority,
                        source: 'admin-panel',
                        timestamp: new Date().toISOString()
                    }
                };
                
                // Debug logging
                console.log('Sending command:', command);
                console.log('Command type:', command.type);
                console.log('Command payload:', command.payload);
                
                // Validate command before sending
                if (!command.type || !command.payload || Object.keys(command.payload).length === 0) {
                    throw new Error('Command type and payload are required');
                }
                
                // Determine tenant ID from target
                let tenantId = this.commandForm.target;
                if (this.commandForm.target.startsWith('client:')) {
                    // Extract tenant from client:clientId:tenantId format
                    const parts = this.commandForm.target.split(':');
                    tenantId = parts[2];
                }
                
                // Send via service
                await this.gatewayService.sendCloudflareCommand(tenantId, command);
                
                // Also send locally for immediate feedback
                const localCommand = {
                    ...command,
                    target: this.commandForm.target
                };
                this.gatewayService.sendCommand(localCommand);
                
                this.addLog('success', `คำสั่ง ${this.commandForm.type} ถูกส่งไปยัง ${this.commandForm.target} แล้ว`);
                
                // Reset form
                this.resetCommandForm();
                
            } catch (error) {
                this.addLog('error', `Failed to send command: ${error.message}`);
                alert(`ส่งคำสั่งไม่สำเร็จ: ${error.message}`);
            } finally {
                this.commandForm.loading = false;
            }
        },
        
        async updateStatistics() {
            // Use service statistics as base
            const serviceStats = this.gatewayService.getStatistics();
            
            // Update with local data
            this.statistics = {
                totalTenants: this.tenants.length,
                activeConnections: this.onlineClients.length, // Use local onlineClients count
                commandsSent: serviceStats.commandsSent || 0,
                messagesReceived: serviceStats.messagesReceived || 0
            };
            
            // Also update local data from service
            this.commands = this.gatewayService.getRecentCommands(50);
            
            console.log('Updated statistics:', this.statistics);
            console.log('Online clients count:', this.onlineClients.length);
        },
        
        toggleUseCase(useCaseId) {
            const useCase = this.useCases.find(uc => uc.id === useCaseId);
            if (useCase) {
                useCase.active = !useCase.active;
                this.addLog('usecase_toggled', `${useCase.active ? 'เปิด' : 'ปิด'}ใช้งาน: ${useCase.name}`);
            }
        },
        
        addLog(type, message) {
            // Use service for logging
            this.gatewayService.addLog(type, message);
            
            // Update local logs
            this.logs = this.gatewayService.getRecentLogs(100);
        },
        
        resetNewTenant() {
            this.newTenant = {
                subdomain: '',
                name: '',
                status: 'active',
                industry: 'general',
                plan: 'free',
                maxUsers: 100,
                features: []
            };
        },
        
        // Delete tenant
        async deleteTenant(tenant) {
            if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบ Tenant "${tenant.name}"?\n\nการกระทำนี้ไม่สามารถยกเลิกได้`)) {
                return;
            }
            
            try {
                await this.gatewayService.deleteTenant(tenant.id);
                
                this.addLog('success', `Tenant ${tenant.name} ถูกลบเรียบร้อยแล้ว`);
                
                // Refresh tenants list
                this.loadTenants();
                
            } catch (error) {
                this.addLog('error', `ไม่สามารถลบ Tenant ได้: ${error.message}`);
                alert(`ไม่สามารถลบ Tenant ได้: ${error.message}`);
            }
        },
        
        // Edit tenant
        editTenant(tenant) {
            this.editingTenant = { 
                ...tenant,
                config: { ...tenant.config } || {},
                metadata: { ...tenant.metadata } || {}
            };
            this.showEditTenantModal = true;
        },
        
        // Update tenant
        async updateTenant() {
            if (!this.editingTenant.name.trim()) {
                alert('กรุณาระบุชื่อ Tenant');
                return;
            }
            
            try {
                const updates = {
                    name: this.editingTenant.name,
                    status: this.editingTenant.status,
                    config: {
                        ...this.editingTenant.config,
                        maxUsers: this.editingTenant.config?.maxUsers || 100,
                        features: this.editingTenant.config?.features || []
                    },
                    metadata: {
                        ...this.editingTenant.metadata,
                        plan: this.editingTenant.metadata?.plan || 'free',
                        industry: this.editingTenant.metadata?.industry || 'general'
                    }
                };
                
                await this.gatewayService.updateTenant(this.editingTenant.id, updates);
                
                this.addLog('success', `Tenant ${this.editingTenant.name} อัปเดตเรียบร้อยแล้ว`);
                
                // Close modal and refresh
                this.showEditTenantModal = false;
                this.editingTenant = null;
                this.loadTenants();
                
            } catch (error) {
                this.addLog('error', `ไม่สามารถอัปเดต Tenant ได้: ${error.message}`);
                alert(`ไม่สามารถอัปเดต Tenant ได้: ${error.message}`);
            }
        },
        
        cancelEditTenant() {
            this.showEditTenantModal = false;
            this.editingTenant = null;
        },
        
        getTenantStatusColor(status) {
            switch (status) {
                case 'active': return 'text-green-600 bg-green-100';
                case 'inactive': return 'text-red-600 bg-red-100';
                case 'maintenance': return 'text-yellow-600 bg-yellow-100';
                default: return 'text-gray-600 bg-gray-100';
            }
        },
        
        formatDate(date) {
            return new Date(date).toLocaleString('th-TH');
        },
        
        // Handle client connection updates
        handleClientConnectionUpdate(event) {
            const connectionData = event.detail;
            console.log('handleClientConnectionUpdate:', connectionData);
            console.log('Current tenants:', this.tenants.map(t => ({ id: t.id, name: t.name })));
            
            if (connectionData.isConnecting) {
                // Add or update client in onlineClients
                const existingIndex = this.onlineClients.findIndex(
                    c => c.clientId === connectionData.clientId && c.tenantId === connectionData.tenantId
                );
                
                const clientData = {
                    clientId: connectionData.clientId,
                    tenantId: connectionData.tenantId,
                    status: 'connected',
                    connectedAt: connectionData.timestamp,
                    lastSeen: connectionData.timestamp,
                    ipAddress: connectionData.ipAddress || 'N/A',
                    userAgent: connectionData.userAgent || 'N/A'
                };
                
                if (existingIndex === -1) {
                    // Add new client
                    this.onlineClients.push(clientData);
                    this.addLog('client_connected', `Client ${connectionData.clientId} connected to tenant ${connectionData.tenantId}`);
                    
                    // Create connection notification
                    this.createHostNotification(
                        'client',
                        'Client Connected',
                        `Client ${connectionData.clientId} connected to tenant ${connectionData.tenantId}`,
                        { priority: 'normal', icon: '🔗' }
                    );
                } else {
                    // Update existing client
                    this.onlineClients[existingIndex] = { ...this.onlineClients[existingIndex], ...clientData };
                    this.addLog('client_updated', `Client ${connectionData.clientId} updated in tenant ${connectionData.tenantId}`);
                }
            } else {
                // Remove client from onlineClients
                const clientIndex = this.onlineClients.findIndex(
                    c => c.clientId === connectionData.clientId && c.tenantId === connectionData.tenantId
                );
                if (clientIndex !== -1) {
                    this.onlineClients.splice(clientIndex, 1);
                    this.addLog('client_disconnected', `Client ${connectionData.clientId} disconnected from tenant ${connectionData.tenantId}`);
                    
                    // Create disconnection notification
                    this.createHostNotification(
                        'client',
                        'Client Disconnected',
                        `Client ${connectionData.clientId} disconnected from tenant ${connectionData.tenantId}`,
                        { priority: 'normal', icon: '🔌' }
                    );
                }
            }
            
            // Update service as well (for compatibility)
            this.gatewayService.getAllClients();
            
            // Update statistics
            this.updateStatistics();
            
            // Sync tenant connection counts
            this.syncAllTenantConnectionCounts();
            
            // Force update to ensure UI reflects changes
            this.forceUpdateConnectionCounts();
            
            console.log('Updated onlineClients:', this.onlineClients);
        },
        
        getClientsForTenant(tenantId) {
            if (!tenantId || tenantId === undefined || tenantId === null) {
                console.warn('getClientsForTenant called with invalid tenantId:', tenantId);
                return [];
            }
            
            // Debug: Check if tenantId is an object
            if (typeof tenantId === 'object') {
                console.error('getClientsForTenant received object instead of string:', tenantId);
                console.trace('Call stack for object tenantId');
                return [];
            }
            
            try {
                // Ensure tenantId is a string
                const tenantIdString = String(tenantId);
                
                // Use local onlineClients array instead of service
                const clients = this.onlineClients.filter(client => client && client.tenantId === tenantIdString);
                console.log(`getClientsForTenant(${tenantIdString}):`, clients);
                console.log('All onlineClients:', this.onlineClients);
                return clients;
            } catch (error) {
                console.error(`Error in getClientsForTenant for tenant ${tenantId}:`, error);
                return [];
            }
        },
        
        getClientStatusColor(status) {
            switch (status) {
                case 'connected': return 'text-green-600 bg-green-100';
                case 'disconnected': return 'text-gray-600 bg-gray-100';
                case 'error': return 'text-red-600 bg-red-100';
                default: return 'text-gray-600 bg-gray-100';
            }
        },
        
        sendCommandToClient(client) {
            // Pre-fill command form with specific client target
            this.commandForm = {
                type: 'notification',
                message: 'This is a direct message',
                title: `Message to ${client.clientId}`,
                target: client.tenantId,
                priority: 'normal',
                urgent: false,
                questions: 10,
                timeLimit: 30,
                dueDate: '',
                component: 'system',
                version: '1.0.0',
                loading: false
            };
            this.showClientsModal = false;
            this.showCommandModal = true;
        },
        
        disconnectClient(client) {
            if (confirm(`Are you sure you want to disconnect client ${client.clientId}?`)) {
                // Simulate forcing client disconnection
                const disconnectEvent = new CustomEvent('force-client-disconnect', {
                    detail: {
                        clientId: client.clientId,
                        tenantId: client.tenantId,
                        reason: 'Admin disconnection'
                    }
                });
                window.dispatchEvent(disconnectEvent);
                
                // Remove from online clients list
                const clientIndex = this.onlineClients.findIndex(
                    c => c.clientId === client.clientId && c.tenantId === client.tenantId
                );
                if (clientIndex !== -1) {
                    this.onlineClients.splice(clientIndex, 1);
                    this.addLog('admin_disconnect', `Admin disconnected client ${client.clientId} from tenant ${client.tenantId}`);
                    this.updateTenantConnectionCount(client.tenantId);
                    this.updateStatistics();
                }
            }
        },
        
        // Client Selection Methods
        selectClient(client) {
            this.selectedClient = client;
            this.addLog('client_selected', `Selected client: ${client.clientId} from tenant ${client.tenantId}`);
        },
        
        clearClientSelection() {
            this.selectedClient = null;
            this.addLog('client_deselected', 'Client selection cleared');
        },
        
        sendCommandToSpecificClient(client) {
            this.selectClient(client);
            
            // Pre-fill command form for specific client
            this.commandForm = {
                type: 'notification',
                message: 'This is a direct message',
                title: `Message to ${client.clientId}`,
                target: `client:${client.clientId}:${client.tenantId}`,
                priority: 'normal',
                urgent: false,
                questions: 10,
                timeLimit: 30,
                dueDate: '',
                component: 'system',
                version: '1.0.0',
                loading: false
            };
            
            this.showCommandModal = true;
        },
        
        // Refresh Methods
        async refreshClients(silent = false) {
            if (!silent) {
                this.isRefreshing = true;
            }
            
            try {
                // Emit refresh request to all clients
                const refreshEvent = new CustomEvent('gateway-refresh-request', {
                    detail: {
                        timestamp: new Date(),
                        requestId: `refresh-${Date.now()}`
                    }
                });
                window.dispatchEvent(refreshEvent);
                
                // Wait a bit for clients to respond
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                if (!silent) {
                    this.addLog('system', 'Client refresh completed');
                }
                
                await this.updateStatistics();
            } catch (error) {
                console.error('Failed to refresh clients:', error);
                if (!silent) {
                    alert('เกิดข้อผิดพลาดในการรีเฟรช client');
                }
            } finally {
                if (!silent) {
                    this.isRefreshing = false;
                }
            }
        },
        
        // Handle client heartbeat
        handleClientHeartbeat(event) {
            const heartbeatData = event.detail;
            console.log('handleClientHeartbeat:', heartbeatData);
            
            // Update lastSeen for the client
            const clientIndex = this.onlineClients.findIndex(
                c => c.clientId === heartbeatData.clientId && c.tenantId === heartbeatData.tenantId
            );
            
            if (clientIndex !== -1) {
                this.onlineClients[clientIndex].lastSeen = heartbeatData.timestamp;
                this.onlineClients[clientIndex].status = 'connected';
                console.log(`Updated heartbeat for client ${heartbeatData.clientId}`);
            } else {
                // Client not found, add it
                const clientData = {
                    clientId: heartbeatData.clientId,
                    tenantId: heartbeatData.tenantId,
                    status: 'connected',
                    connectedAt: heartbeatData.timestamp,
                    lastSeen: heartbeatData.timestamp,
                    ipAddress: heartbeatData.ipAddress || 'N/A',
                    userAgent: heartbeatData.userAgent || 'N/A'
                };
                this.onlineClients.push(clientData);
                this.addLog('client_heartbeat_new', `New client discovered via heartbeat: ${heartbeatData.clientId}`);
            }
            
            // Update service as well
            this.gatewayService.updateClientLastSeen(heartbeatData.clientId, heartbeatData.tenantId);
            
            // Update statistics
            this.updateStatistics();
        },
        
        // State Persistence Methods
        saveState() {
            try {
                const state = {
                    tenants: this.tenants,
                    onlineClients: this.onlineClients,
                    statistics: this.statistics,
                    commands: this.commands,
                    logs: this.logs.slice(-100), // Keep only last 100 logs
                    timestamp: new Date()
                };
                
                localStorage.setItem('connection-gateway-state', JSON.stringify(state));
            } catch (error) {
                console.error('Failed to save state:', error);
            }
        },
        
        loadPersistedState() {
            try {
                const savedState = localStorage.getItem('connection-gateway-state');
                if (savedState) {
                    const state = JSON.parse(savedState);
                    
                    // Check if state is not too old (max 1 hour)
                    const stateAge = new Date() - new Date(state.timestamp);
                    if (stateAge < 3600000) { // 1 hour in milliseconds
                        this.tenants = state.tenants || this.tenants;
                        this.onlineClients = state.onlineClients || [];
                        this.statistics = { ...this.statistics, ...state.statistics };
                        this.commands = state.commands || [];
                        this.logs = state.logs || [];
                        
                        // Mark old clients as potentially offline
                        this.onlineClients.forEach(client => {
                            const lastSeenAge = new Date() - new Date(client.lastSeen);
                            if (lastSeenAge > 60000) { // More than 1 minute
                                client.status = 'disconnected';
                            }
                        });
                        
                        this.addLog('system', 'State restored from local storage');
                    } else {
                        this.addLog('system', 'Saved state too old, starting fresh');
                    }
                }
            } catch (error) {
                console.error('Failed to load persisted state:', error);
                this.addLog('error', 'Failed to restore previous state');
            }
        },
        
        // Real-time WebSocket event handlers
        handleWebSocketConnected(data) {
            console.log('WebSocket connected:', data);
            this.webSocketStatus = 'connected';
            this.realTimeEnabled = true;
            this.lastWebSocketUpdate = new Date();
            
            const isReconnected = data && data.reconnected;
            const logMessage = isReconnected ? 
                '⚡ Real-time mode reactivated via WebSocket reconnection' : 
                '⚡ Real-time mode activated via WebSocket';
            
            this.addLog('system', logMessage);
            
            // Create real-time connection notification
            this.createHostNotification(
                'realtime',
                isReconnected ? 'Real-time Connection Restored' : 'Real-time Connection Active',
                isReconnected ? 
                    'WebSocket reconnection successful - Real-time monitoring is restored' :
                    'WebSocket connection established - Real-time monitoring is now active',
                { priority: 'normal', icon: '⚡' }
            );
            
            // Reset auto-reconnect if this was a successful reconnection
            if (isReconnected || this.autoReconnect.isReconnecting) {
                this.resetAutoReconnect();
            }
        },
        
        handleWebSocketDisconnected(data) {
            console.log('WebSocket disconnected:', data);
            this.webSocketStatus = 'disconnected';
            this.realTimeEnabled = false;
            this.lastWebSocketUpdate = null;
            this.addLog('warning', '🔌 Real-time mode deactivated - WebSocket disconnected');
            
            // Create real-time disconnection notification
            this.createHostNotification(
                'warning',
                'Real-time Connection Lost',
                'WebSocket connection disconnected - Real-time monitoring is inactive',
                { priority: 'high', urgent: true, icon: '🔌' }
            );
            
            // Start auto-reconnect process
            this.startAutoReconnect();
        },
        
        handleWebSocketStatus(data) {
            console.log('WebSocket status update:', data);
            this.webSocketStatus = data.status;
            this.realTimeEnabled = data.status === 'connected';
            this.lastWebSocketUpdate = new Date();
        },
        
        // ============================================
        // Auto-Reconnect System Methods
        // ============================================
        
        // Start auto-reconnect process
        startAutoReconnect() {
            if (!this.autoReconnect.enabled || this.autoReconnect.isReconnecting) {
                return;
            }
            
            // Clear any existing timeout
            this.clearAutoReconnectTimeout();
            
            this.autoReconnect.isReconnecting = true;
            this.autoReconnect.attempts++;
            
            // Check if we've exceeded max attempts
            if (this.autoReconnect.attempts > this.autoReconnect.maxAttempts) {
                this.addLog('error', `❌ Auto-reconnect failed after ${this.autoReconnect.maxAttempts} attempts`);
                this.createHostNotification(
                    'error',
                    'Auto-Reconnect Failed',
                    `Failed to reconnect after ${this.autoReconnect.maxAttempts} attempts. Manual intervention required.`,
                    { priority: 'high', urgent: true, icon: '🚫' }
                );
                this.autoReconnect.isReconnecting = false;
                return;
            }
            
            // Calculate delay with backoff (5-10 seconds range, increasing with attempts)
            const baseDelay = this.autoReconnect.backoffDelay;
            const randomJitter = Math.random() * 5000; // 0-5 seconds random jitter
            const backoffMultiplier = Math.min(this.autoReconnect.attempts, 3); // Max 3x backoff
            const delay = Math.min(baseDelay * backoffMultiplier + randomJitter, this.autoReconnect.maxDelay);
            
            this.addLog('info', `🔄 Attempting auto-reconnect in ${Math.round(delay/1000)} seconds (attempt ${this.autoReconnect.attempts}/${this.autoReconnect.maxAttempts})`);
            this.createHostNotification(
                'info',
                'Auto-Reconnect Scheduled',
                `Attempting to reconnect in ${Math.round(delay/1000)} seconds (attempt ${this.autoReconnect.attempts}/${this.autoReconnect.maxAttempts})`,
                { priority: 'normal', icon: '🔄' }
            );
            
            // Set timeout for reconnection
            this.autoReconnect.timeout = setTimeout(() => {
                this.attemptReconnect();
            }, delay);
        },
        
        // Attempt to reconnect
        async attemptReconnect() {
            if (!this.autoReconnect.isReconnecting) {
                return;
            }
            
            try {
                this.addLog('info', `🔌 Attempting to reconnect... (attempt ${this.autoReconnect.attempts})`);
                
                // Try to reconnect by triggering the gateway service reconnection
                // In a real implementation, this would call the appropriate connection method
                await this.reconnectWebSocket();
                
                // If we get here, connection was successful
                this.onReconnectSuccess();
                
            } catch (error) {
                this.addLog('warning', `⚠️ Reconnect attempt ${this.autoReconnect.attempts} failed: ${error.message}`);
                
                // Try again with exponential backoff
                this.startAutoReconnect();
            }
        },
        
        // Simulate reconnection attempt (replace with actual reconnection logic)
        async reconnectWebSocket() {
            // Simulate connection attempt
            return new Promise((resolve, reject) => {
                // In a real implementation, this would attempt to reconnect to WebSocket
                // For now, we'll simulate a random success/failure
                setTimeout(() => {
                    const success = Math.random() > 0.3; // 70% success rate for simulation
                    if (success) {
                        // Simulate successful reconnection
                        this.handleWebSocketConnected({ reconnected: true });
                        resolve();
                    } else {
                        reject(new Error('Connection timeout'));
                    }
                }, 2000); // Simulate 2-second connection attempt
            });
        },
        
        // Handle successful reconnection
        onReconnectSuccess() {
            this.addLog('success', `✅ Auto-reconnect successful after ${this.autoReconnect.attempts} attempts`);
            this.createHostNotification(
                'success',
                'Reconnected Successfully',
                `Real-time connection restored after ${this.autoReconnect.attempts} attempts`,
                { priority: 'normal', icon: '✅' }
            );
            
            // Reset auto-reconnect state
            this.resetAutoReconnect();
        },
        
        // Reset auto-reconnect state
        resetAutoReconnect() {
            this.clearAutoReconnectTimeout();
            this.autoReconnect.attempts = 0;
            this.autoReconnect.isReconnecting = false;
        },
        
        // Clear auto-reconnect timeout
        clearAutoReconnectTimeout() {
            if (this.autoReconnect.timeout) {
                clearTimeout(this.autoReconnect.timeout);
                this.autoReconnect.timeout = null;
            }
        },
        
        // Toggle auto-reconnect feature
        toggleAutoReconnect() {
            this.autoReconnect.enabled = !this.autoReconnect.enabled;
            
            if (!this.autoReconnect.enabled) {
                this.clearAutoReconnectTimeout();
                this.autoReconnect.isReconnecting = false;
                this.addLog('info', '⏸️ Auto-reconnect disabled');
            } else {
                this.addLog('info', '▶️ Auto-reconnect enabled');
            }
            
            this.createHostNotification(
                'info',
                `Auto-Reconnect ${this.autoReconnect.enabled ? 'Enabled' : 'Disabled'}`,
                `Auto-reconnection feature has been ${this.autoReconnect.enabled ? 'enabled' : 'disabled'}`,
                { priority: 'normal', icon: this.autoReconnect.enabled ? '▶️' : '⏸️' }
            );
        },
        
        // Manual reconnect trigger
        manualReconnect() {
            if (this.autoReconnect.isReconnecting) {
                this.addLog('warning', '⚠️ Auto-reconnect already in progress');
                return;
            }
            
            if (this.webSocketStatus === 'connected') {
                this.addLog('info', 'ℹ️ Already connected to WebSocket');
                return;
            }
            
            this.addLog('info', '🔄 Manual reconnect triggered');
            this.createHostNotification(
                'info',
                'Manual Reconnect',
                'Manual reconnection attempt initiated',
                { priority: 'normal', icon: '🔄' }
            );
            
            // Reset attempts for manual reconnect
            this.autoReconnect.attempts = 0;
            this.startAutoReconnect();
        },
        
        // Get auto-reconnect status info
        getAutoReconnectStatus() {
            if (!this.autoReconnect.enabled) {
                return { status: 'disabled', message: 'Auto-reconnect is disabled' };
            }
            
            if (this.webSocketStatus === 'connected') {
                return { status: 'connected', message: 'Connected - no reconnection needed' };
            }
            
            if (this.autoReconnect.isReconnecting) {
                return { 
                    status: 'reconnecting', 
                    message: `Reconnecting... (attempt ${this.autoReconnect.attempts}/${this.autoReconnect.maxAttempts})` 
                };
            }
            
            if (this.autoReconnect.attempts >= this.autoReconnect.maxAttempts) {
                return { status: 'failed', message: 'Auto-reconnect failed - manual intervention required' };
            }
            
            return { status: 'ready', message: 'Ready to reconnect when needed' };
        },
        
        handleConnectionCountUpdate(data) {
            console.log('Real-time connection count update:', data);
            const { tenantId, connections } = data;
            
            // Handle undefined connections by calculating from local clients
            let actualConnections = connections;
            if (connections === undefined || connections === null) {
                actualConnections = this.getClientsForTenant(tenantId).length;
                console.log(`Fixed undefined connections for tenant ${tenantId}: ${actualConnections}`);
            }
            
            // Update tenant in the tenants array
            const tenantIndex = this.tenants.findIndex(t => t.id === tenantId);
            if (tenantIndex !== -1) {
                this.tenants[tenantIndex].connections = actualConnections;
                this.tenants[tenantIndex].lastActivity = new Date();
                console.log(`Updated tenant ${tenantId} connections to ${actualConnections}`);
            } else {
                console.warn(`Tenant ${tenantId} not found in tenants array`);
            }
            
            // Update statistics
            this.updateStatistics();
            this.lastWebSocketUpdate = new Date();
            
            this.addLog('realtime_update', `📊 Real-time update: Tenant ${tenantId} has ${actualConnections} connections`);
        },
        
        handleRealTimeClientUpdate(data) {
            console.log('Real-time client update:', data);
            const { clientId, tenantId, status } = data;
            
            if (status === 'connected') {
                // Add or update client in onlineClients array
                const existingIndex = this.onlineClients.findIndex(
                    c => c.clientId === clientId && c.tenantId === tenantId
                );
                
                const clientData = {
                    clientId,
                    tenantId,
                    status: 'connected',
                    connectedAt: data.timestamp,
                    lastSeen: data.timestamp,
                    ipAddress: data.ipAddress || 'N/A',
                    userAgent: data.userAgent || 'N/A'
                };
                
                if (existingIndex === -1) {
                    this.onlineClients.push(clientData);
                    this.addLog('realtime_connect', `⚡ Real-time: Client ${clientId} connected to ${tenantId}`);
                } else {
                    this.onlineClients[existingIndex] = { ...this.onlineClients[existingIndex], ...clientData };
                }
            } else if (status === 'disconnected') {
                // Remove client from onlineClients array
                const clientIndex = this.onlineClients.findIndex(
                    c => c.clientId === clientId && c.tenantId === tenantId
                );
                if (clientIndex !== -1) {
                    this.onlineClients.splice(clientIndex, 1);
                    this.addLog('realtime_disconnect', `⚡ Real-time: Client ${clientId} disconnected from ${tenantId}`);
                }
            }
            
            this.updateStatistics();
            this.lastWebSocketUpdate = new Date();
            
            // Force update connection counts
            this.forceUpdateConnectionCounts();
        },
        
        getWebSocketStatusIcon() {
            switch (this.webSocketStatus) {
                case 'connected': return 'check-circle';
                case 'disconnected': return 'times-circle';
                case 'connecting': return 'sync-alt';
                default: return 'question-circle';
            }
        },
        
        getWebSocketStatusColor() {
            switch (this.webSocketStatus) {
                case 'connected': return 'text-green-600 bg-green-100';
                case 'disconnected': return 'text-red-600 bg-red-100';
                case 'connecting': return 'text-yellow-600 bg-yellow-100';
                default: return 'text-gray-600 bg-gray-100';
            }
        },
        
        // Sync connection counts for all tenants
        syncAllTenantConnectionCounts() {
            console.log('Syncing all tenant connection counts...');
            this.tenants.forEach(tenant => {
                const connectionCount = this.getClientsForTenant(tenant.id).length;
                if (tenant.connections !== connectionCount) {
                    console.log(`Syncing tenant ${tenant.id}: ${tenant.connections} → ${connectionCount}`);
                    tenant.connections = connectionCount;
                    tenant.lastActivity = new Date();
                }
            });
        },
        
        // Force update connection counts for all tenants
        forceUpdateConnectionCounts() {
            console.log('Force updating connection counts...');
            this.tenants.forEach(tenant => {
                if (tenant && tenant.id) {
                    const currentCount = this.getClientsForTenant(tenant.id).length;
                    console.log(`Tenant ${tenant.id}: current display=${tenant.connections}, actual=${currentCount}`);
                    
                    // Force update if different
                    if (tenant.connections !== currentCount) {
                        tenant.connections = currentCount;
                        tenant.lastActivity = new Date();
                        console.log(`Force updated tenant ${tenant.id} to ${currentCount} connections`);
                    }
                }
            });
            
            // Force Vue reactivity update
            this.$forceUpdate();
        },
        
        // Update connection count for specific tenant
        updateTenantConnectionCount(tenantId) {
            if (!tenantId) {
                console.warn('updateTenantConnectionCount called with invalid tenantId:', tenantId);
                return;
            }
            
            try {
                // Find tenant and update connection count
                const tenantIndex = this.tenants.findIndex(t => t.id === tenantId);
                if (tenantIndex !== -1) {
                    const currentCount = this.getClientsForTenant(tenantId).length;
                    this.tenants[tenantIndex].connections = currentCount;
                    this.tenants[tenantIndex].lastActivity = new Date();
                    console.log(`Updated tenant ${tenantId} connection count to ${currentCount}`);
                    
                    // Also update via service
                    this.gatewayService.updateTenantConnectionCount(tenantId, currentCount);
                } else {
                    console.warn(`Tenant ${tenantId} not found for connection count update`);
                }
                
                // Update overall statistics
                this.updateStatistics();
                
            } catch (error) {
                console.error(`Error updating connection count for tenant ${tenantId}:`, error);
            }
        },
        
        // Refresh tenants list
        async refreshTenantList() {
            this.addLog('info', '🔄 Refreshing tenant list...');
            try {
                await this.loadTenants();
                this.addLog('success', '✅ Tenant list refreshed successfully');
            } catch (error) {
                this.addLog('error', `❌ Failed to refresh tenant list: ${error.message}`);
            }
        },
        
        // Reset command form
        resetCommandForm() {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            this.commandForm = {
                type: '',
                message: '',
                title: '',
                target: 'all',
                priority: 'normal',
                urgent: false,
                questions: 10,
                timeLimit: 30,
                dueDate: tomorrow.toISOString().split('T')[0],
                component: 'system',
                version: '1.0.0',
                loading: false
            };
        },
        
        // Force load tenants (เหมือน Client.vue)
        async forceLoadTenants() {
            this.loading_sources = true;
            try {
                await this.loadTenants();
                this.addLog('success', '🔄 Force loaded tenants successfully');
            } catch (error) {
                this.addLog('error', `❌ Failed to force load tenants: ${error.message}`);
            } finally {
                this.loading_sources = false;
            }
        },
        
        // ============================================
        // Health Monitoring System Methods
        // ============================================
        
        // Start health monitoring
        startHealthMonitoring() {
            if (!this.healthMonitoring.enabled) return;
            
            this.addLog('system', '🏥 Starting health monitoring system...');
            
            // Initial health check
            this.checkSystemHealth();
            
            // Set up periodic health checks
            this.healthMonitoring.checkInterval = setInterval(() => {
                this.checkSystemHealth();
            }, this.healthMonitoring.interval);
            
            this.addLog('success', `✅ Health monitoring started (interval: ${this.healthMonitoring.interval/1000}s)`);
        },
        
        // Stop health monitoring
        stopHealthMonitoring() {
            if (this.healthMonitoring.checkInterval) {
                clearInterval(this.healthMonitoring.checkInterval);
                this.healthMonitoring.checkInterval = null;
                this.addLog('info', '🏥 Health monitoring stopped');
            }
        },
        
        // Check global system health
        async checkSystemHealth() {
            try {
                this.healthMonitoring.lastCheck = new Date();
                
                // In a real implementation, this would call the Cloudflare Workers health endpoint
                // For now, we'll simulate the health check based on local data
                const health = await this.simulateGlobalHealthCheck();
                
                this.healthMonitoring.globalHealth = health;
                
                // Process alerts
                this.processHealthAlerts(health);
                
                // Update tenant health cache
                health.tenants.forEach(tenant => {
                    this.healthMonitoring.tenantHealth.set(tenant.tenantId, tenant);
                });
                
                this.addLog('health_check', `🔍 Health check completed: ${health.status} (${health.summary.healthyTenants}/${health.summary.totalTenants} healthy)`);
                
                // Create health status notification based on status
                if (health.status === 'unhealthy') {
                    this.createHostNotification(
                        'health',
                        'System Health Alert',
                        `Health check shows unhealthy status: ${health.summary.unhealthyTenants} tenant(s) need attention`,
                        { priority: 'high', urgent: true, icon: '🚨' }
                    );
                } else if (health.status === 'warning') {
                    this.createHostNotification(
                        'health',
                        'System Health Warning',
                        `Health check shows warning status: ${health.summary.warningTenants} tenant(s) have issues`,
                        { priority: 'medium', icon: '⚠️' }
                    );
                }
                
            } catch (error) {
                console.error('Health check failed:', error);
                this.addLog('error', `❌ Health check failed: ${error.message}`);
                
                // Create health check error notification
                this.createHostNotification(
                    'error',
                    'Health Check Failed',
                    `System health check failed: ${error.message}`,
                    { priority: 'high', urgent: true, icon: '❌' }
                );
                
                // Set error state
                this.healthMonitoring.globalHealth.status = 'error';
                this.healthMonitoring.globalHealth.timestamp = new Date();
            }
        },
        
        // Simulate global health check (in real app, this would call the API)
        async simulateGlobalHealthCheck() {
            const timestamp = new Date();
            const tenantHealthChecks = [];
            
            // Check health for each tenant
            for (const tenant of this.tenants) {
                const tenantHealth = await this.simulateTenantHealthCheck(tenant);
                tenantHealthChecks.push(tenantHealth);
            }
            
            // Calculate summary
            const summary = {
                totalTenants: this.tenants.length,
                healthyTenants: tenantHealthChecks.filter(t => t.status === 'healthy').length,
                warningTenants: tenantHealthChecks.filter(t => t.status === 'warning').length,
                unhealthyTenants: tenantHealthChecks.filter(t => t.status === 'unhealthy').length,
                totalConnections: this.onlineClients.length,
                totalErrors: 0,
                globalErrorRate: 0
            };
            
            // Determine overall system status
            let status = 'healthy';
            if (summary.unhealthyTenants > 0) {
                status = 'unhealthy';
            } else if (summary.warningTenants > 0) {
                status = 'warning';
            }
            
            return {
                status,
                timestamp,
                summary,
                tenants: tenantHealthChecks
            };
        },
        
        // Simulate individual tenant health check
        async simulateTenantHealthCheck(tenant) {
            const tenantClients = this.getClientsForTenant(tenant.id);
            const activeConnections = tenantClients.length;
            const adminConnections = tenantClients.filter(c => c.isAdmin).length;
            
            // Calculate uptime (simulate)
            const startTime = tenant.createdAt ? new Date(tenant.createdAt) : new Date(Date.now() - 3600000);
            const uptime = Date.now() - startTime.getTime();
            
            // Determine status based on criteria
            let status = 'healthy';
            const issues = [];
            
            // Check for issues
            if (activeConnections === 0 && uptime > 3600000) { // No connections for over 1 hour
                status = 'warning';
                issues.push('No active connections for over 1 hour');
            }
            
            if (adminConnections === 0) {
                if (status === 'healthy') status = 'warning';
                issues.push('No admin connections');
            }
            
            // Simulate error rate check
            const errorRate = Math.random() * 5; // Random 0-5%
            if (errorRate > 10) {
                status = 'unhealthy';
                issues.push(`High error rate: ${errorRate.toFixed(1)}%`);
            }
            
            return {
                status,
                tenantId: tenant.id,
                tenantName: tenant.name,
                timestamp: new Date(),
                uptime: {
                    milliseconds: uptime,
                    hours: Math.floor(uptime / 3600000),
                    minutes: Math.floor((uptime % 3600000) / 60000),
                    formatted: `${Math.floor(uptime / 3600000)}h ${Math.floor((uptime % 3600000) / 60000)}m`
                },
                connections: {
                    active: activeConnections,
                    admin: adminConnections,
                    total: activeConnections,
                    rate: Math.round(activeConnections / Math.max(uptime / 3600000, 0.1))
                },
                performance: {
                    messagesProcessed: Math.floor(Math.random() * 1000),
                    commandsProcessed: Math.floor(Math.random() * 100),
                    errorCount: Math.floor(Math.random() * 10),
                    errorRate: errorRate,
                    lastActivity: tenantClients.length > 0 ? tenantClients[0].lastSeen : startTime
                },
                issues
            };
        },
        
        // Process health alerts
        processHealthAlerts(health) {
            const alerts = [];
            
            // System-level alerts
            if (health.status === 'unhealthy') {
                alerts.push({
                    level: 'critical',
                    type: 'system',
                    message: 'System is unhealthy',
                    timestamp: new Date(),
                    details: health.summary
                });
            } else if (health.status === 'warning') {
                alerts.push({
                    level: 'warning',
                    type: 'system',
                    message: 'System has warnings',
                    timestamp: new Date(),
                    details: health.summary
                });
            }
            
            // Tenant-level alerts
            health.tenants.forEach(tenant => {
                if (tenant.status === 'unhealthy') {
                    alerts.push({
                        level: 'critical',
                        type: 'tenant',
                        message: `Tenant "${tenant.tenantName}" is unhealthy`,
                        timestamp: new Date(),
                        tenantId: tenant.tenantId,
                        details: tenant.issues
                    });
                } else if (tenant.status === 'warning' && tenant.issues.length > 0) {
                    alerts.push({
                        level: 'warning',
                        type: 'tenant',
                        message: `Tenant "${tenant.tenantName}" has warnings`,
                        timestamp: new Date(),
                        tenantId: tenant.tenantId,
                        details: tenant.issues
                    });
                }
            });
            
            // Add new alerts
            alerts.forEach(alert => {
                // Check if similar alert already exists
                const exists = this.healthMonitoring.alerts.some(existing => 
                    existing.type === alert.type && 
                    existing.level === alert.level && 
                    existing.tenantId === alert.tenantId
                );
                
                if (!exists) {
                    this.healthMonitoring.alerts.unshift(alert);
                    this.addLog('alert', `🚨 ${alert.level.toUpperCase()}: ${alert.message}`);
                }
            });
            
            // Keep only last 50 alerts
            this.healthMonitoring.alerts = this.healthMonitoring.alerts.slice(0, 50);
        },
        
        // Get health status color
        getHealthStatusColor(status) {
            switch (status) {
                case 'healthy': return 'text-green-600 bg-green-100';
                case 'warning': return 'text-yellow-600 bg-yellow-100';
                case 'unhealthy': return 'text-red-600 bg-red-100';
                case 'error': return 'text-gray-600 bg-gray-100';
                default: return 'text-gray-600 bg-gray-100';
            }
        },
        
        // Get health status icon
        getHealthStatusIcon(status) {
            switch (status) {
                case 'healthy': return 'check-circle';
                case 'warning': return 'exclamation-triangle';
                case 'unhealthy': return 'times-circle';
                case 'error': return 'question-circle';
                default: return 'question-circle';
            }
        },
        
        // Get alert level color
        getAlertLevelColor(level) {
            switch (level) {
                case 'info': return 'text-blue-600 bg-blue-100';
                case 'warning': return 'text-yellow-600 bg-yellow-100';
                case 'critical': return 'text-red-600 bg-red-100';
                default: return 'text-gray-600 bg-gray-100';
            }
        },
        
        // Clear alerts
        clearAlerts() {
            this.healthMonitoring.alerts = [];
            this.addLog('info', '🗑️ Health alerts cleared');
        },
        
        // Clear alerts by type
        clearAlertsByType(type) {
            const before = this.healthMonitoring.alerts.length;
            this.healthMonitoring.alerts = this.healthMonitoring.alerts.filter(alert => alert.type !== type);
            const cleared = before - this.healthMonitoring.alerts.length;
            this.addLog('info', `🗑️ Cleared ${cleared} ${type} alerts`);
        },
        
        // Toggle health monitoring
        toggleHealthMonitoring() {
            if (this.healthMonitoring.enabled) {
                this.stopHealthMonitoring();
                this.healthMonitoring.enabled = false;
                this.addLog('info', '⏸️ Health monitoring disabled');
            } else {
                this.healthMonitoring.enabled = true;
                this.startHealthMonitoring();
                this.addLog('info', '▶️ Health monitoring enabled');
            }
        },
        
        // Format uptime
        formatUptime(milliseconds) {
            const hours = Math.floor(milliseconds / 3600000);
            const minutes = Math.floor((milliseconds % 3600000) / 60000);
            const seconds = Math.floor((milliseconds % 60000) / 1000);
            
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            } else if (minutes > 0) {
                return `${minutes}m ${seconds}s`;
            } else {
                return `${seconds}s`;
            }
        },
        
        // Format memory size
        formatMemorySize(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        },
        
        // Export health report
        exportHealthReport() {
            const report = {
                timestamp: new Date().toISOString(),
                globalHealth: this.healthMonitoring.globalHealth,
                alerts: this.healthMonitoring.alerts,
                metrics: this.healthMonitoring.metrics,
                tenants: this.tenants.map(tenant => ({
                    ...tenant,
                    health: this.healthMonitoring.tenantHealth.get(tenant.id)
                }))
            };
            
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `health-report-${new Date().toISOString().slice(0, 19)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.addLog('export', '📄 Health report exported');
        },
        
        // Check specific tenant health
        async checkTenantHealth(tenantId) {
            try {
                const tenant = this.tenants.find(t => t.id === tenantId);
                if (!tenant) {
                    throw new Error('Tenant not found');
                }
                
                const health = await this.simulateTenantHealthCheck(tenant);
                this.healthMonitoring.tenantHealth.set(tenantId, health);
                
                this.addLog('health_check', `🔍 Tenant health checked: ${tenant.name} - ${health.status}`);
                
                return health;
            } catch (error) {
                this.addLog('error', `❌ Failed to check tenant health: ${error.message}`);
                throw error;
            }
        }
    },
    
    mounted() {
        try {
            this.addLog('info', 'Host gateway panel initialized');
            
            // Load tenants directly like Client.vue - no await
            this.loadTenants();
            
            // Load persisted state
            this.loadPersistedState();
            
            // Listen for client connection updates
            window.addEventListener('client-connection-update', this.handleClientConnectionUpdate);
            
            // Listen for client heartbeat/ping
            window.addEventListener('client-heartbeat', this.handleClientHeartbeat);
            
            // Listen for real-time WebSocket events
            this.gatewayService.on('admin-websocket-connected', this.handleWebSocketConnected);
            this.gatewayService.on('admin-websocket-disconnected', this.handleWebSocketDisconnected);
            this.gatewayService.on('admin-websocket-status', this.handleWebSocketStatus);
            this.gatewayService.on('connection-count-updated', this.handleConnectionCountUpdate);
            this.gatewayService.on('realtime-client-update', this.handleRealTimeClientUpdate);
            
            // Auto-refresh clients every 30 seconds
            this.autoRefreshInterval = setInterval(() => {
                this.refreshClients(true); // silent refresh
            }, 30000);
            
            // Start health monitoring system
            this.startHealthMonitoring();
            
            // Setup reactive notifications with NotificationService
            this.setupReactiveNotifications();
            
            // Initial sync of notifications
            this.syncReactiveNotifications();
            
            // Create welcome notification
            this.createHostNotification(
                'system',
                'Host Gateway Initialized',
                'Connection Gateway Host panel is ready for monitoring',
                { priority: 'normal', icon: '⚙️' }
            );
            
        } catch (error) {
            console.error('Failed to mount component:', error);
        }
    },
    
    beforeUnmount() {
        // Stop health monitoring
        this.stopHealthMonitoring();
        
        // Clear auto-reconnect timeout
        this.clearAutoReconnectTimeout();
        
        // Remove event listeners
        window.removeEventListener('client-connection-update', this.handleClientConnectionUpdate);
        window.removeEventListener('client-heartbeat', this.handleClientHeartbeat);
        
        // Remove service event listeners
        this.gatewayService.off('admin-websocket-connected', this.handleWebSocketConnected);
        this.gatewayService.off('admin-websocket-disconnected', this.handleWebSocketDisconnected);
        this.gatewayService.off('admin-websocket-status', this.handleWebSocketStatus);
        this.gatewayService.off('connection-count-updated', this.handleConnectionCountUpdate);
        this.gatewayService.off('realtime-client-update', this.handleRealTimeClientUpdate);
        
        // Clear auto-refresh interval
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        // Save state before unmount
        this.saveState();
    }
};
</script>

<template>
    <div v-if="loading_sources" class="text-center py-8">
        <Loader/>
    </div>
    
    <!-- Notification Panel for Host -->
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
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <font-awesome-icon :icon="['fas', PageIcon]" class="text-blue-600 text-lg"/>
                        </div>
                        <div>
                            <h1 class="text-xl font-semibold text-gray-900">Connection Gateway</h1>
                            <p class="text-sm text-gray-600">จัดการ Real-time Communication</p>
                        </div>
                    </div>
                    
                    <!-- Real-time Status -->
                    <div class="flex items-center space-x-3">
                        <!-- Auto-reconnect Status -->
                        <div v-if="autoReconnect.isReconnecting" 
                             class="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm bg-yellow-100 text-yellow-700">
                            <div class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                            Reconnecting... ({{ autoReconnect.attempts }}/{{ autoReconnect.maxAttempts }})
                        </div>
                        
                        <div class="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm"
                             :class="realTimeEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                            <div class="w-2 h-2 rounded-full"
                                 :class="realTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"></div>
                            {{ realTimeEnabled ? 'Real-time Active' : 'Offline' }}
                        </div>
                        
                        <div class="flex items-center space-x-1 px-2 py-1 rounded text-xs"
                             :class="getWebSocketStatusColor()">
                            <font-awesome-icon :icon="['fas', getWebSocketStatusIcon()]" 
                                               :class="webSocketStatus === 'connecting' ? 'fa-spin' : ''"/>
                            <span>{{ webSocketStatus }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <font-awesome-icon :icon="['fas', 'bolt']" class="text-gray-500 mr-2"/>
                    Quick Actions
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <button @click="showTenantModal = true" 
                            class="px-3 py-2 rounded text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
                        <font-awesome-icon :icon="['fas', 'plus']" class="mr-1"/>
                        เพิ่ม Tenant
                    </button>
                    <button @click="showCommandModal = true" 
                            class="px-3 py-2 rounded text-sm bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
                        <font-awesome-icon :icon="['fas', 'paper-plane']" class="mr-1"/>
                        ส่งคำสั่ง
                    </button>
                    <button @click="refreshClients" 
                            :disabled="isRefreshing"
                            class="px-3 py-2 rounded text-sm bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 disabled:opacity-50 transition-colors">
                        <font-awesome-icon :icon="['fas', 'sync-alt']" class="mr-1" :class="{ 'animate-spin': isRefreshing }"/>
                        รีเฟรช Client
                    </button>
                    
                    <!-- Auto-reconnect Controls -->
                    <button @click="manualReconnect" 
                            :disabled="webSocketStatus === 'connected' || autoReconnect.isReconnecting"
                            class="px-3 py-2 rounded text-sm bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 disabled:opacity-50 transition-colors">
                        <font-awesome-icon :icon="['fas', 'plug']" class="mr-1" :class="{ 'animate-spin': autoReconnect.isReconnecting }"/>
                        {{ autoReconnect.isReconnecting ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อใหม่' }}
                    </button>
                    
                    <button @click="toggleAutoReconnect" 
                            class="px-3 py-2 rounded text-sm transition-colors"
                            :class="autoReconnect.enabled ? 
                                'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' : 
                                'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'">
                        <font-awesome-icon :icon="['fas', autoReconnect.enabled ? 'toggle-on' : 'toggle-off']" class="mr-1"/>
                        Auto-Reconnect
                    </button>
                    <button @click="loadTenants" 
                            class="px-3 py-2 rounded text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors">
                        <font-awesome-icon :icon="['fas', 'building']" class="mr-1"/>
                        โหลด Tenants
                    </button>
                </div>
            </div>

            <!-- Health Monitoring Statistics -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                
                <!-- Health Status -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <font-awesome-icon :icon="['fas', 'heartbeat']" class="text-gray-500 mr-2"/>
                        System Health
                    </h3>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-600">Status:</span>
                            <div class="flex items-center space-x-1">
                                <font-awesome-icon :icon="['fas', getHealthStatusIcon(healthMonitoring.globalHealth.status)]" 
                                                   :class="getHealthStatusColor(healthMonitoring.globalHealth.status).split(' ')[0]"/>
                                <span class="text-xs font-medium" :class="getHealthStatusColor(healthMonitoring.globalHealth.status)">
                                    {{ healthMonitoring.globalHealth.status.toUpperCase() }}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-600">Healthy:</span>
                            <span class="text-xs font-medium text-green-600">
                                {{ healthMonitoring.globalHealth.summary.healthyTenants }}/{{ healthMonitoring.globalHealth.summary.totalTenants }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-600">Alerts:</span>
                            <span class="text-xs font-medium" :class="healthMonitoring.alerts.length > 0 ? 'text-red-600' : 'text-gray-500'">
                                {{ healthMonitoring.alerts.length }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-600">Last Check:</span>
                            <span class="text-xs text-gray-500">
                                {{ healthMonitoring.lastCheck ? new Date(healthMonitoring.lastCheck).toLocaleTimeString('th-TH') : 'Never' }}
                            </span>
                        </div>
                        <button @click="checkSystemHealth" 
                                class="w-full mt-2 px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors">
                            <font-awesome-icon :icon="['fas', 'sync-alt']" class="mr-1"/>
                            Check Now
                        </button>
                    </div>
                </div>

                <!-- Health Alerts -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center justify-between">
                        <div class="flex items-center">
                            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-gray-500 mr-2"/>
                            Alerts ({{ healthMonitoring.alerts.length }})
                        </div>
                        <button v-if="healthMonitoring.alerts.length > 0" @click="clearAlerts" 
                                class="text-xs text-red-600 hover:text-red-800">
                            Clear
                        </button>
                    </h3>
                    <div class="space-y-2 max-h-24 overflow-y-auto">
                        <div v-if="healthMonitoring.alerts.length === 0" class="text-xs text-gray-500 text-center py-2">
                            No alerts
                        </div>
                        <div v-else>
                            <div v-for="alert in healthMonitoring.alerts.slice(0, 3)" :key="alert.timestamp" 
                                 class="flex items-start space-x-2 p-2 rounded text-xs"
                                 :class="getAlertLevelColor(alert.level)">
                                <font-awesome-icon :icon="['fas', alert.level === 'critical' ? 'exclamation-circle' : 'exclamation-triangle']" 
                                                   class="text-xs mt-0.5 flex-shrink-0"/>
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium truncate">{{ alert.message }}</div>
                                    <div class="text-xs opacity-75">{{ new Date(alert.timestamp).toLocaleTimeString('th-TH') }}</div>
                                </div>
                            </div>
                            <button v-if="healthMonitoring.alerts.length > 3" @click="showHealthModal = true"
                                    class="w-full text-xs text-blue-600 hover:text-blue-800 py-1">
                                View all {{ healthMonitoring.alerts.length }} alerts
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Health Controls -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <font-awesome-icon :icon="['fas', 'cogs']" class="text-gray-500 mr-2"/>
                        Health Controls
                    </h3>
                    <div class="space-y-2">
                        <button @click="toggleHealthMonitoring" 
                                class="w-full text-left px-3 py-2 rounded text-sm transition-colors"
                                :class="healthMonitoring.enabled ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'">
                            <font-awesome-icon :icon="['fas', healthMonitoring.enabled ? 'pause' : 'play']" class="mr-2"/>
                            {{ healthMonitoring.enabled ? 'Disable' : 'Enable' }}
                            <span class="float-right text-xs">{{ healthMonitoring.enabled ? 'ON' : 'OFF' }}</span>
                        </button>
                        <button @click="showHealthModal = true" 
                                class="w-full text-left px-3 py-2 rounded text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
                            <font-awesome-icon :icon="['fas', 'chart-line']" class="mr-2"/>
                            Health Dashboard
                        </button>
                        <button @click="exportHealthReport" 
                                class="w-full text-left px-3 py-2 rounded text-sm bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors">
                            <font-awesome-icon :icon="['fas', 'download']" class="mr-2"/>
                            Export Report
                        </button>
                    </div>
                </div>

                <!-- System Statistics -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <font-awesome-icon :icon="['fas', 'chart-bar']" class="text-gray-500 mr-2"/>
                        Statistics
                    </h3>
                    <div class="grid grid-cols-2 gap-2 text-center">
                        <div>
                            <div class="text-lg font-bold text-blue-600">{{ statistics.totalTenants }}</div>
                            <div class="text-xs text-gray-500">Tenants</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold text-green-600">{{ statistics.activeConnections }}</div>
                            <div class="text-xs text-gray-500">Connections</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold text-purple-600">{{ statistics.commandsSent }}</div>
                            <div class="text-xs text-gray-500">Commands</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold text-orange-600">{{ statistics.messagesReceived }}</div>
                            <div class="text-xs text-gray-500">Messages</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                <!-- Tenants -->
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-sm font-medium text-gray-900 flex items-center">
                            <font-awesome-icon :icon="['fas', 'building']" class="text-gray-500 mr-2"/>
                            Tenants ({{ tenants.length }})
                        </h3>
                        <button @click="loadTenants" 
                                class="text-indigo-600 hover:text-indigo-800 text-xs">
                            Refresh
                        </button>
                    </div>
                    <div class="max-h-80 overflow-y-auto">
                        <div v-if="tenants.length === 0" class="text-center py-8 text-gray-500 text-sm">
                            <font-awesome-icon :icon="['fas', 'building']" class="text-2xl mb-2"/>
                            <p>ไม่มี Tenant</p>
                            <button @click="loadTenants" class="mt-2 text-indigo-600 hover:text-indigo-800 text-xs">
                                โหลด Tenant List
                            </button>
                        </div>
                        <div v-else class="divide-y divide-gray-100">
                            <div v-for="tenant in tenants" :key="tenant.id" 
                                 class="p-3 hover:bg-gray-50 transition-colors">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center justify-between">
                                            <h4 class="text-sm font-medium text-gray-900 truncate">{{ tenant.name }}</h4>
                                            <span class="ml-2 px-2 py-0.5 text-xs rounded-full" :class="getTenantStatusColor(tenant.status)">
                                                {{ tenant.status }}
                                            </span>
                                        </div>
                                        <div class="flex items-center justify-between mt-1">
                                            <p class="text-xs text-gray-500 truncate">{{ tenant.id }}</p>
                                            <div class="flex items-center space-x-1">
                                                <span class="text-xs font-medium text-gray-700">{{ tenant && tenant.id ? safeGetClientCount(tenant.id) : 0 }}</span>
                                                <span class="text-xs text-gray-500">clients</span>
                                                <div v-if="realTimeEnabled" class="w-1 h-1 bg-green-500 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div class="flex items-center space-x-2 mt-2">
                                            <button @click="selectedTenant = tenant; showClientsModal = true" 
                                                    class="text-xs text-green-600 hover:text-green-800">
                                                ดู Clients
                                            </button>
                                            <button @click="editTenant(tenant)" 
                                                    class="text-xs text-blue-600 hover:text-blue-800">
                                                แก้ไข
                                            </button>
                                            <button @click="deleteTenant(tenant)" 
                                                    class="text-xs text-red-600 hover:text-red-800">
                                                ลบ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Online Clients -->
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-sm font-medium text-gray-900 flex items-center">
                            <font-awesome-icon :icon="['fas', 'users']" class="text-gray-500 mr-2"/>
                            Online Clients ({{ onlineClients.length }})
                        </h3>
                        <div class="flex items-center space-x-2">
                            <span v-if="isRefreshing" class="text-xs text-gray-500">
                                <font-awesome-icon :icon="['fas', 'sync-alt']" class="animate-spin mr-1"/>
                                Refreshing...
                            </span>
                            <button @click="refreshClients" 
                                    class="text-purple-600 hover:text-purple-800 text-xs">
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div class="max-h-80 overflow-y-auto">
                        <div v-if="onlineClients.length === 0" class="text-center py-8 text-gray-500 text-sm">
                            <font-awesome-icon :icon="['fas', 'users']" class="text-2xl mb-2"/>
                            <p>ไม่มี Client ออนไลน์</p>
                        </div>
                        <div v-else class="divide-y divide-gray-100">
                            <div v-for="client in onlineClients" :key="`${client.clientId}-${client.tenantId}`" 
                                 @click="selectClient(client)"
                                 class="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                 :class="[
                                     selectedClient && selectedClient.clientId === client.clientId && selectedClient.tenantId === client.tenantId
                                         ? 'bg-blue-50 border-l-2 border-blue-500' 
                                         : ''
                                 ]">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center space-x-2">
                                                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span class="text-sm font-medium text-gray-900 truncate">{{ client.clientId }}</span>
                                                <span v-if="selectedClient && selectedClient.clientId === client.clientId && selectedClient.tenantId === client.tenantId" 
                                                      class="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded">
                                                    Selected
                                                </span>
                                            </div>
                                            <span class="px-2 py-0.5 text-xs rounded-full" :class="getClientStatusColor(client.status)">
                                                {{ client.status }}
                                            </span>
                                        </div>
                                        <div class="flex items-center justify-between mt-1">
                                            <span class="text-xs text-gray-500">{{ client.tenantId }}</span>
                                            <span class="text-xs text-gray-400">{{ new Date(client.lastSeen).toLocaleTimeString('th-TH') }}</span>
                                        </div>
                                        <div class="flex items-center space-x-2 mt-2">
                                            <button @click.stop="sendCommandToSpecificClient(client)" 
                                                    class="text-xs text-blue-600 hover:text-blue-800">
                                                ส่งคำสั่ง
                                            </button>
                                            <button @click.stop="disconnectClient(client)" 
                                                    class="text-xs text-red-600 hover:text-red-800">
                                                ตัดการเชื่อมต่อ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-lg shadow-sm mt-4">
                <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-sm font-medium text-gray-900 flex items-center">
                        <font-awesome-icon :icon="['fas', 'clock']" class="text-gray-500 mr-2"/>
                        Recent Activity
                    </h3>
                    <button @click="showLogsModal = true" 
                            class="text-blue-600 hover:text-blue-800 text-xs">
                        View All
                    </button>
                </div>
                <div class="max-h-60 overflow-y-auto">
                    <div v-if="logs.length === 0" class="text-center py-6 text-gray-500 text-sm">
                        ยังไม่มี Activity
                    </div>
                    <div v-else class="divide-y divide-gray-100">
                        <div v-for="log in logs.slice(0, 8)" :key="log.id" 
                             class="px-4 py-2 text-xs hover:bg-gray-50">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <span class="font-medium text-gray-700">[{{ log.type.toUpperCase() }}]</span>
                                    <span class="ml-2 text-gray-600">{{ log.message }}</span>
                                </div>
                                <span class="text-gray-400 ml-2">
                                    {{ new Date(log.timestamp).toLocaleTimeString('th-TH') }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Simplified Tenant Modal -->
    <div v-if="showTenantModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">เพิ่ม Tenant ใหม่</h3>
                <button @click="showTenantModal = false" class="text-gray-400 hover:text-gray-600">
                    <font-awesome-icon :icon="['fas', 'times']"/>
                </button>
            </div>
            
            <form @submit.prevent="createTenant" class="p-4 space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                    <input v-model="newTenant.subdomain" 
                           type="text" 
                           class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5"
                           placeholder="tenant1"
                           required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ Tenant</label>
                    <input v-model="newTenant.name" 
                           type="text" 
                           class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5"
                           placeholder="บริษัท ABC"
                           required>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">อุตสาหกรรม</label>
                        <select v-model="newTenant.industry" 
                                class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5">
                            <option value="general">ทั่วไป</option>
                            <option value="education">การศึกษา</option>
                            <option value="healthcare">สาธารณสุข</option>
                            <option value="finance">การเงิน</option>
                            <option value="technology">เทคโนโลยี</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">แผน</label>
                        <select v-model="newTenant.plan" 
                                class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5">
                            <option value="free">Free</option>
                            <option value="basic">Basic</option>
                            <option value="premium">Premium</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-2 pt-3">
                    <button type="button" 
                            @click="showTenantModal = false"
                            class="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                        ยกเลิก
                    </button>
                    <button type="submit" 
                            class="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                        สร้าง Tenant
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Simplified Command Modal -->
    <div v-if="showCommandModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">
                    ส่งคำสั่ง
                    <span v-if="selectedClient" class="ml-2 text-sm text-blue-600">
                        → {{ selectedClient.clientId }}
                    </span>
                </h3>
                <button @click="showCommandModal = false; resetCommandForm()" class="text-gray-400 hover:text-gray-600">
                    <font-awesome-icon :icon="['fas', 'times']"/>
                </button>
            </div>
            
            <form @submit.prevent="sendCommand" class="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">ประเภทคำสั่ง</label>
                        <select v-model="commandForm.type" 
                                class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5"
                                required>
                            <option value="">เลือกประเภท</option>
                            <option value="notification">📢 Notification</option>
                            <option value="message">💬 Message</option>
                            <option value="quiz">📝 Quiz</option>
                            <option value="assignment">📋 Assignment</option>
                            <option value="update">🔄 Update</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">เป้าหมาย</label>
                        <select v-model="commandForm.target" 
                                class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5">
                            <option value="all">ทุก Client</option>
                            <option v-if="selectedClient" :value="`client:${selectedClient.clientId}:${selectedClient.tenantId}`">
                                🎯 {{ selectedClient.clientId }}
                            </option>
                            <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                                🏢 {{ tenant.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <!-- Title field (for most command types) -->
                <div v-if="commandForm.type && commandForm.type !== 'update'">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        หัวข้อ
                        <span v-if="commandForm.type === 'notification'" class="text-xs text-gray-500">(แจ้งเตือน)</span>
                        <span v-if="commandForm.type === 'quiz'" class="text-xs text-gray-500">(ชื่อแบบทดสอบ)</span>
                        <span v-if="commandForm.type === 'assignment'" class="text-xs text-gray-500">(ชื่องาน)</span>
                    </label>
                    <input v-model="commandForm.title" 
                           type="text" 
                           class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5"
                           :placeholder="commandForm.type === 'notification' ? 'แจ้งเตือนสำคัญ' : 
                                        commandForm.type === 'quiz' ? 'แบบทดสอบบทที่ 1' : 
                                        commandForm.type === 'assignment' ? 'งานที่ 1' : 'หัวข้อ'">
                </div>
                
                <!-- Message field (required for all) -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        ข้อความ <span class="text-red-500">*</span>
                        <span v-if="commandForm.type === 'update'" class="text-xs text-gray-500">(การกระทำ)</span>
                    </label>
                    <textarea v-model="commandForm.message" 
                              class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                              rows="3"
                              :placeholder="commandForm.type === 'notification' ? 'ระบบจะปิดปรับปรุงในวันที่ 15 มีนาคม' : 
                                           commandForm.type === 'message' ? 'สวัสดีครับ มีประกาศสำคัญ...' :
                                           commandForm.type === 'quiz' ? 'แบบทดสอบเกี่ยวกับเนื้อหาที่เรียนไปแล้ว' :
                                           commandForm.type === 'assignment' ? 'ให้ทำการบ้านหน้า 25-30' :
                                           commandForm.type === 'update' ? 'restart server' : 'พิมพ์ข้อความที่ต้องการส่ง...'"
                              required></textarea>
                </div>

                <!-- Additional fields based on command type -->
                <div v-if="commandForm.type === 'quiz'" class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">จำนวนข้อ</label>
                        <input v-model.number="commandForm.questions" 
                               type="number" 
                               min="1" 
                               max="100"
                               class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">เวลา (นาที)</label>
                        <input v-model.number="commandForm.timeLimit" 
                               type="number" 
                               min="1" 
                               max="180"
                               class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5">
                    </div>
                </div>

                <div v-if="commandForm.type === 'assignment'">
                    <label class="block text-sm font-medium text-gray-700 mb-1">กำหนดส่ง</label>
                    <input v-model="commandForm.dueDate" 
                           type="date" 
                           class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5"
                           :min="new Date().toISOString().split('T')[0]">
                </div>

                <div v-if="commandForm.type === 'update'" class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">คอมโพเนนต์</label>
                        <select v-model="commandForm.component" 
                                class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5">
                            <option value="system">System</option>
                            <option value="client">Client</option>
                            <option value="server">Server</option>
                            <option value="database">Database</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">เวอร์ชัน</label>
                        <input v-model="commandForm.version" 
                               type="text" 
                               class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5"
                               placeholder="1.0.0">
                    </div>
                </div>

                <!-- Priority and Urgent options -->
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">ความสำคัญ</label>
                        <select v-model="commandForm.priority" 
                                class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5">
                            <option value="low">🟢 ต่ำ</option>
                            <option value="normal">🟡 ปกติ</option>
                            <option value="high">🟠 สูง</option>
                            <option value="critical">🔴 วิกฤต</option>
                        </select>
                    </div>
                    <div v-if="commandForm.type === 'notification' || commandForm.type === 'message'">
                        <label class="block text-sm font-medium text-gray-700 mb-1">ด่วน</label>
                        <label class="flex items-center mt-2">
                            <input v-model="commandForm.urgent" 
                                   type="checkbox" 
                                   class="rounded border-gray-300 text-red-600 focus:border-red-500 focus:ring-red-500">
                            <span class="ml-2 text-sm text-gray-700">แจ้งเตือนด่วน</span>
                        </label>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                    <button type="button" 
                            @click="showCommandModal = false; resetCommandForm()"
                            class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                        ยกเลิก
                    </button>
                    <button type="submit" 
                            :disabled="commandForm.loading || !commandForm.type || !commandForm.message"
                            class="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <font-awesome-icon v-if="commandForm.loading" :icon="['fas', 'spinner']" class="animate-spin mr-2"/>
                        {{ commandForm.loading ? 'กำลังส่ง...' : 'ส่งคำสั่ง' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Simplified Logs Modal -->
    <div v-if="showLogsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-80 overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Activity Logs</h3>
                <button @click="showLogsModal = false" class="text-gray-400 hover:text-gray-600">
                    <font-awesome-icon :icon="['fas', 'times']"/>
                </button>
            </div>
            
            <div class="p-4 overflow-y-auto max-h-64">
                <div v-if="logs.length === 0" class="text-center py-8 text-gray-500 text-sm">
                    ยังไม่มี logs
                </div>
                <div v-else class="space-y-2">
                    <div v-for="log in logs" :key="log.id" 
                         class="p-2 bg-gray-50 rounded text-xs">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="font-medium text-gray-900">[{{ log.type.toUpperCase() }}]</span>
                                <span class="ml-2 text-gray-700">{{ log.message }}</span>
                            </div>
                            <span class="text-gray-500 ml-2">{{ formatDate(log.timestamp) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Simplified Clients Modal -->
    <div v-if="showClientsModal && selectedTenant" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-80 overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b border-gray-200">
                <div>
                    <h3 class="text-lg font-medium text-gray-900">Clients in {{ selectedTenant.name }}</h3>
                    <p class="text-xs text-gray-500">{{ selectedTenant.id }}</p>
                </div>
                <button @click="showClientsModal = false" class="text-gray-400 hover:text-gray-600">
                    <font-awesome-icon :icon="['fas', 'times']"/>
                </button>
            </div>
            
            <div class="p-4 overflow-y-auto max-h-64">
                <div v-if="selectedTenant && selectedTenant.id && getClientsForTenant(selectedTenant.id).length === 0" class="text-center py-8 text-gray-500 text-sm">
                    ไม่มี Client ออนไลน์ใน Tenant นี้
                </div>
                <div v-else class="space-y-2">
                    <div v-for="client in selectedTenant && selectedTenant.id ? getClientsForTenant(selectedTenant.id) : []" :key="client.clientId" 
                         class="p-3 border rounded-lg hover:bg-gray-50">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2">
                                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span class="font-medium text-gray-900 text-sm">{{ client.clientId }}</span>
                                    <span class="px-2 py-0.5 text-xs rounded-full" :class="getClientStatusColor(client.status)">
                                        {{ client.status }}
                                    </span>
                                </div>
                                <div class="text-xs text-gray-500 mt-1">
                                    Connected: {{ formatDate(client.connectedAt) }}
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <button @click="sendCommandToClient(client)" 
                                        class="text-xs text-blue-600 hover:text-blue-800">
                                    ส่งคำสั่ง
                                </button>
                                <button @click="disconnectClient(client)" 
                                        class="text-xs text-red-600 hover:text-red-800">
                                    ตัด
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Tenant Modal (Simplified) -->
    <div v-if="showEditTenantModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">แก้ไข Tenant</h3>
                <button @click="cancelEditTenant" class="text-gray-400 hover:text-gray-600">
                    <font-awesome-icon :icon="['fas', 'times']"/>
                </button>
            </div>
            
            <form @submit.prevent="updateTenant" class="p-4 space-y-3" v-if="editingTenant">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                    <input v-model="editingTenant.id" 
                           type="text" 
                           class="w-full text-sm rounded border-gray-300 bg-gray-100 text-gray-500 py-1.5"
                           readonly>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ Tenant</label>
                    <input v-model="editingTenant.name" 
                           type="text" 
                           class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5"
                           required>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                        <select v-model="editingTenant.status" 
                                class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">แผน</label>
                        <select v-model="editingTenant.metadata.plan" 
                                class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-1.5">
                            <option value="free">Free</option>
                            <option value="basic">Basic</option>
                            <option value="premium">Premium</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-2 pt-3">
                    <button type="button" 
                            @click="cancelEditTenant"
                            class="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                        ยกเลิก
                    </button>
                    <button type="submit" 
                            class="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                        บันทึก
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Health Dashboard Modal -->
    <div v-if="showHealthModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900 flex items-center">
                    <font-awesome-icon :icon="['fas', 'heartbeat']" class="text-red-500 mr-2"/>
                    Health Monitoring Dashboard
                </h3>
                <button @click="showHealthModal = false" class="text-gray-400 hover:text-gray-600">
                    <font-awesome-icon :icon="['fas', 'times']"/>
                </button>
            </div>
            
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <!-- Global Health Overview -->
                <div class="mb-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">Global System Health</h4>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="bg-gray-50 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold" :class="getHealthStatusColor(healthMonitoring.globalHealth.status).split(' ')[0]">
                                {{ healthMonitoring.globalHealth.status.toUpperCase() }}
                            </div>
                            <div class="text-sm text-gray-600">Overall Status</div>
                        </div>
                        <div class="bg-green-50 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-green-600">
                                {{ healthMonitoring.globalHealth.summary.healthyTenants }}
                            </div>
                            <div class="text-sm text-gray-600">Healthy Tenants</div>
                        </div>
                        <div class="bg-yellow-50 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-yellow-600">
                                {{ healthMonitoring.globalHealth.summary.warningTenants }}
                            </div>
                            <div class="text-sm text-gray-600">Warning Tenants</div>
                        </div>
                        <div class="bg-red-50 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-red-600">
                                {{ healthMonitoring.globalHealth.summary.unhealthyTenants }}
                            </div>
                            <div class="text-sm text-gray-600">Unhealthy Tenants</div>
                        </div>
                    </div>
                </div>

                <!-- Tenant Health List -->
                <div class="mb-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">Tenant Health Status</h4>
                    <div class="space-y-3">
                        <div v-if="healthMonitoring.globalHealth.tenants.length === 0" class="text-center py-8 text-gray-500">
                            No tenant health data available
                        </div>
                        <div v-else>
                            <div v-for="tenant in healthMonitoring.globalHealth.tenants" :key="tenant.tenantId" 
                                 class="bg-white border rounded-lg p-4">
                                <div class="flex items-start justify-between">
                                    <div>
                                        <div class="flex items-center space-x-3">
                                            <font-awesome-icon :icon="['fas', getHealthStatusIcon(tenant.status)]" 
                                                               :class="getHealthStatusColor(tenant.status).split(' ')[0]"/>
                                            <div>
                                                <h5 class="font-medium text-gray-900">{{ tenant.tenantName }}</h5>
                                                <p class="text-sm text-gray-600">{{ tenant.tenantId }}</p>
                                            </div>
                                        </div>
                                        <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span class="text-gray-600">Connections:</span>
                                                <span class="ml-1 font-medium">{{ tenant.connections.active }}</span>
                                            </div>
                                            <div>
                                                <span class="text-gray-600">Uptime:</span>
                                                <span class="ml-1 font-medium">{{ tenant.uptime.formatted }}</span>
                                            </div>
                                            <div>
                                                <span class="text-gray-600">Error Rate:</span>
                                                <span class="ml-1 font-medium">{{ tenant.performance.errorRate.toFixed(1) }}%</span>
                                            </div>
                                            <div>
                                                <span class="text-gray-600">Messages:</span>
                                                <span class="ml-1 font-medium">{{ tenant.performance.messagesProcessed }}</span>
                                            </div>
                                        </div>
                                        <div v-if="tenant.issues.length > 0" class="mt-3">
                                            <div class="text-sm font-medium text-red-600 mb-1">Issues:</div>
                                            <ul class="list-disc list-inside text-sm text-red-600 space-y-1">
                                                <li v-for="issue in tenant.issues" :key="issue">{{ issue }}</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="px-3 py-1 rounded-full text-xs font-medium"
                                             :class="getHealthStatusColor(tenant.status)">
                                            {{ tenant.status }}
                                        </div>
                                        <div class="text-xs text-gray-500 mt-1">
                                            Last check: {{ new Date(tenant.timestamp).toLocaleTimeString('th-TH') }}
                                        </div>
                                        <button @click="checkTenantHealth(tenant.tenantId)"
                                                class="mt-2 px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100">
                                            Check Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Health Alerts -->
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-md font-medium text-gray-900">Health Alerts</h4>
                        <div class="space-x-2">
                            <button @click="clearAlertsByType('system')"
                                    class="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100">
                                Clear System
                            </button>
                            <button @click="clearAlertsByType('tenant')"
                                    class="px-3 py-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100">
                                Clear Tenant
                            </button>
                            <button @click="clearAlerts"
                                    class="px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100">
                                Clear All
                            </button>
                        </div>
                    </div>
                    <div class="space-y-2 max-h-64 overflow-y-auto">
                        <div v-if="healthMonitoring.alerts.length === 0" class="text-center py-8 text-gray-500">
                            No alerts
                        </div>
                        <div v-else>
                            <div v-for="alert in healthMonitoring.alerts" :key="alert.timestamp" 
                                 class="border rounded-lg p-3"
                                 :class="getAlertLevelColor(alert.level)">
                                <div class="flex items-start space-x-3">
                                    <font-awesome-icon :icon="['fas', alert.level === 'critical' ? 'exclamation-circle' : 'exclamation-triangle']" 
                                                       class="text-lg mt-0.5 flex-shrink-0"/>
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between">
                                            <div class="font-medium">{{ alert.message }}</div>
                                            <div class="text-xs">{{ alert.level.toUpperCase() }}</div>
                                        </div>
                                        <div class="text-sm opacity-75 mt-1">
                                            Type: {{ alert.type }} | 
                                            Time: {{ new Date(alert.timestamp).toLocaleString('th-TH') }}
                                        </div>
                                        <div v-if="alert.details && Array.isArray(alert.details)" class="text-sm mt-2">
                                            <ul class="list-disc list-inside space-y-1">
                                                <li v-for="detail in alert.details" :key="detail">{{ detail }}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Health Monitoring Settings -->
                <div>
                    <h4 class="text-md font-medium text-gray-900 mb-4">Monitoring Settings</h4>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Monitoring Status
                                </label>
                                <button @click="toggleHealthMonitoring" 
                                        class="w-full px-3 py-2 rounded text-sm font-medium transition-colors"
                                        :class="healthMonitoring.enabled ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-600 text-white hover:bg-gray-700'">
                                    {{ healthMonitoring.enabled ? 'Enabled' : 'Disabled' }}
                                </button>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Check Interval
                                </label>
                                <select v-model="healthMonitoring.interval" 
                                        @change="healthMonitoring.enabled && (stopHealthMonitoring(), startHealthMonitoring())"
                                        class="w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                    <option :value="15000">15 seconds</option>
                                    <option :value="30000">30 seconds</option>
                                    <option :value="60000">1 minute</option>
                                    <option :value="300000">5 minutes</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Actions
                                </label>
                                <div class="space-y-2">
                                    <button @click="checkSystemHealth"
                                            class="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Run Check Now
                                    </button>
                                    <button @click="exportHealthReport"
                                            class="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                                        Export Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Tenant Modal -->
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