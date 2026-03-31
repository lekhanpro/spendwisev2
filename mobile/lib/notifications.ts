// lib/notifications.ts - Expo Notifications for React Native
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Request notification permissions
export async function requestNotificationPermission(): Promise<boolean> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Notification permission not granted');
            return false;
        }

        // Configure Android channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'SpendWise Notifications',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#3b82f6',
            });

            await Notifications.setNotificationChannelAsync('budget-alerts', {
                name: 'Budget Alerts',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 500],
                lightColor: '#ef4444',
            });

            await Notifications.setNotificationChannelAsync('insights', {
                name: 'AI Insights',
                importance: Notifications.AndroidImportance.DEFAULT,
                lightColor: '#8b5cf6',
            });
        }

        return true;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
}

// Send immediate notification
export async function sendNotification(
    title: string,
    body: string,
    channelId: string = 'default'
): Promise<void> {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null, // Immediate
        });
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Budget alert notification
export async function sendBudgetAlert(
    category: string,
    percentUsed: number,
    spent: number,
    limit: number,
    currencySymbol: string
): Promise<void> {
    if (percentUsed >= 100) {
        await sendNotification(
            '🚨 Budget Exceeded!',
            `You've spent ${currencySymbol}${spent.toFixed(0)} on ${category}, exceeding your ${currencySymbol}${limit} budget!`,
            'budget-alerts'
        );
    } else if (percentUsed >= 80) {
        await sendNotification(
            '⚠️ Budget Warning',
            `You've used ${percentUsed.toFixed(0)}% of your ${category} budget (${currencySymbol}${spent.toFixed(0)}/${currencySymbol}${limit})`,
            'budget-alerts'
        );
    }
}

// AI Insight notification
export async function sendInsightNotification(
    title: string,
    message: string
): Promise<void> {
    await sendNotification(`💡 ${title}`, message, 'insights');
}

// Schedule daily reminder
export async function scheduleDailyReminder(
    hour: number = 20,
    minute: number = 0
): Promise<void> {
    try {
        // Cancel existing reminders
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Schedule new daily reminder
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '💰 SpendWise Reminder',
                body: "Don't forget to log your expenses today!",
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });

        console.log(`Daily reminder scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);
    } catch (error) {
        console.error('Error scheduling daily reminder:', error);
    }
}

// Weekly summary notification
export async function scheduleWeeklySummary(): Promise<void> {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '📊 Weekly Summary Ready',
                body: 'Check your spending insights and see how you did this week!',
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday: 1, // Monday
                hour: 9,
                minute: 0,
            },
        });
    } catch (error) {
        console.error('Error scheduling weekly summary:', error);
    }
}

// Get all scheduled notifications
export async function getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

// Add notification response listener
export function addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
) {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

// Add notification received listener
export function addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
) {
    return Notifications.addNotificationReceivedListener(callback);
}
