import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactCalendar from "react-calendar";
import { auth, firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function CalendarPage() {
  const [remindersByDate, setRemindersByDate] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReminders = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(firestore, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.reminders) {
              // Organize reminders by date
              const remindersByDate = userData.reminders.reduce(
                (acc, reminder) => {
                  const reminderDate = new Date(
                    reminder.date
                  ).toLocaleDateString();
                  if (!acc[reminderDate]) acc[reminderDate] = [];
                  acc[reminderDate].push(reminder.text);
                  return acc;
                },
                {}
              );
              setRemindersByDate(remindersByDate);
            }
          }
        } catch (error) {
          console.error("Error fetching reminders:", error.message);
        }
      }
    };
    fetchReminders();
  }, []);

  const handleDateClick = (date) => {
    const selectedDate = date.toLocaleDateString();
    const reminders = remindersByDate[selectedDate] || [];
    alert(`Reminders for ${selectedDate}: ${reminders.join(", ")}`);
  };

  return (
    <div className="container text-center mt-5">
      <h3>Your Reminders Calendar</h3>
      <ReactCalendar onClickDay={handleDateClick} />
    </div>
  );
}
