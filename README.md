# tourguide

TourGuide is a web application that calculates the shortest tour that visits a list of real-world locations chosen by the user. Users will be able to create, store, edit, and delete their tours.

## Technologies

TourGuide uses a PostgreSQL database to store user-created tours; Django for database connection, routing, and other back-end logic; React for the front-end; and Node.js for the JavaScript runtime. Other technologies used include the Django REST Framework to connect the Django back-end to the React front-end and Leaflet to display tours on a map. Nominatim, a geocoding API that uses OpenStreetMap data, is used to retrieve a list of candidate locations based on a user-input string. (For example, when a user types "London," Nominatim will return a list of the most relevant locations called London, including London, England; London, Canada; and towns called London in the United States.)

## Algorithms

TourGuide creates tours based on algorithms designed to solve or approximate a solution to the traveling salesman problem. For tours with 15 or fewer locations, the Held-Karp algorithm is used to find an exact solution. For tours with more than 15 locations, the nearest neighbor algorithm is used to approximate a solution that is also intuitive for human travel. Due to limitations of the API, distances between locations are calculated using the great-circle distance (i.e., distance accounting for the curvature of the earth) between latitude and longitude points rather than the distance of the actual route taken.
