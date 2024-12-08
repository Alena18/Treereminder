import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { firestore, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function CalendarPage() {
  const [reminders, setReminders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
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
              setReminders(userData.reminders);
            }
          }
        } catch (error) {
          console.error("Error fetching reminders:", error.message);
          setError("Error fetching reminders.");
        } finally {
          setLoading(false);
        }
      } else {
        setError("No user found.");
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const filterRemindersForSelectedDate = () => {
    const selectedDateString = selectedDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    return reminders.filter((reminder) => {
      const reminderDate = new Date(reminder.dueDate.seconds * 1000);
      const reminderDateString = reminderDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      return reminderDateString === selectedDateString;
    });
  };

  return (
    <div>
      <h2>Your Calendar</h2>
      <ReactCalendar onChange={handleDateChange} value={selectedDate} />

      {loading ? (
        <p>Loading reminders...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <h3>Reminders for {selectedDate.toLocaleDateString()}</h3>
          {filterRemindersForSelectedDate().length === 0 ? (
            <p>No reminders for this date.</p>
          ) : (
            <ul>
              {filterRemindersForSelectedDate().map((item, index) => (
                <li key={index}>
                  {item.text} - Due:{" "}
                  {new Date(item.dueDate.seconds * 1000).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
