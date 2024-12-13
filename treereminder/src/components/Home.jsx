import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Treeicon from "../public/tree4w.svg";
import Random from "./Random";
import TreeRem from "../public/tree4w.svg";

export default function Home() {
  const [count, setCount] = useState(0);
  const [inputField, setInputField] = useState("");
  const [treeCount, setTreesCount] = useState(0);
  const [a, setA] = useState([]); // Array to store reminders
  const [image, setImage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // Selected date by the user

  const navigate = useNavigate();

  // Fetch reminders and tree count from Firestore when component mounts
  useEffect(() => {
    const fetchRemindersAndTreeCount = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(firestore, "Users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.reminders) {
              setA(userData.reminders);
              setCount(userData.reminders.length);
            }
            if (userData.treeCount !== undefined) {
              setTreesCount(userData.treeCount);
            }
          } else {
            // If user document doesn't exist, create it with initial values
            await updateDoc(docRef, {
              email: user.email,
              reminders: [],
              treeCount: 0,
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error.message);
        }
      }
    };
    fetchRemindersAndTreeCount();
  }, []);

  // Push a reminder to the array and save to Firestore
  async function pushReminder(newReminder) {
    const updatedReminders = [...a, newReminder];
    setA(updatedReminders);
    setCount(updatedReminders.length);

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(firestore, "Users", user.uid);
        await updateDoc(docRef, { reminders: updatedReminders });
      } catch (error) {
        console.error("Error saving reminders:", error.message);
      }
    }
  }

  // Remove a reminder and update Firestore
  async function removeReminder(i) {
    const updatedReminders = [...a];
    updatedReminders.splice(i, 1);
    setA(updatedReminders);
    setCount(updatedReminders.length);
    setTreesCount(treeCount + 1);

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(firestore, "Users", user.uid);
        await updateDoc(docRef, {
          reminders: updatedReminders,
          treeCount: treeCount + 1,
        });
      } catch (error) {
        console.error("Error updating reminders:", error.message);
      }
    }
  }

  // Clear all reminders
  async function clearReminders() {
    setA([]);
    setCount(0);

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(firestore, "Users", user.uid);
        await updateDoc(docRef, { reminders: [] });
      } catch (error) {
        console.error("Error clearing reminders:", error.message);
      }
    }
  }

  // Reset tree count
  async function RemoveTrees() {
    setTreesCount(0);

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(firestore, "Users", user.uid);
        await updateDoc(docRef, { treeCount: 0 });
      } catch (error) {
        console.error("Error resetting tree count:", error.message);
      }
    }
  }

  // Comparison method for sorting by enter date

  function comparisonMethodEnterDate(X, Y) {
    if (X.enterTime > Y.enterTime) return 1;
    if (X.enterTime < Y.enterTime) return -1;
    return 0;
  }

  // Comparison method for sorting by due date
  function comparisonMethodDueDate(X, Y) {
    const xDate = new Date(X.date.split("/").reverse().join("/"));
    const yDate = new Date(Y.date.split("/").reverse().join("/"));
    if (xDate > yDate) return 1;
    if (xDate < yDate) return -1;
    return 0;
  }

  // Sort array by enter date
  function sortArrayEnterDate() {
    let tempArray = [...a];
    tempArray.sort(comparisonMethodEnterDate);
    setA(tempArray);
  }

  // Sort array by due date
  function sortArrayDueDate() {
    let tempArray = [...a];
    tempArray.sort(comparisonMethodDueDate);
    setA(tempArray);
  }

  // OCR functionality to extract text from the image
  const ocrFunction = () => {
    if (!image) return;
    Tesseract.recognize(image, "eng").then(({ data: { text } }) => {
      setInputField(text); // Set the extracted text into the input field
    });
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!", { position: "top-center" });
      navigate("/login");
    } catch (error) {
      console.error(error.message);
      toast.error("Error logging out. Please try again.", {
        position: "bottom-center",
      });
    }
  };

  // Save reminder (called on Enter or button click)
  const saveReminder = () => {
    if (inputField.trim() === "") {
      return; // Don't save empty reminders
    }

    const reminder = {
      enterTime: Date.now(),
      text: inputField,
      date: selectedDate
        ? selectedDate.toLocaleDateString()
        : "No date selected",
    };

    pushReminder(reminder);
    setInputField("");
    setSelectedDate(null);
  };

  // Image upload handler
  const imageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  // Component to render tree count message
  function TreesRender({ treeCount }) {
    if (treeCount === 0) {
      return <>You have {treeCount} trees... do better</>;
    } else if (treeCount < 10) {
      return <>You have {treeCount} trees... getting there!</>;
    } else if (treeCount < 20) {
      return <>You have {treeCount} trees great job!</>;
    }
    return <>You have {treeCount} trees amazing work!</>;
  }

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-top">
      <div className="container text-center">
        <div className="mt-3">
          <button
            className="btn btn-outline-light btn-sm"
            onClick={clearReminders}
          >
            Clear Reminders
          </button>{" "}
          &nbsp;
          <button
            className="btn btn-outline-light btn-sm"
            onClick={RemoveTrees}
          >
            Cut Down Trees
          </button>
          &nbsp;
          <br />
          <input
            className="form-control w-50 mx-auto margt"
            value={inputField}
            onChange={(textBox) => setInputField(textBox.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveReminder();
              }
            }}
            type="text"
            placeholder="Type a reminder!"
          />
          <div className="mt-3">
            <h3>Select a date for your reminder:</h3>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              placeholderText="Select a date"
              className="form-control text-center mx-auto"
            />
          </div>
          <br />
          <Link
            to="/calendar"
            state={{ reminders: a }} // Passing the reminders to the CalendarPage
            className="btn btn-outline-light btn-sm"
          >
            View Calendar
          </Link>
          <h3>You have {count} reminders</h3>
          <div className="text-start">
            <ul>
              {a.map((item, index) => (
                <li key={index}>
                  <img
                    src={Treeicon}
                    alt="custom bullet"
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "8px",
                    }}
                  />
                  <button
                    className="form-check-input"
                    style={{ padding: ".6rem" }}
                    onClick={() => removeReminder(index)}
                  ></button>{" "}
                  &nbsp;
                  {item.text} - {item.date}
                </li>
              ))}
            </ul>
          </div>
          <h3>
            <TreesRender treeCount={treeCount} />
            <h1>&nbsp;</h1>
          </h3>
          <h5>Upload an image to save:</h5>
          <input
            className="form-control w-50 mx-auto"
            type="file"
            accept="image/*"
            onChange={imageUpload}
          />
          <button
            className="btn btn-outline-light btn-sm margt"
            onClick={ocrFunction}
          >
            Save Reminder
          </button>
          <br />
          <button
            className="btn btn-outline-light margt"
            onClick={sortArrayEnterDate}
          >
            Sort array By Enter Date
          </button>
          <br />
          <button
            className="btn btn-outline-light btn-sm margt"
            onClick={sortArrayDueDate}
          >
            Sort array By Due Date
          </button>
          <br />
          <Random />
          <button
            className="btn btn-outline-light btn-sm margt"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
