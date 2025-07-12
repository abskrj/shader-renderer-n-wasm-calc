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
    You are an expert in GLSL ES 3.00 fragment shaders for WebGL2. Your task is to write a fragment shader that will work in a WebGL2 context.

    CRITICAL REQUIREMENTS - Follow these exactly:

    1. VERSION DIRECTIVE:
       - MUST start with: #version 300 es
       - This must be the very first line, no comments or whitespace before it

    2. PRECISION QUALIFIER:
       - MUST include: precision highp float;
       - Place this after the version directive

    3. INPUT/OUTPUT VARIABLES:
       - Use "in vec2 v_texCoord;" for texture coordinates from vertex shader
       - Use "out vec4 fragColor;" for fragment output
       - DO NOT use gl_FragColor (deprecated in GLSL ES 3.00)

    4. UNIFORM VARIABLES (choose appropriate ones):
       - For screen resolution: uniform vec2 iResolution; OR uniform vec2 u_resolution;
       - For animation time: uniform float iTime; OR uniform float u_time;
       - For mouse position: uniform vec2 iMouse; OR uniform vec2 u_mouse;

    5. MAIN FUNCTION STRUCTURE:
       void main() {
           vec2 uv = v_texCoord;
           // OR calculate UV from gl_FragCoord: vec2 uv = gl_FragCoord.xy / iResolution.xy;

           // Your shader logic here

           fragColor = vec4(color, 1.0);
       }

    6. COMPATIBILITY NOTES:
       - Avoid deprecated functions like texture2D() - use texture() instead
       - Use modern GLSL ES 3.00 syntax throughout
       - Ensure all variables are properly declared
       - Use appropriate precision qualifiers

    7. OUTPUT FORMAT:
       - Output ONLY the raw GLSL code
       - No markdown formatting, no explanations, no extra text
       - No code blocks or backticks
       - Start directly with #version 300 es

    Example structure:
    #version 300 es
    precision highp float;

    uniform vec2 iResolution;
    uniform float iTime;
    in vec2 v_texCoord;
    out vec4 fragColor;

    void main() {
        vec2 uv = v_texCoord;
        // shader logic
        fragColor = vec4(color, 1.0);
    }
    """

    final_system_prompt = system_prompt || default_system_prompt

    # Enhance the user prompt with compatibility context
    enhanced_prompt = """
    Create a WebGL2 compatible fragment shader for: #{prompt}

    Requirements:
    - Use GLSL ES 3.00 syntax
    - Include proper version directive and precision
    - Use modern uniform naming (iResolution, iTime preferred)
    - Output to fragColor variable
    - Ensure the shader compiles and runs in WebGL2
    """

    body = %{
      "system_instruction" => %{
        "parts" => [%{"text" => final_system_prompt}]
      },
      "contents" => [
        %{
          "parts" => [
            %{
              "text" => enhanced_prompt
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

    case Finch.build(:post, url, headers, json_body)
         |> Finch.request(Invideo.Finch, receive_timeout: 60_000) do
      {:ok, %Response{status: 200, body: body}} ->
        {:ok, Jason.decode!(body)}

      {:ok, %Response{status: status, body: body}} ->
        {:error, "Gemini API returned status #{status}: #{body}"}

      {:error, reason} ->
        {:error, "Failed to call Gemini API: #{inspect(reason)}"}
    end
  end
end
