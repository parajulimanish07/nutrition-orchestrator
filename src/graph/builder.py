from langgraph.graph import StateGraph, END
from src.graph.state import AgentState
from src.graph.nodes import supervisor_node, menu_worker_node, math_worker_node
from src.graph.routing import route_from_supervisor, route_from_math_worker


def build_nutrition_graph():
    """
    Assembles and compiles the multi-agent LangGraph workflow.
    
    Graph Topology:
    1. Entry Point -> supervisor
    2. supervisor -> menu_worker (or END when finalized)
    3. menu_worker -> math_worker
    4. math_worker -> conditional routing:
         - fits macros -> supervisor (finalizes)
         - fails & iterations < max -> menu_worker (error correction loop)
         - max iterations reached -> supervisor
    """
    workflow = StateGraph(AgentState)

    # 1. Add Nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("menu_worker", menu_worker_node)
    workflow.add_node("math_worker", math_worker_node)

    # 2. Set Entry Point
    workflow.set_entry_point("supervisor")

    # 3. Add Edges
    workflow.add_conditional_edges(
        "supervisor",
        route_from_supervisor,
        {
            "menu_worker": "menu_worker",
            "__end__": END,
        },
    )

    workflow.add_edge("menu_worker", "math_worker")

    workflow.add_conditional_edges(
        "math_worker",
        route_from_math_worker,
        {
            "menu_worker": "menu_worker",
            "supervisor": "supervisor",
        },
    )

    return workflow.compile()
