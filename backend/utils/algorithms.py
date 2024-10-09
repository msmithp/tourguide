import numpy as np
import math
import itertools
import sys


def calculate_tour(distances: np.ndarray, start: int=0) -> tuple[list, float]:
    n = len(distances)

    # greatest number of locations for which Held-Karp will be used
    CUTOFF = 15

    if n == 1:
        return ([0], 0.0)
    elif n <= CUTOFF:
        return held_karp(distances, start)
    else:
        return nearest_neighbor(distances, start)


def held_karp(distances: np.ndarray, start: int=0) -> tuple[list, float]:
    """ Held-Karp algorithm to find the optimal tour through the vertices of a graph
        and the total cost of the tour
        
        :param distances:   Distance matrix representation of a graph 
        :param start:       Index of the starting vertex, 0 by default
        :return:            A tuple containing a list of the indices of 
                            the vertices in the order they are visited and
                            the total cost of thr tour"""
    
    # number of cities in tour
    n = len(distances)

    # `opt` is a dictionary of the format:
    #      {(S, v), (cost, previous_city)}
    # where `S` = bitmask of cities visited in subtour (1 for visited, 0 otherwise)
    #       `v` = last node visited in the tour, as an index to cities[]
    #       `cost` = sum of edge weights, i.e., total cost of the tour
    #       `previous_city` = second-to-last city visited in tour 
    # 
    # `opt` stores optimal subtours that start at `start`, travel through the
    # cities in `S`, and end at `v`
    opt = {}

    for i in range(1, n):
        # the optimal tour from `start` to one other city is the edge between them
        opt[(1 << i, i)] = (distances[0][i], 0)

    for size in range(2, n):
        # get all combinations of cities of size `size` not including the start
        subsets = itertools.combinations(range(1, n), size)

        # iterate through all subsets `S` whose size is i and who do not include the start
        for S in subsets:
            # subset `S` represented as a bitmask with a 1 for included
            # cities and 0 for excluded cities
            mask = to_bitmask(S)

            # iterate through all `v` in `S`
            for v in S:
                min_cost = sys.maxsize
                previous_city = -1  # last city visited in subtour
                S_minus_v = mask & ~(1 << v)  # subset `S` with city `v` excluded

                # iterate through all cities `u` != `v` in the subset `S` to
                # find the optimal sub-tour that starts at `start`, goes through 
                # `S` (not including `v`), goes to `u`, and ends at `v`
                for u in S:
                    if u == v:
                        continue

                    new_cost = opt[(S_minus_v, u)][0] + distances[u][v]

                    if new_cost < min_cost:
                        min_cost = new_cost
                        previous_city = u

                opt[(mask, v)] = (min_cost, previous_city)

    # all optimal subtours of size (n - 1) have been found - now, we
    # find the optimal tour of size n
    min_cost = sys.maxsize
    previous_city = -1
    cities_bitmask = (2 ** n) - 2  # bitmask of cities with `start` excluded

    # find shortest path through all cities (excluding `start`) to `start`
    for v in range(1, n):
        new_cost = opt[(cities_bitmask, v)][0] + distances[0][v]
        
        if new_cost < min_cost:
            min_cost = new_cost
            previous_city = v

    # reconstruct path
    tour = [previous_city]  # start with last city visited
    while cities_bitmask > 0:
        # remove previous_city from the bitmask
        new_mask = cities_bitmask & (~(1 << previous_city))

        # get next-latest city visited in tour
        _, previous_city = opt[(cities_bitmask, previous_city)]
        
        # insert next-latest city at index 0
        tour.insert(0, previous_city)

        # re-assign bitmask to new mask and iterate
        cities_bitmask = new_mask

    # since TSP solution is a Hamiltonian cycle, starting location is
    # arbitrary - we simply rotate the list to get the right starting point
    tour = np.roll(tour, -tour.index(start)).tolist()

    return tour, min_cost

    
def to_bitmask(combination: tuple[int]):
    """ Convert a tuple of integers into a bitmask """
    mask = 0
    for bit in combination:
        # add a `1` at each index (0-based, right-to-left) specified in the tuple
        # e.g., (2, 5, 6, 7) returns `0b11100100`
        mask |= 1 << bit

    return mask


def make_distance_matrix(vertices: dict) -> tuple[np.ndarray, np.ndarray]:
    """ Creates a matrix of distances given a dictionary of names and coordinates """
    names = np.array(list(vertices.keys()))
    dists = np.zeros(shape=(len(vertices), len(vertices)))

    for i, (lat1, long1) in enumerate(vertices.values()):
        for j, (lat2, long2) in enumerate(vertices.values()):
            dists[i][j] = haversine(lat1, long1, lat2, long2)

    return dists, names    


def nearest_neighbor(distances: np.ndarray, start: int=0) -> tuple[list, float]:
    """ Nearest Neighbor algorithm to approximate the optimal tour and the 
        length of the shortest tour of a graph
        
        :param distances:   Distance matrix representation of a graph 
        :param start:       Index of the starting vertex, 0 by default
        :return:            A tuple containing a list of the indices of 
                            the vertices in the order they are visited and
                            the total cost of thr tour"""
    # all cities except `start` are initialized as False (unvisited)
    visited = [False for _ in distances]
    visited[start] = True

    # `start` is the first city
    current = start
    tour = [start]
    tour_length = 0

    # iterate until all cities have been visited
    while False in visited:
        min_edge = sys.maxsize
        min_index = 0

        # find the minimum edge that connects current city to some unvisited city
        for i, edge in enumerate(distances[current]):
            if (not visited[i]) and i != current and edge < min_edge:
                min_edge = edge
                min_index = i
        
        # set `current` to unvisited city with smallest edge weight
        current = min_index

        # add unvisited city to tour
        tour.append(current)
        tour_length += min_edge
        
        # mark `current` as visited
        visited[current] = True

    # add distance from last visited city to start
    tour_length += distances[tour[-1]][start]
    
    return tour, tour_length


def haversine(lat1: float, long1: float, lat2: float, long2: float) -> float:
    """ Get the great-circle distance in miles between two latitude/longitude pairs. """
    RADIUS = 3958.8  # Radius of Earth in miles
    to_rad = math.pi / 180

    return 2 * RADIUS * math.asin(math.sqrt(
        0.5 - math.cos((lat2 - lat1) * to_rad) / 2
        + math.cos(lat1 * to_rad) * math.cos(lat2 * to_rad) *
        (1 - math.cos((long2 - long1) * to_rad)) / 2
    ))
