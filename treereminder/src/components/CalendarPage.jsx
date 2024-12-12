import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useLocation } from "react-router-dom"; // Hook to access passed state

function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const { state } = useLocation(); // Get the state passed from Home
  const reminders = state?.reminders || []; // Default to an empty array if no reminders

  // Function to display reminders for a given date
  const getRemindersForDate = (selectedDate) => {
    const formattedDate = selectedDate.toLocaleDateString();
    return reminders.filter((reminder) => reminder.date === formattedDate);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <div className="calendar-container">
      <h3>Pick a date for your reminder</h3>
      <Calendar onChange={handleDateChange} value={date} />
      <div className="reminders-list">
        <h4>Reminders for {date.toLocaleDateString()}:</h4>
        <ul>
          {getRemindersForDate(date).map((reminder, index) => (
            <li key={index}>
              {reminder.text} - {reminder.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CalendarPage;
