import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setRetryCount(0);
      setCountdown(null);
    }
  }, [countdown]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
  
    const isEmailValid = validateEmail(value);
    setEmailError(isEmailValid ? '' : 'Invalid Email format');
    setError('');
  
    const isPasswordValid = password.length >= 4;
    setIsButtonDisabled(!(isPasswordValid && isEmailValid));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const isPasswordValid = value.length >= 4;
    const isEmailValid = validateEmail(email);
    setIsButtonDisabled(!(isPasswordValid && isEmailValid));
  };

  
const handleSubmit = async () => {

  if (retryCount >= 3) {
    setError('Maximum Invalid Password Attempts Reached. Please Try Again Later.');
    setIsButtonDisabled(true);
    setCountdown(60);
    return;
  }

  try {
    const response = await axios.get('http://localhost:3001/accounts');
    const account = response.data.find(
      (acc) => acc.email === email && acc.password === password
    );

    if (account) {
      setError('');
      alert('Login successful!');
      localStorage.setItem('loggedInUser', JSON.stringify(account));
      navigate('/home');
    } else {
      setRetryCount((prev) => prev + 1);
      setError('Incorrect Email or Password.');
    }
  } catch (err) {
    setError('Error connecting to the server. Please try again later.');
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Exam Track</h1>
        <form className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
            />
            {emailError && <small className="error-message">{emailError}</small>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          {error && <small className="error-message">{error}</small>}
          {countdown !== null && (
            <small className="countdown-message">Try again in {countdown} seconds.</small>
          )}
          <button
            className="login-button"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            disabled={isButtonDisabled}
          >
            Login
          </button>
          <Link to="/reset-password" className="forgot-password">
            Forgot Password?
          </Link>
        </form>
        <footer className="login-footer">
          Copyright © 2024 FE Exam track, All Rights Reserved.
        </footer>
      </div>
    </div>
  );
}
