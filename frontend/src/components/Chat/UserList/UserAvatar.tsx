import { Component } from "react";

interface Props {
    image: string;
}

const UserAvatar = ({ image }: Props) => {
  return (
    <div className="avatar">
      <div className="avatar-img">
        <img src={image} alt="#" />
      </div>
    </div>
  );
};

export default UserAvatar;
