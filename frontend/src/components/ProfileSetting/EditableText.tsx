import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CSS from 'csstype';

type EditableTextProps = {
  text: string;
  onSubmit: (value: string) => void;
};

const EditableText = ({ text, onSubmit }: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(value);
    setIsEditing(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return isEditing ? (
    <form onSubmit={handleSubmit}>
      <input type="text" className="text-black" value={value} onChange={handleChange}/>
      <button type="submit" style={Buttonstyles}>Save</button>
    </form>) : (
    <h1 className="font-semibold text-4xl">
      {text+" "}
      <EditIcon onClick={handleEdit} style={{cursor: 'pointer'}}/>
    </h1>);
};

const Buttonstyles: CSS.Properties = {
  backgroundColor: '#e5e7eb',
  color: 'black',
  border: 'solid 1px black',
  borderRadius: '5px',
  padding: '0 5px',
}

export default EditableText;