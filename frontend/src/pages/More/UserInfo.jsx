import React, { useState, useEffect } from 'react';
import UAParser from 'ua-parser-js';
import axios from 'axios';
import './more.css';

const UserInfo = () => {
  const [showDevice, setShowDevice] = useState(false);
  const [ip, setIp] = useState('');

  const getUserInfo = () => {
    const parser = new UAParser();
    const result = parser.getResult();

    return {
      browser: result.browser.name,
      browserVersion: result.browser.version,
      os: result.os.name,
      osVersion: result.os.version,
      device: result.device.model || 'Desktop',
    };
  };

  const getUserIP = async () => {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      setIp(response.data.ip);
    } catch (error) {
      console.error('Error fetching IP address:', error);
      return null;
    }
  };

  useEffect(() => {
    getUserIP();
  }, []);

  const { browser, browserVersion, os, osVersion, device } = getUserInfo();

  return (
    <div className="container">
      <h1>Device Info</h1>
      <button onClick={() => setShowDevice(true)}>Access</button>
      {showDevice && (
        <div>
          <p><span>Browser:</span> {browser}</p>
          <p><span>Browser Version:</span> {browserVersion}</p>
          <p><span>OS:</span> {os}</p>
          <p><span>OS Version:</span> {osVersion}</p>
          <p><span>Device:</span> {device}</p>
          <p><span>IP:</span> {ip}</p>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
