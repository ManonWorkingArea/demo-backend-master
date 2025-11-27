<script>
import { useRoute } from 'vue-router'
import Loader from '@/interface/template/Loader.vue'

export default {
    name: 'HostControlPanel',
    data() {
        const route = useRoute()
        return {
            PageName: route.meta.title || 'Host Control Panel',
            PageIcon: route.meta.icon || 'crown',
            PagePath: route.meta.path,
            ParentName: route.meta.parent,
            ParentPage: route.meta.page,
            loading: false,

            // Host WebSocket
            hostWs: null,
            connected: false,
            hostUrl: 'wss://api-socket-worker.manonsanoi.workers.dev/host',
            
            // Host Info
            hostId: null,
            connectedAt: null,
            
            // Clients Management
            clients: [],
            totalClients: 0,
            
            // Room Management
            rooms: [],
            totalRooms: 0,
            selectedRoom: null,
            roomClients: {},
            
            // Messages & Controls
            messages: [],
            broadcastMessage: '',
            roomBroadcastMessage: '',
            
            // Stats
            stats: {
                totalConnections: 0,
                messagesReceived: 0,
                broadcastsSent: 0,
                clientsKicked: 0,
                totalRooms: 0,
                messagesToday: 0,
                countries: 0
            },
            
            // Analytics
            analytics: {
                countryStats: [],
                usageHistory: [],
                databaseStats: {},
                performanceMetrics: {}
            },
            
            // Dashboard Settings
            dashboardSettings: {
                autoRefreshInterval: 30000,
                showAdvancedStats: true,
                timeframe: '24h'
            },

            // Real-time Features
            notifications: [],
            recentActivity: [],
            autoRefreshEnabled: false,
            showToastNotifications: true,
            roomActivity: {},

            // Real-time Status
            lastHeartbeat: null,
            connectionHealth: true,
            realTimeStatus: {
                heartbeatInterval: 10000, // 10 seconds
                autoRefreshInterval: 30000, // 30 seconds
                missedHeartbeats: 0,
                maxMissedHeartbeats: 3
            },

            // Enhanced Notifications
            notificationSettings: {
                showHeartbeat: false,
                showAutoRefresh: true,
                showImmediateUpdates: true,
                showToastDuration: 5000
            },

            // Auto refresh
            refreshInterval: null,
            heartbeatMonitorInterval: null,

            // DO operation reports
            doCountdowns: {},
            doStats: null
        }
    },
    components: {
        Loader
    },
    computed: {
        connectionDuration() {
            if (!this.connectedAt) return '0s'
            const diff = Date.now() - this.connectedAt
            const seconds = Math.floor(diff / 1000)
            const minutes = Math.floor(seconds / 60)
            const hours = Math.floor(minutes / 60)
            
            if (hours > 0) return `${hours}h ${minutes % 60}m`
            if (minutes > 0) return `${minutes}m ${seconds % 60}s`
            return `${seconds}s`
        },
        recentMessages() {
            return this.messages.slice(-15).reverse()
        },
        activeRooms() {
            return this.rooms.filter(room => room.clientCount > 0)
        },
        activeRoomsCount() {
            return this.activeRooms.length
        },
        selectedRoomClients() {
            if (!this.selectedRoom) return []
            return this.roomClients[this.selectedRoom.id] || []
        },
        connectionUptimeFormatted() {
            if (!this.connectedAt) return '0s'
            const diff = Date.now() - this.connectedAt
            const seconds = Math.floor(diff / 1000)
            const minutes = Math.floor(seconds / 60)
            const hours = Math.floor(minutes / 60)
            
            if (hours > 0) return `${hours}h ${minutes % 60}m`
            if (minutes > 0) return `${minutes}m ${seconds % 60}s`
            return `${seconds}s`
        },
        realTimeStatsFormatted() {
            // Implement the logic to calculate real-time stats
            return {
                messageLatency: '0ms',
                health: 'Healthy',
            }
        },
        connectedHosts() {
            // Implement the logic to count connected hosts
            return 1
        },
        showAdvancedStats() {
            return this.dashboardSettings.showAdvancedStats
        },
        getDOStatsFormatted() {
            if (!this.doStats) return {}
            
            return {
                totalOperations: this.doStats.totalOperations.toLocaleString(),
                activeInstances: this.doStats.activeInstances.toLocaleString(),
                operationCounts: Object.entries(this.doStats.operationCounts)
                    .map(([op, count]) => `${op}: ${count}`)
                    .join(' | ')
            }
        }
    },
    methods: {
        connectAsHost() {
            try {
                if (this.hostWs) {
                    this.hostWs.close()
                }
                
                this.hostWs = new WebSocket(this.hostUrl)
                
                this.hostWs.onopen = () => {
                    this.connected = true
                    this.connectedAt = Date.now()
                    this.addMessage('system', '🎯 เชื่อมต่อเป็น Host สำเร็จ!')
                }
                
                this.hostWs.onmessage = (event) => {
                    const data = JSON.parse(event.data)
                    this.handleHostMessage(data)
                }
                
                this.hostWs.onclose = (event) => {
                    this.connected = false
                    this.connectedAt = null
                    this.hostId = null
                    this.addMessage('system', `การเชื่อมต่อ Host ถูกปิด (${event.code})`)
                }
                
                this.hostWs.onerror = () => {
                    this.addMessage('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ Host')
                }
                
            } catch (error) {
                this.addMessage('error', `ไม่สามารถเชื่อมต่อได้: ${error.message}`)
            }
        },
        
        disconnectHost() {
            if (this.hostWs) {
                this.hostWs.close()
            }
        },
        
        handleHostMessage(data) {
            this.stats.messagesReceived++
            
            switch (data.type) {
                case 'host_welcome':
                    this.handleHostWelcome(data)
                    break
                case 'client_connected':
                    this.handleClientConnected(data)
                    break
                case 'client_disconnected':
                    this.handleClientDisconnected(data)
                    break
                case 'client_message':
                    this.handleClientMessage(data)
                    break
                case 'room_list':
                    this.handleRoomList(data)
                    break
                case 'room_clients':
                    this.handleRoomClients(data)
                    break
                case 'broadcast_sent':
                    this.handleBroadcastSent(data)
                    break
                case 'room_broadcast_sent':
                    this.handleRoomBroadcastSent(data)
                    break
                case 'room_list_updated':
                    this.handleRoomListUpdated(data)
                    break
                case 'client_joined_room':
                    this.handleClientJoinedRoom(data)
                    break
                case 'client_left_room':
                    this.handleClientLeftRoom(data)
                    break
                case 'heartbeat':
                    this.handleHeartbeat(data)
                    break
                case 'auto_stats_update':
                    this.handleAutoStatsUpdate(data)
                    break
                case 'immediate_stats_update':
                    this.handleImmediateStatsUpdate(data)
                    break
                case 'connection_list':
                    this.handleConnectionList(data)
                    break
                case 'client_list_updated':
                    this.handleClientListUpdated(data)
                    break
                case 'room_activity_update':
                    this.handleRoomActivityUpdate(data)
                    break
                
                // DO Operation Reports
                case 'do_operation_report':
                    this.handleDOOperationReport(data)
                    break
                case 'do_countdown':
                    this.handleDOCountdown(data)
                    break
                case 'do_error':
                    this.handleDOError(data)
                    break
                default:
                    this.addMessage('received', JSON.stringify(data, null, 2))
            }
        },
        
        handleHostWelcome(data) {
            this.hostId = data.connectionId
            this.stats.totalConnections = data.totalConnections
            this.addMessage('welcome', `🎉 ยินดีต้อนรับ Host! ID: ${data.connectionId}`)
            
            // Auto request room list
            this.getRoomList()
        },
        
        handleClientConnected(data) {
            this.totalClients = data.totalClients
            const username = data.client.metadata?.username || data.client.id.substring(0, 8)
            const roomName = data.client.roomName || data.client.roomId || 'Unknown Room'
            
            this.addMessage('client', `👤 ${username} เชื่อมต่อในห้อง ${roomName}`)
            this.addActivity('connect', `${username} เข้าร่วม ${roomName}`)
            this.showToast(`👤 ${username} เชื่อมต่อ`, 'success')
            
            // Update room client count
            if (data.client.roomId) {
                this.updateRoomClientCount(data.client.roomId, 1)
                this.markRoomActivity(data.client.roomId)
            }
            
            // Update room clients if viewing that room
            if (this.selectedRoom && data.client.roomId === this.selectedRoom.id) {
                this.getRoomClients(this.selectedRoom.id)
            }
        },
        
        handleClientDisconnected(data) {
            this.totalClients = data.totalClients
            const username = data.username || data.clientId.substring(0, 8)
            const roomName = data.roomId || 'Unknown Room'
            
            this.addMessage('client', `👋 ${username} ตัดการเชื่อมต่อจากห้อง ${roomName}`)
            this.addActivity('disconnect', `${username} ออกจาก ${roomName}`)
            this.showToast(`👋 ${username} ตัดการเชื่อมต่อ`, 'warning')
            
            // Update room client count
            if (data.roomId) {
                this.updateRoomClientCount(data.roomId, -1)
                this.markRoomActivity(data.roomId)
            }
            
            // Update room clients if viewing that room
            if (this.selectedRoom && data.roomId === this.selectedRoom.id) {
                this.getRoomClients(this.selectedRoom.id)
            }
        },
        
        handleClientMessage(data) {
            const username = data.fromUser || data.from.substring(0, 8)
            const roomName = data.roomName || data.roomId
            
            this.addMessage('message', `💬 [${roomName}] ${username}: ${data.message}`)
            this.markRoomActivity(data.roomId)
            
            // Update client message in room view
            if (this.selectedRoom && data.roomId === this.selectedRoom.id) {
                const clients = this.roomClients[this.selectedRoom.id] || []
                const client = clients.find(c => c.id === data.from)
                if (client) {
                    client.lastMessage = data.message
                    client.lastMessageTime = data.timestamp || Date.now()
                    client.username = username
                }
            }
        },
        
        handleRoomList(data) {
            this.rooms = data.rooms || []
            this.totalRooms = data.total || 0
            this.stats.totalRooms = this.totalRooms
            this.addMessage('info', `🏠 รายชื่อห้อง: ${this.totalRooms} ห้อง`)
        },
        
        handleRoomClients(data) {
            this.roomClients[data.roomId] = data.clients || []
            this.addMessage('info', `👥 ข้อมูล clients ห้อง ${data.roomId}: ${data.clients?.length || 0} คน`)
        },
        
        handleBroadcastSent(data) {
            this.stats.broadcastsSent++
            this.addMessage('broadcast', `📢 ส่ง Global Broadcast ไปยัง ${data.sentTo} clients`)
        },
        
        handleRoomBroadcastSent(data) {
            this.stats.broadcastsSent++
            this.addMessage('broadcast', `📢 ส่งข้อความไปห้อง ${data.roomId}: ${data.sentTo} clients`)
        },
        
        // New Real-time Event Handlers
        handleRoomListUpdated(data) {
            this.rooms = data.rooms || []
            this.totalRooms = data.total || 0
            this.stats.totalRooms = this.totalRooms
            this.addMessage('info', `🔄 Room list อัพเดต: ${this.totalRooms} ห้อง`)
            
            // Initialize roomActivity if not exists
            if (!this.roomActivity) {
                this.roomActivity = {}
            }
            
            // Update room activity timestamps
            if (this.rooms && this.rooms.length > 0) {
                this.rooms.forEach(room => {
                    if (room && room.id && !this.roomActivity[room.id]) {
                        this.roomActivity[room.id] = {
                            lastActivity: room.createdAt || Date.now(),
                            isActive: room.clientCount > 0
                        }
                    }
                })
            }
        },
        
        handleClientJoinedRoom(data) {
            const username = data.client.username || data.client.id.substring(0, 8)
            const roomName = data.roomName || data.roomId
            
            this.addMessage('room', `🏠 ${username} เข้าร่วมห้อง ${roomName}`)
            this.addActivity('join', `${username} เข้าร่วมห้อง ${roomName}`)
            this.showToast(`🏠 ${username} เข้าร่วมห้อง`, 'info')
            this.markRoomActivity(data.roomId)
            
            // Update room clients if viewing that room
            if (this.selectedRoom && data.roomId === this.selectedRoom.id) {
                this.getRoomClients(this.selectedRoom.id)
            }
        },
        
        handleClientLeftRoom(data) {
            const username = data.client.username || data.client.id.substring(0, 8)
            
            this.addMessage('room', `🚪 ${username} ออกจากห้อง ${data.roomId}`)
            this.addActivity('leave', `${username} ออกจากห้อง ${data.roomId}`)
            this.showToast(`🚪 ${username} ออกจากห้อง`, 'warning')
            this.markRoomActivity(data.roomId)
            
            // Update room clients if viewing that room
            if (this.selectedRoom && data.roomId === this.selectedRoom.id) {
                this.getRoomClients(this.selectedRoom.id)
            }
        },
        
        // Host Commands
        sendHostCommand(command) {
            if (!this.connected || !this.hostWs) return
            
            this.hostWs.send(JSON.stringify(command))
            this.addMessage('sent', JSON.stringify(command))
        },
        
        getRoomList() {
            this.sendHostCommand({ type: 'get_rooms' })
        },
        
        getRoomClients(roomId) {
            this.sendHostCommand({ 
                type: 'get_room_clients',
                roomId: roomId 
            })
        },
        
        selectRoom(room) {
            this.selectedRoom = room
            this.getRoomClients(room.id)
        },
        
        backToRoomList() {
            this.selectedRoom = null
        },
        
        broadcastToAll() {
            if (!this.broadcastMessage.trim()) return
            
            this.sendHostCommand({
                type: 'broadcast_to_clients',
                message: this.broadcastMessage
            })
            this.broadcastMessage = ''
        },
        
        broadcastToRoom() {
            if (!this.roomBroadcastMessage.trim() || !this.selectedRoom) return
            
            this.sendHostCommand({
                type: 'broadcast_to_room',
                roomId: this.selectedRoom.id,
                message: this.roomBroadcastMessage
            })
            this.roomBroadcastMessage = ''
        },
        
        kickClient(clientId) {
            this.sendHostCommand({
                type: 'kick_client',
                clientId: clientId
            })
        },
        
        addMessage(type, content) {
            this.messages.push({
                type,
                content,
                timestamp: new Date().toLocaleTimeString('th-TH')
            })
            
            // Keep only last 100 messages
            if (this.messages.length > 100) {
                this.messages.shift()
            }
        },
        
        clearMessages() {
            this.messages = []
        },
        
        formatTimestamp(timestamp) {
            return new Date(timestamp).toLocaleString('th-TH')
        },
        
        getRoomType(room) {
            if (room.id.startsWith('auto_')) return 'Auto'
            return room.isPrivate ? 'Private' : 'Public'
        },
        
        getRoomCountry(room) {
            if (room.id.startsWith('auto_')) {
                const parts = room.id.split('_')
                return parts[1]?.toUpperCase() || 'Unknown'
            }
            return room.country || 'Global'
        },
        
        refreshData() {
            if (this.autoRefreshEnabled) {
                this.getRoomList()
                if (this.selectedRoom) {
                    this.getRoomClients(this.selectedRoom.id)
                }
            }
        },
        
        // Real-time Helper Functions
        updateRoomClientCount(roomId, change) {
            if (!roomId || !this.rooms) return
            
            const room = this.rooms.find(r => r.id === roomId)
            if (room) {
                room.clientCount = Math.max(0, (room.clientCount || 0) + change)
            }
        },
        
        markRoomActivity(roomId) {
            if (!roomId) return
            
            if (!this.roomActivity) {
                this.roomActivity = {}
            }
            
            if (!this.roomActivity[roomId]) {
                this.roomActivity[roomId] = {}
            }
            
            this.roomActivity[roomId].lastActivity = Date.now()
            this.roomActivity[roomId].isActive = true
        },
        
        addActivity(type, message) {
            if (!this.recentActivity) {
                this.recentActivity = []
            }
            
            this.recentActivity.unshift({
                type,
                message,
                timestamp: Date.now()
            })
            
            // Keep only last 20 activities
            if (this.recentActivity.length > 20) {
                this.recentActivity = this.recentActivity.slice(0, 20)
            }
        },
        
        showToast(message, type = 'info') {
            if (!this.showToastNotifications) return
            
            if (!this.notifications) {
                this.notifications = []
            }
            
            const toast = {
                id: Date.now(),
                message,
                type,
                timestamp: Date.now()
            }
            
            this.notifications.push(toast)
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                this.removeNotification(toast.id)
            }, 5000)
        },
        
        removeNotification(id) {
            if (!this.notifications) {
                this.notifications = []
                return
            }
            this.notifications = this.notifications.filter(n => n.id !== id)
        },
        
        toggleAutoRefresh() {
            this.autoRefreshEnabled = !this.autoRefreshEnabled
            if (this.autoRefreshEnabled) {
                this.addMessage('system', '🔄 เปิดใช้ Auto-refresh')
            } else {
                this.addMessage('system', '⏸️ ปิดใช้ Auto-refresh')
            }
        },
        
        toggleToastNotifications() {
            this.showToastNotifications = !this.showToastNotifications
            if (this.showToastNotifications) {
                this.addMessage('system', '🔔 เปิดใช้ Toast notifications')
            } else {
                this.addMessage('system', '🔕 ปิดใช้ Toast notifications')
            }
        },
        
        getRoomActivityStatus(roomId) {
            if (!this.roomActivity || !roomId) return 'inactive'
            
            const activity = this.roomActivity[roomId]
            if (!activity || !activity.lastActivity) return 'inactive'
            
            const timeDiff = Date.now() - activity.lastActivity
            if (timeDiff < 60000) return 'very-active' // < 1 minute
            if (timeDiff < 300000) return 'active' // < 5 minutes
            return 'inactive'
        },
        
        formatActivityTime(timestamp) {
            const diff = Date.now() - timestamp
            const minutes = Math.floor(diff / 60000)
            const hours = Math.floor(minutes / 60)
            
            if (hours > 0) return `${hours}h ago`
            if (minutes > 0) return `${minutes}m ago`
            return 'just now'
        },

        // New Real-time Event Handlers
        handleHeartbeat(data) {
            if (data.stats) {
                this.totalClients = data.stats.totalClients || data.connections || 0
                this.totalRooms = data.stats.totalRooms || data.rooms || 0
                this.stats.totalRooms = this.totalRooms
            }
            
            // อัพเดต connection indicator แต่ไม่แสดง message
            this.addActivity('system', '💓 Heartbeat received')
            
            // Update last heartbeat time
            this.lastHeartbeat = Date.now()
            
            // Subtle UI indicator
            this.showConnectionHealth(true)
        },

        handleAutoStatsUpdate(data) {
            if (data.stats) {
                this.totalClients = data.stats.totalClients || 0
                this.totalRooms = data.stats.totalRooms || 0
                this.rooms = data.stats.rooms || []
                this.clients = data.stats.connections || []
                this.stats.totalRooms = this.totalRooms
            }
            
            this.addMessage('info', `📊 Auto-refresh: ${this.totalRooms} ห้อง, ${this.totalClients} ผู้ใช้`)
            if (this.notificationSettings.showAutoRefresh) {
                this.showToast('📊 อัพเดตข้อมูลอัตโนมัติ', 'info')
            }
        },

        handleImmediateStatsUpdate(data) {
            if (data.stats) {
                this.totalClients = data.stats.totalClients || 0
                this.totalRooms = data.stats.totalRooms || 0
                this.rooms = data.stats.rooms || []
                this.clients = data.stats.connections || []
                this.stats.totalRooms = this.totalRooms
            }
            
            if (data.urgency === 'immediate' && this.notificationSettings.showImmediateUpdates) {
                this.addMessage('info', `⚡ อัพเดตทันที: ${this.totalRooms} ห้อง, ${this.totalClients} ผู้ใช้`)
                this.showToast('⚡ ได้รับการอัพเดตแบบ Real-time', 'success')
            }
            
            this.$forceUpdate()
        },

        handleConnectionList(data) {
            this.clients = data.connections || []
            this.addMessage('info', `👥 อัพเดตรายการการเชื่อมต่อ: ${this.clients.length} ผู้ใช้`)
        },

        handleClientListUpdated(data) {
            this.clients = data.clients || []
            this.addMessage('info', `👥 อัพเดตรายการผู้ใช้: ${this.clients.length} ผู้ใช้`)
        },

        handleRoomActivityUpdate(data) {
            if (data.roomId && data.activity) {
                if (!this.roomActivity) {
                    this.roomActivity = {}
                }
                
                this.roomActivity[data.roomId] = {
                    ...this.roomActivity[data.roomId],
                    ...data.activity,
                    lastActivity: Date.now()
                }
                
                // อัพเดต room ใน list
                const room = this.rooms.find(r => r.id === data.roomId)
                if (room) {
                    room.lastActivity = Date.now()
                    room.isActive = data.activity.isActive
                }
            }
            
            this.addMessage('room', `🏠 กิจกรรมห้อง ${data.roomId}: ${data.activity?.type || 'อัพเดต'}`)
        },

        // Connection Health Management
        showConnectionHealth(isHealthy) {
            this.connectionHealth = isHealthy
            
            if (isHealthy) {
                this.realTimeStatus.missedHeartbeats = 0
            } else {
                this.realTimeStatus.missedHeartbeats++
                
                if (this.realTimeStatus.missedHeartbeats >= this.realTimeStatus.maxMissedHeartbeats) {
                    this.showToast('⚠️ การเชื่อมต่ออาจไม่เสถียร', 'warning')
                    this.addMessage('warning', '⚠️ ไม่ได้รับ heartbeat หลายครั้ง - การเชื่อมต่อไม่เสถียร')
                }
            }
        },

        startHeartbeatMonitor() {
            this.heartbeatMonitorInterval = setInterval(() => {
                if (this.connected && this.lastHeartbeat) {
                    const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat
                    
                    if (timeSinceLastHeartbeat > (this.realTimeStatus.heartbeatInterval * 1.5)) {
                        this.showConnectionHealth(false)
                    }
                }
            }, this.realTimeStatus.heartbeatInterval)
        },

        // Debug Tools
        getRealtimeDebugInfo() {
            return {
                connected: this.connected,
                connectionHealth: this.connectionHealth,
                lastHeartbeat: this.lastHeartbeat,
                missedHeartbeats: this.realTimeStatus.missedHeartbeats,
                totalMessages: this.stats.messagesReceived,
                autoRefreshEnabled: this.autoRefreshEnabled,
                timestamp: Date.now()
            }
        },

        debugRealtime() {
            console.table(this.getRealtimeDebugInfo())
            this.addMessage('debug', `Debug info: ${JSON.stringify(this.getRealtimeDebugInfo(), null, 2)}`)
        },

        // DO operation report handler - รายงานผลการทำงานของ DO
        handleDOOperationReport(data) {
            if (data.id && data.operation) {
                const operationEmoji = {
                    'CREATE': '🆕',
                    'UPDATE': '📝',
                    'DELETE': '🗑️',
                    'CLEANUP': '🧹'
                }[data.operation] || '🏠'

                this.addMessage('do', `${operationEmoji} [DO-REPORT] ID: ${data.id} | Operation: ${data.operation}`)
                
                // อัพเดต stats ตาม operation
                if (data.stats) {
                    this.updateDOStats(data.stats)
                }

                // แสดง toast notification สำหรับ operations สำคัญ
                if (['CREATE', 'DELETE'].includes(data.operation)) {
                    this.showToast(`${operationEmoji} DO ${data.operation}: ${data.id}`, 'info')
                }
            }
        },

        // DO countdown handler - จัดการ countdown สำหรับ DO operations
        handleDOCountdown(data) {
            if (data.id && data.remainingTime) {
                this.addMessage('do', `⏰ [DO-COUNTDOWN] Next cleanup in ${data.remainingTime} seconds`)
                
                // เก็บข้อมูล countdown
                if (!this.doCountdowns) {
                    this.doCountdowns = {}
                }
                this.doCountdowns[data.id] = {
                    remainingTime: data.remainingTime,
                    timestamp: Date.now()
                }
            }
        },

        // DO error handler - จัดการ errors จาก DO
        handleDOError(data) {
            if (data.id && data.error) {
                this.addMessage('error', `❌ [DO-ERROR] ID: ${data.id} | Error: ${data.error}`)
                this.showToast(`❌ DO Error: ${data.error}`, 'error')
            }
        },

        // อัพเดต DO stats
        updateDOStats(stats) {
            if (!this.doStats) {
                this.doStats = {
                    totalOperations: 0,
                    activeInstances: 0,
                    operationCounts: {
                        CREATE: 0,
                        UPDATE: 0,
                        DELETE: 0,
                        CLEANUP: 0
                    }
                }
            }

            this.doStats = {
                ...this.doStats,
                ...stats
            }
        },

        // คำนวณ progress percentage สำหรับ countdown
        getCountdownProgress(countdown) {
            const elapsed = (Date.now() - countdown.timestamp) / 1000
            const progress = 100 - (elapsed / countdown.remainingTime * 100)
            return Math.max(0, Math.min(100, progress))
        }
    },
    
    mounted() {
        // Auto connect as host
        this.connectAsHost()
        
        // Start heartbeat monitor
        this.startHeartbeatMonitor()
        
        // Reduced auto refresh interval since we have real-time updates
        this.refreshInterval = setInterval(() => {
            if (this.connected && this.autoRefreshEnabled) {
                // Backup refresh only when real-time fails
                if (!this.connectionHealth) {
                    this.refreshData()
                    this.addMessage('info', '🔄 Backup refresh เนื่องจากการเชื่อมต่อมีปัญหา')
                }
            }
        }, 60000) // เพิ่มเป็น 60 วินาทีเนื่องจากมี real-time updates
        
        // Real-time events reduce need for constant polling
        this.autoRefreshEnabled = false // ปิดโดยค่าเริ่มต้น
        this.showToastNotifications = true
    },
    
    beforeUnmount() {
        if (this.hostWs) {
            this.hostWs.close()
        }
        
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval)
        }
        
        if (this.heartbeatMonitorInterval) {
            clearInterval(this.heartbeatMonitorInterval)
        }
    }
}
</script>

<template>
    <div class="host-panel">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <h1>
                    <i :class="['fas', `fa-${PageIcon}`]"></i>
                    {{ PageName }}
                </h1>
                <div class="host-info">
                    <span>Host ID: {{ hostId?.substring(0, 8) || 'N/A' }}</span>
                    <span>{{ connectionDuration }}</span>
                </div>
            </div>
            <div class="connection-status" :class="{ 
                connected, 
                'connection-healthy': connectionHealth,
                'connection-warning': !connectionHealth && connected 
            }">
                <i :class="[
                    'fas', 
                    connected ? (connectionHealth ? 'fa-crown' : 'fa-crown-warning') : 'fa-crown-slash'
                ]"></i>
                {{ connected ? 
                    (connectionHealth ? 'Host ทำงาน (Real-time)' : 'Host ทำงาน (การเชื่อมต่อมีปัญหา)') : 
                    'Host ออฟไลน์' 
                }}
                
                <!-- Real-time indicator -->
                <div v-if="connected && connectionHealth" class="realtime-indicator">
                    <i class="fas fa-circle pulse"></i>
                    <span>Live</span>
                </div>
            </div>
        </div>

        <!-- Loading -->
        <Loader v-if="loading" />

        <!-- Main Content -->
        <div v-else class="content">
            <!-- Stats Bar with Real-time Indicators -->
            <div class="stats-bar">
                <div class="stat-item">
                    <span class="stat-value">{{ totalRooms }}</span>
                    <span class="stat-label">ห้อง</span>
                    <div v-if="connectionHealth" class="realtime-badge">Live</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ activeRooms.length }}</span>
                    <span class="stat-label">ห้องที่ใช้งาน</span>
                    <div v-if="connectionHealth" class="realtime-badge">Live</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ totalClients }}</span>
                    <span class="stat-label">ผู้ใช้</span>
                    <div v-if="connectionHealth" class="realtime-badge">Live</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ stats.broadcastsSent }}</span>
                    <span class="stat-label">ข้อความที่ส่ง</span>
                </div>
            </div>

            <!-- NEW: Performance Stats Section -->
            <div v-if="showAdvancedStats && connected" class="performance-stats">
                <div class="performance-stat">
                    <span class="performance-stat-value">{{ connectionUptimeFormatted }}</span>
                    <span class="performance-stat-label">เวลาเชื่อมต่อ</span>
                </div>
                <div class="performance-stat">
                    <span class="performance-stat-value">{{ realTimeStatsFormatted.messageLatency }}</span>
                    <span class="performance-stat-label">ความหน่วง</span>
                </div>
                <div class="performance-stat">
                    <span class="performance-stat-value">{{ realTimeStatsFormatted.health }}</span>
                    <span class="performance-stat-label">สถานะ</span>
                </div>
                <div class="performance-stat">
                    <span class="performance-stat-value">{{ connectedHosts }}</span>
                    <span class="performance-stat-label">Hosts</span>
                </div>
            </div>

            <!-- Controls -->
            <div class="controls">
                <button @click="connectAsHost" :disabled="connected" class="btn btn-success">
                    <i class="fas fa-plug"></i> Connect
                </button>
                <button @click="disconnectHost" :disabled="!connected" class="btn btn-danger">
                    <i class="fas fa-plug-circle-xmark"></i> Disconnect
                </button>
                <button @click="refreshData" :disabled="!connected" class="btn btn-info">
                    <i class="fas fa-refresh"></i> {{ autoRefreshEnabled ? 'Manual Refresh' : 'Refresh (Manual)' }}
                </button>
                
                <div class="realtime-controls">
                    <button @click="toggleAutoRefresh" 
                            class="btn btn-toggle" 
                            :class="{ 'active': autoRefreshEnabled }">
                        <i :class="['fas', autoRefreshEnabled ? 'fa-pause' : 'fa-play']"></i>
                        {{ autoRefreshEnabled ? 'Disable Auto-refresh' : 'Enable Auto-refresh' }}
                    </button>
                    <button @click="toggleToastNotifications" 
                            class="btn btn-toggle" 
                            :class="{ 'active': showToastNotifications }">
                        <i :class="['fas', showToastNotifications ? 'fa-bell-slash' : 'fa-bell']"></i>
                        {{ showToastNotifications ? 'Disable Notifications' : 'Enable Notifications' }}
                    </button>
                </div>
                
                <div class="broadcast-control">
                    <input v-model="broadcastMessage" 
                           type="text" 
                           placeholder="Global broadcast message"
                           :disabled="!connected"
                           @keyup.enter="broadcastToAll">
                    <button @click="broadcastToAll" 
                            :disabled="!connected || !broadcastMessage.trim()" 
                            class="btn btn-warning">
                        <i class="fas fa-broadcast-tower"></i> Broadcast All
                    </button>
                </div>
            </div>

            <!-- Room List View -->
            <div v-if="!selectedRoom" class="room-list-view">
                <h2>🏠 Active Rooms ({{ activeRooms.length }})</h2>
                
                <div v-if="activeRooms.length === 0" class="no-rooms">
                    ไม่มีห้องที่มี clients
                </div>
                
                <div v-else class="rooms-grid">
                    <div v-for="room in activeRooms" 
                         :key="room.id" 
                         class="room-card"
                         :class="getRoomActivityStatus(room.id)"
                         @click="selectRoom(room)">
                        <div class="room-header">
                            <div class="room-name">{{ room.name || room.id }}</div>
                            <div class="room-type">{{ getRoomType(room) }}</div>
                            <div class="room-activity" :class="getRoomActivityStatus(room.id)">
                                <i class="fas fa-circle"></i>
                                {{ getRoomActivityStatus(room.id) === 'very-active' ? 'Very Active' : 
                                   getRoomActivityStatus(room.id) === 'active' ? 'Active' : 'Inactive' }}
                            </div>
                        </div>
                        <div class="room-stats">
                            <div class="stat">
                                <i class="fas fa-users"></i>
                                <span>{{ room.clientCount || 0 }} clients</span>
                            </div>
                            <div class="stat">
                                <i class="fas fa-comments"></i>
                                <span>{{ room.messageCount || 0 }} messages</span>
                            </div>
                            <div class="stat">
                                <i class="fas fa-globe"></i>
                                <span>{{ getRoomCountry(room) }}</span>
                            </div>
                        </div>
                        <div class="room-footer">
                            <div class="room-id">{{ room.id }}</div>
                            <div v-if="roomActivity[room.id]" class="last-activity">
                                {{ formatActivityTime(roomActivity[room.id].lastActivity) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Room Detail View -->
            <div v-else class="room-detail-view">
                <div class="room-detail-header">
                    <button @click="backToRoomList" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i> Back to Rooms
                    </button>
                    <h2>{{ selectedRoom.name || selectedRoom.id }}</h2>
                    <div class="room-detail-info">
                        <span>{{ selectedRoomClients.length }} clients</span>
                        <span>{{ getRoomType(selectedRoom) }}</span>
                        <span>{{ getRoomCountry(selectedRoom) }}</span>
                    </div>
                </div>

                <!-- Room Broadcast -->
                <div class="room-broadcast">
                    <input v-model="roomBroadcastMessage" 
                           type="text" 
                           placeholder="Message to this room"
                           :disabled="!connected"
                           @keyup.enter="broadcastToRoom">
                    <button @click="broadcastToRoom" 
                            :disabled="!connected || !roomBroadcastMessage.trim()" 
                            class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i> Send to Room
                    </button>
                </div>

                <!-- Clients Grid -->
                <div v-if="selectedRoomClients.length === 0" class="no-clients">
                    ไม่มี clients ในห้องนี้
                </div>
                
                <div v-else class="clients-grid">
                    <div v-for="client in selectedRoomClients" 
                         :key="client.id" 
                         class="client-card">
                        <div class="client-header">
                            <div class="client-id">{{ client.id.substring(0, 8) }}...</div>
                            <div class="client-status online">
                                <i class="fas fa-circle"></i> Online
                            </div>
                        </div>
                        
                        <div class="client-info">
                            <div class="info-row">
                                <span>Country:</span>
                                <span>{{ client.country || 'Unknown' }}</span>
                            </div>
                            <div class="info-row">
                                <span>Connected:</span>
                                <span>{{ formatTimestamp(client.connectedAt) }}</span>
                            </div>
                        </div>

                        <!-- Last Message -->
                        <div v-if="client.lastMessage" class="client-message">
                            <div class="message-time">{{ new Date(client.lastMessageTime).toLocaleTimeString('th-TH') }}</div>
                            <div class="message-content">{{ client.lastMessage }}</div>
                        </div>

                        <div class="client-actions">
                            <button @click="kickClient(client.id)" 
                                    :disabled="!connected"
                                    class="btn btn-danger btn-sm">
                                <i class="fas fa-user-slash"></i> Kick
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div v-if="recentActivity && recentActivity.length > 0" class="recent-activity">
                <div class="activity-header">
                    <h3>🔄 Recent Activity</h3>
                    <span class="activity-count">{{ (recentActivity || []).length }} activities</span>
                </div>
                <div class="activity-list">
                    <div v-for="(activity, index) in (recentActivity || []).slice(0, 10)" 
                         :key="index" 
                         class="activity-item"
                         :class="activity.type">
                        <div class="activity-icon">
                            <i :class="[
                                'fas', 
                                activity.type === 'connect' ? 'fa-user-plus' :
                                activity.type === 'disconnect' ? 'fa-user-minus' :
                                activity.type === 'join' ? 'fa-door-open' :
                                activity.type === 'leave' ? 'fa-door-closed' :
                                'fa-activity'
                            ]"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-message">{{ activity.message }}</div>
                            <div class="activity-time">{{ formatActivityTime(activity.timestamp) }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Messages Log -->
            <div class="messages-log">
                <div class="log-header">
                    <h3>📋 Messages Log</h3>
                    <button @click="clearMessages" class="btn btn-sm">
                        <i class="fas fa-trash"></i> Clear
                    </button>
                </div>
                <div class="messages-container">
                    <div v-if="messages.length === 0" class="no-messages">
                        ยังไม่มีข้อความ
                    </div>
                    <div v-else>
                        <div v-for="(message, index) in recentMessages" 
                             :key="index" 
                             class="message-item"
                             :class="message.type">
                            <span class="message-time">{{ message.timestamp }}</span>
                            <span class="message-type">{{ message.type }}</span>
                            <span class="message-content">{{ message.content }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Toast Notifications -->
            <div class="toast-container">
                <div v-for="notification in (notifications || [])" 
                     :key="notification.id" 
                     class="toast-notification"
                     :class="notification.type">
                    <div class="toast-content">
                        <div class="toast-message">{{ notification.message }}</div>
                        <button @click="removeNotification(notification.id)" class="toast-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- DO Stats Section -->
            <div v-if="doStats" class="do-stats-section">
                <div class="section-header">
                    <h3>🏠 DO Statistics</h3>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🔄</div>
                        <div class="stat-value">{{ getDOStatsFormatted().totalOperations }}</div>
                        <div class="stat-label">Total Operations</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⚡</div>
                        <div class="stat-value">{{ getDOStatsFormatted().activeInstances }}</div>
                        <div class="stat-label">Active Instances</div>
                    </div>
                    <div class="stat-card operations">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value operations-grid">
                            <span v-for="(count, op) in doStats.operationCounts" :key="op"
                                  class="operation-count">
                                {{ op }}: {{ count }}
                            </span>
                        </div>
                        <div class="stat-label">Operation Counts</div>
                    </div>
                </div>
            </div>

            <!-- DO Countdowns Section -->
            <div v-if="Object.keys(doCountdowns).length > 0" class="do-countdowns-section">
                <div class="section-header">
                    <h3>⏰ Active Countdowns</h3>
                </div>
                <div class="countdowns-grid">
                    <div v-for="(countdown, id) in doCountdowns" :key="id"
                         class="countdown-card">
                        <div class="countdown-header">
                            <span class="countdown-id">{{ id }}</span>
                            <span class="countdown-time">{{ countdown.remainingTime }}s</span>
                        </div>
                        <div class="countdown-progress">
                            <div class="progress-bar"
                                 :style="{ width: getCountdownProgress(countdown) + '%' }">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.host-panel {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    color: white;
}

.header-left h1 {
    margin: 0 0 10px 0;
    font-size: 2rem;
    font-weight: 600;
}

.host-info {
    display: flex;
    gap: 15px;
    font-size: 0.9rem;
    opacity: 0.9;
}

.connection-status {
    padding: 12px 24px;
    border-radius: 25px;
    background: rgba(220, 53, 69, 0.9);
    color: white;
    font-weight: 500;
    transition: all 0.3s ease;
}

.connection-status.connected {
    background: rgba(40, 167, 69, 0.9);
    box-shadow: 0 0 15px rgba(40, 167, 69, 0.4);
}

.connection-status.connection-warning {
    background: rgba(245, 158, 11, 0.9);
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
}

.connection-status.connection-healthy {
    background: rgba(40, 167, 69, 0.9);
    box-shadow: 0 0 15px rgba(40, 167, 69, 0.4);
    animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 15px rgba(40, 167, 69, 0.4); }
    50% { box-shadow: 0 0 25px rgba(40, 167, 69, 0.6); }
}

.content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.stats-bar {
    display: flex;
    gap: 20px;
    justify-content: center;
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.stat-item {
    text-align: center;
    padding: 0 20px;
}

.stat-value {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: #667eea;
}

.stat-label {
    display: block;
    font-size: 0.9rem;
    color: #6b7280;
    margin-top: 5px;
}

.controls {
    display: flex;
    gap: 15px;
    align-items: center;
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    flex-wrap: wrap;
}

.realtime-controls {
    display: flex;
    gap: 10px;
    margin-left: 10px;
}

.btn-toggle {
    background: #f8f9fa;
    border: 2px solid #dee2e6;
    color: #495057;
    transition: all 0.3s ease;
    position: relative;
}

.btn-toggle.active {
    background: linear-gradient(45deg, #28a745, #20c997);
    border-color: #28a745;
    color: white;
    box-shadow: 0 0 15px rgba(40, 167, 69, 0.3);
}

.btn-toggle:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #adb5bd;
}

.btn-toggle.active:hover:not(:disabled) {
    background: linear-gradient(45deg, #218838, #1ea085);
    border-color: #1e7e34;
    box-shadow: 0 0 20px rgba(40, 167, 69, 0.4);
}

.btn-toggle.active:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-toggle.active:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.broadcast-control {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-left: auto;
}

.broadcast-control input {
    padding: 10px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    width: 300px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-sm {
    padding: 6px 12px;
    font-size: 0.8rem;
}

.btn-success { background: #059669; color: white; }
.btn-danger { background: #dc2626; color: white; }
.btn-info { background: #0891b2; color: white; }
.btn-warning { background: #d97706; color: white; }
.btn-primary { background: #2563eb; color: white; }
.btn-secondary { background: #6b7280; color: white; }

.room-list-view, .room-detail-view {
    background: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.room-list-view h2 {
    margin: 0 0 20px 0;
    color: #1f2937;
    font-size: 1.5rem;
}

.no-rooms {
    text-align: center;
    padding: 60px;
    color: #6b7280;
    font-style: italic;
    font-size: 1.1rem;
}

.rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
}

.room-card {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    background: #f9fafb;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.room-card:hover {
    border-color: #667eea;
    background: white;
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    transform: translateY(-2px);
}

.room-card.very-active {
    border-color: #10b981;
    background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}

.room-card.active {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
}

.room-card.inactive {
    border-color: #9ca3af;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.room-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
    flex-wrap: wrap;
    gap: 10px;
}

.room-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1f2937;
    flex: 1;
    min-width: 0;
}

.room-type {
    background: #667eea;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.room-activity {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.8);
    margin-top: 5px;
}

.room-activity.very-active {
    color: #059669;
    background: rgba(16, 185, 129, 0.1);
}

.room-activity.active {
    color: #d97706;
    background: rgba(245, 158, 11, 0.1);
}

.room-activity.inactive {
    color: #6b7280;
    background: rgba(107, 114, 128, 0.1);
}

.room-activity i {
    font-size: 0.6rem;
}

.room-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid #e5e7eb;
}

.last-activity {
    font-size: 0.8rem;
    color: #6b7280;
    font-style: italic;
}

.room-stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;
}

.stat {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
}

.stat i {
    width: 16px;
    color: #667eea;
}

.room-id {
    font-family: monospace;
    font-size: 0.8rem;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
    padding-top: 10px;
}

.room-detail-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e5e7eb;
}

.room-detail-header h2 {
    margin: 0;
    flex: 1;
    color: #1f2937;
}

.room-detail-info {
    display: flex;
    gap: 15px;
    color: #6b7280;
}

.room-broadcast {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    padding: 20px;
    background: #f3f4f6;
    border-radius: 10px;
}

.room-broadcast input {
    flex: 1;
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
}

.no-clients {
    text-align: center;
    padding: 60px;
    color: #6b7280;
    font-style: italic;
    font-size: 1.1rem;
}

.clients-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.client-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 20px;
    background: #f9fafb;
    transition: all 0.2s ease;
}

.client-card:hover {
    border-color: #667eea;
    background: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.client-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.client-id {
    font-family: monospace;
    font-weight: 600;
    color: #1f2937;
    font-size: 1.1rem;
}

.client-status.online {
    color: #059669;
    font-size: 0.9rem;
    font-weight: 600;
}

.client-info {
    margin-bottom: 15px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 0.9rem;
}

.info-row span:first-child {
    color: #6b7280;
    font-weight: 500;
}

.info-row span:last-child {
    color: #1f2937;
    font-weight: 600;
}

.client-message {
    background: #e0e7ff;
    border-left: 4px solid #667eea;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 15px;
}

.message-time {
    font-size: 0.8rem;
    color: #6b7280;
    margin-bottom: 5px;
}

.message-content {
    color: #1f2937;
    font-weight: 500;
    word-break: break-word;
}

.client-actions {
    text-align: right;
}

/* Recent Activity */
.recent-activity {
    background: white;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f3f4f6;
}

.activity-header h3 {
    margin: 0;
    color: #1f2937;
}

.activity-count {
    background: #667eea;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.activity-item:hover {
    background: #f9fafb;
}

.activity-item.connect {
    border-left: 4px solid #10b981;
    background: rgba(16, 185, 129, 0.05);
}

.activity-item.disconnect {
    border-left: 4px solid #ef4444;
    background: rgba(239, 68, 68, 0.05);
}

.activity-item.join {
    border-left: 4px solid #3b82f6;
    background: rgba(59, 130, 246, 0.05);
}

.activity-item.leave {
    border-left: 4px solid #f59e0b;
    background: rgba(245, 158, 11, 0.05);
}

.activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.activity-item.connect .activity-icon {
    background: rgba(16, 185, 129, 0.2);
    color: #059669;
}

.activity-item.disconnect .activity-icon {
    background: rgba(239, 68, 68, 0.2);
    color: #dc2626;
}

.activity-item.join .activity-icon {
    background: rgba(59, 130, 246, 0.2);
    color: #2563eb;
}

.activity-item.leave .activity-icon {
    background: rgba(245, 158, 11, 0.2);
    color: #d97706;
}

.activity-content {
    flex: 1;
}

.activity-message {
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 2px;
}

.activity-time {
    font-size: 0.8rem;
    color: #6b7280;
}

/* Toast Notifications */
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
}

.toast-notification {
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    border-left: 5px solid #667eea;
    animation: slideIn 0.3s ease-out;
    overflow: hidden;
}

.toast-notification.success {
    border-left-color: #10b981;
}

.toast-notification.warning {
    border-left-color: #f59e0b;
}

.toast-notification.error {
    border-left-color: #ef4444;
}

.toast-notification.info {
    border-left-color: #3b82f6;
}

.toast-notification.realtime {
    border-left-color: #10b981;
    background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
}

.toast-notification.realtime .toast-content {
    position: relative;
}

.toast-notification.realtime::before {
    content: '⚡';
    position: absolute;
    left: -15px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
}

.toast-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
}

.toast-message {
    font-weight: 500;
    color: #1f2937;
    flex: 1;
}

.toast-close {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.toast-close:hover {
    background: #f3f4f6;
    color: #1f2937;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.messages-log {
    background: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.log-header h3 {
    margin: 0;
    color: #1f2937;
}

.messages-container {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
}

.no-messages {
    text-align: center;
    padding: 40px;
    color: #6b7280;
    font-style: italic;
}

.message-item {
    padding: 10px 15px;
    border-bottom: 1px solid #e5e7eb;
    display: grid;
    grid-template-columns: 80px 100px 1fr;
    gap: 15px;
    font-size: 0.85rem;
}

.message-item:last-child {
    border-bottom: none;
}

.message-time {
    color: #6b7280;
    font-family: monospace;
}

.message-type {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 4px;
    text-align: center;
}

.message-content {
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-word;
}

.message-item.system .message-type { background: #dbeafe; color: #1d4ed8; }
.message-item.welcome .message-type { background: #dcfce7; color: #166534; }
.message-item.client .message-type { background: #fef3c7; color: #92400e; }
.message-item.message .message-type { background: #e0e7ff; color: #3730a3; }
.message-item.broadcast .message-type { background: #fed7aa; color: #c2410c; }
.message-item.info .message-type { background: #cffafe; color: #0e7490; }
.message-item.sent .message-type { background: #f3e8ff; color: #7c3aed; }
.message-item.received .message-type { background: #ecfdf5; color: #059669; }
.message-item.error .message-type { background: #fef2f2; color: #dc2626; }

/* Real-time Indicator */
.realtime-indicator {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    margin-top: 5px;
    opacity: 0.9;
}

.realtime-indicator .fa-circle {
    color: #10b981;
    font-size: 0.6rem;
}

.pulse {
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

/* Real-time Badge */
.realtime-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    background: linear-gradient(45deg, #10b981, #059669);
    color: white;
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
    animation: pulse-badge 2s infinite;
}

@keyframes pulse-badge {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* Performance Stats Styles */
.performance-stats {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    margin-top: 15px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
}

.performance-stat {
    text-align: center;
}

.performance-stat-value {
    display: block;
    font-weight: 700;
    color: #1e293b;
    font-size: 1.1rem;
}

.performance-stat-label {
    display: block;
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 2px;
}

/* DO Stats Styles */
.do-stats-section {
    background: linear-gradient(135deg, #1a1c2d 0%, #2a2d3e 100%);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    color: #fff;
}

.section-header {
    margin-bottom: 15px;
}

.section-header h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.stat-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stat-icon {
    font-size: 1.5rem;
    margin-bottom: 10px;
}

.stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 5px 0;
}

.stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
}

.operations-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    font-size: 1rem;
}

.operation-count {
    background: rgba(255, 255, 255, 0.05);
    padding: 4px;
    border-radius: 4px;
    font-size: 0.9rem;
}

/* DO Countdowns Styles */
.do-countdowns-section {
    background: linear-gradient(135deg, #2a2d3e 0%, #1a1c2d 100%);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    color: #fff;
}

.countdowns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.countdown-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 15px;
    position: relative;
    overflow: hidden;
}

.countdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.countdown-id {
    font-family: monospace;
    font-size: 0.9rem;
    opacity: 0.8;
}

.countdown-time {
    font-weight: 600;
    color: #10b981;
}

.countdown-progress {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
    transition: width 1s linear;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
    .host-panel {
        padding: 15px;
    }
    
    .header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
    
    .stats-bar {
        flex-direction: column;
        gap: 10px;
    }
    
    .controls {
        flex-direction: column;
        align-items: stretch;
    }
    
    .broadcast-control {
        margin-left: 0;
        flex-direction: column;
    }
    
    .broadcast-control input {
        width: 100%;
    }
    
    .rooms-grid {
        grid-template-columns: 1fr;
    }
    
    .clients-grid {
        grid-template-columns: 1fr;
    }
    
    .room-detail-header {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }
    
    .room-broadcast {
        flex-direction: column;
    }
    
    .message-item {
        grid-template-columns: 1fr;
        gap: 5px;
    }
    
    .stats-grid,
    .countdowns-grid {
        grid-template-columns: 1fr;
    }
    
    .operation-count {
        font-size: 0.8rem;
    }
}
</style>
