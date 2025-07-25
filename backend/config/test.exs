import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :invideo, InvideoWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "qnwIkjbd4OtGepB+ir5hbA4MvBnd2bjsMZG0pBBdiTZI3bSkAtAxa0jECE6p9wkB",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
