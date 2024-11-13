import moment from 'moment'
// Request permission to show notifications
export function requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      }).catch((error) => {
        console.error('Failed to request notification permission:', error);
      });
    } else {
      console.error('This browser does not support notifications.');
    }
  }
  
  // Schedule a notification
  export function scheduleNotification(event) {
    console.log("Event data received in scheduleNotification:", event);
  
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications.');
      return;
    }
  
    if (Notification.permission !== 'granted') {
      console.warn('Notifications are not permitted.');
      return;
    }
  
    // Parse event start time as UTC and convert it to local time for display
    let eventTimeUTC = moment.utc(event.start); // Parse event start in UTC
    let eventTimeLocal = eventTimeUTC.local();   // Convert to local time for notification scheduling
    console.log("Parsed Event Start Time (moment):", eventTimeLocal.toString());
  
    // Log the time for debugging
    const nowUTC = moment.utc();  // Get current time in UTC
    console.log("Current time (UTC):", nowUTC.toString());
    
    // Calculate time until the event in milliseconds
    const timeUntilEvent = eventTimeLocal.diff(nowUTC);  // Difference in milliseconds
    console.log("Time until event (ms):", timeUntilEvent);
  
    // Add a small buffer (e.g., 5 seconds) to avoid small discrepancies
    const buffer = 5000; // 5 seconds
    if (timeUntilEvent + buffer > 0) {
      setTimeout(() => {
        const notification = new Notification(event.title, {
          body: event.description || 'Your event is starting now!',
          tag: event._id,
        });
  
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
  
        notification.onclose = () => {
          console.log('Notification dismissed');
        };
      }, timeUntilEvent + buffer);
    } else {
      console.warn('The event time is in the past.');
    }
  }
  