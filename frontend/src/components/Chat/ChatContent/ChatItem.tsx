import React, { Component } from "react";
import UserAvatar from "../UserList/UserAvatar";

interface Props {
    animationDelay: number;
    key: number;
    user: string;
    msg: string;
    image: string;
    username:string;
    time:string;
}

const convertTime = (time:string) => {
  let date = new Date(time);
  let day:any = date.getDate();
  let month:any = date.getMonth() + 1;
  let year:any = date.getFullYear();
  let hours:any = date.getHours();
  let minutes:any = date.getMinutes();
  if (day < 10)
    day = "0" + day.toString();
  if (month < 10)
    month = "0" + month.toString();
  if (hours < 10)
    hours = "0" + hours.toString();
  if (minutes < 10)
    minutes = "0" + minutes.toString();
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
}

const ChatItem = ({ user, msg, image , username, time}: Props) => {
  return (
    <div style={{ animationDelay: `0.8s` }} className={`chat__item ${user ? user : ""}`}>
      <div className="chat__item__content">
        <div>{username}</div>
        <div className="chat__msg">{msg}</div>
        <div>{convertTime(time)}</div>
      </div>
      <UserAvatar image={image} />
    </div>
  );
};

export default ChatItem;