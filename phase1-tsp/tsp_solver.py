from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from osrm_client import get_osrm_duration_matrix, OSRMError

node_names = ["Depot", "A", "B", "C", "D"]

coordinates = [
    (28.7158, 77.1091),  # Depot
    (28.7237, 77.1280),  # A
    (28.7208, 77.1072),  # B
    (28.7115, 77.1391),  # C
    (28.7186, 77.1195),  # D
]

try:
    distance_matrix = get_osrm_duration_matrix(coordinates)
except (ValueError, OSRMError) as e:
    print(f"Failed to build distance matrix: {e}")
    exit(1)



def solve_tsp(durations, node_names):
    num_nodes = len(durations)
    depot_index = 0

    # Manager translates between OR-Tools' internal node numbering
    # and our actual matrix indices. With 1 vehicle, this is straightforward.
    manager = pywrapcp.RoutingIndexManager(num_nodes, 1, depot_index)

    # Routing model holds the actual problem definition
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(round(durations[from_node][to_node]))

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Search parameters: tells OR-Tools HOW to search for a solution
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        print_solution(manager, routing, solution, node_names)
    else:
        print("No solution found.")


def print_solution(manager, routing, solution, node_names):
    index = routing.Start(0)
    route = []
    total_distance = 0

    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        route.append(node_names[node])
        previous_index = index
        index = solution.Value(routing.NextVar(index))
        total_distance += routing.GetArcCostForVehicle(previous_index, index, 0)

    route.append(node_names[manager.IndexToNode(index)])  # back to depot

    print("Route:", " -> ".join(route))
    print("Total distance:", total_distance)


if __name__ == "__main__":
    solve_tsp(distance_matrix, node_names)