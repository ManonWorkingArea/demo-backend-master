/**
 * Shared Gateway Service
 * ตัวกลางในการจัดการ logic ร่วมกันระหว่าง Host และ Client
 */
import ConnectionGatewayService from './ConnectionGatewayService.js';

class SharedGatewayService {
    constructor() {
        this.baseService = ConnectionGatewayService;
        this.componentType = 'unknown'; // 'host' หรือ 'client'
        this.isInitialized = false;
        
        // Shared state
        this.tenants = [];
        this.onlineClients = [];
        this.logs = [];
        this.statistics = {
            totalTenants: 0,
            activeConnections: 0,
            commandsSent: 0,
            messagesReceived: 0
        };
        
        // Real-time status
        this.webSocketStatus = 'disconnected';
        this.realTimeEnabled = false;
        this.lastWebSocketUpdate = null;
        
        // Configuration
        this.config = {
            autoRefreshInterval: 30000,
            maxLogs: 100,
            maxTenants: 1000
        };
        
        // Event listeners storage
        this.eventListeners = new Map();
        
        this.initialize();
    }
    
    /**
     * Initialize shared service
     */
    initialize() {
        this.addLog('system', 'Shared Gateway Service initialized');
        this.isInitialized = true;
    }
    
    /**
     * Set component type (host or client)
     */
    setComponentType(type) {
        this.componentType = type;
        this.addLog('system', `Component type set to: ${type}`);
    }
    
    /**
     * TENANT MANAGEMENT - ใช้ร่วมกันได้
     */
    
    // โหลด tenant list (ใช้ได้ทั้ง host และ client)
    async loadTenants() {
        try {
            this.addLog('info', '🔄 กำลังโหลด tenant list จาก Cloudflare...');
            
            const tenants = await this.baseService.fetchAllTenants();
            
            if (tenants && Array.isArray(tenants)) {
                this.tenants = tenants.map(tenant => ({
                    id: String(tenant.id || tenant.tenantId),
                    tenantId: String(tenant.id || tenant.tenantId),
                    name: tenant.name || String(tenant.id || tenant.tenantId),
                    subdomain: String(tenant.id || tenant.tenantId),
                    status: tenant.status || 'active',
                    connections: 0,
                    lastActivity: tenant.lastActivity || new Date(),
                    createdAt: tenant.createdAt || tenant.metadata?.createdAt || new Date(),
                    metadata: tenant.metadata || {},
                    config: tenant.config || {}
                }));
            } else {
                this.tenants = [];
            }
            
            this.addLog('success', `✅ โหลด tenant list สำเร็จ: ${this.tenants.length} tenant(s)`);
            this.updateStatistics();
            
            return this.tenants;
        } catch (error) {
            console.error('Failed to load tenants:', error);
            this.addLog('error', `❌ ไม่สามารถโหลดรายการ tenant ได้: ${error.message}`);
            this.tenants = [];
            return [];
        }
    }
    
    // Refresh tenant list
    async refreshTenants() {
        this.addLog('info', '🔄 Refreshing tenant list...');
        try {
            const result = await this.loadTenants();
            this.addLog('success', '✅ Tenant list refreshed successfully');
            return result;
        } catch (error) {
            this.addLog('error', `❌ Failed to refresh tenant list: ${error.message}`);
            throw error;
        }
    }
    
    // Get tenants (สำหรับ component)
    getTenants() {
        return this.tenants;
    }
    
    // สร้าง tenant ใหม่
    async createTenant(tenantData) {
        try {
            const tenant = await this.baseService.registerTenant(tenantData);
            await this.refreshTenants(); // รีเฟรชหลังสร้าง
            return tenant;
        } catch (error) {
            this.addLog('error', `Failed to create tenant: ${error.message}`);
            throw error;
        }
    }
    
    // ลบ tenant
    async deleteTenant(tenantId) {
        try {
            await this.baseService.deleteTenant(tenantId);
            await this.refreshTenants(); // รีเฟรชหลังลบ
            return true;
        } catch (error) {
            this.addLog('error', `Failed to delete tenant: ${error.message}`);
            throw error;
        }
    }
    
    // อัปเดต tenant
    async updateTenant(tenantId, updates) {
        try {
            const result = await this.baseService.updateTenant(tenantId, updates);
            await this.refreshTenants(); // รีเฟรชหลังอัปเดต
            return result;
        } catch (error) {
            this.addLog('error', `Failed to update tenant: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * CLIENT MANAGEMENT - สำหรับ Host
     */
    
    // Handle client connection update
    handleClientConnectionUpdate(clientData) {
        console.log('SharedService: handleClientConnectionUpdate called', {
            componentType: this.componentType,
            clientData: clientData
        });
        
        if (this.componentType !== 'host') {
            console.log('SharedService: Not a host component, ignoring client update');
            return; // เฉพาะ host เท่านั้น
        }
        
        if (clientData.isConnecting) {
            // เพิ่มหรืออัปเดต client
            const existingIndex = this.onlineClients.findIndex(
                c => c.clientId === clientData.clientId && c.tenantId === clientData.tenantId
            );
            
            const client = {
                clientId: clientData.clientId,
                tenantId: clientData.tenantId,
                status: 'connected',
                connectedAt: clientData.timestamp,
                lastSeen: clientData.timestamp,
                ipAddress: clientData.ipAddress || 'N/A',
                userAgent: clientData.userAgent || 'N/A'
            };
            
            if (existingIndex === -1) {
                this.onlineClients.push(client);
                this.addLog('client_connected', `Client ${clientData.clientId} connected to tenant ${clientData.tenantId}`);
                console.log('SharedService: Added new client', client);
            } else {
                this.onlineClients[existingIndex] = { ...this.onlineClients[existingIndex], ...client };
                console.log('SharedService: Updated existing client', client);
            }
        } else {
            // ลบ client
            const clientIndex = this.onlineClients.findIndex(
                c => c.clientId === clientData.clientId && c.tenantId === clientData.tenantId
            );
            if (clientIndex !== -1) {
                this.onlineClients.splice(clientIndex, 1);
                this.addLog('client_disconnected', `Client ${clientData.clientId} disconnected from tenant ${clientData.tenantId}`);
                console.log('SharedService: Removed client', clientData.clientId);
            }
        }
        
        console.log('SharedService: Current online clients count:', this.onlineClients.length);
        
        this.updateStatistics();
        this.updateTenantConnectionCounts();
        
        // Update WebSocket status based on client connections
        this.updateWebSocketStatus();
    }
    
    /**
     * WebSocket Status Management
     */
    updateWebSocketStatus() {
        const hasConnections = this.onlineClients.length > 0;
        const newStatus = hasConnections ? 'connected' : 'disconnected';
        
        if (this.webSocketStatus !== newStatus) {
            console.log('SharedService: WebSocket status changing from', this.webSocketStatus, 'to', newStatus);
            this.webSocketStatus = newStatus;
            this.realTimeEnabled = hasConnections;
            this.lastWebSocketUpdate = hasConnections ? new Date() : null;
            
            this.addLog('system', `⚡ Real-time mode ${hasConnections ? 'activated' : 'deactivated'} - WebSocket ${newStatus}`);
        }
    }
    
    // Method สำหรับ set WebSocket status manually
    setWebSocketStatus(status, enabled = null) {
        this.webSocketStatus = status;
        this.realTimeEnabled = enabled !== null ? enabled : (status === 'connected');
        this.lastWebSocketUpdate = this.realTimeEnabled ? new Date() : null;
        
        console.log('SharedService: Manual WebSocket status update:', {
            status: this.webSocketStatus,
            enabled: this.realTimeEnabled
        });
    }
    
    // Handle client heartbeat
    handleClientHeartbeat(heartbeatData) {
        if (this.componentType !== 'host') return;
        
        const clientIndex = this.onlineClients.findIndex(
            c => c.clientId === heartbeatData.clientId && c.tenantId === heartbeatData.tenantId
        );
        
        if (clientIndex !== -1) {
            this.onlineClients[clientIndex].lastSeen = heartbeatData.timestamp;
            this.onlineClients[clientIndex].status = 'connected';
        } else {
            // เพิ่ม client ใหม่จาก heartbeat
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
        
        this.updateStatistics();
    }
    
    // Get clients for tenant
    getClientsForTenant(tenantId) {
        if (!tenantId) return [];
        const tenantIdString = String(tenantId);
        return this.onlineClients.filter(client => client && client.tenantId === tenantIdString);
    }
    
    // Get all online clients
    getOnlineClients() {
        return this.onlineClients;
    }
    
    // Force disconnect client
    disconnectClient(client) {
        const disconnectEvent = new CustomEvent('force-client-disconnect', {
            detail: {
                clientId: client.clientId,
                tenantId: client.tenantId,
                reason: 'Admin disconnection'
            }
        });
        window.dispatchEvent(disconnectEvent);
        
        // ลบจาก local list
        const clientIndex = this.onlineClients.findIndex(
            c => c.clientId === client.clientId && c.tenantId === client.tenantId
        );
        if (clientIndex !== -1) {
            this.onlineClients.splice(clientIndex, 1);
            this.addLog('admin_disconnect', `Admin disconnected client ${client.clientId} from tenant ${client.tenantId}`);
            this.updateStatistics();
        }
    }
    
    // อัปเดต connection count ของ tenant
    updateTenantConnectionCounts() {
        this.tenants.forEach(tenant => {
            const connectionCount = this.getClientsForTenant(tenant.id).length;
            if (tenant.connections !== connectionCount) {
                tenant.connections = connectionCount;
                tenant.lastActivity = new Date();
            }
        });
    }
    
    /**
     * COMMAND MANAGEMENT
     */
    
    // ส่งคำสั่ง
    async sendCommand(commandForm) {
        try {
            const command = {
                type: commandForm.type,
                payload: typeof commandForm.payload === 'string' ? JSON.parse(commandForm.payload) : commandForm.payload,
                target: commandForm.target,
                metadata: {
                    priority: commandForm.priority || 'normal',
                    source: this.componentType === 'host' ? 'admin-panel' : 'client-panel'
                }
            };
            
            // ส่งผ่าน base service
            await this.baseService.sendCommand(command);
            
            this.addLog('success', `คำสั่ง ${command.type} ถูกส่งไปยัง ${command.target} แล้ว`);
            return true;
        } catch (error) {
            this.addLog('error', `Failed to send command: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * CONNECTION MANAGEMENT - สำหรับ Client
     */
    
    // เชื่อมต่อ Gateway (สำหรับ client)
    async connectToGateway(clientConfig, selectedTenant) {
        if (this.componentType !== 'client') return;
        
        try {
            const clientData = {
                clientId: clientConfig.clientId,
                tenantId: selectedTenant,
                subdomain: clientConfig.subdomain,
                wsUrl: this.baseService.generateWebSocketUrl(selectedTenant),
                isConnecting: true,
                timestamp: new Date(),
                userAgent: navigator.userAgent,
                ipAddress: 'simulated-ip'
            };
            
            // Register with service
            this.baseService.registerClient(clientData);
            
            this.addLog('success', `Connected to gateway as ${clientConfig.clientId} on tenant ${selectedTenant}`);
            
            // Notify Gateway about connection
            console.log('SharedService: Client notifying gateway about connection', clientData);
            this.notifyGatewayConnection(clientData, true);
            
            // เพิ่ม event เพื่อบอก host ว่ามี client connection
            setTimeout(() => {
                console.log('SharedService: Sending delayed connection update');
                const delayedEvent = new CustomEvent('client-connection-update', {
                    detail: { ...clientData, isConnecting: true }
                });
                window.dispatchEvent(delayedEvent);
            }, 500);
            
            return true;
        } catch (error) {
            this.addLog('error', `Connection failed: ${error.message}`);
            throw error;
        }
    }
    
    // ตัดการเชื่อมต่อ (สำหรับ client)
    disconnect(clientConfig, selectedTenant) {
        if (this.componentType !== 'client') return;
        
        // Notify Gateway about disconnection
        const clientData = {
            clientId: clientConfig.clientId,
            tenantId: selectedTenant,
            isConnecting: false,
            timestamp: new Date()
        };
        this.notifyGatewayConnection(clientData, false);
        
        // Unregister from service
        this.baseService.unregisterClient(clientConfig.clientId, selectedTenant);
        
        this.addLog('info', 'Disconnected from gateway');
    }
    
    // แจ้ง Gateway เกี่ยวกับการเชื่อมต่อ
    notifyGatewayConnection(clientData, isConnecting) {
        const event = new CustomEvent('client-connection-update', {
            detail: { ...clientData, isConnecting }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * LOGGING - ใช้ร่วมกัน
     */
    
    addLog(type, message) {
        // ใช้ base service สำหรับ logging
        this.baseService.addLog(type, message);
        
        // อัปเดต local logs
        this.logs = this.baseService.getRecentLogs(this.config.maxLogs);
    }
    
    getLogs() {
        return this.logs;
    }
    
    clearLogs() {
        this.logs = [];
        this.baseService.clearLogs();
    }
    
    /**
     * STATISTICS - ใช้ร่วมกัน
     */
    
    updateStatistics() {
        this.statistics = {
            totalTenants: this.tenants.length,
            activeConnections: this.onlineClients.length,
            commandsSent: this.baseService.getStatistics().commandsSent || 0,
            messagesReceived: this.baseService.getStatistics().messagesReceived || 0
        };
    }
    
    getStatistics() {
        return this.statistics;
    }
    
    /**
     * EVENT MANAGEMENT - ใช้ร่วมกัน
     */
    
    // Setup event listeners สำหรับ component
    setupEventListeners(component) {
        const listeners = [];
        
        if (this.componentType === 'host') {
            // Host-specific events
            const clientConnectionHandler = (event) => {
                console.log('SharedService: Received client-connection-update', event.detail);
                this.handleClientConnectionUpdate(event.detail);
                
                // Force sync with component
                this.syncWithComponent(component);
                
                // Update component statistics
                if (component.updateStatistics) {
                    component.updateStatistics();
                }
                
                // Force Vue reactivity update
                if (component.$forceUpdate) {
                    component.$forceUpdate();
                }
                
                console.log('SharedService: Updated component data', {
                    onlineClients: this.onlineClients.length,
                    tenants: this.tenants.length
                });
            };
            
            const clientHeartbeatHandler = (event) => {
                console.log('SharedService: Received client-heartbeat', event.detail);
                this.handleClientHeartbeat(event.detail);
                
                // Force sync with component
                this.syncWithComponent(component);
                
                // Update component statistics
                if (component.updateStatistics) {
                    component.updateStatistics();
                }
            };
            
            window.addEventListener('client-connection-update', clientConnectionHandler);
            window.addEventListener('client-heartbeat', clientHeartbeatHandler);
            
            listeners.push(
                { event: 'client-connection-update', handler: clientConnectionHandler },
                { event: 'client-heartbeat', handler: clientHeartbeatHandler }
            );
        }
        
        if (this.componentType === 'client') {
            // Client-specific events
            const gatewayCommandHandler = (event) => {
                if (component.receiveCommand) {
                    component.receiveCommand(event.detail);
                }
            };
            
            window.addEventListener('gateway-command', gatewayCommandHandler);
            listeners.push({ event: 'gateway-command', handler: gatewayCommandHandler });
        }
        
        // Store listeners for cleanup
        this.eventListeners.set(component, listeners);
        
        return listeners;
    }
    
    // Cleanup event listeners
    cleanupEventListeners(component) {
        const listeners = this.eventListeners.get(component);
        if (listeners) {
            listeners.forEach(({ event, handler }) => {
                window.removeEventListener(event, handler);
            });
            this.eventListeners.delete(component);
        }
    }
    
    /**
     * UTILITY FUNCTIONS
     */
    
    formatDate(date) {
        return new Date(date).toLocaleString('th-TH');
    }
    
    generateClientId(prefix = 'client') {
        return this.baseService.generateClientId(prefix);
    }
    
    generateWebSocketUrl(tenantId) {
        return this.baseService.generateWebSocketUrl(tenantId);
    }
    
    /**
     * STATE MANAGEMENT
     */
    
    // สำหรับ component เรียกใช้เพื่อ sync ข้อมูล
    syncWithComponent(component) {
        console.log('SharedService: syncWithComponent called', {
            componentType: this.componentType,
            serviceData: {
                tenants: this.tenants.length,
                onlineClients: this.onlineClients.length,
                logs: this.logs.length,
                webSocketStatus: this.webSocketStatus,
                realTimeEnabled: this.realTimeEnabled
            }
        });
        
        // ส่งข้อมูลไปยัง component
        component.tenants = [...this.tenants]; // ใช้ spread operator เพื่อ force reactivity
        
        if (this.componentType === 'host') {
            component.onlineClients = [...this.onlineClients]; // ใช้ spread operator เพื่อ force reactivity
            
            // Sync WebSocket status สำหรับ Host
            component.webSocketStatus = this.webSocketStatus;
            component.realTimeEnabled = this.realTimeEnabled;
            component.lastWebSocketUpdate = this.lastWebSocketUpdate;
            
            console.log('SharedService: Synced onlineClients to host component:', component.onlineClients.length);
            console.log('SharedService: Synced WebSocket status:', this.webSocketStatus);
        }
        
        component.logs = [...this.logs]; // ใช้ spread operator เพื่อ force reactivity
        component.statistics = { ...this.statistics }; // ใช้ spread operator เพื่อ force reactivity
        
        console.log('SharedService: Component sync completed');
    }
    
    // Initialize สำหรับ component เฉพาะ
    async initializeFor(component, type) {
        this.setComponentType(type);
        
        // Setup event listeners
        this.setupEventListeners(component);
        
        // Load initial data
        await this.loadTenants();
        
        // Initialize WebSocket status
        if (type === 'host') {
            // จำลอง WebSocket connecting
            this.setWebSocketStatus('connecting', false);
            
            // หลังจาก 2 วินาที เปลี่ยนเป็น connected
            setTimeout(() => {
                this.setWebSocketStatus('connected', true);
                this.syncWithComponent(component);
                if (component.$forceUpdate) {
                    component.$forceUpdate();
                }
            }, 2000);
        }
        
        // Sync with component
        this.syncWithComponent(component);
        
        this.addLog('system', `${type} component initialized successfully`);
        
        return true;
    }
    
    // Cleanup สำหรับ component
    cleanup(component) {
        this.cleanupEventListeners(component);
        this.addLog('system', `${this.componentType} component cleanup completed`);
    }
}

// Create singleton instance
const sharedGatewayService = new SharedGatewayService();

export default sharedGatewayService; 