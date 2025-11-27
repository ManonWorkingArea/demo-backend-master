/**
 * Notification Manager
 * จัดการ notifications สำหรับ commands ต่างๆ
 */
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.notificationId = 0;
        this.maxNotifications = 10;
        this.soundEnabled = true;
        this.recentCommands = new Map(); // เปลี่ยนเป็น Map เพื่อเก็บ timestamp
        this.duplicateCheckWindow = 2000; // 2 วินาที - เพิ่มขึ้นเล็กน้อย
        this.duplicatesPrevented = 0;
        this.statistics = {
            totalCreated: 0,
            totalPrevented: 0,
            byType: {}
        };
    }

    /**
     * สร้าง notification จาก command
     */
    createNotification(command) {
        // ตรวจสอบการซ้ำอย่างละเอียด
        if (this.isDuplicateNotification(command)) {
            this.duplicatesPrevented++;
            this.statistics.totalPrevented++;
            console.log('🚫 Duplicate notification prevented:', this.generateCommandKey(command));
            return null; // ไม่สร้าง notification ซ้ำ
        }
        
        // สร้าง unique key สำหรับ command
        const commandKey = this.generateCommandKey(command);
        const now = Date.now();
        
        // เพิ่ม command key พร้อม timestamp เข้า Map
        this.recentCommands.set(commandKey, now);
        
        // ลบ command keys ที่หมดอายุ
        this.cleanupExpiredCommands();

        const notification = {
            id: ++this.notificationId,
            type: command.type,
            title: this.getCommandTitle(command),
            message: this.getCommandMessage(command),
            urgent: command.payload?.urgent || false,
            priority: command.payload?.priority || 'normal',
            timestamp: new Date(),
            duration: this.getNotificationDuration(command),
            icon: this.getCommandIcon(command.type),
            color: this.getCommandColor(command.type),
            command: command // เก็บ command ต้นฉบับไว้
        };

        // เพิ่ม notification ลงใน array
        this.notifications.unshift(notification);

        // อัปเดตสถิติ
        this.statistics.totalCreated++;
        this.statistics.byType[command.type] = (this.statistics.byType[command.type] || 0) + 1;

        // จำกัดจำนวน notifications
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }

        // เล่นเสียงสำหรับ urgent notifications
        if (notification.urgent && this.soundEnabled) {
            this.playNotificationSound();
        }

        // ตั้งเวลาลบ notification อัตโนมัติ
        this.scheduleAutoRemove(notification);

        console.log('✅ Notification created:', notification.title);
        return notification;
    }

    /**
     * สร้าง unique key สำหรับ command เพื่อป้องกันการซ้ำ
     */
    generateCommandKey(command) {
        const payload = command.payload || {};
        // สำหรับการป้องกันการซ้ำ ใช้เฉพาะ content ไม่รวม timestamp
        const contentKey = `${command.type}_${payload.title || ''}_${payload.message || ''}`;
        return contentKey.replace(/\s+/g, '_').substring(0, 150);
    }

    /**
     * สร้าง unique key รวม timestamp สำหรับการจัดเก็บ
     */
    generateStorageKey(command) {
        const payload = command.payload || {};
        const timestamp = command.timestamp || Date.now();
        const source = command.source || 'unknown';
        const storageKey = `${command.type}_${payload.title || ''}_${payload.message || ''}_${source}_${timestamp}`;
        return storageKey.replace(/\s+/g, '_').substring(0, 200);
    }

    /**
     * ตรวจสอบว่า notification นี้เหมือนกับที่มีอยู่แล้วหรือไม่
     */
    isDuplicateNotification(command) {
        const commandKey = this.generateCommandKey(command);
        const now = Date.now();
        
        // ตรวจสอบใน recent commands พร้อมกับเวลา
        if (this.recentCommands.has(commandKey)) {
            const lastTime = this.recentCommands.get(commandKey);
            const timeDiff = now - lastTime;
            
            // ถ้าส่งมาใน window time ให้ถือว่าซ้ำ
            if (timeDiff < this.duplicateCheckWindow) {
                console.log(`🚫 Duplicate detected: ${commandKey} (${timeDiff}ms ago)`);
                return true;
            } else {
                console.log(`✅ Same content but different time: ${commandKey} (${timeDiff}ms ago)`);
            }
        }
        
        return false;
    }

    /**
     * ลบ command keys ที่หมดอายุแล้ว
     */
    cleanupExpiredCommands() {
        const now = Date.now();
        const expiredKeys = [];
        
        for (const [key, timestamp] of this.recentCommands.entries()) {
            if (now - timestamp > this.duplicateCheckWindow) {
                expiredKeys.push(key);
            }
        }
        
        expiredKeys.forEach(key => {
            this.recentCommands.delete(key);
        });
        
        if (expiredKeys.length > 0) {
            console.log(`🧹 Cleaned up ${expiredKeys.length} expired command keys`);
        }
    }

    /**
     * รีเซ็ตระบบป้องกันการซ้ำ (สำหรับการทดสอบ)
     */
    resetDuplicateProtection() {
        this.recentCommands.clear();
        console.log('🔄 Duplicate protection reset');
    }

    /**
     * แสดงสถิติการป้องกันการซ้ำ
     */
    showDuplicateStats() {
        const stats = {
            activeKeys: this.recentCommands.size,
            totalPrevented: this.statistics.totalPrevented,
            totalCreated: this.statistics.totalCreated,
            preventionRate: this.statistics.totalCreated + this.statistics.totalPrevented > 0 
                ? ((this.statistics.totalPrevented / (this.statistics.totalCreated + this.statistics.totalPrevented)) * 100).toFixed(1)
                : 0
        };
        
        console.log('📊 Duplicate Protection Stats:', stats);
        return stats;
    }

    /**
     * บังคับสร้าง notification แม้จะซ้ำ (สำหรับกรณีพิเศษ)
     */
    forceCreateNotification(command) {
        const originalCheckWindow = this.duplicateCheckWindow;
        this.duplicateCheckWindow = 0; // ปิดการตรวจสอบชั่วคราว
        
        const notification = this.createNotification(command);
        
        this.duplicateCheckWindow = originalCheckWindow; // เปิดกลับ
        return notification;
    }

    /**
     * ลบ notification ตาม ID
     */
    removeNotification(id) {
        if (!this.notifications || !Array.isArray(this.notifications)) {
            console.warn('notifications array is not initialized');
            return false;
        }
        
        const index = this.notifications.findIndex(n => n.id === id);
        if (index > -1) {
            const notification = this.notifications[index];
            
            // ยกเลิก timer ถ้ามี
            if (notification.timerId) {
                clearTimeout(notification.timerId);
            }
            
            this.notifications.splice(index, 1);
            console.log('✅ Notification removed:', id);
            
            // Trigger reactive update
            this.triggerReactiveUpdate();
            
            return true;
        }
        console.log('❌ Notification not found:', id);
        return false;
    }

    /**
     * ล้าง notifications ทั้งหมด
     */
    clearAll() {
        if (!this.notifications || !Array.isArray(this.notifications)) {
            console.warn('notifications array is not initialized');
            this.notifications = [];
            return;
        }
        this.notifications = [];
        console.log('✅ All notifications cleared');
    }

    /**
     * ดึง notifications ทั้งหมด
     */
    getNotifications() {
        if (!this.notifications || !Array.isArray(this.notifications)) {
            console.warn('notifications array is not initialized, returning empty array');
            this.notifications = [];
        }
        return [...this.notifications];
    }

    /**
     * ดึง notification title ตามประเภท command
     */
    getCommandTitle(command) {
        const titles = {
            notification: command.payload?.title || 'แจ้งเตือน',
            message: command.payload?.title || 'ข้อความใหม่',
            quiz: command.payload?.title || 'แบบทดสอบใหม่',
            assignment: command.payload?.title || 'งานใหม่',
            update: command.payload?.title || 'อัปเดตระบบ',
            test: 'ทดสอบระบบ',
            health_check: 'ตรวจสอบสุขภาพ',
            broadcast: command.payload?.title || 'ประกาศ',
            alert: command.payload?.title || 'แจ้งเตือนด่วน'
        };
        return titles[command.type] || `คำสั่ง ${command.type}`;
    }

    /**
     * ดึง notification message ตามประเภท command
     */
    getCommandMessage(command) {
        const { payload } = command;

        switch (command.type) {
            case 'notification':
            case 'message':
            case 'broadcast':
            case 'alert':
                return payload?.message || 'ไม่มีข้อความ';
                
            case 'quiz': {
                const questions = payload?.questions || 0;
                const timeLimit = payload?.timeLimit || 0;
                return `${questions} ข้อ เวลา ${timeLimit} นาที`;
            }
                
            case 'assignment': {
                const dueDate = payload?.dueDate || 'ไม่ระบุ';
                return `กำหนดส่ง: ${dueDate}`;
            }
                
            case 'update': {
                const component = payload?.component || 'ระบบ';
                const action = payload?.action || payload?.message || 'อัปเดต';
                return `${component}: ${action}`;
            }
                
            case 'test':
                return payload?.message || 'ทดสอบการเชื่อมต่อ';
                
            case 'health_check':
                return payload?.message || 'ตรวจสอบสถานะระบบ';
                
            default:
                // สำหรับ command types อื่นๆ
                if (payload?.message) return payload.message;
                if (payload?.title) return payload.title;
                return JSON.stringify(payload).substring(0, 50) + '...';
        }
    }

    /**
     * กำหนดระยะเวลาแสดง notification ตามประเภทและความเร่งด่วน
     */
    getNotificationDuration(command) {
        // Urgent commands แสดงนานกว่า
        if (command.payload?.urgent) return 10000; // 10 วินาที

        // ระยะเวลาตามประเภท command
        const durations = {
            notification: 5000,
            message: 7000,
            quiz: 8000,
            assignment: 8000,
            update: 6000,
            test: 3000,
            health_check: 4000,
            broadcast: 9000,
            alert: 12000
        };

        return durations[command.type] || 5000;
    }

    /**
     * ดึงไอคอนตามประเภท command
     */
    getCommandIcon(type) {
        const icons = {
            notification: 'bell',
            message: 'envelope',
            quiz: 'question-circle',
            assignment: 'clipboard-list',
            update: 'sync-alt',
            test: 'flask',
            health_check: 'heartbeat',
            broadcast: 'bullhorn',
            alert: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * ดึงสีตามประเภท command
     */
    getCommandColor(type) {
        const colors = {
            notification: 'bg-purple-500',
            message: 'bg-blue-500',
            quiz: 'bg-indigo-500',
            assignment: 'bg-pink-500',
            update: 'bg-orange-500',
            test: 'bg-cyan-500',
            health_check: 'bg-red-500',
            broadcast: 'bg-green-500',
            alert: 'bg-yellow-500'
        };
        return colors[type] || 'bg-gray-500';
    }

    /**
     * เล่นเสียงแจ้งเตือน
     */
    playNotificationSound() {
        if (!this.soundEnabled) return;

        try {
            // สร้าง audio context สำหรับเสียงแจ้งเตือน
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // สร้างเสียง beep สองครั้ง
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    /**
     * เปิด/ปิดเสียงแจ้งเตือน
     */
    toggleSound(enabled = null) {
        if (enabled !== null) {
            this.soundEnabled = enabled;
        } else {
            this.soundEnabled = !this.soundEnabled;
        }
        return this.soundEnabled;
    }

    /**
     * ตั้งค่าจำนวน notifications สูงสุด
     */
    setMaxNotifications(max) {
        this.maxNotifications = max;
        
        // ตัดจำนวน notifications ถ้าเกิน
        if (this.notifications.length > max) {
            this.notifications = this.notifications.slice(0, max);
        }
    }

    /**
     * ดึงสถิติ notifications
     */
    getStats() {
        const stats = {
            total: this.notifications.length,
            urgent: 0,
            byType: {},
            byPriority: {}
        };

        this.notifications.forEach(notification => {
            // นับ urgent
            if (notification.urgent) {
                stats.urgent++;
            }

            // นับตามประเภท
            stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;

            // นับตาม priority
            stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
        });

        return stats;
    }

    /**
     * ล้าง notifications เก่าที่หมดอายุแล้ว
     */
    cleanup() {
        const now = Date.now();
        this.notifications = this.notifications.filter(notification => {
            const age = now - notification.timestamp.getTime();
            return age < (notification.duration * 2); // เก็บไว้ 2 เท่าของ duration
        });
    }

    /**
     * ดึงสถิติการป้องกันการซ้ำ
     */
    getDuplicatePreventionStats() {
        const total = this.statistics.totalCreated + this.statistics.totalPrevented;
        return {
            created: this.statistics.totalCreated,
            prevented: this.statistics.totalPrevented,
            total: total,
            rate: total > 0 ? (this.statistics.totalPrevented / total) * 100 : 0
        };
    }

    /**
     * รีเซ็ตสถิติ
     */
    resetStats() {
        this.duplicatesPrevented = 0;
        this.statistics = {
            totalCreated: 0,
            totalPrevented: 0,
            byType: {}
        };
    }

    /**
     * ตั้งเวลาลบ notification อัตโนมัติ
     */
    scheduleAutoRemove(notification) {
        if (!notification || !notification.id || !notification.duration) {
            console.warn('Invalid notification for auto-remove:', notification);
            return;
        }

        console.log(`⏰ Scheduling auto-remove for notification ${notification.id} in ${notification.duration}ms`);
        
        // เก็บ timer ID ไว้เพื่อให้สามารถยกเลิกได้
        const timerId = setTimeout(() => {
            console.log(`🕒 Auto-removing notification ${notification.id}`);
            const removed = this.removeNotification(notification.id);
            if (removed) {
                console.log(`✅ Auto-removed notification: ${notification.title}`);
                // Trigger reactive update สำหรับ Vue components
                this.triggerReactiveUpdate();
            } else {
                console.log(`❌ Failed to auto-remove notification ${notification.id} - may already be removed`);
            }
        }, notification.duration);

        // เก็บ timer ID ไว้ใน notification object
        notification.timerId = timerId;
    }

    /**
     * Trigger reactive update สำหรับ Vue components
     */
    triggerReactiveUpdate() {
        // ส่ง event เพื่อแจ้ง Vue components ให้ update
        if (typeof window !== 'undefined') {
            const event = new CustomEvent('notifications-updated', {
                detail: { notifications: this.getNotifications() }
            });
            window.dispatchEvent(event);
        }
    }
}

// Export singleton instance
const notificationManager = new NotificationManager();
export default notificationManager;