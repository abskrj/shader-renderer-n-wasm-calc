defmodule InvideoWeb.Router do
  use InvideoWeb, :router

  pipeline :api do
    plug(:accepts, ["json"])
  end

  scope "/api", InvideoWeb do
    pipe_through(:api)

    get("/health", HealthController, :check)
    post("/generate/shader", ShaderController, :create)
  end
end
