# Invideo - AI Shader Generator

This is a full-stack application consisting
1. Rust based Calculator
2. AI powered GLSL code generator and renderer.

### Disclaimer

The docker compose creates and runs it, but there is some issue bundling the rust package in docker, so everything works in the final build except the calculator calculation.

Though the calculator works fine in if build directly using `pnpm build`

In the given url -> https://invdo.learncuda.dev  
Nginx is proxing the /api routes to backend, and / routes to seprate frontend build.

## Project Architecture

*   **Backend**: An Elixir/Phoenix API that interfaces with the Gemini API.
*   **Frontend**: A React/TypeScript application built with Vite providing the user interface and a live WebGL shader preview.
*   **Wasm**: A Rust-based WebAssembly module (`wasm-calculator`) used for client-side computations.
*   **Containerization**: The entire application is containerized using Docker and managed with Docker Compose for a consistent and easy-to-manage setup.

## Requirements

*   Docker & Docker Compose
*   A Google Gemini API Key

---

## Running the Application (Recommended)

The easiest way to get the application running is with Docker Compose.

1.  **Set up Environment Variables**

    Create a `.env` file in the `backend/` directory and add your Gemini API key:

    ```sh
    # backend/.env
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

2.  **Build and Run**

    From the project root directory, run:

    ```sh
    docker-compose up --build
    ```

3.  **Access the Application**

    Once the build is complete and the containers are running, you can access the application at [`http://localhost:4000`](http://localhost:4000).

---

## Local Development Setup

For more advanced development, you can run the frontend and backend services separately.

### 1. Build the Wasm Module

The React frontend depends on the Rust-based WebAssembly module. You must build it first.

```sh
cd wasm-calculator
wasm-pack build --target web
```

### 2. Run the Backend Server

The backend is a Phoenix API server.

1.  **Navigate to the backend directory:**
    ```sh
    cd backend
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file in this directory as described in the Docker setup above.

3.  **Install dependencies and start the server:**
    ```sh
    mix deps.get
    mix phx.server
    ```

The backend API will be running on [`http://localhost:4000`](http://localhost:4000).

### 3. Run the Frontend Dev Server

The frontend is a Vite-powered React app.

1.  **Navigate to the frontend directory:**
    ```sh
    cd frontend
    ```

2.  **Install dependencies and start the server:**
    ```sh
    pnpm install
    pnpm run dev
    ```

The frontend will be available at [`http://localhost:5173`](http://localhost:5173) (or another port if 5173 is in use). The development server is configured to proxy API requests to the backend at `localhost:4000`.
