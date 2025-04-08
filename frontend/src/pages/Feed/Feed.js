import React, { useEffect, useState } from "react";
import Post from "./Post/Post";
import "./Feed.css";
import TweetBox from "./TweetBox/TweetBox";
import axios from "axios";
import { useTranslation } from "react-i18next";

function Feed() {
  const [posts, setPosts] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    //fetch('https://pacific-peak-30751.herokuapp.com/post')
    // fetch('https://twitter-clone-aevo.onrender.com/post')
    //     .then(res => res.json())
    //     .then(data => {
    //         setPosts(data);
    //     })
    async function fetchPosts() {
      try {
        const response = await axios.get("https://twitter-clone-aevo.onrender.com/post");
        setPosts(response.data);
        // console.log(response.data)
      } catch (error) {
        console.log(error);
      }
    }
    fetchPosts();
  }, [posts]);

  return (
    <div className="feed">
      <div className="feed__header">
        <h2>{t("Home")}</h2>
      </div>
      <TweetBox />
      {posts?.map((p) => (
        <Post key={p._id} p={p} />
      ))}
    </div>
  );
}

export default Feed;
