from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from osrm_client import get_osrm_duration_matrix, OSRMError
from tsp_solver import solve_tsp

app = FastAPI()


class Stop(BaseModel):
    id: str
    lat: float
    lng: float


class OptimizeRequest(BaseModel):
    depot: Stop
    stops: list[Stop]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/optimize")
def optimize(request: OptimizeRequest):
    all_points = [request.depot] + request.stops
    coordinates = [(p.lat, p.lng) for p in all_points]
    node_names = [p.id for p in all_points]
    try:
        durations = get_osrm_duration_matrix(coordinates)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except OSRMError as e:
        raise HTTPException(status_code=502, detail=str(e))

    result = solve_tsp(durations, node_names)

    if result is None:
        raise HTTPException(status_code=422, detail="No feasible route found")

    return result