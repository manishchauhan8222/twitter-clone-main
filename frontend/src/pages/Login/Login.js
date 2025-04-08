import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "react-google-button";
import { useUserAuth } from "../../context/UserAuthContext";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { logIn, googleSignIn } = useUserAuth();
  const [withOtp, setWithOtp] = useState(false);
  const [otp, setOtp] = useState();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (email && password) {
      setWithOtp(true);
      const { data } = await axios.post(
        "https://twitter-clone-aevo.onrender.com/api/generate-otp",
        { email }
      );
    } else {
      alert("Enter email/password");
    }

  };

  const handleOTP = async () => {
    const { data } = await axios.post("https://twitter-clone-aevo.onrender.com/api/verify-otp", {
      email,
      otp,
    });
    if (data.success) {
        try {
            await logIn(email, password);
            navigate("/");
          } catch (err) {
            setError(err.message);
            window.alert("Oops, your entered password was incorrect");
          }
    } else {
      alert("invalid OTP, try again");
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      await googleSignIn();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="image-container">
          <img className=" image" src={twitterimg} alt="twitterImage" />
        </div>

        <div className="form-container">
          <div className="form-box">
            <TwitterIcon style={{ color: "skyblue" }} />
            <h2 className="heading">Happening now</h2>

            {error && <p>{error.message}</p>}
            {!withOtp && (
              <div>
                <form onSubmit={handleSubmit}>
                  <input
                    type="email"
                    className="email"
                    placeholder="Email address"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    className="password"
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <div className="btn-login">
                    <button type="submit" className="btn">
                      Log In
                    </button>
                  </div>
                </form>

                <hr />

                <div>
                  <GoogleButton
                    className="g-btn"
                    type="light"
                    onClick={handleGoogleSignIn}
                  />
                </div>
              </div>
            )}

            {withOtp && (
              <div className="otp-container">
                <h4>An OTP has been sent to your mail!</h4>
                <input
                  type="text"
                  className="otp"
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button className="btn" onClick={handleOTP}>
                  Submit OTP
                </button>
              </div>
            )}
          </div>
          <div>
            Don't have an account?
            <Link
              to="/signup"
              style={{
                textDecoration: "none",
                color: "var(--twitter-color)",
                fontWeight: "600",
                marginLeft: "5px",
              }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
