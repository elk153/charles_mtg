import React from "react";
import "./Input.css";

const Input = ({ 
  id, 
  placeholder="", 
  label, 
  onSubmit, 
  isLoading, 
  searchQuery, 
  setSearchQuery 
}) => {

  return (
    <form className="input" onSubmit={onSubmit}>

      <label htmlFor={id}>{label}</label>

       <input 
        id={id} 
        type="text" 
        placeholder={placeholder} 
        onChange={ (event) => (
          setSearchQuery(previousState => ({
            ...previousState,
            params: {q: event.target.value},
          }))
      )}
      />

      <button type="submit" id="submitButton" disabled={isLoading}>
        {isLoading ? "Summoning..." : "Go for it"}
      </button>

    </ form>
  );

};

export default Input;