import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./more.css";
import { useUserAuth } from "../../context/UserAuthContext";
import axios from 'axios'
import Otp from "./Otp";

const Language = () => {
  const [lang, setLang] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const { t } = useTranslation();
  const { user } = useUserAuth();
  const email = user?.email;
  // console.log(email)
  const handleLanguageChange = async (e) => {
    setLang(e.target.value);
    if(email){
      const {data} = await axios.post("https://twitter-clone-aevo.onrender.com/api/generate-otp", {email})
    }
    
    setShowOtp(true);
  };
  return (
    <div className="container">
      <div>
        <h4>{t("Experience your app in a new language")}</h4>
        <select onChange={handleLanguageChange} value={lang}>
          <option value="">select</option>
          <option value="en">English</option>
          <option value="es">Español (Spanish)</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="pt">Português (Portuguese)</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="bn">বাংলা (Bengali)</option>
          <option value="fr">Français (French)</option>
        </select>
      </div>
      <div>
        {showOtp && <Otp mail={email} lang={lang} />}
      </div>
    </div>
  );
};

export default Language;
