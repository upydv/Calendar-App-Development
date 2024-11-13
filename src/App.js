import React, { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getEvents, createEvent, updateEvent, deleteEvent } from './api'
import './App.css'

const localizer = momentLocalizer(moment)

// Notification functions
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.log('Notification permission denied')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }
}

const scheduleNotification = (event) => {
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
          console.log('Notification clicked:', event)
        }

        setTimeout(() => {
          new Notification(`Reminder: ${event.title}`, {
            body: 'This event started 5 minutes ago.',
          })
        }, 5 * 60 * 1000) // 5 minutes
      }, timeUntilEvent)
    }
  }
}

export default function App() {
  const [events, setEvents] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState({
    title: '',
    start: null,
    end: null,
    description: '',
    attachments: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    requestNotificationPermission()
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await getEvents()
      setEvents(response.data)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleSelectSlot = ({ start, end }) => {
    if (start.getMonth() === new Date().getMonth()) {
      setCurrentEvent({ title: '', start, end, description: '', attachments: [] })
      setIsOpen(true)
      setSelectedDate(start)
      setIsEditing(false)
    }
  }

  const handleSelectEvent = (event) => {
    setCurrentEvent(event)
    setIsOpen(true)
    setIsEditing(true)
  }

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault()
    if (!currentEvent.title || !currentEvent.start || !currentEvent.end) {
      alert('Please fill in all required fields (title, start, and end time)')
      return
    }
    if (currentEvent.end <= currentEvent.start) {
      alert('End time must be after start time')
      return
    }
    try {
      let updatedEvent
      if (isEditing) {
        updatedEvent = await updateEvent(currentEvent._id, currentEvent)
      } else {
        updatedEvent = await createEvent(currentEvent)
      }
      scheduleNotification(updatedEvent)
      setIsOpen(false)
      setCurrentEvent({ title: '', start: null, end: null, description: '', attachments: [] })
      fetchEvents()
    } catch (error) {
      console.error('Error creating/updating event:', error)
    }
  }

  const handleDeleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(currentEvent._id)
        setIsOpen(false)
        fetchEvents()
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setCurrentEvent({ ...currentEvent, attachments: files.map(file => file.name) })
  }

  const filteredEvents = events.filter(event => {
    return (
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const isToday = (date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Calendar App</h1>
      <input
        type="text"
        placeholder="Search events..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-sm p-2 border rounded mb-4"
      />
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        dayPropGetter={(date) => {
          let style = {}
          if (date.getTime() === (selectedDate?.getTime() || null)) {
            style = { backgroundColor: '#cfe2ff', border: '1px solid #007bff' }
          } else if (isToday(date)) {
            style = { backgroundColor: '#ffeb3b', border: '1px solid #f57c00' }
          } else if (date.getMonth() !== new Date().getMonth()) {
            style = { backgroundColor: '#f0f0f0' }
          }
          return { style }
        }}
      />
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
            <form onSubmit={handleCreateOrUpdateEvent} className="space-y-4">
              <div>
                <label htmlFor="title" className="block mb-1">Title</label>
                <input
                  id="title"
                  type="text"
                  value={currentEvent.title}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="start" className="block mb-1">Start Time</label>
                <input
                  id="start"
                  type="datetime-local"
                  value={currentEvent.start ? moment(currentEvent.start).format('YYYY-MM-DDTHH:mm') : ''}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, start: new Date(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="end" className="block mb-1">End Time</label>
                <input
                  id="end"
                  type="datetime-local"
                  value={currentEvent.end ? moment(currentEvent.end).format('YYYY-MM-DDTHH:mm') : ''}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, end: new Date(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block mb-1">Description</label>
                <textarea
                  id="description"
                  value={currentEvent.description}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <div>
                <label htmlFor="attachments" className="block mb-1">Attachments</label>
                <input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}