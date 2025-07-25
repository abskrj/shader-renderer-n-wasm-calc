# General application configuration
import Config

config :invideo,
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :invideo, InvideoWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: InvideoWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Invideo.PubSub,
  live_view: [signing_salt: "+aMcuHDe"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
