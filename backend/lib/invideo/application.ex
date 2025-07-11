defmodule Invideo.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {Finch, name: Invideo.Finch},
      InvideoWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:invideo, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Invideo.PubSub},
      InvideoWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: Invideo.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    InvideoWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
