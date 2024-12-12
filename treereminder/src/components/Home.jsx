import { useState, useEffect } from "react"; // CHANGE START: Added useEffect for Firestore
import Tesseract from "tesseract.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { signOut } from "firebase/auth"; // Import signOut method
import { auth, firestore } from "../firebase"; // Import auth and firestore from Firebase
import { useNavigate, Link } from "react-router-dom"; // For navigation after logout
import { toast } from "react-toastify"; // Optional: for toast notifications
import { doc, getDoc, updateDoc } from "firebase/firestore"; // CHANGE START: Firestore methods
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for DatePicker

export default function Home() {
  const [count, setCount] = useState(0);
  const [inputField, setInputField] = useState("");
  const [treeCount, setTreesCount] = useState(0);
  const [a, setA] = useState([]); // Array to store reminders
  const [image, setImage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // Date selected by the user

  // CHANGE START: Fetch reminders from Firestore when component mounts
  useEffect(() => {
    const fetchReminders = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(firestore, "Users", user.uid); // Reference user's Firestore document
          const docSnap = await getDoc(docRef); // Fetch document
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.reminders) {
              setA(userData.reminders); // Populate reminders array
              setCount(userData.reminders.length); // Update count
            }
          } else {
            // If user document doesn't exist, create it
            await updateDoc(docRef, { email: user.email, reminders: [] });
          }
        } catch (error) {
          console.error("Error fetching reminders:", error.message);
        }
      }
    };

    fetchReminders();
  }, []);
  // CHANGE END

  // Function to handle saving a reminder with date
  const saveReminder = () => {
    if (inputField.trim() === "") {
      return; // Don't save empty reminders
    }

    const reminder = {
      text: inputField,
      date: selectedDate
        ? selectedDate.toLocaleDateString()
        : "No date selected", // Format date
    };

    // Add reminder to the list
    pushReminder(reminder);
    setInputField(""); // Clear the input field
    setSelectedDate(null); // Reset the selected date
  };

  // Function to push a reminder to the array
  async function pushReminder(newReminder) {
    const updatedReminders = [...a, newReminder];
    setA(updatedReminders);
    setCount(updatedReminders.length);

    // CHANGE START: Save reminder to Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(firestore, "Users", user.uid);
        await updateDoc(docRef, { reminders: updatedReminders });
      } catch (error) {
        console.error("Error saving reminders:", error.message);
      }
    }
    // CHANGE END
  }

  // Remove a reminder
  async function removeReminder(i) {
    const updatedReminders = [...a];
    updatedReminders.splice(i, 1); // Remove the reminder at index i
    setA(updatedReminders);
    setCount(updatedReminders.length);
    setTreesCount(treeCount + 1);

    // CHANGE START: Update Firestore after removing a reminder
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(firestore, "Users", user.uid);
        await updateDoc(docRef, { reminders: updatedReminders });
      } catch (error) {
        console.error("Error updating reminders:", error.message);
      }
    }
    // CHANGE END
  }

  // Function to clear all reminders
  async function clearReminders() {
    setA([]);
    setCount(0);

    // CHANGE START: Clear all reminders in Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(firestore, "Users", user.uid);
        await updateDoc(docRef, { reminders: [] });
      } catch (error) {
        console.error("Error clearing reminders:", error.message);
      }
    }
    // CHANGE END
  }
  //enter key input reference
  //https://www.geeksforgeeks.org/how-to-get-the-enter-key-in-reactjs/

  //save reminder button function if needed
  // <button
  //           onClick={() => {
  //             pushReminder(inputField);
  //             setCount(count + 1);
  //             setInputField("");
  //           }}
  //         >
  //           Save Reminder
  //         </button>
  // Image upload handler
  const imageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Preview the uploaded image
    }
  };

  // OCR functionality to extract text from the image
  const ocrFunction = () => {
    Tesseract.recognize(image, "eng").then(({ data: { text } }) => {
      setInputField(text); // Set the extracted text into the input field
    });
  };

  // UseNavigate hook for redirection
  const navigate = useNavigate();

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out the user
      toast.success("Logged out successfully!", { position: "top-center" });
      navigate("/login"); // Redirect to the login page after logout
    } catch (error) {
      console.error(error.message);
      toast.error("Error logging out. Please try again.", {
        position: "bottom-center",
      });
    }
  };

  // Function to handle tree removal (reset count)
  function RemoveTrees() {
    setTreesCount(0);
  }

  // Conditional rendering of trees message
  function TreesRender(props) {
    let treeCount = props.treeCount;
    if (treeCount === 0) {
      return <>You have {treeCount} trees... do better</>;
    }
    if (treeCount < 10) {
      return <>You have {treeCount} trees... getting there!</>;
    }
    if (treeCount < 20) {
      return <>You have {treeCount} trees great job!</>;
    }
    return <>You have {treeCount} trees amazing work!</>;
  }

  return (
    <div className="text-white min-vh-100 d-flex justify-content-center align-items-top">
      <div className="container text-center">
        <div className="mt-3">
          <>
            <button
              class="btn btn-outline-light btn-sm"
              onClick={() => {
                clearReminders();
              }}
            >
              Clear Reminders
            </button>{" "}
            &nbsp;
            <button
              class="btn btn-outline-light btn-sm"
              onClick={() => {
                RemoveTrees();
              }}
            >
              Cut Down Trees
            </button>
            &nbsp;
            <br />
            <input
              class="form-control w-50 mx-auto margt"
              value={inputField}
              onChange={(textBox) => setInputField(textBox.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveReminder(); // Save reminder on Enter key
                }
              }}
              type="text"
              placeholder="Type a reminder!"
            />
            {/* DatePicker implementation */}
            <div className="mt-3">
              <h5>Select a date for your reminder:</h5>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                placeholderText="Select a date"
                className="form-control w-50 mx-auto"
              />
            </div>
            <br />
            {/* Link to CalendarPage */}
            <div>
              <Link to="/calendar" className="btn btn-outline-light btn-sm">
                View Calendar
              </Link>
            </div>
            <h3>You have {count} reminders</h3>
            <div className="text-start">
              <ul>
                {a.map((item, index) => (
                  <li key={index}>
                    <button
                      className="form-check-input"
                      onClick={() => {
                        removeReminder(index);
                      }}
                    ></button>{" "}
                    &nbsp;
                    {item.text} - {item.date}{" "}
                    {/* Display reminder text and date */}
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
              class="form-control w-50 mx-auto"
              type="file"
              accept="image/*"
              onChange={imageUpload}
            />
            <button
              class="btn btn-outline-light btn-sm margt"
              onClick={() => {
                ocrFunction();
              }}
            >
              Save Reminder
            </button>
            <br />
            <button
              className="btn text-white btn-sm mt-3"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </>
        </div>
      </div>
    </div>
  );
  // Function to push a reminder to the array
  async function pushReminder(newReminder) {
    const updatedReminders = [...a, newReminder];
    setA(updatedReminders);
    setCount(updatedReminders.length);

    // CHANGE START: Save reminder to Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(firestore, "Users", user.uid);
        await updateDoc(docRef, { reminders: updatedReminders });
      } catch (error) {
        console.error("Error saving reminders:", error.message);
      }
    }
    // CHANGE END
  }

  // Remove reminder
  async function removeReminder(i) {
    const updatedReminders = [...a];
    updatedReminders.splice(i, 1); // Remove the reminder at index i
    setA(updatedReminders);
    setCount(updatedReminders.length);
    setTreesCount(treeCount + 1);

    // CHANGE START: Update Firestore after removing a reminder
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(firestore, "Users", user.uid);
        await updateDoc(docRef, { reminders: updatedReminders });
      } catch (error) {
        console.error("Error updating reminders:", error.message);
      }
    }
    // CHANGE END
  }

  // Clear trees
  function RemoveTrees() {
    setTreesCount(0);
  }

  // Conditional rendering of trees message
  function TreesRender(props) {
    let treeCount = props.treeCount;
    console.clear();
    console.log(treeCount);
    if (treeCount === 0) {
      return <>You have {treeCount} trees... do better</>;
    }
    if (treeCount < 10) {
      return <>You have {treeCount} trees... getting there!</>;
    }
    if (treeCount < 20) {
      return <>You have {treeCount} trees great job!</>;
    }
    return <>You have {treeCount} trees amazing work!</>;
  }

  // Clear all reminders
  async function clearReminders() {
    setA([]);
    setCount(0);

    // CHANGE START: Clear all reminders in Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(firestore, "Users", user.uid);
        await updateDoc(docRef, { reminders: [] });
      } catch (error) {
        console.error("Error clearing reminders:", error.message);
      }
    }
    // CHANGE END
  }

  // //set the tesseract ocr text to the input field textBox
  // function tesseractInputField() {
  //   setInputField(output);
  // }

  // Tesseract OCR text output
  function tesseractOutput() {
    return <>This is a test</>;
  }
}
