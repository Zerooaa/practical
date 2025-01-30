import React, { useState, useEffect } from "react";
import "./homepage.css";

export default function Homepage() {
  const [attendance, setAttendance] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isTimeIn, setIsTimeIn] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const maxRecords = 100;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user) {
      setLoggedInUser(user);
      fetchAttendance(user.empId);
    } else {
      alert("No user logged in. Redirecting to login...");
      window.location.href = "/";
    }
  }, []);

  const fetchAttendance = (empId) => {
    fetch(`http://localhost:3001/empTime?empId=${empId}`)
      .then((response) => response.json())
      .then((data) => {
        setAttendance(data.slice(0, maxRecords));
        checkTimeStatus(data);
      })
      .catch((error) => console.error("Error fetching attendance:", error));
  };

  const checkTimeStatus = (records) => {
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = records.find((entry) => entry.date === today);
    if (todayEntry && todayEntry.time_in && todayEntry.time_out) {
      setIsTimeIn(false);
    } else {
      setIsTimeIn(!todayEntry || !!todayEntry.time_out);
    }
  };

  const handleToggleTime = () => {
    const today = new Date();
    const date = today.toISOString().split("T")[0];
    const time = today.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  
    fetch("http://localhost:3001/empTime")
      .then(response => response.json())
      .then((allEntries) => {
        const existingEntry = allEntries.find((entry) => entry.date === date && entry.empId === loggedInUser.empId);
  
        if (existingEntry) {
          if (existingEntry.time_in && existingEntry.time_out && existingEntry.time_out.trim() !== "") {
            alert("You have already timed in and timed out today.");
            return;
          }

          if (existingEntry.time_in && !existingEntry.time_out) {
            const updatedEntry = { ...existingEntry, time_out: time };
  
            // Update the existing record with the time_out
            fetch(`http://localhost:3001/empTime/${existingEntry.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedEntry),
            })
            .then((response) => response.json()) 
            .then((updatedData) => {
              fetchAttendance(loggedInUser.empId);
              setIsTimeIn(true); 
              alert("Time Out Recorded Successfully!");
            })
            .catch((error) => console.error("Error recording Time Out:", error));
          }
        } else {
          const newId = allEntries.length > 0 ? Math.max(...allEntries.map(a => a.id)) + 1 : 1;
          const newEntry = { id: newId, empId: loggedInUser.empId, date, time_in: time, time_out: "" };
  
          fetch("http://localhost:3001/empTime", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEntry),
          })
          .then(() => {
            setAttendance((prev) => [...prev, newEntry].slice(0, maxRecords));
            setIsTimeIn(false); 
            alert("Time In Recorded Successfully!");
          })
          .catch((error) => console.error("Error recording Time In:", error));
        }
      })
      .catch(error => console.error("Error fetching attendance records:", error));
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser"); // This will delete the logged-in user from localStorage
    window.location.href = "/"; // Redirect to login page or home page
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = attendance.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(attendance.length / recordsPerPage);

  return (
    <div className="homepage-container">
      <h1 className="welcome-text">Welcome, {loggedInUser?.username}</h1>
      <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
      <div className="cards-container">
        <div className="card">
          <div className="card-header gradient-header">
            <h2>My Attendance</h2>
            <button className="btn time-btn" onClick={handleToggleTime}>{isTimeIn ? "Time In" : "Time Out"}</button>
          </div>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{entry.time_in || "-"}</td>
                  <td>{entry.time_out || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendance.length > recordsPerPage && (
            <div className="pagination">
              <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
              <span> Page {currentPage} of {totalPages} </span>
              <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header gradient-header">
            <h2>Leave Credits</h2>
            <button className="btn apply-btn">Apply</button>
          </div>
          <table className="styled-table">
            <tbody>
              <tr><td>Vacation</td><td>7</td></tr>
              <tr><td>Sick</td><td>5</td></tr>
              <tr><td>Bereavement</td><td>3</td></tr>
              <tr><td>Emergency Leave</td><td>2</td></tr>
              <tr><td>Offset Leave</td><td>0</td></tr>
              <tr><td>Compensatory Time Off</td><td>0</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
