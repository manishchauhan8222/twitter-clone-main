import React from 'react'
import './more.css'
import Language from './Language'
import { useTranslation } from 'react-i18next';
import UserInfo from './UserInfo';

function More() {
  const { t } = useTranslation();
    return (
        <div className='container'>
            <h2 className='heading'>{t("Explore New Features")}</h2>
            <h4>OTP-based authentication is required for email & password type login and language change.</h4>
            <h4>Premium plans are currently only available for users who register & login with email & password type authentication (not for google-signin) due to security reasons.</h4>
            <div className="language">
                <Language />
            </div>
            <div className="device">
                <UserInfo />
            </div>
        </div>
    )
}

export default More