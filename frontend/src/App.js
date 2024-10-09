import React, { Component } from "react";
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations : ""
    };
  }

  getItem = () => {
    axios.get("http://127.0.0.1:8000/api/locations/")
    // .then((res) => this.setState({locations: res.data[0].name}))
    // .then((res) => console.log(res.data))
    .then((res) => this.setState({locations: "test"}))
    .catch((err) => console.log(err));

    console.log(this.state);
  }

  render () {
    return (
      <main>
        <p>Hello world</p>
        <button onClick={this.getItem}>
          Click me
        </button>
        {/* <p>{this.state.locations}</p> */}
      </main>
    )
  }
}

export default App;
