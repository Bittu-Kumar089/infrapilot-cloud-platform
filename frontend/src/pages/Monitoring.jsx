
import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MemoryStick,
  Cloud,
} from "lucide-react";

const API = "/api";

const Monitoring = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch real Docker metrics
  const refreshMetrics = useCallback(async () => {
    setRefreshing(true);

    try {
      const response = await fetch(`${API}/metrics`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch metrics");
      }

      const container = data.metrics?.[0];

      if (!container || !container.available) {
        throw new Error("Docker container metrics unavailable");
      }

      setMetrics(container);
      setLastUpdated(new Date(data.timestamp));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Automatic refresh every 5 seconds
  useEffect(() => {
    refreshMetrics();

    const interval = setInterval(refreshMetrics, 5000);

    return () => clearInterval(interval);
  }, [refreshMetrics]);

  // Reusable Metric Card
  const MetricCard = ({ title, value, unit, icon: Icon, color }) => {
    const isNumeric =
      typeof value === "number" && Number.isFinite(value);

    const numericValue = isNumeric
      ? Math.min(100, Math.max(0, value))
      : 0;

    return (
      <div className="min-w-0 rounded-xl border border-slate-800 bg-[#101a2b] p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-slate-400">{title}</p>

          <div className={`shrink-0 rounded-lg bg-slate-800 p-3 ${color}`}>
            <Icon size={22} />
          </div>
        </div>

        <div className="mt-5 flex min-h-[64px] min-w-0 flex-wrap items-end gap-2">
          <h2
            className={`min-w-0 max-w-full font-bold text-white ${
              isNumeric
                ? "text-3xl"
                : "break-words text-xl leading-tight"
            }`}
          >
            {isNumeric
              ? `${numericValue.toFixed(2)}%`
              : value}
          </h2>

          <span className="mb-1 text-sm text-slate-400">
            {unit}
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          {isNumeric && (
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${numericValue}%` }}
            />
          )}
        </div>
      </div>
    );
  };

  const healthy = metrics?.status === "running";

  return (
    <div className="space-y-7">

      {/* Page Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Infrastructure Monitoring
          </h1>

          <p className="mt-2 text-slate-400">
            Live resource metrics from Docker Engine.
          </p>
        </div>

        <button
          onClick={refreshMetrics}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh Metrics
        </button>
      </div>

      {/* Infrastructure Status */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-5 ${
          healthy
            ? "border-emerald-900 bg-emerald-950/30"
            : "border-red-900 bg-red-950/30"
        }`}
      >
        <div className="flex items-center gap-3">
          {healthy ? (
            <CheckCircle2
              className="text-emerald-400"
              size={25}
            />
          ) : (
            <AlertTriangle
              className="text-red-400"
              size={25}
            />
          )}

          <div>
            <h3 className="font-semibold text-white">
              {healthy
                ? "Infrastructure Healthy"
                : error
                ? "Infrastructure Unavailable"
                : "Checking Infrastructure"}
            </h3>

            <p className="text-sm text-slate-400">
              {error ||
                `Container: ${metrics?.container || "Connecting..."}`}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm ${
            healthy
              ? "bg-emerald-900/50 text-emerald-400"
              : "bg-red-900/50 text-red-400"
          }`}
        >
          {healthy ? "Operational" : error ? "Unavailable" : "Checking"}
        </span>
      </div>

      {/* Real Docker Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          title="CPU Utilization"
          value={metrics?.cpu ?? "N/A"}
          unit="Processor"
          icon={Cpu}
          color="text-blue-400"
        />

        <MetricCard
          title="Memory Usage"
          value={metrics?.memory ?? "N/A"}
          unit="RAM"
          icon={MemoryStick}
          color="text-purple-400"
        />

        <MetricCard
          title="Disk I/O"
          value={metrics?.blockIO ?? "N/A"}
          unit="Read / Write"
          icon={HardDrive}
          color="text-orange-400"
        />

        <MetricCard
          title="Network I/O"
          value={metrics?.networkIO ?? "N/A"}
          unit="Received / Sent"
          icon={Activity}
          color="text-emerald-400"
        />

      </div>

      {/* Server Information */}
      <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-6">
        <h2 className="mb-5 text-lg font-semibold text-white">
          Server Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="flex items-center gap-3">
            <Server className="text-blue-400" size={25} />

            <div>
              <p className="text-sm text-slate-400">
                Container Name
              </p>

              <p className="font-medium text-white">
                {metrics?.container || "Loading..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Cloud className="text-purple-400" size={25} />

            <div>
              <p className="text-sm text-slate-400">
                Monitoring Source
              </p>

              <p className="font-medium text-white">
                Docker Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="text-emerald-400" size={25} />

            <div>
              <p className="text-sm text-slate-400">
                Last Updated
              </p>

              <p className="font-medium text-white">
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString()
                  : "Waiting..."}
              </p>
            </div>
          </div>

        </div>

        <div className="mt-6 border-t border-slate-800 pt-5">
          <p className="text-sm text-slate-400">
            Memory Allocation
          </p>

          <p className="mt-1 font-medium text-white">
            {metrics?.memoryUsage || "Waiting for Docker metrics"}
          </p>

          <p className="mt-3 text-sm text-slate-400">
            Active Processes (PIDs): {metrics?.pids ?? "N/A"}
          </p>
        </div>
      </div>

      {/* Monitoring Information */}
      <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Monitoring Information
        </h2>

        <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-[#0b1423] p-4">
          <Activity
            className="mt-1 text-blue-400"
            size={22}
          />

          <div>
            <p className="font-medium text-white">
              Live Docker Monitoring Enabled
            </p>

            <p className="mt-1 text-sm text-slate-400">
              CPU, memory, network I/O and block I/O are retrieved
              directly from Docker Engine. Metrics refresh every
              5 seconds. Disk I/O is not the same as total disk capacity.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Monitoring;
