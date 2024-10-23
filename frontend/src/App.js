import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Modal } from "react-bootstrap";
import LocationRadio from "./components/radio.js";
import LocationCard from "./components/locationCard.js"


const sampleLocations = [
    {
        id: 1,
        name: "Empire State Building",
        address: "Empire State Building, 350, 5th Avenue, Manhattan Community Board 5, Manhattan, New York County, New York, 10118, United States",
        latitude: "40.748300",
        longitude: "-73.985659"
    },
    {
        id: 2,
        name: "Hood College",
        address: "Hood College, 401, Rosemont Avenue, Rosedale, Frederick, Frederick County, Maryland, 21701, United States",
        latitude: "39.422962",
        longitude: "-77.418917"
    },
    {
        id: 3,
        name: "Myersville, MD",
        address: "Myersville, Frederick County, Maryland, United States",
        latitude: "39.505101",
        longitude: "-77.566377"
    }
];


function currentTime() {
    var date = new Date();
    return "" + date.getFullYear() + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" 
        + ('0' + date.getDate()).slice(-2) + " " + ('0' + date.getHours()).slice(-2) 
        + ":" + ('0' + date.getMinutes()).slice(-2) 
        + ":" + ('0' + date.getSeconds()).slice(-2);
}


function Dropdown({ tours=[], handler }) {
    const selectItems = tours.map(t =>
        <option key={t.id} value={t.id}>{t.name}</option>
    );

    return (
        <div> {/* TODO: add CSS class */}
            <select name="selectedTour" onChange={e => handler(e.target.value)}>
                {selectItems}
            </select>
        </div>
    )
}


function Sidebar({ children }) {
    return (
        <div> {/* TODO: add CSS class */}
            {children}
        </div>
    )
}


function SearchForm({ handler }) {
    function handleSubmit(event) {
        event.preventDefault();  // prevent redirect
        handler(event.target[0].value);  // send query to handler
    }

    return (
        <form onSubmit={(e) => handleSubmit(e)}>
            <label>Enter location to add:
                <input type="text"/>
            </label>
            <input type="submit" />
        </form>
    )
}


function LocationList({ locations, handler }) {
    if (locations == null) {  // TODO: Handle empty case (prompt user to select a tour)
        return <div></div>
    }

    const listItems = locations.map(loc => 
        <li key={loc.id} value={loc.id}>
            <LocationCard 
                name={loc.name}
                address={loc.address}
                latitude={loc.latitude}
                longitude={loc.longitude}
            />
            <button onClick={e => handler(loc.id)}>Remove</button>
        </li>
    );

    return (
        <div> {/* TODO: add CSS class */}
            <ul>{listItems}</ul>    
        </div>
    );
}


function LocationSelection({ locations, handler }){
    return (
        <div>
            <LocationRadio locations={locations} handler={handler} />
        </div>
    )
}


export default function App() {
    const [tours, setTours] = useState([]);
    const [currentTour, setCurrentTour] = useState({});
    const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);
    const [searchLocations, setSearchLocations] = useState([]);

    console.log("Rerendering: " + currentTime() + "\nCurrent tour: " + currentTour.name
                + "\nTour info: " + JSON.stringify(currentTour));

    useEffect(() => {
        // Set tours upon page load
        let ignore = false;
        setTours([])
        axios.get("http://127.0.0.1:8000/api/tours/")
        .then(res => {
            if (!ignore) {
                setTours(res.data);
            }
        });

        return () => {
            ignore = true;
        }
    }, []);

    async function handleTourChange(tour_id) {
        // Selected tour changed, so change current tour
        await axios.get("http://127.0.0.1:8000/api/get_tour/" + tour_id + '/')
        .then(res => setCurrentTour(res.data))
        .catch(err => console.log(err));
    }

    function handleGetLocations(query) {
        // Don't spam the button or something bad might happen
        if (query == "") {
            // Ignore blank queries
            return;
        }

        // Set search locations to blank first
        setSearchLocations([]);

        // Get candidate search locations based on search query
        axios.get("http://127.0.0.1:8000/api/search/" + query + '/')
        .then((res) => setSearchLocations(res.data.data))
        .catch((err) => console.log(err));

        // Open popup to display locations
        setSearchModalIsOpen(true);
    }

    async function handleAddToTour(location_id) {
        // Add location to database, then add location to tour
        await axios.post("http://127.0.0.1:8000/api/add_location/", searchLocations[location_id])
        .then((res) => axios.post("http://127.0.0.1:8000/api/add_to_tour/", 
            {tour_id: currentTour.id, location_id: res.data.id}));

        // Refresh tour by retrieving it from the backend
        handleTourChange(currentTour.id);
        
        // Close popup
        setSearchModalIsOpen(false);
    }

    async function handleRemoveFromTour(location_id) {
        // Remove a location from a tour
        await axios.post("http://127.0.0.1:8000/api/remove_from_tour/", 
            {tour_id: currentTour.id, location_id: location_id});

        // Refresh tour by retrieving it from the backend
        handleTourChange(currentTour.id);
    }

    const handleSearchModalClose = () => setSearchModalIsOpen(false);

    return (
        <main>
            <h1>tourguide</h1>
            <Modal show={searchModalIsOpen} onHide={handleSearchModalClose}>
                <LocationSelection 
                    locations={searchLocations} 
                    handler={handleAddToTour}
                />
            </Modal>
            <Dropdown 
                tours={tours}
                handler={handleTourChange}
            />
            <Sidebar>
                <SearchForm handler={handleGetLocations}/>
                <LocationList
                    locations={currentTour.locations}
                    handler={handleRemoveFromTour} 
                />
            </Sidebar>
        </main>
    );
}
