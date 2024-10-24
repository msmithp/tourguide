import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Modal } from "react-bootstrap";
import LocationRadio from "./components/radio.js";
import LocationCard from "./components/locationCard.js"


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
            <select name="selectedTour" defaultValue="default" onChange={e => handler(e.target.value)}>
                <option disabled value="default">Select a tour</option>
                {selectItems}
            </select>
        </div>
    )
}


function CreateTourButton({ handler }) {
    const [isTextBoxShown, setTextBoxShown] = useState(false);

    function handleButtonClick(event) {
        // Show text box and button
        event.preventDefault();
        setTextBoxShown(true);
    }

    function handleSubmit(event) {
        // Hide text box and send name to handler
        event.preventDefault();
        setTextBoxShown(false);
        handler(event.target[0].value);
    }

    function handleCancel(event) {
        // Hide text box
        event.preventDefault();
        setTextBoxShown(false);
    }

    return (
        <>
            {isTextBoxShown ? 
                <div>
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <input type="text" placeholder="Tour name"/>
                        <input type="submit" value="Create tour"/>
                        <button onClick={(e) => handleCancel(e)}>Cancel</button>
                    </form>
                </div>
            :
                <div>
                    <button onClick={(e) => handleButtonClick(e)}>Create Tour</button>
                </div>
            }
        </>
    );
}


function DeleteTourButton({ handler }) {
    const [isOptionsShown, setOptionsShown] = useState(false);

    function handleButtonClick(event) {
        setOptionsShown(true);
    }

    function handleSubmit(event) {
        setOptionsShown(false);
        handler();
    }

    function handleCancel(event) {
        setOptionsShown(false);
    }

    return (
        <>
            {isOptionsShown ?
                <div>
                    <button onClick={(e) => handleSubmit(e)}>Delete Tour</button>
                    <button onClick={(e) => handleCancel(e)}>Cancel</button>
                </div>
            :
                <div>
                    <button onClick={(e) => handleButtonClick(e)}>Delete Tour</button>
                </div>
            }
        </>
    );
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
        <>
            {locations.length == 0 ? 
            <p>No results.</p>
            :
            <div>
                <LocationRadio locations={locations} handler={handler} />
            </div>
            }
        </>
    )
}


function LoadingScreen() {
    return (
        <div>
            <p>Loading...</p>
        </div>
    )
}


function DefaultScreen() {
    return (
        <div>
            <h2>No tour selected</h2>
            <p>Select or create a tour to start.</p>
        </div>
    );
}


export default function App() {
    // Tour data
    const [tours, setTours] = useState([]);
    const [currentTour, setCurrentTour] = useState({});
    const [searchLocations, setSearchLocations] = useState([]);

    // Modals
    const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);
    const [loadingModalIsOpen, setLoadingModalIsOpen] = useState(false);

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

    async function handleGetLocations(query) {
        // Don't spam the button or something bad might happen
        if (query === "") {
            // Ignore blank queries
            return;
        }

        // Display loading screen
        setLoadingModalIsOpen(true);

        // Set search locations to blank first
        setSearchLocations([]);

        // Get candidate search locations based on search query
        await axios.get("http://127.0.0.1:8000/api/search/" + query + '/')
        .then((res) => setSearchLocations(res.data.data))
        .catch((err) => console.log(err));

        // Hide loading screen
        setLoadingModalIsOpen(false);

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

    async function handleCreateTour(name) {
        // Create tour with a given name
        await axios.post("http://127.0.0.1:8000/api/create_tour/", {name: name})
        .then((res) => {
            axios.get("http://127.0.0.1:8000/api/tours/")
            .then(res => setTours(res.data));

            handleTourChange(res.id);
        });
    }

    async function handleDeleteTour(tour_id) {
        // Delete tour with a given tour ID
        console.log("Deleting tour " + currentTour.id);

        // After deletion, default to tour `{}`
    }

    const handleSearchModalClose = () => setSearchModalIsOpen(false);
    
    const handleLoadingModalClose = () => setLoadingModalIsOpen(false);

    return (
        <main>
            <h1>tourguide</h1>
            <Modal show={loadingModalIsOpen} onHide={handleLoadingModalClose}>
                <LoadingScreen />
            </Modal>
            <Modal show={searchModalIsOpen} onHide={handleSearchModalClose}>
                <LocationSelection 
                    locations={searchLocations} 
                    handler={handleAddToTour}
                />
            </Modal>
            <CreateTourButton handler={handleCreateTour} />
            <DeleteTourButton handler={handleDeleteTour} />
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
            {/* Map goes here */}
        </main>
    );
}
