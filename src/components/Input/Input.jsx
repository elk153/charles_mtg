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

      <fieldset>
        <label className="radio-option">
          <input 
            type="radio" 
            name="path" 
            value="cards/named" 
            checked={searchQuery.path === "cards/named"} 
            onChange={(event) => setSearchQuery(previousState => ({
              ...previousState,
              path: event.target.value
            }))}
          />
          <span>One card</span>
        </label>

        <label className="radio-option">
          <input 
            type="radio" 
            name="path" 
            value="cards/search" 
            checked={searchQuery.path === "cards/search"}
            onChange={(event) => setSearchQuery(previousState => ({
              ...previousState,
              path: event.target.value
            }))}
          />
        <span>All matching cards</span>
        </label>
      </fieldset>

      <input 
        id={id} 
        type="text" 
        placeholder={placeholder} 
        onChange={ (event) => setSearchQuery(previousState => {
          
          let newParam;

          switch (searchQuery.path) {
            case "cards/named":
              newParam = {fuzzy: event.target.value};
              break;
            case "cards/search":
              newParam = {q: event.target.value};
              break;
            default:
              newParam = {format:json};
          };

          return {
            ...previousState,
            params: newParam,
          };
        })}
      />
      <button type="submit" id="submitButton" disabled={isLoading}>
        {isLoading ? "Summoning..." : "Go for it"}
      </button>
    </ form>
  );

};

export default Input;