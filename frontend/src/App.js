import React, { useState } from "react";
import './App.css';
import axios from "axios";

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
    return "" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() 
        + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}


function SearchForm() {
    const [query, setQuery] = useState("");
    // const [loc, setLoc] = useState({});

    const handleSubmit = async (event) => {
        // TODO: handle blank input
        event.preventDefault();
        
        // axios.post("http://127.0.0.1:8000/api/tours/", {name: query, created: currentTime()});
        // axios.delete("http://127.0.0.1:8000/api/delete_tour/3/")
        // axios.post("http://127.0.0.1:8000/api/add_to_tour/", {tour_id: 1, location_id: 2})
        // axios.post("http://127.0.0.1:8000/api/remove_from_tour/", {tour_id: 1, location_id: 2})
        // axios.post("http://127.0.0.1:8000/api/locations/", {name: query, address: "test", latitude: -1.0, longitude: -1.0})

        // axios.get("http://127.0.0.1:8000/api/search/" + query + '/')
        // .then((res) => setLoc(res.data.data[0]))
        // .catch((err) => console.log(err));

        var loc = await axios.get("http://127.0.0.1:8000/api/search/" + query + '/');

        var loc_data = {
            name: loc.data.data[0].name,
            address: loc.data.data[0].display_name,
            latitude: loc.data.data[0].lat,
            longitude: loc.data.data[0].lon
        }

        axios.post("http://127.0.0.1:8000/api/add_location/", loc_data)
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>Enter location to add:
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}/>
            </label>
            <input type="submit" />
        </form>
    )
}

export default function App() {
    const [tours, setTours] = useState([]);
    const [currentTour, setCurrentTour] = useState(-1);
    const [locations, setLocations] = useState([]);

    const getTours = () => {
        axios.get("http://127.0.0.1:8000/api/tours/")
        .then((res) => this.setState({tours: JSON.stringify(res.data)}))
        .catch((err) => console.log(err));
    }

    const getATour = () => {
        // code here to retrieve a tour

    }

    return (
        <main>
            <h2>Create tour</h2>
            <SearchForm />
            <button onClick={getTours}>
                Show tours
            </button>
            <p>{tours}</p>
            <button onClick={getATour}>
                Show a tour
            </button>
            <p>{currentTour}</p>
        </main>
    )
}
