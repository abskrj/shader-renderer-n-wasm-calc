defmodule InvideoWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :invideo

  plug(Plug.Static,
    at: "/",
    from: :invideo,
    gzip: true,
    only: InvideoWeb.static_paths(),
    cache_control_for_etags: "public, max-age=604800"
  )

  plug(:serve_spa_index)

  if code_reloading? do
    plug(Phoenix.CodeReloader)
  end

  plug(Plug.RequestId)
  plug(Plug.Telemetry, event_prefix: [:phoenix, :endpoint])

  plug(Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()
  )

  plug(Plug.MethodOverride)
  plug(Plug.Head)
  plug(InvideoWeb.Router)

  @file_path_regex ~r{\.[^/]+$}
  defp serve_spa_index(conn, _opts) do
    is_file_path = conn.request_path =~ @file_path_regex

    # If the request is not for the API and doesn't look like a file, serve index.html.
    if !String.starts_with?(conn.request_path, "/api/") and !is_file_path do
      index_path = Path.join([:code.priv_dir(:invideo), "static", "index.html"])

      conn
      |> put_resp_content_type("text/html")
      |> send_file(200, index_path)
      |> halt()
    else
      conn
    end
  end
end
