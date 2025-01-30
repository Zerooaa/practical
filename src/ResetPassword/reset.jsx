import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./reset.css";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value) ? "" : "Invalid Email Format");
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSend = async () => {
    if (!validateEmail(email)) {
      setEmailError("Invalid Email Format");
      return;
    }

    try {
      const response = await axios.get("http://localhost:3001/accounts");
      const accountExists = response.data.some((account) => account.email === email);

      if (accountExists) {
        setSuccessMessage("Reset link sent! Please check your email.");
        setErrorMessage("");
      } else {
        setErrorMessage("Email Does not Exist in Our Records.");
        setSuccessMessage("");
      }
    } catch (err) {
      setErrorMessage("Error connecting to the server. Please try again later.");
      setSuccessMessage("");
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h1 className="reset-title">Reset Password</h1>
        <form className="reset-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
            />
            {emailError && <small className="error-message">{emailError}</small>}
          </div>
          {successMessage && <small className="success-message">{successMessage}</small>}
          {errorMessage && <small className="error-message">{errorMessage}</small>}
          <div className="button-group">
            <button
              type="button"
              className="send-button"
              onClick={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              Send
            </button>
            <button
              type="button"
              className="back-button"
              onClick={(e) => {
                e.preventDefault();
                handleBack();
              }}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
