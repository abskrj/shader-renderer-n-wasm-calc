defmodule Invideo.Generator do
  alias Finch.Response

  @base_url "https://generativelanguage.googleapis.com"

  @doc """
  Generates a shader from a prompt using the Gemini API.
  """
  def generate_shader(prompt, system_prompt \\ nil) do
    api_key = System.get_env("GEMINI_API_KEY")

    if is_nil(api_key) or api_key == "" do
      {:error, "GEMINI_API_KEY environment variable is not set"}
    else
      with {:ok, body} <- build_body(prompt, system_prompt),
           {:ok, response} <- send_request(body, api_key) do
        extract_shader_code(response)
      end
    end
  end

  defp extract_shader_code(response) do
    case response do
      %{"candidates" => [%{"content" => %{"parts" => [%{"text" => shader_code} | _]}} | _]} ->
        {:ok, shader_code}

      %{"candidates" => []} ->
        {:error, "No candidates returned from Gemini API"}

      %{"candidates" => [%{"content" => %{"parts" => []}} | _]} ->
        {:error, "No content parts returned from Gemini API"}

      _ ->
        {:error, "Unexpected response structure from Gemini API"}
    end
  end

  defp build_body(prompt, system_prompt) do
    default_system_prompt = """
    You are an expert in GLSL. Your task is to write a fragment shader.
    Only output the raw GLSL code. Do not include any explanations, markdown, or any text other than the code itself.
    """

    final_system_prompt = system_prompt || default_system_prompt

    body = %{
      "system_instruction" => %{
        "parts" => [%{"text" => final_system_prompt}]
      },
      "contents" => [
        %{
          "parts" => [
            %{
              "text" => prompt
            }
          ]
        }
      ]
    }

    {:ok, Jason.encode!(body)}
  end

  defp send_request(json_body, api_key) do
    headers = [
      {"Content-Type", "application/json"},
      {"x-goog-api-key", api_key}
    ]

    model = "gemini-2.5-pro"
    url = "#{@base_url}/v1beta/models/#{model}:generateContent"

    case Finch.build(:post, url, headers, json_body) |> Finch.request(Invideo.Finch) do
      {:ok, %Response{status: 200, body: body}} ->
        {:ok, Jason.decode!(body)}

      {:ok, %Response{status: status, body: body}} ->
        {:error, "Gemini API returned status #{status}: #{body}"}

      {:error, reason} ->
        {:error, "Failed to call Gemini API: #{inspect(reason)}"}
    end
  end
end
