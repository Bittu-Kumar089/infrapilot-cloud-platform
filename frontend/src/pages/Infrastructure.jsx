
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Server,
  Play,
  Square,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  RotateCw,
} from "lucide-react";

const API = "http://127.0.0.1:5000/api";

export default function Infrastructure() {
  const [services, setServices] = useState([]);
  const [dockerConnected, setDockerConnected] = useState(false);
  const [dockerVersion, setDockerVersion] = useState("-");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadInfrastructure() {
    setRefreshing(true);
    setError("");

    try {
      const [healthResponse, servicesResponse] = await Promise.all([
        fetch(`${API}/docker-health`),
        fetch(`${API}/services`),
      ]);

      if (!healthResponse.ok || !servicesResponse.ok) {
        throw new Error("Backend API request failed");
      }

      const health = await healthResponse.json();
      const data = await servicesResponse.json();

      setDockerConnected(health.connected === true);
      setDockerVersion(health.version || "-");
      setServices(data.services || []);
    } catch (err) {
      setError(err.message || "Unable to connect to backend");
      setDockerConnected(false);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadInfrastructure();

    const interval = setInterval(loadInfrastructure, 10000);

    return () => clearInterval(interval);
  }, []);

  async function performAction(name, action) {
    setLoading(name);
    setMessage("");
    setError("");

    try {
      const endpoint =
        action === "stop"
          ? `${API}/services/${encodeURIComponent(name)}/stop`
          : `${API}/services/${encodeURIComponent(name)}/recover`;

      const response = await fetch(endpoint, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Action failed");
      }

      setMessage(
        action === "stop"
          ? `${name} stopped successfully`
          : `${name} recovered successfully`
      );

      await loadInfrastructure();
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setLoading("");
    }
  }

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const status = service.running ? "Running" : "Stopped";
      const matchesStatus =
        statusFilter === "All" || statusFilter === status;

      return matchesSearch && matchesStatus;
    });
  }, [services, search, statusFilter]);

  const running = services.filter((s) => s.running).length;
  const stopped = services.length - running;

  return (
    <div className="space-y-6">

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Server size={23} className="text-blue-400" />
            <h1 className="text-2xl font-bold text-white">
              Infrastructure
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Live Docker container management and infrastructure status.
          </p>
        </div>

        <button
          onClick={loadInfrastructure}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#101a2b] px-4 py-2.5 text-sm text-white hover:border-blue-500 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh Data
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#101a2b] p-5">
        <div className="flex items-center gap-3">
          <Cloud className="text-blue-400" size={26} />
          <div>
            <h3 className="font-semibold text-white">Docker Engine</h3>
            <p className="text-xs text-slate-400">
              Docker Version: {dockerVersion}
            </p>
          </div>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs ${
          dockerConnected
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400"
        }`}>
          {dockerConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Containers"
          value={services.length}
          icon={Server}
          color="text-blue-400"
        />

        <SummaryCard
          title="Running"
          value={running}
          icon={CheckCircle2}
          color="text-emerald-400"
        />

        <SummaryCard
          title="Stopped"
          value={stopped}
          icon={AlertTriangle}
          color="text-red-400"
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-4">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={17} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">
            Search & Filters
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#080d18] px-3">
            <Search size={17} className="text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search container..."
              className="w-full bg-transparent py-3 text-sm text-white outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-[#080d18] px-3 py-3 text-sm text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Running">Running</option>
            <option value="Stopped">Stopped</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#101a2b]">
        <div className="border-b border-slate-800 p-5">
          <h3 className="font-semibold text-white">
            Docker Containers
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Showing {filteredServices.length} of {services.length} containers
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-[#0c1524] text-xs text-slate-500">
              <tr>
                <th className="px-5 py-4">Container Name</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Health</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.map((service) => (
                <tr
                  key={service.name}
                  className="border-b border-slate-800/70"
                >
                  <td className="px-5 py-4 font-medium text-white">
                    {service.name}
                  </td>

                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs ${
                      service.running
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {service.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {service.healthy ? "Healthy" : "Unhealthy"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {service.running ? (
                        <button
                          disabled={loading === service.name}
                          onClick={() =>
                            performAction(service.name, "stop")
                          }
                          className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <Square size={13} />
                          Stop
                        </button>
                      ) : (
                        <button
                          disabled={loading === service.name}
                          onClick={() =>
                            performAction(service.name, "recover")
                          }
                          className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <Play size={13} />
                          Start
                        </button>
                      )}

                      <button
                        disabled={loading === service.name}
                        onClick={() =>
                          performAction(service.name, "recover")
                        }
                        className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/20 disabled:opacity-50"
                      >
                        <RotateCw size={13} />
                        Restart
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredServices.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center text-slate-500"
                  >
                    No containers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <Icon size={20} className={color} />
      </div>
      <h2 className="mt-4 text-3xl font-bold text-white">{value}</h2>
    </div>
  );
}
