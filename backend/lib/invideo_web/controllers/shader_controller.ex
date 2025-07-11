defmodule InvideoWeb.ShaderController do
  use InvideoWeb, :controller

  alias Invideo.Generator

  def create(conn, params) do
    case params do
      %{"prompt" => prompt} ->
        # This will be nil if not present
        system_prompt = params["system_prompt"]

        case Generator.generate_shader(prompt, system_prompt) do
          {:ok, shader_code} ->
            conn
            |> put_status(:created)
            |> json(%{
              success: true,
              data: %{
                code: shader_code
              }
            })

          {:error, reason} ->
            conn
            |> put_status(:internal_server_error)
            |> json(%{
              success: false,
              error: %{
                message: reason
              }
            })
        end

      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          success: false,
          error: %{
            message: "Missing 'prompt' in request body."
          }
        })
    end
  end
end
