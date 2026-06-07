import React from "react";
import "./Input.css";

const Input = ({ id, type, placeholder="", label }) => {

    return (
        <div className="input">
            <label htmlFor={id}>{label}</label>
            <input id={id} type={type} placeholder={placeholder} />
            <button>Go for it!</button>
        </ div>
    );

};

export default Input;