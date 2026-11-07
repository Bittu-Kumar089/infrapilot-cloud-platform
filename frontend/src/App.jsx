import Infrastructure from "./pages/Infrastructure";
import Deployments from "./pages/Deployments";
import Monitoring from "./pages/Monitoring";
import SelfHealing from "./pages/SelfHealing";
import Automation from "./pages/Automation";
import { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Server,
  Activity,
  Rocket,
  ShieldCheck,
  Cloud,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CircleDot,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Sidebar from "./components/Sidebar";

const performanceData = [
  { time: "09:00", cpu: 32, memory: 45 },
  { time: "10:00", cpu: 45, memory: 52 },
  { time: "11:00", cpu: 38, memory: 49 },
  { time: "12:00", cpu: 62, memory: 61 },
  { time: "13:00", cpu: 48, memory: 55 },
  { time: "14:00", cpu: 72, memory: 68 },
  { time: "15:00", cpu: 55, memory: 60 },
  { time: "16:00", cpu: 42, memory: 53 },
];

const deployments = [
  {
    name: "Frontend Application",
    version: "v2.4.1",
    environment: "Production",
    status: "Successful",
    time: "10 minutes ago",
  },
  {
    name: "Backend API",
    version: "v1.8.0",
    environment: "Production",
    status: "Successful",
    time: "35 minutes ago",
  },
  {
    name: "Payment Service",
    version: "v1.2.3",
    environment: "Staging",
    status: "In Progress",
    time: "1 hour ago",
  },
];

const stats = [
  {
    title: "Total Instances",
    value: "12",
    change: "+2 this week",
    icon: Server,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Active Services",
    value: "24",
    change: "All operational",
    icon: Activity,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Deployments",
    value: "86",
    change: "+12 this month",
    icon: Rocket,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "Recovery Events",
    value: "08",
    change: "Last 30 days",
    icon: ShieldCheck,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
];

function Header({ active }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800 bg-[#080d18]/95 px-5 backdrop-blur md:px-8">
      <div>
        <h2 className="text-lg font-semibold text-white">{active}</h2>
        <p className="text-xs text-slate-500">
          Cloud Operations / {active}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-[#101a2b] px-3 py-2 md:flex">
          <Search size={16} className="text-slate-400" />
          <span className="text-sm text-slate-500">
            Search resources...
          </span>
          <span className="rounded bg-slate-800 px-2 text-xs text-slate-400">
            Ctrl K
          </span>
        </div>

        <button className="relative rounded-lg border border-slate-700 p-2.5 text-slate-400 hover:bg-slate-800">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <button className="flex items-center gap-2 rounded-lg border border-slate-700 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            BK
          </div>
          <span className="hidden text-sm text-white md:block">
            Admin
          </span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-5 transition hover:border-slate-600">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{item.title}</p>
        <div className={`rounded-lg p-2 ${item.bg}`}>
          <Icon size={19} className={item.color} />
        </div>
      </div>

      <h3 className="mt-4 text-3xl font-bold text-white">
        {item.value}
      </h3>

      <p className="mt-2 text-xs text-emerald-400">
        {item.change}
      </p>
    </div>
  );
}

function Overview() {
  return (
    <div className="space-y-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome to InfraPilot
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitor and manage your cloud infrastructure from one place.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">
            System Operational
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} item={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">
                Resource Utilization
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                CPU and memory usage over time
              </p>
            </div>

            <span className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">
              Last 24 hours
            </span>
          </div>

          <div className="mt-6 flex gap-5 text-xs">
            <span className="flex items-center gap-2 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              CPU Usage
            </span>
            <span className="flex items-center gap-2 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              Memory Usage
            </span>
          </div>

          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="memoryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#243247" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101a2b",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#60a5fa"
                  fill="url(#cpuFill)"
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#c084fc"
                  fill="url(#memoryFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-5">
          <h3 className="font-semibold text-white">
            Infrastructure Health
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Current resource status
          </p>

          <div className="my-8 flex justify-center">
            <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-[12px] border-emerald-500/80">
              <span className="text-3xl font-bold text-white">98%</span>
              <span className="text-xs text-slate-400">Healthy</span>
            </div>
          </div>

          {[
            ["Healthy Services", "24", "text-emerald-400"],
            ["Warning Services", "02", "text-yellow-400"],
            ["Critical Services", "00", "text-red-400"],
          ].map(([name, value, color]) => (
            <div key={name} className="flex justify-between border-t border-slate-800 py-3 text-sm">
              <span className="text-slate-400">{name}</span>
              <span className={`font-semibold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">
              Recent Deployments
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Latest application deployment activity
            </p>
          </div>
          <Rocket size={20} className="text-blue-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-slate-800 text-xs text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Application</th>
                <th className="pb-3 font-medium">Version</th>
                <th className="pb-3 font-medium">Environment</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>

            <tbody>
              {deployments.map((item) => (
                <tr key={item.name} className="border-b border-slate-800/70 last:border-0">
                  <td className="py-4 font-medium text-white">{item.name}</td>
                  <td className="py-4 text-slate-400">{item.version}</td>
                  <td className="py-4 text-slate-400">{item.environment}</td>
                  <td className="py-4">
                    <span className={`rounded-full px-3 py-1 text-xs ${
                      item.status === "Successful"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" size={20} />
            <h3 className="font-semibold text-white">Latest Recovery</h3>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Docker container recovery workflow completed.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Demo event · 15 minutes ago
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-400" size={20} />
            <h3 className="font-semibold text-white">Pending Alerts</h3>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Two warning-level services require attention.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Demo monitoring data
          </p>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ name }) {
  const descriptions = {
    Infrastructure: "Manage cloud servers, instances and infrastructure resources.",
    Deployments: "Track application builds, deployment stages and release history.",
    Monitoring: "Observe CPU, memory, disk utilization and application health.",
    "Self-Healing": "Review automated recovery workflows and service restoration.",
    Automation: "Manage Ansible playbooks and infrastructure automation tasks.",
    Incidents: "Track operational incidents, severity and resolution status.",
    Settings: "Configure your InfraPilot workspace and application preferences.",
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#101a2b] p-8">
      <div className="mb-4 inline-flex rounded-xl bg-blue-500/10 p-4 text-blue-400">
        <Cloud size={30} />
      </div>
      <h1 className="text-2xl font-bold text-white">{name}</h1>
      <p className="mt-3 max-w-xl text-sm text-slate-400">
        {descriptions[name]}
      </p>
      <div className="mt-6 rounded-lg border border-slate-700 bg-[#0b1422] p-4">
        <p className="text-sm text-blue-400">
          Module initialized successfully.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          This module will be implemented in the upcoming development steps.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("Overview");

  return (
    <div className="min-h-screen bg-[#080d18]">
      <Sidebar active={active} setActive={setActive} />

      <main className="min-h-screen md:ml-64">
        <Header active={active} />

        <div className="p-5 md:p-8">
          {active === "Overview" ? (
            <Overview />
          ) : active === "Infrastructure" ?(
            <Infrastructure />
          ) : active === "Deployments" ?(
            <Deployments />
          ) : active === "Monitoring" ?(
            <Monitoring />
          ) : active === "Self-Healing" ?(
            <SelfHealing />
          ) : active === "Automation" ?(
            <Automation />
          ) : (
            <PlaceholderPage name={active} />
          )}

          <footer className="mt-10 border-t border-slate-800 py-5 text-center text-xs text-slate-500">
            InfraPilot © 2026 · Cloud Infrastructure Management Platform
            · Demo Environment
          </footer>
        </div>
      </main>
    </div>
  );
}
