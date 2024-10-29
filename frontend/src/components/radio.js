import React, { useState } from "react";
import LocationCard from "./locationCard.js"

export default function LocationRadio({ locations, handler }) {
    const [selected, setSelected] = useState(0);

    const handleChange = input => {
        setSelected(input);
    };

    function handleSubmit(event) {
        event.preventDefault();
        handler(selected);
    }

    const buttons = locations.map(loc => 
        <div className={selected === loc.id ? "selectedButtonOption" : "buttonOption"}>
            <RadioButton
                value={loc.id}
                key={loc.id}
                isChecked={selected === loc.id}
                handleChange={handleChange}
            >
                <LocationCard
                    name={loc.name}
                    address={loc.address}
                    latitude={loc.latitude}
                    longitude={loc.longitude}
                />
            </RadioButton>
        </div>
    );

    return (
        <div>
            <form onSubmit={(e) => handleSubmit(e)}>
                {buttons}
                <input type="submit" />
            </form>
        </div>
    );
}


function RadioButton({ value, isChecked, handleChange, children }) {
    const handleRadioChange = () => {
        handleChange(value);
    };

    return (
        <div className="radio">
            <input
                type="radio"
                id={value}
                checked={isChecked}
                onChange={handleRadioChange}
            />
            <label htmlFor={value}>
                {children}
            </label>
        </div>
    );
}
