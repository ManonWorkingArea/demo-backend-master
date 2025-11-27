/**
 * Notification Service
 * ตัวกลางในการจัดการ notifications ระหว่าง Client/Host และ NotificationManager
 * รองรับทั้ง reactive updates และ event handling
 */

import NotificationManager from './NotificationManager.js';

class NotificationService {
    constructor() {
        this.notificationManager = NotificationManager;
        this.reactiveCallbacks = new Set(); // เก็บ callbacks สำหรับ reactive updates
        this.eventListeners = new Map(); // เก็บ event listeners
        this.isInitialized = false;
        
        // Configuration
        this.config = {
            autoRemove: true,
            maxVisible: 5,
            soundEnabled: true,
            debugMode: process.env.NODE_ENV === 'development'
        };
        
        // Statistics
        this.statistics = {
            totalNotifications: 0,
            totalRemoved: 0,
            totalCleared: 0
        };
        
        this.initialize();
    }
    
    /**
     * Initialize notification service
     */
    initialize() {
        if (this.isInitialized) return;
        
        // Listen to NotificationManager events
        this.setupEventListeners();
        
        this.isInitialized = true;
        this.log('✅ NotificationService initialized');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for notifications-updated events
        if (typeof window !== 'undefined') {
            window.addEventListener('notifications-updated', this.handleNotificationsUpdated.bind(this));
        }
    }
    
    /**
     * Create notification from command
     */
    createNotification(command, options = {}) {
        try {
            // Apply configuration options (merge with current config)
            if (Object.keys(options).length > 0) {
                this.updateConfig(options);
            }
            
            // Create notification via NotificationManager
            const notification = this.notificationManager.createNotification(command);
            
            if (notification) {
                this.statistics.totalNotifications++;
                this.log(`📢 Notification created: ${notification.title}`);
                
                // Trigger reactive updates
                this.triggerReactiveUpdate();
                
                // Emit custom event for external listeners
                this.emit('notification-created', { notification, command });
                
                return notification;
            } else {
                this.log(`🚫 Notification creation blocked (duplicate)`);
                return null;
            }
        } catch (error) {
            console.error('Failed to create notification:', error);
            return null;
        }
    }
    
    /**
     * Remove notification by ID
     */
    removeNotification(id) {
        try {
            const removed = this.notificationManager.removeNotification(id);
            
            if (removed) {
                this.statistics.totalRemoved++;
                this.log(`🗑️ Notification removed: ${id}`);
                
                // Trigger reactive updates
                this.triggerReactiveUpdate();
                
                // Emit custom event
                this.emit('notification-removed', { id });
            }
            
            return removed;
        } catch (error) {
            console.error('Failed to remove notification:', error);
            return false;
        }
    }
    
    /**
     * Clear all notifications
     */
    clearAllNotifications() {
        try {
            const count = this.getNotifications().length;
            this.notificationManager.clearAll();
            
            this.statistics.totalCleared += count;
            this.log(`🧹 All notifications cleared (${count})`);
            
            // Trigger reactive updates
            this.triggerReactiveUpdate();
            
            // Emit custom event
            this.emit('notifications-cleared', { count });
            
            return true;
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            return false;
        }
    }
    
    /**
     * Get all notifications (reactive)
     */
    getNotifications() {
        return this.notificationManager.getNotifications();
    }
    
    /**
     * Get visible notifications (limited by maxVisible)
     */
    getVisibleNotifications() {
        const notifications = this.getNotifications();
        return notifications.slice(0, this.config.maxVisible);
    }
    
    /**
     * Register reactive callback for Vue components (alias)
     */
    onReactiveUpdate(callback) {
        return this.registerReactiveCallback(callback);
    }
    
    /**
     * Get service statistics (alias for compatibility)
     */
    getStatistics() {
        return this.getServiceStats();
    }
    
    /**
     * Register reactive callback for Vue components
     */
    registerReactiveCallback(callback) {
        if (typeof callback === 'function') {
            this.reactiveCallbacks.add(callback);
            this.log(`📝 Reactive callback registered (${this.reactiveCallbacks.size} total)`);
            
            // Return unregister function
            return () => {
                this.reactiveCallbacks.delete(callback);
                this.log(`📝 Reactive callback unregistered (${this.reactiveCallbacks.size} remaining)`);
            };
        }
    }
    
    /**
     * Trigger reactive updates for all registered callbacks
     */
    triggerReactiveUpdate() {
        const notifications = this.getNotifications();
        
        this.reactiveCallbacks.forEach(callback => {
            try {
                callback(notifications);
            } catch (error) {
                console.error('Reactive callback error:', error);
            }
        });
        
        // Also emit window event for backward compatibility
        if (typeof window !== 'undefined') {
            const event = new CustomEvent('notifications-updated', {
                detail: { notifications }
            });
            window.dispatchEvent(event);
        }
    }
    
    /**
     * Handle notifications updated event
     */
    handleNotificationsUpdated() {
        this.log('🔄 Notifications updated event received');
        this.triggerReactiveUpdate();
    }
    
    /**
     * Event system for service
     */
    on(eventType, callback) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, new Set());
        }
        this.eventListeners.get(eventType).add(callback);
        
        // Return unsubscribe function
        return () => {
            const listeners = this.eventListeners.get(eventType);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    }
    
    /**
     * Emit event to listeners
     */
    emit(eventType, data) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Event listener error (${eventType}):`, error);
                }
            });
        }
    }
    
    /**
     * Reset duplicate protection
     */
    resetDuplicateProtection() {
        this.notificationManager.resetDuplicateProtection();
        this.log('🔄 Duplicate protection reset');
        
        this.emit('duplicate-protection-reset', {});
    }
    
    /**
     * Force create notification (bypass duplicate protection)
     */
    forceCreateNotification(command) {
        try {
            const notification = this.notificationManager.forceCreateNotification(command);
            
            if (notification) {
                this.statistics.totalNotifications++;
                this.log(`💪 Notification force created: ${notification.title}`);
                
                // Trigger reactive updates
                this.triggerReactiveUpdate();
                
                // Emit custom event
                this.emit('notification-created', { notification, command, forced: true });
            }
            
            return notification;
        } catch (error) {
            console.error('Failed to force create notification:', error);
            return null;
        }
    }
    
    /**
     * Get duplicate prevention statistics
     */
    getDuplicateStats() {
        return this.notificationManager.getDuplicatePreventionStats();
    }
    
    /**
     * Get service statistics
     */
    getServiceStats() {
        const managerStats = this.getDuplicateStats();
        
        return {
            ...this.statistics,
            reactiveCallbacks: this.reactiveCallbacks.size,
            eventListeners: Array.from(this.eventListeners.keys()).length,
            manager: managerStats,
            isInitialized: this.isInitialized
        };
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.log('⚙️ Configuration updated', this.config);
        
        this.emit('config-updated', { config: this.config });
    }
    
    /**
     * Enable/disable sound
     */
    setSoundEnabled(enabled) {
        this.config.soundEnabled = enabled;
        this.notificationManager.setSoundEnabled(enabled);
        this.log(`🔊 Sound ${enabled ? 'enabled' : 'disabled'}`);
        
        this.emit('sound-toggled', { enabled });
    }
    
    /**
     * Set maximum visible notifications
     */
    setMaxVisible(maxVisible) {
        this.config.maxVisible = Math.max(1, Math.min(20, maxVisible));
        this.log(`👁️ Max visible notifications: ${this.config.maxVisible}`);
        
        this.emit('max-visible-changed', { maxVisible: this.config.maxVisible });
    }
    
    /**
     * Check if notifications are available
     */
    hasNotifications() {
        return this.getNotifications().length > 0;
    }
    
    /**
     * Get notification count
     */
    getNotificationCount() {
        return this.getNotifications().length;
    }
    
    /**
     * Get urgent notifications count
     */
    getUrgentCount() {
        return this.getNotifications().filter(n => n.urgent).length;
    }
    
    /**
     * Export all notifications
     */
    exportNotifications() {
        const notifications = this.getNotifications();
        const data = {
            timestamp: new Date().toISOString(),
            count: notifications.length,
            statistics: this.getServiceStats(),
            notifications: notifications
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notifications-export-${new Date().toISOString().slice(0, 19)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.log('📄 Notifications exported');
        this.emit('notifications-exported', { count: notifications.length });
    }
    
    /**
     * Cleanup service
     */
    cleanup() {
        // Remove event listeners
        if (typeof window !== 'undefined') {
            window.removeEventListener('notifications-updated', this.handleNotificationsUpdated);
        }
        
        // Clear callbacks
        this.reactiveCallbacks.clear();
        this.eventListeners.clear();
        
        this.isInitialized = false;
        this.log('🧹 NotificationService cleaned up');
    }
    
    /**
     * Debug logging
     */
    log(message, data = null) {
        if (this.config.debugMode) {
            if (data) {
                console.log(`[NotificationService] ${message}`, data);
            } else {
                console.log(`[NotificationService] ${message}`);
            }
        }
    }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export for use in components
export default notificationService;

// Also make it available globally for debugging
if (typeof window !== 'undefined') {
    window.NotificationService = notificationService;
}
