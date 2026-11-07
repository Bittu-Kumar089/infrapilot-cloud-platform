
import React, { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  Server,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Activity,
  Clock,
  RotateCcw,
  Terminal,
  Container,
} from "lucide-react";

const API = "/api";

const SelfHealing = () => {
  const [services, setServices] = useState([]);
  const [recovering, setRecovering] = useState([]);
  const [logs, setLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("infrapilot-recovery-logs") || "[]");
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dockerConnected, setDockerConnected] = useState(false);

  // Save dashboard activity history in browser
  useEffect(() => {
    localStorage.setItem(
      "infrapilot-recovery-logs",
      JSON.stringify(logs.slice(0, 50))
    );
  }, [logs]);

  // Activity logger
  const addLog = (message, type = "info") => {
    setLogs((prev) => [
      {
        id: Date.now() + Math.random(),
        message,
        type,
        time: new Date().toLocaleString(),
      },
      ...prev,
    ].slice(0, 50));
  };

  // API request helper
  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, options);
    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid backend response. Check API server.");
    }

    if (!response.ok || data.success === false) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  };

  // Check Docker connection
  const checkDocker = useCallback(async () => {
    try {
      const data = await apiRequest(`${API}/docker-health`);
      setDockerConnected(Boolean(data.connected));
    } catch {
      setDockerConnected(false);
    }
  }, []);

  // Fetch actual Docker services
  const fetchServices = useCallback(async () => {
    try {
      const data = await apiRequest(`${API}/services`);

      const mapped = (data.services || []).map((item) => ({
        id: item.name,
        name: item.name === "infrapilot-nginx" ? "Nginx Server" : item.name,
        container: item.name,
        status: item.running ? "Healthy" : "Failed",
        uptime: item.running ? "Running" : "Stopped",
      }));

      setServices(mapped);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and automatic refresh
  useEffect(() => {
    fetchServices();
    checkDocker();

    const interval = setInterval(() => {
      fetchServices();
      checkDocker();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchServices, checkDocker]);

  // Simulate a real container failure by stopping it
  const simulateFailure = async () => {
    if (busy || services.length === 0) return;

    const target = services.find(
      (service) => service.status === "Healthy"
    );

    if (!target) {
      addLog("No running container available for failure simulation.", "warning");
      return;
    }

    const confirmed = window.confirm(
      `Stop ${target.container} to simulate a real failure?`
    );

    if (!confirmed) return;

    setBusy(true);
    addLog(`Failure simulation started: ${target.container}`, "warning");

    try {
      const data = await apiRequest(
        `${API}/services/${encodeURIComponent(target.container)}/stop`,
        { method: "POST" }
      );

      addLog(data.message || "Container stopped for failure simulation.", "error");
      await fetchServices();
    } catch (err) {
      addLog(`Failure simulation failed: ${err.message}`, "error");
    } finally {
      setBusy(false);
    }
  };

  // Real manual recovery using separate backend endpoint
  const recoverService = async (service) => {
    if (recovering.includes(service.id)) return;

    setRecovering((prev) => [...prev, service.id]);

    addLog(`Manual recovery requested for ${service.container}`, "warning");

    try {
      const data = await apiRequest(
        `${API}/services/${encodeURIComponent(service.container)}/manual-recover`,
        { method: "POST" }
      );

      addLog(data.message || "Manual recovery completed.", "success");

      await fetchServices();
    } catch (err) {
      addLog(`Recovery failed: ${err.message}`, "error");
    } finally {
      setRecovering((prev) =>
        prev.filter((id) => id !== service.id)
      );
    }
  };

  // Manual dashboard refresh
  const refreshDashboard = async () => {
    setLoading(true);

    await Promise.all([
      fetchServices(),
      checkDocker(),
    ]);
  };

  const healthyCount = services.filter(
    (service) => service.status === "Healthy"
  ).length;

  const failedCount = services.filter(
    (service) => service.status === "Failed"
  ).length;

  const recoveringCount = recovering.length;

  const stats = [
    {
      title: "Total Services",
      value: services.length,
      icon: Server,
      color: "text-blue-400",
    },
    {
      title: "Healthy Services",
      value: healthyCount,
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      title: "Failed Services",
      value: failedCount,
      icon: AlertTriangle,
      color: "text-red-400",
    },
    {
      title: "Recovering",
      value: recoveringCount,
      icon: RefreshCw,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="space-y-7">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Self-Healing Management
          </h1>
          <p className="mt-2 text-slate-400">
            Real Docker container monitoring and recovery.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={simulateFailure}
            disabled={
              busy ||
              loading ||
              failedCount > 0 ||
              !dockerConnected ||
              healthyCount === 0
            }
            className="flex items-center gap-2 rounded-lg border border-yellow-700 bg-yellow-500/10 px-4 py-3 text-yellow-400 hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AlertTriangle size={18} />
            {busy ? "Stopping..." : "Simulate Failure"}
          </button>

          <button
            onClick={refreshDashboard}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-40"
            title="Refresh dashboard"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Docker Connection */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-900 bg-blue-950/30 p-5">
        <div className="flex items-center gap-3">
          <ShieldCheck size={28} className="text-blue-400" />
          <div>
            <h3 className="font-semibold text-white">
              Automated Recovery System
            </h3>
            <p className="text-sm text-slate-400">
              Connected to Docker through Node.js API
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm ${
            dockerConnected
              ? "bg-blue-900/50 text-blue-400"
              : "bg-red-900/40 text-red-400"
          }`}
        >
          {dockerConnected ? "Docker Connected" : "Docker Disconnected"}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/30 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-slate-800 bg-[#101a2b] p-5"
            >
              <div className="flex justify-between">
                <p className="text-sm text-slate-400">{item.title}</p>
                <Icon className={item.color} size={22} />
              </div>

              <h2 className="mt-4 text-3xl font-bold text-white">
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Service Health */}
      <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-5">
        <h2 className="mb-2 text-lg font-semibold text-white">
          Service Health & Recovery
        </h2>

        <p className="mb-5 text-sm text-slate-400">
          Actual Docker container status. Refreshes every 5 seconds.
        </p>

        {loading ? (
          <p className="text-slate-400">Loading Docker services...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="pb-4">Service</th>
                  <th className="pb-4">Container</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Uptime</th>
                  <th className="pb-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {services.map((service) => {
                  const isRecovering = recovering.includes(service.id);

                  return (
                    <tr
                      key={service.id}
                      className="border-b border-slate-800/70"
                    >
                      <td className="py-5 font-medium text-white">
                        {service.name}
                      </td>

                      <td className="py-5 text-slate-400">
                        {service.container}
                      </td>

                      <td className="py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            isRecovering
                              ? "bg-yellow-500/10 text-yellow-400"
                              : service.status === "Healthy"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {isRecovering
                            ? "Recovering"
                            : service.status}
                        </span>
                      </td>

                      <td className="py-5 text-slate-400">
                        {service.uptime}
                      </td>

                      <td className="py-5">
                        <button
                          onClick={() => recoverService(service)}
                          disabled={isRecovering || !dockerConnected}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <RotateCcw
                            size={15}
                            className={isRecovering ? "animate-spin" : ""}
                          />
                          {isRecovering
                            ? "Recovering..."
                            : service.status === "Healthy"
                            ? "Restart"
                            : "Recover"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {services.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-8 text-center text-slate-400"
                    >
                      No services available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Workflow */}
      <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-6">
        <h2 className="mb-5 text-lg font-semibold text-white">
          Self-Healing Workflow
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            ["Detection", "Detect container failure", Activity],
            ["Diagnosis", "Identify failed container", AlertTriangle],
            ["Recovery", "Restart Docker container", Container],
            ["Verification", "Verify actual status", CheckCircle2],
          ].map(([title, desc, Icon], index) => (
            <div
              key={title}
              className="rounded-xl border border-slate-700 bg-[#0b1423] p-5 text-center"
            >
              <Icon
                size={25}
                className="mx-auto mb-3 text-blue-400"
              />
              <h3 className="font-semibold text-white">
                {index + 1}. {title}
              </h3>
              <p className="mt-2 text-xs text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery Activity Logs */}
      <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Terminal size={21} className="text-blue-400" />
            <h2 className="font-semibold text-white">
              Recovery Activity Logs
            </h2>
          </div>

          <button
            onClick={() => setLogs([])}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear Logs
          </button>
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#0b1423] p-4"
            >
              <div className="flex items-center gap-3">
                <Activity
                  size={18}
                  className={
                    log.type === "success"
                      ? "text-emerald-400"
                      : log.type === "error"
                      ? "text-red-400"
                      : log.type === "warning"
                      ? "text-yellow-400"
                      : "text-blue-400"
                  }
                />
                <p className="text-sm text-slate-300">
                  {log.message}
                </p>
              </div>

              <span className="flex items-center gap-2 text-xs text-slate-500">
                <Clock size={13} />
                {log.time}
              </span>
            </div>
          ))}

          {logs.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">
              No recovery activity yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfHealing;
