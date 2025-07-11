defmodule InvideoWeb.HealthController do
  use InvideoWeb, :controller

  def check(conn, _params) do
    json(conn, %{status: "ok", message: "Service is healthy"})
  end
end
