import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Modal } from "react-bootstrap";
import LocationRadio from "./components/radio.js";
import LocationCard from "./components/locationCard.js";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from "leaflet";

// Configure Leaflet marker icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});


function currentTime() {
    var date = new Date();
    return "" + date.getFullYear() + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" 
        + ('0' + date.getDate()).slice(-2) + " " + ('0' + date.getHours()).slice(-2) 
        + ":" + ('0' + date.getMinutes()).slice(-2) 
        + ":" + ('0' + date.getSeconds()).slice(-2);
}


function isEmpty(dict) {
    return Object.keys(dict).length === 0;
}


function Dropdown({ currentTour, tours=[], handler }) {
    const selectItems = tours.map(t =>
        <option key={t.id} value={t.id}>{t.name}</option>
    );

    return (
        <div className="dropdown">
            <select 
                name="selectedTour"
                value={isEmpty(currentTour) ? "default" : currentTour.id}
                onChange={e => handler(e.target.value)}>
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
        <div className="createTourButton">
            {isTextBoxShown ? 
                <div>
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <input type="text" placeholder="Tour name" style={{width: "40%"}}/>
                        <input type="submit" value="Create Tour"/>
                        <button onClick={(e) => handleCancel(e)}>Cancel</button>
                    </form>
                </div>
            :
                <div>
                    <button onClick={(e) => handleButtonClick(e)}>Create Tour</button>
                </div>
            }
        </div>
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
                    <button className="deleteButton" onClick={(e) => handleSubmit(e)}>Delete Tour</button>
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
        <div className="sidebar">
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
        <div className="searchForm">
            <form onSubmit={(e) => handleSubmit(e)}>
                <label>Add a location:
                    <input type="text" placeholder="Search..."/>
                </label>
                <input type="submit" />
            </form>
        </div>
    )
}


function LocationList({ locations, handler }) {
    if (locations == null) {
        return <div></div>
    }

    const listItems = locations.map((loc, index) => 
        <li key={loc.id} value={loc.id}>
            {/* <p>{index}</p> */}
            <LocationCard 
                name={loc.name}
                address={loc.address}
                latitude={loc.latitude}
                longitude={loc.longitude}
            />
            <button className="removeButton" onClick={e => handler(loc.id)}>Remove</button>
        </li>
    );

    return (
        <div className="locationList">
            <ul>{listItems}</ul>    
        </div>
    );
}


function LocationSelection({ locations, handler }){
    return (
        <div className="locationSelection">
            {locations.length === 0 ? 
            <p>No results.</p>
            :
            <div>
                <LocationRadio locations={locations} handler={handler} />
            </div>
            }
        </div>
    )
}


function LoadingScreen() {
    return (
        <div className="loadingScreen">
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

function InnerMap({ locations }) {
    // Inner map component to handle bounds fitting
    const map = useMap();

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = locations.map(loc => [loc.latitude, loc.longitude]);
            map.fitBounds(bounds, {padding: [50, 50]});
        }
    }, [locations, map])

    return null;
}


export default function App() {
    // Tour data
    const [tours, setTours] = useState([]);
    const [currentTour, setCurrentTour] = useState({});
    const [searchLocations, setSearchLocations] = useState([]);

    // Modals
    const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);
    const [loadingModalIsOpen, setLoadingModalIsOpen] = useState(false);

    // console.log("Rerendering: " + currentTime() + "\nCurrent tour: " + currentTour.name
    //             + "\nTour info: " + JSON.stringify(currentTour));

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
        if (tour_id < 1) {
            // Invalid tour ID, default to {}
            setCurrentTour({});
            return;
        }

        // Get tour data from database
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
        if (name.length > 100) {
            // Truncate names longer than 100 characters
            name = name.substring(0, 100);
        }

        // Create tour with given name
        await axios.post("http://127.0.0.1:8000/api/create_tour/", {name: name})
        .then((newTour) => {
            axios.get("http://127.0.0.1:8000/api/tours/")
            .then((res) => {
                // Refresh list of tours
                setTours(res.data);

                // Set current tour to newly created tour
                handleTourChange(newTour.data.id);
            });
        });
    }

    async function handleDeleteTour() {
        // Delete current tour
        if (isEmpty(currentTour)) {
            // Don't delete the default null tour
            return;
        }

        // Delete tour from database
        await axios.delete("http://127.0.0.1:8000/api/delete_tour/" + currentTour.id + "/");

        // Refresh list of tours
        await axios.get("http://127.0.0.1:8000/api/tours/")
        .then((res) => setTours(res.data))
        .catch((err) => console.log(err));

        // After deletion, default to tour `{}`
        handleTourChange(-1);
    }

    const handleSearchModalClose = () => setSearchModalIsOpen(false);
    
    const handleLoadingModalClose = () => setLoadingModalIsOpen(false);

    function getPolyline(locations) {
        // Get ordered list of points for polyline in map
        if (locations === null || locations.length <= 1) {
            return [];
        }

        // Push each [lat, lon] pair to the line
        let line = [];
        for (let i = 0; i < locations.length; i++) {
            line.push([locations[i].latitude, locations[i].longitude]);
        }

        // Loop back to start
        line.push([locations[0].latitude, locations[0].longitude])

        return line;
    }

    return (
        <main>
            <Modal show={loadingModalIsOpen} onHide={handleLoadingModalClose}>
                <LoadingScreen />
            </Modal>
            <Modal show={searchModalIsOpen} onHide={handleSearchModalClose}>
                <LocationSelection 
                    locations={searchLocations} 
                    handler={handleAddToTour}
                />
            </Modal>
            <Sidebar>
                <div className="header">
                    <div>
                        <h1 className="logo">tourguide</h1>
                        <Dropdown
                            currentTour={currentTour}
                            tours={tours}
                            handler={handleTourChange}
                        />
                    </div>
                    <div className="buttons">
                        <CreateTourButton handler={handleCreateTour} />
                        <DeleteTourButton handler={handleDeleteTour} />
                    </div>
                </div>
                {isEmpty(currentTour) ?
                <>
                    <DefaultScreen />
                </>
                :
                <>
                    <SearchForm handler={handleGetLocations}/>
                    <LocationList
                        locations={currentTour.locations}
                        handler={handleRemoveFromTour} 
                    />
                </>
                }
            </Sidebar>
            <MapContainer
                className="map"
                zoom={6}
                minZoom={3}
                center={[39.422962, -77.418918]}
                maxBounds={[[-85.06, -180], [85.06, 180]]}
            >
                <TileLayer 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
                        OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {isEmpty(currentTour) ? (
                    <></> 
                ) : (
                    <>
                        {currentTour.locations.map(loc => (
                            <Marker
                                key={loc.id}
                                position={[loc.latitude, loc.longitude]}
                            >
                                <Popup>
                                    {loc.name}
                                </Popup>
                            </Marker>
                        ))}
                        <Polyline positions={getPolyline(currentTour.locations)}/>
                        <InnerMap locations={currentTour.locations} />
                    </>
                )}
            </MapContainer>
        </main>
    );
}
