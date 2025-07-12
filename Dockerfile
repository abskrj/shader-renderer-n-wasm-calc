# Stage 1: Build the Rust Wasm module
FROM rust:1.88 AS wasm-builder

RUN rustup target add wasm32-unknown-unknown

# Install wasm-pack for building web-compatible wasm
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

WORKDIR /app

COPY wasm-calculator/Cargo.toml wasm-calculator/Cargo.lock ./
# Copy the actual source and build the wasm package
COPY wasm-calculator/src ./src
RUN wasm-pack build --target web --out-dir pkg
# The output will be in /app/pkg

# Stage 2: Build the Frontend
FROM node:22-alpine AS frontend-builder

# Install pnpm for package management
RUN npm install -g pnpm

WORKDIR /app

# Copy wasm package from previous stage into a structure that mirrors local dev
COPY --from=wasm-builder /app/pkg ./wasm-calculator/pkg

# Copy the entire frontend source code first
COPY frontend/ ./frontend/
WORKDIR /app/frontend

# Explicitly install the local wasm-calculator package.
# This command uses the correct Linux path inside the container, overriding
# any Windows-style path from your source package.json. This is the key
# to making the Docker build work correctly regardless of the host OS.
RUN pnpm add file:../wasm-calculator/pkg

# Now, install all other dependencies.
RUN pnpm install

# Build the frontend with the correct dependencies in place
RUN pnpm build

# ---

# Stage 3: Build the Elixir/Phoenix Backend Release
FROM hexpm/elixir:1.18.4-erlang-28.0.1-alpine-3.21.3 AS backend-builder

# Install build tools and ca-certificates
RUN apk add --no-cache build-base git ca-certificates

WORKDIR /app

# Install Hex and Rebar
RUN mix local.hex --force && mix local.rebar --force

# Set ENV for production
ENV MIX_ENV=prod

# Copy backend dependency files
COPY backend/mix.exs backend/mix.lock ./

# Fetch and compile dependencies
RUN mix deps.get --only prod
RUN mix deps.compile

# Copy the rest of the backend application source
COPY backend/config ./config
COPY backend/lib ./lib
COPY backend/priv ./priv

# Copy the built frontend assets into the static directory
COPY --from=frontend-builder /app/frontend/dist/ ./priv/static/

# Create the release
RUN mix release

# ---

# Stage 4: Final Production Image
FROM alpine:3.21 AS app-runner

# Install runtime dependencies for Elixir/Erlang and ca-certificates for SSL
RUN apk add --no-cache libstdc++ openssl ncurses-libs ca-certificates

WORKDIR /app

# Copy the compiled release from the builder stage
COPY --from=backend-builder /app/_build/prod/rel/invideo .

# Set runtime ENV variables.
# The GEMINI_API_KEY must be provided at runtime.
ENV PHX_HOST=0.0.0.0
ENV PORT=4000
ENV HOME=/app

# Expose the port the application will run on
EXPOSE 4000

# The command to start the server. No migrations needed (--no-ecto was used).
CMD ["bin/invideo", "start"] 