# osrm_client.py

import requests


class OSRMError(Exception):
    """Raised when OSRM cannot provide a usable travel-time matrix."""
    pass


def validate_coordinates(coordinates):
    """coordinates: list of (lat, lng) tuples"""
    for i, (lat, lng) in enumerate(coordinates):
        if not (-90 <= lat <= 90):
            raise ValueError(f"Invalid latitude at index {i}: {lat}")
        if not (-180 <= lng <= 180):
            raise ValueError(f"Invalid longitude at index {i}: {lng}")


def get_osrm_duration_matrix(coordinates, timeout=5, max_retries=2):
    """
    Get a travel time matrix from OSRM.
    coordinates: list of (lat, lng) tuples, first one treated as depot
    Returns: 2D list of travel times in seconds (integers)
    Raises: ValueError for bad input, OSRMError for API/network failures
    """
    validate_coordinates(coordinates)

    # OSRM wants "lng,lat" pairs, semicolon-separated
    coord_string = ";".join(f"{lng},{lat}" for lat, lng in coordinates)
    url = f"http://router.project-osrm.org/table/v1/driving/{coord_string}"

    last_error = None
    for attempt in range(max_retries + 1):
        try:
            response = requests.get(url, timeout=timeout)
            response.raise_for_status()
            data = response.json()

            if data.get("code") != "Ok":
                raise OSRMError(f"OSRM returned error code: {data.get('code')}")

            durations = data.get("durations")
            if durations is None:
                raise OSRMError("OSRM response missing 'durations' field")

            # Check for null entries = unroutable point
            for row in durations:
                if None in row:
                    raise OSRMError(
                        "OSRM could not compute a route for one or more points "
                        "(location may be unreachable by road)."
                    )

            return durations

        except requests.exceptions.RequestException as e:
            last_error = e
            continue  # retry

    raise OSRMError(f"Failed to reach OSRM after {max_retries + 1} attempts: {last_error}")