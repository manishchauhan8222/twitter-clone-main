import React, { useState, useEffect } from "react";
import "./more.css";
import axios from "axios";

const Otp = ({ mail, lang }) => {
  const [otp, setOtp] = useState("");

  const getThemeClass = (language) => {
    switch (language) {
      case "es":
        return "spanish-theme";
      case "hi":
        return "hindi-theme";
      case "pt":
        return "portuguese-theme";
      case "ta":
        return "tamil-theme";
      case "bn":
        return "bengali-theme";
      case "fr":
        return "french-theme";
      default:
        return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpData = {
      email: mail,
      otp,
      newLanguage: lang,
    };
    const { data } = await axios.post(
      "https://twitter-clone-aevo.onrender.com/api/verify-otp",
      otpData
    );
    if (data.success) {
      localStorage.setItem("language-theme", getThemeClass(lang));
      setTimeout(() => {
        window.location.replace(`https://twitter-clone-nullclass.netlify.app/?lng=${lang}`);
      }, 500);
    } else {
      alert("Invalid OTP, try again");
      window.location.replace("https://twitter-clone-nullclass.netlify.app/");
    }
  };

  return (
    <div className="container">
      <h4>An OTP has been sent to {mail}</h4>
      <input
        type="text"
        onChange={(e) => setOtp(e.target.value)}
      />
      <button type="submit" onClick={handleSubmit}>
        Submit
      </button>
      <h6>Enter OTP to change the language</h6>
    </div>
  );
};

export default Otp;
