# Project Brief: Precision Nutrition & Body Recomposition Orchestrator

## 1. Project Overview
This project is an API-first, multi-agent AI system designed to generate mathematically verified, macro-exact meal plans. It uses a Supervisor-Worker architecture to ensure that LLM outputs strictly adhere to numerical constraints rather than hallucinating nutritional values or portion sizes.

## 2. Tech Stack & Environment
* **Orchestration:** LangGraph (Python), LangChain Core
* **Tools Standard:** Model Context Protocol (MCP) Python SDK
* **Data Validation:** Pydantic
* **API Gateway:** FastAPI
* **LLM Inference:** AWS Bedrock (Claude 3.5 Sonnet or Llama 3 via Bedrock API)
* **Frontend (Future Integration):** Next.js (TypeScript)
* **Deployment:** Docker

## 3. Core System Architecture
The system utilizes a LangGraph state machine with the following nodes:
* **Supervisor Agent:** Receives the user prompt and delegates tasks. Evaluates if the final meal plan meets the numerical targets.
* **Menu Worker:** Uses the `LocalMenuSearch` tool to retrieve available meals and their raw nutritional data.
* **Math Worker:** Uses the `MacroMathEngine` tool to calculate deficits and verify if the Menu Worker's suggestions fit the baseline targets.

## 4. Test Data & Baseline Constraints
To build and test the deterministic tools in Phase 1, use the following baseline targets and mock data structure:
* **Default Macro Target:** 2,400 calories, 155g protein.
* **Mock Database (`LocalMenuSearch`):** Populate the initial JSON database with menu items from specific local vendors to test real-world retrieval. Ensure the following test cases exist to simulate real API fetching:
    * Yum Yai Thai (e.g., Pad See Ew, Spicy Fried Rice, Spring Rolls)
    * Tapari Momo (e.g., Steamed Dumplings)
    * KFC (e.g., Zinger Burger, Original Recipe Chicken)

## 5. Development Phases

**Phase 1: Deterministic Tools (MCP & Python)**
* Build the `UserMacros` Pydantic schema for strict type enforcement.
* Implement the `MacroMathEngine` Python function to handle deficit/surplus math.
* Implement the `LocalMenuSearch` function using the mock JSON database.

**Phase 2: Multi-Agent Engine (LangGraph)**
* Define the state dictionary to track current macros and proposed meals.
* Construct the Supervisor, Menu, and Math nodes.
* Implement the routing logic for error correction (e.g., looping back to the Menu Worker if the Math Worker determines the macros exceed targets).

**Phase 3: Strict Validation & API Setup**
* Enforce a Pydantic schema for the final output generation so the system returns strict JSON, not conversational text.
* Wrap the LangGraph workflow in a FastAPI instance with asynchronous endpoints.
* Configure the AWS Bedrock client for secure LLM inference.
