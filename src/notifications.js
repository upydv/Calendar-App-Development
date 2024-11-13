export function requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission()
    }
  }
  
  export function scheduleNotification(event) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const now = new Date().getTime()
      const eventTime = new Date(event.start).getTime()
      const timeUntilEvent = eventTime - now
  
      if (timeUntilEvent > 0) {
        setTimeout(() => {
          const notification = new Notification(event.title, {
            body: event.description || 'Your event is starting now!',
          })
  
          notification.onclick = () => {
            // Handle notification click (e.g., open the event details)
          }
  
          // Implement snooze functionality
          setTimeout(() => {
            new Notification(`Reminder: ${event.title}`, {
              body: 'This event started 5 minutes ago.',
            })
          }, 5 * 60 * 1000) // 5 minutes
        }, timeUntilEvent)
      }
    }
  }