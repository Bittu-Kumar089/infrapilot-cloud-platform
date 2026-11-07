
import { useState } from "react";
import {
  Hammer,
  TestTube,
  Container,
  Cloud,
  Rocket,
  CheckCircle2,
  Clock3,
  XCircle,
  Play,
  RefreshCw,
  Code2,
  GitBranch,
  Package,
  Activity,
} from "lucide-react";

const initialStages = [
  { name: "Source", detail: "GitBranch repository", icon: GitBranch },
  { name: "Build", detail: "Jenkins build", icon: Hammer },
  { name: "Test", detail: "Automated testing", icon: TestTube },
  { name: "Docker", detail: "Build container image", icon: Container },
  { name: "Deploy", detail: "Deploy to AWS EC2", icon: Cloud },
];

const initialHistory = [
  {
    id: "#DEP-1042",
    branch: "main",
    commit: "a82f91c",
    environment: "Production",
    status: "Success",
    duration: "2m 34s",
    time: "Today, 10:42 AM",
  },
  {
    id: "#DEP-1041",
    branch: "develop",
    commit: "b72e15a",
    environment: "Staging",
    status: "Success",
    duration: "1m 58s",
    time: "Today, 09:30 AM",
  },
  {
    id: "#DEP-1040",
    branch: "main",
    commit: "c91d42b",
    environment: "Production",
    status: "Failed",
    duration: "0m 45s",
    time: "Yesterday, 06:15 PM",
  },
];

export default function Deployments() {
  const [stages, setStages] = useState(
    initialStages.map((stage) => ({ ...stage, status: "Pending" }))
  );

  const [history, setHistory] = useState(initialHistory);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  const successCount = history.filter(
    (item) => item.status === "Success"
  ).length;

  function runDemoPipeline() {
    if (running) return;

    setRunning(true);
    setMessage("Demo pipeline completed successfully. No actual deployment was performed.");

    setStages((previous) =>
      previous.map((stage) => ({ ...stage, status: "Success" }))
    );

    const newDeployment = {
      id: `#DEP-${1043 + history.length - 3}`,
      branch: "main",
      commit: "d83a71f",
      environment: "Staging",
      status: "Success",
      duration: "2m 18s",
      time: "Just now",
    };

    setHistory((previous) => [newDeployment, ...previous]);
    setRunning(false);
  }

  function resetPipeline() {
    setStages((previous) =>
      previous.map((stage) => ({ ...stage, status: "Pending" }))
    );
    setMessage("Pipeline view has been reset.");
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Rocket size={23} className="text-blue-400" />
            <h1 className="text-2xl font-bold text-white">
              Deployments
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Build, test and deploy your applications through CI/CD.
          </p>
        </div>

        <button
          onClick={runDemoPipeline}
          disabled={running}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          <Play size={16} />
          Run Demo Pipeline
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Total Deployments"
          value={history.length}
          icon={Rocket}
          color="text-blue-400"
        />
        <Metric
          title="Successful"
          value={successCount}
          icon={CheckCircle2}
          color="text-emerald-400"
        />
        <Metric
          title="Failed"
          value={history.filter((d) => d.status === "Failed").length}
          icon={XCircle}
          color="text-red-400"
        />
        <Metric
          title="Pipeline Status"
          value="Ready"
          icon={Activity}
          color="text-emerald-400"
        />
      </div>

      {/* Pipeline visualization */}
      <section className="rounded-xl border border-slate-800 bg-[#101a2b] p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">
              CI/CD Pipeline
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              GitHub to AWS deployment workflow
            </p>
          </div>

          <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs text-blue-400">
            Demo Environment
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {stages.map((stage, index) => {
            const Icon = stage.icon;

            return (
              <div key={stage.name} className="relative">
                <div className="flex h-full flex-col items-center rounded-xl border border-slate-700 bg-[#0b1423] p-5 text-center">
                  <div className="mb-3 rounded-xl bg-blue-500/10 p-3">
                    <Icon size={25} className="text-blue-400" />
                  </div>

                  <p className="font-semibold text-white">
                    {stage.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {stage.detail}
                  </p>

                  <div className="mt-4 flex items-center gap-1.5 text-xs">
                    {stage.status === "Success" ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-emerald-400">Success</span>
                      </>
                    ) : (
                      <>
                        <Clock3 size={14} className="text-slate-500" />
                        <span className="text-slate-400">Pending</span>
                      </>
                    )}
                  </div>
                </div>

                {index !== stages.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-3 z-10 text-blue-400">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={resetPipeline}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            Reset Pipeline
          </button>

          <span className="self-center text-xs text-slate-500">
            All stages are simulated using frontend demo data.
          </span>
        </div>
      </section>

      {/* Repository information */}
      <section className="rounded-xl border border-slate-800 bg-[#101a2b] p-5">
        <h2 className="mb-4 font-semibold text-white">
          Repository Information
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Info icon={Code2} label="Repository" value="infrapilot-cloud-platform" />
          <Info icon={GitBranch} label="Branch" value="main" />
          <Info icon={Package} label="Container Registry" value="Local Docker Registry (Demo)" />
        </div>
      </section>

      {/* Deployment history */}
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#101a2b]">
        <div className="border-b border-slate-800 p-5">
          <h2 className="font-semibold text-white">
            Deployment History
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Recent application deployment activity
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-[#0b1423] text-xs text-slate-500">
              <tr>
                <th className="px-5 py-4">Deployment ID</th>
                <th className="px-4 py-4">Branch</th>
                <th className="px-4 py-4">Commit</th>
                <th className="px-4 py-4">Environment</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Duration</th>
                <th className="px-5 py-4">Time</th>
              </tr>
            </thead>

            <tbody>
              {history.map((deployment) => (
                <tr key={deployment.id} className="border-t border-slate-800">
                  <td className="px-5 py-4 font-medium text-blue-400">
                    {deployment.id}
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {deployment.branch}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-slate-400">
                    {deployment.commit}
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {deployment.environment}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs ${
                      deployment.status === "Success"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {deployment.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {deployment.duration}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {deployment.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {message && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-300">
          {message}
        </div>
      )}

    </div>
  );
}

function Metric({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{title}</span>
        <Icon size={20} className={color} />
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b1423] p-4">
      <Icon size={20} className="mb-3 text-blue-400" />
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-white">
        {value}
      </p>
    </div>
  );
}
