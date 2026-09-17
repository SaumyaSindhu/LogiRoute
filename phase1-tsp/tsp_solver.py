distance_matrix = [
    [0, 10, 15, 20, 25],   # from Depot
    [10, 0, 35, 25, 30],   # from A
    [15, 35, 0, 30, 20],   # from B
    [20, 25, 30, 0, 90],   # from C
    [25, 30, 5, 15, 0],   # from D
]

node_names = ["Depot", "A", "B", "C", "D"]

from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp


def solve_tsp(distance_matrix, node_names):
    num_nodes = len(distance_matrix)
    depot_index = 0

    # Manager translates between OR-Tools' internal node numbering
    # and our actual matrix indices. With 1 vehicle, this is straightforward.
    manager = pywrapcp.RoutingIndexManager(num_nodes, 1, depot_index)

    # Routing model holds the actual problem definition
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

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
    solve_tsp(distance_matrix, node_names)