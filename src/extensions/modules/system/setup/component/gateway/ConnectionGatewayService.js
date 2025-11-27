/**
 * Connection Gateway Service
 * ตัวกลางในการจัดการ connection ระหว่าง Host และ Client
 * รองรับ Cloudflare Workers + KV Storage
 */
class ConnectionGatewayService {
    constructor() {
        this.eventListeners = new Map();
        this.clients = new Map();
        this.tenants = new Map();
        this.commands = [];
        this.logs = [];
        this.statistics = {
            totalTenants: 0,
            activeConnections: 0,
            commandsSent: 0,
            messagesReceived: 0
        };
        
        // Real-time WebSocket connections
        this.adminWebSocket = null;
        this.connectionCounts = new Map();
        this.webSocketStatus = 'disconnected'; // 'connected', 'connecting', 'disconnected', 'error'
        
        // Cloudflare Workers Configuration
        this.cloudflare = {
            baseUrl: 'https://connection-gateway.manonsanoi.workers.dev',
            adminUrl: 'https://connection-gateway.manonsanoi.workers.dev/admin',
            adminWebSocketUrl: 'wss://connection-gateway.manonsanoi.workers.dev/connect?tenant=admin',
            clientWebSocketBaseUrl: 'wss://connection-gateway.manonsanoi.workers.dev/connect',
            enabled: true // Set to false for local testing
        };
        
        // Configuration
        this.config = {
            maxLogs: 100,
            maxCommands: 50,
            heartbeatInterval: 30000,
            connectionTimeout: 60000,
            maxReconnectAttempts: 5,
            reconnectDelay: 5000
        };
        
        // Initialize service
        this.initialize();
    }
    
    /**
     * Initialize service
     */
    async initialize() {
        this.addLog('system', 'Connection Gateway Service initialized');
        this.loadPersistedState();
        this.setupEventListeners();
        
        // Load tenants from Cloudflare if enabled
        if (this.cloudflare.enabled) {
            try {
                await this.loadCloudflareClients();
            } catch (error) {
                this.addLog('warning', `Could not load Cloudflare tenants on startup: ${error.message}`);
            }
        }
        
        // Connect admin WebSocket for real-time updates
        if (this.cloudflare.enabled) {
            this.connectAdminWebSocket();
        }
        
        // Start cleanup interval
        this.startCleanupInterval();
        
        // Set service as ready
        this.isReady = true;
        this.emit('service-ready', { timestamp: new Date() });
    }
    
    /**
     * Setup internal event listeners
     */
    setupEventListeners() {
        // Listen for browser events
        window.addEventListener('gateway-command', this.handleGatewayCommand.bind(this));
        window.addEventListener('client-connection-update', this.handleClientConnectionUpdate.bind(this));
        window.addEventListener('client-heartbeat', this.handleClientHeartbeat.bind(this));
        window.addEventListener('force-client-disconnect', this.handleForceDisconnect.bind(this));
        window.addEventListener('gateway-refresh-request', this.handleRefreshRequest.bind(this));
        
        this.addLog('system', 'Event listeners setup completed');
    }
    
    /**
     * Event Management
     */
    
    // Subscribe to events
    on(eventType, callback) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(callback);
        
        this.addLog('system', `Subscribed to event: ${eventType}`);
    }
    
    // Unsubscribe from events
    off(eventType, callback) {
        if (this.eventListeners.has(eventType)) {
            const callbacks = this.eventListeners.get(eventType);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
                this.addLog('system', `Unsubscribed from event: ${eventType}`);
            }
        }
    }
    
    // Emit events
    emit(eventType, data) {
        if (this.eventListeners.has(eventType)) {
            this.eventListeners.get(eventType).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    this.addLog('error', `Error in event callback: ${error.message}`);
                }
            });
        }
        
        // Also emit as browser event for backward compatibility
        const event = new CustomEvent(eventType, { detail: data });
        window.dispatchEvent(event);
    }
    
    /**
     * Real-time WebSocket Management
     */
    
    // เชื่อมต่อ Admin WebSocket สำหรับ real-time updates
    connectAdminWebSocket() {
        if (!this.cloudflare.enabled) return;

        try {
            this.webSocketStatus = 'connecting';
            this.emit('admin-websocket-status', { status: 'connecting' });
            
            this.adminWebSocket = new WebSocket(this.cloudflare.adminWebSocketUrl);
            
            this.adminWebSocket.onopen = () => {
                this.webSocketStatus = 'connected';
                this.addLog('system', '⚡ Admin WebSocket connected - Real-time mode activated');
                this.emit('admin-websocket-connected', { timestamp: new Date() });
                this.emit('admin-websocket-status', { status: 'connected' });
                
                // Subscribe to all tenant updates
                this.adminWebSocket.send(JSON.stringify({
                    type: 'subscribe_all_tenants'
                }));
            };

            this.adminWebSocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleAdminWebSocketMessage(data);
                } catch (error) {
                    console.error('Error parsing admin WebSocket message:', error);
                    this.addLog('error', `WebSocket message parse error: ${error.message}`);
                }
            };

            this.adminWebSocket.onclose = (event) => {
                this.webSocketStatus = 'disconnected';
                this.addLog('warning', `🔌 Admin WebSocket disconnected (code: ${event.code})`);
                this.emit('admin-websocket-disconnected', { code: event.code, timestamp: new Date() });
                this.emit('admin-websocket-status', { status: 'disconnected' });
                
                // Reconnect after 5 seconds
                setTimeout(() => {
                    if (this.cloudflare.enabled && this.webSocketStatus !== 'connected') {
                        this.addLog('system', '🔄 Attempting to reconnect Admin WebSocket...');
                        this.connectAdminWebSocket();
                    }
                }, 5000);
            };

            this.adminWebSocket.onerror = (error) => {
                this.webSocketStatus = 'error';
                this.addLog('error', `❌ Admin WebSocket error: ${error.message || 'Connection failed'}`);
                this.emit('admin-websocket-error', { error: error.message, timestamp: new Date() });
                this.emit('admin-websocket-status', { status: 'error' });
            };

        } catch (error) {
            this.webSocketStatus = 'error';
            this.addLog('error', `Failed to connect admin WebSocket: ${error.message}`);
            this.emit('admin-websocket-error', { error: error.message, timestamp: new Date() });
        }
    }

    // Handle admin WebSocket messages
    handleAdminWebSocketMessage(data) {
        switch (data.type) {
            case 'connection_update':
                this.updateTenantConnectionCount(data.tenantId, data.connections);
                break;
            
            case 'subscribed':
                this.addLog('system', `📡 Subscribed to ${data.tenants} tenant updates`);
                break;
            
            case 'client_connected':
                this.handleRealTimeClientUpdate(data, 'connected');
                break;
                
            case 'client_disconnected':
                this.handleRealTimeClientUpdate(data, 'disconnected');
                break;
            
            default:
                console.log('Unknown admin WebSocket message:', data);
                this.addLog('debug', `Unknown WebSocket message type: ${data.type}`);
        }
    }

    // Update tenant connection count in real-time
    updateTenantConnectionCount(tenantId, connectionCount) {
        console.log('updateTenantConnectionCount called:', { tenantId, connectionCount });
        
        // Calculate actual connection count if not provided
        let actualConnectionCount = connectionCount;
        if (connectionCount === undefined || connectionCount === null) {
            actualConnectionCount = this.getClientsByTenant(tenantId).length;
            console.log(`Calculated connection count for ${tenantId}: ${actualConnectionCount}`);
        }
        
        // Update local storage
        this.connectionCounts.set(tenantId, actualConnectionCount);
        
        // Update tenant object if exists
        const tenant = this.getTenant(tenantId);
        if (tenant) {
            tenant.connections = actualConnectionCount;
            tenant.lastActivity = new Date();
            console.log(`Updated tenant ${tenantId} to ${actualConnectionCount} connections`);
        } else {
            console.warn(`Tenant ${tenantId} not found in service`);
        }

        // Emit real-time update event with calculated count
        this.emit('connection-count-updated', {
            tenantId,
            connections: actualConnectionCount,
            timestamp: new Date()
        });

        // Update statistics
        this.updateStatistics();
        
        this.addLog('connection_update', `📊 Tenant ${tenantId}: ${actualConnectionCount} connections`);
    }
    
    // Handle real-time client updates
    handleRealTimeClientUpdate(data, status) {
        const { clientId, tenantId, timestamp } = data;
        
        if (status === 'connected') {
            // Add client to local tracking
            const clientKey = `${clientId}-${tenantId}`;
            const client = {
                clientId,
                tenantId,
                status: 'connected',
                connectedAt: new Date(timestamp),
                lastSeen: new Date(timestamp),
                ipAddress: data.ipAddress || 'N/A',
                userAgent: data.userAgent || 'N/A'
            };
            
            this.clients.set(clientKey, client);
            this.addLog('realtime_connect', `⚡ Real-time: Client ${clientId} connected to ${tenantId}`);
            
        } else if (status === 'disconnected') {
            // Remove client from local tracking
            const clientKey = `${clientId}-${tenantId}`;
            this.clients.delete(clientKey);
            this.addLog('realtime_disconnect', `⚡ Real-time: Client ${clientId} disconnected from ${tenantId}`);
        }
        
        // Emit event for UI updates
        this.emit('realtime-client-update', {
            clientId,
            tenantId,
            status,
            timestamp: new Date(timestamp)
        });
    }
    
    // Get WebSocket connection status
    getWebSocketStatus() {
        return {
            status: this.webSocketStatus,
            connected: this.webSocketStatus === 'connected',
            lastUpdate: new Date()
        };
    }
    
    // Send admin WebSocket message
    sendAdminWebSocketMessage(message) {
        if (this.adminWebSocket && this.webSocketStatus === 'connected') {
            this.adminWebSocket.send(JSON.stringify(message));
            return true;
        }
        return false;
    }
    
    /**
     * Client Management
     */
    
    // Register client
    registerClient(clientData) {
        const clientKey = `${clientData.clientId}-${clientData.tenantId}`;
        
        const client = {
            ...clientData,
            status: 'connected',
            connectedAt: new Date(),
            lastSeen: new Date(),
            messageCount: 0,
            heartbeatCount: 0
        };
        
        this.clients.set(clientKey, client);
        this.updateTenantConnectionCount(clientData.tenantId);
        this.updateStatistics();
        
        this.addLog('client_connected', `Client ${clientData.clientId} registered for tenant ${clientData.tenantId}`);
        this.emit('client-registered', client);
        
        return client;
    }
    
    // Unregister client
    unregisterClient(clientId, tenantId) {
        const clientKey = `${clientId}-${tenantId}`;
        const client = this.clients.get(clientKey);
        
        if (client) {
            this.clients.delete(clientKey);
            this.updateTenantConnectionCount(tenantId);
            this.updateStatistics();
            
            this.addLog('client_disconnected', `Client ${clientId} unregistered from tenant ${tenantId}`);
            this.emit('client-unregistered', { clientId, tenantId, client });
            
            return client;
        }
        
        return null;
    }
    
    // Get client
    getClient(clientId, tenantId) {
        const clientKey = `${clientId}-${tenantId}`;
        return this.clients.get(clientKey);
    }
    
    // Get all clients
    getAllClients() {
        return Array.from(this.clients.values());
    }
    
    // Get clients by tenant
    getClientsByTenant(tenantId) {
        return Array.from(this.clients.values()).filter(client => client.tenantId === tenantId);
    }
    
    // Update client last seen
    updateClientLastSeen(clientId, tenantId) {
        const client = this.getClient(clientId, tenantId);
        if (client) {
            client.lastSeen = new Date();
            client.heartbeatCount++;
            this.saveState();
        }
    }
    
    /**
     * Tenant Management
     */
    
    // Register tenant
    async registerTenant(tenantData) {
        if (this.cloudflare.enabled) {
            return await this.createCloudflareClient(tenantData);
        }
        
        const tenant = {
            ...tenantData,
            connections: 0,
            lastActivity: new Date(),
            createdAt: new Date()
        };
        
        this.tenants.set(tenantData.id, tenant);
        this.updateStatistics();
        
        this.addLog('tenant_created', `Tenant ${tenantData.name} registered`);
        this.emit('tenant-registered', tenant);
        
        // Broadcast tenant creation to all clients
        this.broadcastTenantUpdate('create', { tenant });
        
        return tenant;
    }
    
    // Create tenant via Cloudflare Workers
    async createCloudflareClient(tenantData) {
        try {
            const { id: tenantId, name, config = {}, metadata = {} } = tenantData;

            if (!tenantId || !name) {
                throw new Error('tenantId และ name จำเป็นต้องระบุ');
            }

            // Default configuration
            const defaultConfig = {
                theme: 'light',
                features: ['chat', 'files'],
                maxUsers: 100,
                timezone: 'Asia/Bangkok'
            };

            // Default metadata
            const defaultMetadata = {
                plan: 'free',
                industry: 'general',
                createdAt: new Date().toISOString()
            };

            const tenantPayload = {
                tenantId,
                name,
                config: { ...defaultConfig, ...config },
                metadata: { ...defaultMetadata, ...metadata }
            };

            const response = await fetch(`https://connection-gateway.manonsanoi.workers.dev/tenant?tenant=${tenantId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tenantPayload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Store locally too
            const localTenant = {
                id: tenantId,
                tenantId: tenantId,
                name: (result.tenant?.name || result.data?.name || result.name || name), // fallback to original name
                subdomain: tenantId,
                status: 'active',
                connections: 0,
                lastActivity: new Date(),
                createdAt: new Date(
                    result.tenant?.createdAt || 
                    result.data?.createdAt || 
                    result.createdAt || 
                    result.tenant?.metadata?.createdAt || 
                    result.data?.metadata?.createdAt || 
                    result.metadata?.createdAt || 
                    Date.now()
                )
            };
            
            this.tenants.set(tenantId, localTenant);
            this.updateStatistics();
            
            this.addLog('tenant_created', `Cloudflare Tenant ${localTenant.name} created successfully`);
            this.emit('tenant-registered', localTenant);
            
            // Broadcast tenant creation to all clients
            this.broadcastTenantUpdate('create', { tenant: localTenant });
            
            return localTenant;

        } catch (error) {
            this.addLog('error', `Failed to create Cloudflare tenant: ${error.message}`);
            throw error;
        }
    }
    
    // Get tenant
    getTenant(tenantId) {
        return this.tenants.get(tenantId);
    }
    
    // Get all tenants
    getAllTenants() {
        if (this.cloudflare.enabled) {
            // Return cached tenants for now, but we could fetch from Cloudflare
            return Array.from(this.tenants.values());
        }
        return Array.from(this.tenants.values());
    }
    
    // Load tenants from Cloudflare
    async loadCloudflareClients() {
        if (!this.cloudflare.enabled) return [];
        
        try {
            const response = await fetch(`${this.cloudflare.baseUrl}/tenants`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                console.warn('Could not load tenants from Cloudflare:', response.statusText);
                return [];
            }

            const result = await response.json();
            console.log('Cloudflare tenants response:', result);
            
            // Handle different response formats
            let tenantIds = [];
            if (result.tenants && Array.isArray(result.tenants)) {
                tenantIds = result.tenants;
            } else if (result.data && Array.isArray(result.data)) {
                // Extract tenant IDs from data objects
                tenantIds = result.data.map(item => {
                    if (typeof item === 'string') {
                        return item;
                    } else if (item && item.id) {
                        return item.id;
                    } else if (item && item.tenantId) {
                        return item.tenantId;
                    }
                    return null;
                }).filter(id => id !== null);
            } else {
                console.warn('Unexpected tenants response format:', result);
                return [];
            }
            
            console.log('Extracted tenant IDs:', tenantIds);
            
            // Fetch detailed information for each tenant
            const tenantPromises = tenantIds.map(async (tenantId) => {
                try {
                    // Make sure tenantId is a string
                    const tenantIdString = String(tenantId);
                    console.log(`Fetching tenant details for: ${tenantIdString}`);
                    
                    const tenantResponse = await fetch(`${this.cloudflare.baseUrl}/tenant/${tenantIdString}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    
                    if (tenantResponse.ok) {
                        const tenantData = await tenantResponse.json();
                        console.log(`Tenant ${tenantIdString} data:`, tenantData);
                        return tenantData.tenant || tenantData.data || tenantData;
                    } else {
                        console.warn(`Failed to fetch tenant ${tenantIdString}:`, tenantResponse.statusText);
                        // Return basic tenant info if detailed fetch fails
                        return {
                            id: tenantIdString,
                            name: tenantIdString,
                            status: 'active',
                            metadata: { createdAt: new Date().toISOString() }
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching tenant ${tenantId}:`, error);
                    const tenantIdString = String(tenantId);
                    return {
                        id: tenantIdString,
                        name: tenantIdString,
                        status: 'active',
                        metadata: { createdAt: new Date().toISOString() }
                    };
                }
            });
            
            const tenantDetails = await Promise.all(tenantPromises);
            console.log('All tenant details:', tenantDetails);
            
            // Convert and cache locally
            tenantDetails.forEach(tenant => {
                if (tenant && tenant.id) {
                    const localTenant = {
                        id: String(tenant.id), // Ensure ID is string
                        tenantId: String(tenant.id),
                        name: tenant.name || String(tenant.id),
                        subdomain: String(tenant.id),
                        status: tenant.status || 'active',
                        connections: 0,
                        lastActivity: new Date(),
                        createdAt: new Date(tenant.metadata?.createdAt || tenant.createdAt || Date.now())
                    };
                    
                    console.log('Storing local tenant:', localTenant);
                    this.tenants.set(String(tenant.id), localTenant);
                }
            });
            
            this.updateStatistics();
            this.addLog('system', `Loaded ${tenantDetails.length} tenants from Cloudflare`);
            
            return tenantDetails;

        } catch (error) {
            console.error('Failed to load tenants from Cloudflare:', error);
            this.addLog('error', `Failed to load Cloudflare tenants: ${error.message}`);
            return [];
        }
    }
    
    // Fetch all tenants for clients
    async fetchAllTenants() {
        if (this.cloudflare.enabled) {
            return await this.loadCloudflareClients();
        } else {
            return this.getAllTenants();
        }
    }
    
    // Delete tenant
    async deleteTenant(tenantId) {
        try {
            // Check if tenant has active connections
            const tenantClients = this.getClientsByTenant(tenantId);
            if (tenantClients.length > 0) {
                throw new Error(`Cannot delete tenant with ${tenantClients.length} active connections`);
            }
            
            // Delete from Cloudflare if enabled
            if (this.cloudflare.enabled) {
                await this.deleteCloudflareClient(tenantId);
            }
            
            // Remove from local storage
            const tenant = this.tenants.get(tenantId);
            if (tenant) {
                this.tenants.delete(tenantId);
                this.updateStatistics();
                
                this.addLog('tenant_deleted', `Tenant ${tenant.name} deleted successfully`);
                
                // Notify all clients about tenant deletion
                this.emit('tenant-deleted', { tenantId, tenant });
                this.broadcastTenantUpdate('delete', { tenantId, tenant });
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            this.addLog('error', `Failed to delete tenant: ${error.message}`);
            throw error;
        }
    }
    
    // Delete tenant from Cloudflare Workers
    async deleteCloudflareClient(tenantId) {
        try {
            const response = await fetch(`https://connection-gateway.manonsanoi.workers.dev/tenant/${tenantId}?tenant=${tenantId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok && response.status !== 404) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            this.addLog('tenant_deleted', `Cloudflare Tenant ${tenantId} deleted successfully`);
            return true;

        } catch (error) {
            this.addLog('error', `Failed to delete Cloudflare tenant: ${error.message}`);
            throw error;
        }
    }
    
    // Update tenant
    async updateTenant(tenantId, updates) {
        try {
            // Update in Cloudflare if enabled
            if (this.cloudflare.enabled) {
                await this.updateCloudflareClient(tenantId, updates);
            }
            
            // Update locally
            const tenant = this.getTenant(tenantId);
            if (tenant) {
                Object.assign(tenant, updates);
                tenant.lastActivity = new Date();
                
                this.addLog('tenant_updated', `Tenant ${tenant.name} updated successfully`);
                
                // Notify all clients about tenant update
                this.emit('tenant-updated', { tenantId, tenant, updates });
                this.broadcastTenantUpdate('update', { tenantId, tenant, updates });
                
                return tenant;
            }
            
            throw new Error('Tenant not found');
            
        } catch (error) {
            this.addLog('error', `Failed to update tenant: ${error.message}`);
            throw error;
        }
    }
    
    // Update tenant in Cloudflare Workers
    async updateCloudflareClient(tenantId, updates) {
        try {
            const response = await fetch(`https://connection-gateway.manonsanoi.workers.dev/tenant/${tenantId}?tenant=${tenantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            this.addLog('tenant_updated', `Cloudflare Tenant ${tenantId} updated successfully`);
            
            return result.data;

        } catch (error) {
            this.addLog('error', `Failed to update Cloudflare tenant: ${error.message}`);
            throw error;
        }
    }
    
    // Broadcast tenant updates to all clients
    broadcastTenantUpdate(action, data) {
        const updateEvent = {
            type: 'tenant_list_update',
            action: action, // 'create', 'update', 'delete'
            data: data,
            timestamp: new Date()
        };
        
        // Emit to all clients
        this.emit('tenant-list-update', updateEvent);
        
        // Also broadcast as browser event
        const event = new CustomEvent('tenant-list-update', { detail: updateEvent });
        window.dispatchEvent(event);
    }
    
    /**
     * Command Management
     */
    
    // Send command
    async sendCommand(commandData) {
        // For Cloudflare integration, send to specific tenant
        if (this.cloudflare.enabled && commandData.target && commandData.target !== 'all') {
            // Determine tenant ID from target
            let tenantId = commandData.target;
            if (commandData.target.startsWith('client:')) {
                // Extract tenant from client:clientId:tenantId format
                const parts = commandData.target.split(':');
                tenantId = parts[2];
            }
            return await this.sendCloudflareCommand(tenantId, commandData);
        }
        
        const command = {
            id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...commandData,
            timestamp: new Date(),
            status: 'sent'
        };
        
        // Parse payload if it's a string
        if (typeof command.payload === 'string') {
            try {
                command.payload = JSON.parse(command.payload);
            } catch (error) {
                this.addLog('error', `Invalid JSON payload: ${error.message}`);
                throw new Error('Invalid JSON payload');
            }
        }
        
        // Determine target type and recipients
        this.processCommandTarget(command);
        
        // Store command
        this.commands.unshift(command);
        if (this.commands.length > this.config.maxCommands) {
            this.commands = this.commands.slice(0, this.config.maxCommands);
        }
        
        // Broadcast command
        this.broadcastCommand(command);
        
        this.updateStatistics();
        this.addLog('command_sent', `Command ${command.type} sent to ${command.targetType}`);
        
        return command;
    }
    
    // Send command via Cloudflare Workers
    async sendCloudflareCommand(tenantId, commandData) {
        try {
            console.log('sendCloudflareCommand received:', { tenantId, commandData });
            
            const { type, payload, metadata = {} } = commandData;
            
            if (!type || !payload) {
                console.error('Missing type or payload:', { type, payload });
                throw new Error('type และ payload จำเป็นต้องระบุ');
            }
            
            const commandPayload = {
                type,
                payload,
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString(),
                    source: 'web-client'
                }
            };

            const response = await fetch(`https://connection-gateway.manonsanoi.workers.dev/command?tenant=${tenantId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commandPayload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Store locally too
            const localCommand = {
                id: result.data?.id || `cmd-${Date.now()}`,
                type,
                payload,
                target: tenantId,
                targetType: 'tenant',
                timestamp: new Date(),
                status: 'sent',
                cloudflare: true
            };
            
            this.commands.unshift(localCommand);
            if (this.commands.length > this.config.maxCommands) {
                this.commands = this.commands.slice(0, this.config.maxCommands);
            }
            
            this.updateStatistics();
            this.addLog('command_sent', `Cloudflare Command ${type} sent to ${tenantId}`);
            
            return localCommand;

        } catch (error) {
            this.addLog('error', `Failed to send Cloudflare command: ${error.message}`);
            throw error;
        }
    }
    
    // Process command target
    processCommandTarget(command) {
        if (!command.target) {
            console.error('Command has no target:', command);
            command.targetType = 'all_clients';
            command.recipients = this.getAllClients();
            return;
        }
        
        if (command.target.startsWith('client:')) {
            // Specific client target: client:clientId:tenantId
            const [, clientId, tenantId] = command.target.split(':');
            command.targetType = 'specific_client';
            command.specificClient = { clientId, tenantId };
            command.recipients = [this.getClient(clientId, tenantId)].filter(Boolean);
        } else if (command.target === 'all') {
            // All clients
            command.targetType = 'all_clients';
            command.recipients = this.getAllClients();
        } else {
            // Specific tenant
            command.targetType = 'tenant';
            command.recipients = this.getClientsByTenant(command.target);
        }
    }
    
    // Broadcast command
    broadcastCommand(command) {
        if (command.targetType === 'specific_client') {
            // Send to specific client
            this.emit('gateway-command-specific', {
                ...command,
                targetClientId: command.specificClient.clientId,
                targetTenantId: command.specificClient.tenantId
            });
        } else {
            // Send to all or tenant-specific
            this.emit('gateway-command', command);
        }
        
        // Update recipient message counts
        command.recipients?.forEach(client => {
            if (client) {
                client.messageCount++;
            }
        });
    }
    
    // Get recent commands
    getRecentCommands(limit = 10) {
        return this.commands.slice(0, limit);
    }
    
    /**
     * Connection Status Management
     */
    
    // Check connection health
    checkConnectionHealth() {
        const now = new Date();
        const staleClients = [];
        
        this.clients.forEach((client, clientKey) => {
            const timeSinceLastSeen = now - new Date(client.lastSeen);
            
            if (timeSinceLastSeen > this.config.connectionTimeout) {
                staleClients.push({ clientKey, client });
            }
        });
        
        // Remove stale clients
        staleClients.forEach(({ clientKey, client }) => {
            this.clients.delete(clientKey);
            this.addLog('connection_timeout', `Client ${client.clientId} timed out`);
            this.emit('client-timeout', client);
        });
        
        if (staleClients.length > 0) {
            this.updateStatistics();
        }
        
        return {
            totalClients: this.clients.size,
            staleClientsRemoved: staleClients.length
        };
    }
    
    // Force disconnect client
    forceDisconnectClient(clientId, tenantId, reason = 'Admin action') {
        const client = this.unregisterClient(clientId, tenantId);
        
        if (client) {
            this.emit('force-client-disconnect', {
                clientId,
                tenantId,
                reason,
                timestamp: new Date()
            });
            
            this.addLog('admin_disconnect', `Force disconnected ${clientId}: ${reason}`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Event Handlers
     */
    
    handleGatewayCommand(event) {
        const command = event.detail;
        this.addLog('command_received', `Gateway command received: ${command.type}`);
        this.emit('command-processed', command);
    }
    
    handleClientConnectionUpdate(event) {
        const clientData = event.detail;
        
        if (clientData.isConnecting) {
            this.registerClient(clientData);
        } else {
            this.unregisterClient(clientData.clientId, clientData.tenantId);
        }
    }
    
    handleClientHeartbeat(event) {
        const heartbeatData = event.detail;
        this.updateClientLastSeen(heartbeatData.clientId, heartbeatData.tenantId);
        
        // Update client with latest heartbeat data
        const client = this.getClient(heartbeatData.clientId, heartbeatData.tenantId);
        if (client) {
            Object.assign(client, heartbeatData, { lastSeen: new Date() });
        }
        
        this.emit('heartbeat-received', heartbeatData);
    }
    
    handleForceDisconnect(event) {
        const { clientId, tenantId, reason } = event.detail;
        this.unregisterClient(clientId, tenantId);
        this.addLog('force_disconnect', `Force disconnect: ${clientId} - ${reason}`);
    }
    
    handleRefreshRequest(event) {
        this.addLog('system', 'Refresh request received');
        this.emit('refresh-requested', event.detail);
        
        // Trigger health check
        setTimeout(() => {
            this.checkConnectionHealth();
        }, 2000);
    }
    
    /**
     * Logging
     */
    
    addLog(type, message) {
        const log = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            message,
            timestamp: new Date()
        };
        
        this.logs.unshift(log);
        
        // Keep only recent logs
        if (this.logs.length > this.config.maxLogs) {
            this.logs = this.logs.slice(0, this.config.maxLogs);
        }
        
        // Emit log event
        this.emit('log-added', log);
        
        // Auto-save state
        this.saveState();
    }
    
    // Get recent logs
    getRecentLogs(limit = 20) {
        return this.logs.slice(0, limit);
    }
    
    // Clear logs
    clearLogs() {
        this.logs = [];
        this.addLog('system', 'Logs cleared');
    }
    
    /**
     * Statistics
     */
    
    updateStatistics() {
        this.statistics = {
            totalTenants: this.tenants.size,
            activeConnections: this.clients.size,
            commandsSent: this.commands.length,
            messagesReceived: Array.from(this.clients.values())
                .reduce((total, client) => total + (client.messageCount || 0), 0)
        };
        
        this.emit('statistics-updated', this.statistics);
    }
    
    getStatistics() {
        return { ...this.statistics };
    }
    
    /**
     * Utility Functions
     */
    
    // Generate client ID
    generateClientId(prefix = 'client') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Generate WebSocket URL
    generateWebSocketUrl(tenantId) {
        if (this.cloudflare.enabled) {
            return `${this.cloudflare.clientWebSocketBaseUrl}?tenant=${tenantId}`;
        }
        return `ws://localhost:8080/ws?tenant=${tenantId}`;
    }
    
    // Format date
    formatDate(date) {
        return new Date(date).toLocaleString('th-TH');
    }
    
    // Get connection status color
    getConnectionStatusColor(status) {
        const colors = {
            connected: 'text-green-600 bg-green-100',
            connecting: 'text-yellow-600 bg-yellow-100',
            disconnected: 'text-gray-600 bg-gray-100',
            error: 'text-red-600 bg-red-100'
        };
        return colors[status] || 'text-gray-600 bg-gray-100';
    }
    
    /**
     * State Persistence
     */
    
    saveState() {
        try {
            const state = {
                tenants: Array.from(this.tenants.entries()),
                clients: Array.from(this.clients.entries()),
                commands: this.commands.slice(0, 20), // Save only recent commands
                logs: this.logs.slice(0, 50), // Save only recent logs
                statistics: this.statistics,
                timestamp: new Date()
            };
            
            localStorage.setItem('connection-gateway-service-state', JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save service state:', error);
        }
    }
    
    loadPersistedState() {
        try {
            const savedState = localStorage.getItem('connection-gateway-service-state');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Check if state is not too old (max 1 hour)
                const stateAge = new Date() - new Date(state.timestamp);
                if (stateAge < 3600000) { // 1 hour
                    // Restore tenants
                    if (state.tenants) {
                        this.tenants = new Map(state.tenants);
                    }
                    
                    // Restore clients (but mark as potentially offline)
                    if (state.clients) {
                        state.clients.forEach(([key, client]) => {
                            client.status = 'disconnected'; // Mark as disconnected initially
                            this.clients.set(key, client);
                        });
                    }
                    
                    // Restore commands and logs
                    this.commands = state.commands || [];
                    this.logs = state.logs || [];
                    this.statistics = state.statistics || this.statistics;
                    
                    this.addLog('system', 'Service state restored from storage');
                } else {
                    this.addLog('system', 'Saved state too old, starting fresh');
                }
            }
        } catch (error) {
            console.error('Failed to load persisted state:', error);
            this.addLog('error', 'Failed to restore service state');
        }
    }
    
    /**
     * Cleanup and Maintenance
     */
    
    startCleanupInterval() {
        // Run cleanup every 5 minutes
        setInterval(() => {
            this.checkConnectionHealth();
            this.saveState();
        }, 300000);
    }
    
    // Cleanup resources
    cleanup() {
        // Remove event listeners
        window.removeEventListener('gateway-command', this.handleGatewayCommand.bind(this));
        window.removeEventListener('client-connection-update', this.handleClientConnectionUpdate.bind(this));
        window.removeEventListener('client-heartbeat', this.handleClientHeartbeat.bind(this));
        window.removeEventListener('force-client-disconnect', this.handleForceDisconnect.bind(this));
        window.removeEventListener('gateway-refresh-request', this.handleRefreshRequest.bind(this));
        
        // Save final state
        this.saveState();
        
        this.addLog('system', 'Connection Gateway Service cleanup completed');
    }
}

// Create singleton instance
const connectionGatewayService = new ConnectionGatewayService();

// Export for use in components
export default connectionGatewayService;

// Also make it available globally for debugging
if (typeof window !== 'undefined') {
    window.ConnectionGatewayService = connectionGatewayService;
} 