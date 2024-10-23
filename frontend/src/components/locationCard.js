import React from "react";


export default function LocationCard({ name, address, latitude, longitude }) {
    return (
        <div> {/* TODO: add CSS class */}
            <h5>{name}</h5>
            <p>{address}<br />{latitude}, {longitude}</p>
        </div>
    );
}