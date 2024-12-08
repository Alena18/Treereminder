import { useState, useEffect } from "react"; // CHANGE START: Added useEffect for Firestore
import Tesseract from "tesseract.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { signOut } from "firebase/auth"; // Import signOut method
import { auth, firestore } from "../firebase"; // Import auth and firestore from Firebase
import { useNavigate } from "react-router-dom"; // For navigation after logout
import { toast } from "react-toastify"; // Optional: for toast notifications
import { doc, getDoc, updateDoc } from "firebase/firestore"; // CHANGE START: Firestore methods

export default function Home() {
  const [count, setCount] = useState(0);
  const [inputField, setInputField] = useState("");
  const [treeCount, setTreesCount] = useState(0);
  const [a, setA] = useState([]); // Array to store reminders
  const [image, setImage] = useState(null);

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

  //image upload is generated from chat gpt
  const imageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };
  //tesseract recognise reference
  //https://stackoverflow.com/questions/65835056/how-to-use-tesseract-recognize-in-nodejs
  const ocrFunction = () => {
    Tesseract.recognize(image, "eng").then(({ data: { text } }) => {
      //setOutput(text);
      setInputField(text);
    });
  };

  // useNavigate hook for redirection
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

  return (
    <div className="bg-dark text-white min-vh-100 d-flex justify-content-center align-items-top">
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
              class="form-control w-50 mx-auto"
              value={inputField}
              onChange={(textBox) => setInputField(textBox.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  pushReminder(inputField);
                  setInputField("");
                }
              }}
              type="text"
              placeholder="Type a reminder!"
            />{" "}
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
                    {item}
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
              class="btn btn-outline-light btn-sm"
              onClick={() => {
                ocrFunction();
              }}
            >
              Save Reminder
            </button>
            <br />
            <button
              className="btn btn-outline-danger btn-sm mt-3"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </>
        </div>
      </div>
    </div>
  );
  //function to push a reminder to the array
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

  //remove reminder
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

  //clear trees
  function RemoveTrees() {
    setTreesCount(0);
  }

  //conditional rendering of trees message
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

  //clear all reminders
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

  //conditional rendering of tesseract text output
  function tesseractOutput() {
    return <>This is a test</>;
  }
}
