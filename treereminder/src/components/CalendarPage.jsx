import React, { useState } from "react";
import Calendar from "react-calendar"; // Import the calendar component
import "react-calendar/dist/Calendar.css"; // Import the CSS for the calendar

function CalendarPage() {
  const [date, setDate] = useState(new Date()); // Manage the selected date

  const handleDateChange = (newDate) => {
    setDate(newDate); // Update the selected date
  };

  return (
    <div className="calendar-container">
      <h3>Pick a date for your reminder</h3>
      <Calendar
        onChange={handleDateChange} // Handle date change
        value={date} // Pass the selected date to the calendar
      />
    </div>
  );
}

export default CalendarPage;
