// lib/notifications.ts
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

// Check if we're on a native platform
const isNative = typeof window !== 'undefined' &&
    (window as any).Capacitor?.isNativePlatform?.();

// Play notification sound
function playNotificationSound() {
    try {
        // Create audio context for notification sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Pleasant notification sound (two-tone)
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        
        oscillator.start(audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}

// Request notification permissions
export async function requestNotificationPermission(): Promise<boolean> {
    try {
        if (isNative) {
            // Request push notification permission on native
            const pushResult = await PushNotifications.requestPermissions();
            if (pushResult.receive === 'granted') {
                await PushNotifications.register();
            }

            // Request local notification permission
            const localResult = await LocalNotifications.requestPermissions();
            return localResult.display === 'granted';
        } else {
            // Web notifications
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            }
        }
        return false;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
}

// Schedule a local notification
export async function scheduleNotification(
    title: string,
    body: string,
    id: number = Date.now(),
    scheduleAt?: Date
): Promise<void> {
    try {
        if (isNative) {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        id,
                        title,
                        body,
                        schedule: scheduleAt ? { at: scheduleAt } : undefined,
                        sound: 'default',
                        actionTypeId: '',
                        extra: null,
                    },
                ],
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            // Play sound
            playNotificationSound();
            // Web notification (immediate only)
            new Notification(title, { 
                body, 
                icon: '/logo.png',
                badge: '/logo.png',
                tag: 'spendwise-notification',
                requireInteraction: false
            });
        }
    } catch (error) {
        console.error('Error scheduling notification:', error);
    }
}

// Send immediate notification
export async function sendNotification(title: string, body: string): Promise<void> {
    await scheduleNotification(title, body);
}

// Budget alert notification
export async function sendBudgetAlert(category: string, percentUsed: number): Promise<void> {
    if (percentUsed >= 100) {
        await sendNotification(
            '⚠️ Budget Exceeded!',
            `You've exceeded your ${category} budget!`
        );
    } else if (percentUsed >= 80) {
        await sendNotification(
            '📊 Budget Warning',
            `You've used ${percentUsed.toFixed(0)}% of your ${category} budget.`
        );
    }
}

// Daily reminder notification
export async function scheduleDailyReminder(hour: number = 20, minute: number = 0): Promise<void> {
    try {
        if (isNative) {
            // Cancel existing daily reminder
            await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });

            // Schedule new daily reminder
            const now = new Date();
            const scheduleTime = new Date();
            scheduleTime.setHours(hour, minute, 0, 0);

            if (scheduleTime <= now) {
                scheduleTime.setDate(scheduleTime.getDate() + 1);
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: 1001,
                        title: '💰 SpendWise Reminder',
                        body: "Don't forget to log your expenses today!",
                        schedule: {
                            at: scheduleTime,
                            repeats: true,
                            every: 'day',
                        },
                        sound: 'default',
                        actionTypeId: '',
                        extra: null,
                    },
                ],
            });
        } else {
            // For web, store the preference and show notification at the time
            localStorage.setItem('dailyReminderTime', `${hour}:${minute}`);
            await sendNotification(
                '✅ Daily Reminder Set',
                `You'll receive a reminder at ${hour}:${minute < 10 ? '0' + minute : minute} daily`
            );
        }
    } catch (error) {
        console.error('Error scheduling daily reminder:', error);
    }
}

// Initialize notifications listener (for native)
export function initNotificationListeners(): void {
    if (isNative) {
        // Listen for push notification received
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received:', notification);
        });

        // Listen for push notification action
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            console.log('Push notification action:', action);
        });

        // Listen for registration
        PushNotifications.addListener('registration', (token) => {
            console.log('Push registration token:', token.value);
            // You can send this token to your server to send push notifications
        });

        // Listen for registration error
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Push registration error:', error);
        });
    }
}
