
import { useState } from "react";
import {
  Play,
  RefreshCw,
  Server,
  CheckCircle2,
  XCircle,
  Terminal,
  Clock,
  Layers,
  Loader2,
  Activity
} from "lucide-react";

const API = "http://127.0.0.1:5000/api";

export default function Automation() {
  const [loading, setLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [healthError, setHealthError] = useState("");
  const [restartLoading, setRestartLoading] = useState(false);
  const [restartResult, setRestartResult] = useState(null);
  const [restartError, setRestartError] = useState("");

  const runDeployment = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API}/automation/deploy-nginx`, {
        method: "POST"
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Deployment failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    setHealthLoading(true);
    setHealthError("");
    setHealth(null);

    try {
      const response = await fetch(`${API}/automation/health-check`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Health check failed");
      }

      setHealth(data);
    } catch (err) {
      setHealthError(err.message);
    } finally {
      setHealthLoading(false);
    }
  };

    const restartServices = async () => {
    setRestartLoading(true);
    setRestartError("");
    setRestartResult(null);

    try {
      const response = await fetch(`${API}/automation/restart-services`, {
        method: "POST"
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Restart failed");
      }

      setRestartResult(data);
    } catch (err) {
      setRestartError(err.message);
    } finally {
      setRestartLoading(false);
    }
  };

  const getStatus = (name) => {
    const match = health?.output?.match(
      new RegExp(`${name} Status:\\s*(running|exited|restarting|created|paused)`, "i")
    );
    return match?.[1] || "unknown";
  };

  const StatusCard = ({ name }) => {
    const status = getStatus(name);
    const running = status.toLowerCase() === "running";

    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{name}</p>
            <h3 className="mt-2 text-xl font-semibold capitalize">
              {health ? status : "Not checked"}
            </h3>
          </div>
          {health && (
            running
              ? <CheckCircle2 className="text-green-400" size={25} />
              : <XCircle className="text-red-400" size={25} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold">Automation</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage infrastructure using Ansible playbooks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-[#111827] p-5">
          <Server className="mb-3 text-blue-400" size={24} />
          <p className="text-sm text-gray-400">Automation Tool</p>
          <h2 className="mt-1 text-xl font-semibold">Ansible</h2>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#111827] p-5">
          <Layers className="mb-3 text-purple-400" size={24} />
          <p className="text-sm text-gray-400">Available Playbooks</p>
          <h2 className="mt-1 text-xl font-semibold">2</h2>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#111827] p-5">
          <Clock className="mb-3 text-green-400" size={24} />
          <p className="text-sm text-gray-400">Execution Status</p>
          <h2 className="mt-1 text-xl font-semibold">
            {loading || healthLoading
              ? "Running"
              : error || healthError
                ? "Failed"
                : result || health
                  ? "Successful"
                  : "Ready"}
          </h2>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-[#111827] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Infrastructure Health Check</h2>
            <p className="mt-2 text-sm text-gray-400">
              Check Nginx and Nagios Docker container status using Ansible.
            </p>
          </div>

          <button
            onClick={checkHealth}
            disabled={healthLoading}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {healthLoading
              ? <Loader2 className="animate-spin" size={18} />
              : <Activity size={18} />}
            {healthLoading ? "Checking..." : "Check Infrastructure Health"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatusCard name="Nginx" />
          <StatusCard name="Nagios" />
        </div>

        {healthError && (
          <p className="mt-4 text-sm text-red-400">{healthError}</p>
        )}
      </div>

      <div className="rounded-xl border border-gray-800 bg-[#111827] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Automated Nginx Deployment</h2>
            <p className="mt-2 text-sm text-gray-400">
              Execute the Ansible playbook to verify and start the Nginx Docker container.
            </p>
          </div>

          <button
            onClick={runDeployment}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? <Loader2 className="animate-spin" size={18} />
              : <Play size={18} />}
            {loading ? "Executing..." : "Deploy Nginx"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-gray-900 p-4">
            <p className="text-xs text-gray-500">Playbook</p>
            <p className="mt-1 text-sm font-medium">deploy-nginx.yml</p>
          </div>
          <div className="rounded-lg bg-gray-900 p-4">
            <p className="text-xs text-gray-500">Target</p>
            <p className="mt-1 text-sm font-medium">Local Docker</p>
          </div>
          <div className="rounded-lg bg-gray-900 p-4">
            <p className="text-xs text-gray-500">Service</p>
            <p className="mt-1 text-sm font-medium">infrapilot-nginx</p>
          </div>
        </div>
              {/* Automated Service Restart */}
      <div className="rounded-xl border border-gray-800 bg-[#111827] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Automated Service Restart
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Restart Nginx and Nagios Docker containers using Ansible.
            </p>
          </div>

          <button
            onClick={restartServices}
            disabled={restartLoading}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {restartLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <RefreshCw size={18} />
            )}
            {restartLoading ? "Restarting..." : "Restart Services"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-gray-900 p-4">
            <p className="text-xs text-gray-500">Container 1</p>
            <p className="mt-1 font-medium">infrapilot-nginx</p>
          </div>

          <div className="rounded-lg bg-gray-900 p-4">
            <p className="text-xs text-gray-500">Container 2</p>
            <p className="mt-1 font-medium">infrapilot-nagios</p>
          </div>
        </div>

        {restartResult && (
          <div className="mt-5 rounded-lg border border-green-800 bg-gray-900 p-4">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={20} />
              <h3 className="font-semibold">Restart Successful</h3>
            </div>

            <p className="mt-2 text-sm text-gray-300">
              {restartResult.message}
            </p>

            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black p-4 text-xs leading-6 text-green-300">
              {restartResult.output}
            </pre>
          </div>
        )}

        {restartError && (
          <div className="mt-5 rounded-lg border border-red-800 bg-gray-900 p-4">
            <div className="flex items-center gap-2 text-red-400">
              <XCircle size={20} />
              <h3 className="font-semibold">Restart Failed</h3>
            </div>

            <p className="mt-2 text-sm text-gray-300">
              {restartError}
            </p>
          </div>
        )}
      </div>
      </div>

      {result && (
        <div className="rounded-xl border border-green-800 bg-[#111827] p-5">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 size={21} />
            <h2 className="font-semibold">Deployment Successful</h2>
          </div>
          <p className="mt-2 text-sm text-gray-300">{result.message}</p>
          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black p-4 text-xs leading-6 text-green-300">
            {result.output}
          </pre>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-800 bg-[#111827] p-5">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle size={21} />
            <h2 className="font-semibold">Deployment Failed</h2>
          </div>
          <p className="mt-2 text-sm text-gray-300">{error}</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-800 bg-[#111827] p-5">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="text-blue-400" />
          <h2 className="font-semibold">Automation Workflow</h2>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            "Connect to Docker",
            "Check Container",
            "Execute Playbook",
            "Verify Service"
          ].map((step, index) => (
            <div key={step} className="rounded-lg bg-gray-900 p-4">
              <span className="text-xs text-blue-400">STEP 0{index + 1}</span>
              <p className="mt-2 text-sm font-medium">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
