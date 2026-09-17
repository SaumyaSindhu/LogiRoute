durations = [
    [0, 345.3, 184, 366.8, 171.1],
    [310.3, 0, 432, 239.7, 181],
    [103.6, 307.9, 0, 329.4, 133.7],
    [365.7, 269.6, 487.4, 0, 365],
    [207.5, 174.2, 329.2, 302.9, 0]
]

node_names = ["Depot", "A", "B", "C", "D"]

from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp



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

    print("Route:", " → ".join(route))
    print("Total distance:", total_distance)


if __name__ == "__main__":
    solve_tsp(durations, node_names)