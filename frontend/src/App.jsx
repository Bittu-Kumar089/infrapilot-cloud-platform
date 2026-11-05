
import { useState } from "react";
import {
  LayoutDashboard, Server, Rocket, Activity, ShieldCheck,
  Workflow, Bell, Settings, Search, Menu, X, Cloud,
  Cpu, HardDrive, MemoryStick, ArrowUpRight, ArrowDownRight,
  CheckCircle2, AlertTriangle, Clock3, MoreHorizontal,
  RefreshCw, CircleDot
} from "lucide-react";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const navItems = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Infrastructure", icon: Server },
  { name: "Deployments", icon: Rocket },
  { name: "Monitoring", icon: Activity },
  { name: "Self-Healing", icon: ShieldCheck },
  { name: "Automation", icon: Workflow },
  { name: "Incidents", icon: Bell },
  { name: "Activity Logs", icon: Clock3 },
  { name: "Settings", icon: Settings },
];

const usageData = [
  { time: "09:00", cpu: 24, memory: 40 },
  { time: "10:00", cpu: 35, memory: 48 },
  { time: "11:00", cpu: 29, memory: 45 },
  { time: "12:00", cpu: 52, memory: 55 },
  { time: "13:00", cpu: 41, memory: 49 },
  { time: "14:00", cpu: 64, memory: 62 },
  { time: "15:00", cpu: 46, memory: 58 },
];

const incidents = [
  { title: "API service restarted", service: "api-server", time: "10:42 AM", status: "Recovered" },
  { title: "High CPU utilization", service: "web-server", time: "09:35 AM", status: "Monitoring" },
  { title: "Deployment completed", service: "frontend", time: "08:15 AM", status: "Success" },
];

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-[#101827] ${className}`}>
      {children}
    </div>
  );
}

function MetricCard({ title, value, detail, icon: Icon, trend, color }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{title}</span>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon size={19} />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <h3 className="text-3xl font-semibold text-white">{value}</h3>
        <span className="flex items-center gap-1 text-xs text-emerald-400">
          <ArrowUpRight size={14} /> {trend}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </Card>
  );
}

function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Cloud Instances" value="04" detail="3 running · 1 stopped" icon={Server} trend="+1 this week" color="bg-blue-500/10 text-blue-400" />
        <MetricCard title="Service Availability" value="98.5%" detail="Last 24 hours" icon={Activity} trend="+2.4%" color="bg-emerald-500/10 text-emerald-400" />
        <MetricCard title="Deployments" value="12" detail="This month" icon={Rocket} trend="+4 this week" color="bg-violet-500/10 text-violet-400" />
        <MetricCard title="Recovered Incidents" value="03" detail="Automated recovery events" icon={ShieldCheck} trend="All recovered" color="bg-amber-500/10 text-amber-400" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">Resource Utilization</h3>
              <p className="mt-1 text-xs text-slate-500">Infrastructure performance · Today</p>
            </div>
            <span className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">Last 7 hours</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#263449" strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="time" stroke="#64748b" tickLine={false} axisLine={false}/>
                <YAxis stroke="#64748b" tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ background: "#101827", border: "1px solid #334155", borderRadius: 10 }}/>
                <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#3b82f6" fill="url(#cpuFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="memory" name="Memory %" stroke="#a78bfa" fill="transparent" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex gap-5 text-xs text-slate-400">
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-blue-500"/> CPU</span>
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-violet-400"/> Memory</span>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-white">Infrastructure Status</h3>
          <p className="mt-1 text-xs text-slate-500">Instance distribution</p>
          <div className="relative mx-auto mt-5 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{name:"Running",value:3},{name:"Stopped",value:1}]} dataKey="value" innerRadius={55} outerRadius={76} paddingAngle={5}>
                  <Cell fill="#10b981"/>
                  <Cell fill="#475569"/>
                </Pie>
                <Tooltip contentStyle={{ background: "#101827", border: "1px solid #334155" }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">04</span>
              <span className="text-xs text-slate-500">Instances</span>
            </div>
          </div>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Running</span><span className="text-emerald-400">03</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Stopped</span><span className="text-slate-300">01</span></div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-5 flex justify-between">
            <div>
              <h3 className="font-semibold text-white">Recent Deployments</h3>
              <p className="mt-1 text-xs text-slate-500">Latest pipeline activity</p>
            </div>
            <Rocket className="text-blue-400" size={20}/>
          </div>
          {[
            ["Frontend Production", "v1.2.0", "Success"],
            ["Backend API", "v1.1.4", "Success"],
            ["Authentication Service", "v1.0.2", "Running"],
          ].map((item) => (
            <div key={item[0]} className="flex items-center justify-between border-t border-slate-800 py-4">
              <div>
                <p className="text-sm text-slate-200">{item[0]}</p>
                <p className="mt-1 text-xs text-slate-500">{item[1]}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${item[2] === "Success" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>{item[2]}</span>
            </div>
          ))}
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex justify-between">
            <div>
              <h3 className="font-semibold text-white">Recent Activity</h3>
              <p className="mt-1 text-xs text-slate-500">System events and alerts</p>
            </div>
            <MoreHorizontal className="text-slate-400"/>
          </div>
          {incidents.map((event) => (
            <div key={event.title} className="flex items-center gap-3 border-t border-slate-800 py-4">
              <div className="rounded-lg bg-slate-800 p-2"><Activity size={17} className="text-blue-400"/></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-200">{event.title}</p>
                <p className="mt-1 text-xs text-slate-500">{event.service} · {event.time}</p>
              </div>
              <span className="text-xs text-emerald-400">{event.status}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function ResourcePage({ page }) {
  const descriptions = {
    Infrastructure: "Manage your AWS cloud instances and infrastructure resources.",
    Deployments: "View application releases and CI/CD pipeline executions.",
    Monitoring: "Monitor CPU, memory, disk usage and application availability.",
    "Self-Healing": "Review automated recovery workflows and service health.",
    Automation: "Manage Ansible playbooks and automation execution history.",
    Incidents: "Investigate alerts, errors and infrastructure incidents.",
    "Activity Logs": "Review your platform's operational activity.",
    Settings: "Manage platform preferences and configurations."
  };

  const Icon = navItems.find(item => item.name === page)?.icon || Cloud;

  return (
    <Card className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
      <div className="rounded-2xl bg-blue-500/10 p-5 text-blue-400"><Icon size={35}/></div>
      <h2 className="mt-5 text-2xl font-semibold text-white">{page}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{descriptions[page]}</p>
      <span className="mt-5 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs text-blue-300">Module initialized · Integration pending</span>
    </Card>
  );
}

export default function App() {
  const [active, setActive] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ActiveIcon = navItems.find(item => item.name === active)?.icon || LayoutDashboard;

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-200">
      {sidebarOpen && <button aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden"/>}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-[#0d1523] transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2"><Cloud size={23} className="text-white"/></div>
            <div>
              <h1 className="text-xl font-bold text-white">InfraPilot</h1>
              <p className="text-[10px] tracking-widest text-slate-500">CLOUD OPERATIONS</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X/></button>
        </div>

        <div className="px-4 pt-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Workspace</p>
          <nav className="space-y-1">
            {navItems.map(({name,icon:Icon}) => (
              <button key={name} onClick={() => {setActive(name);setSidebarOpen(false)}} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${active === name ? "bg-blue-600/15 font-medium text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                <Icon size={18}/>{name}
                {name === "Incidents" && <span className="ml-auto rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400">2</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-xl border border-slate-800 bg-[#121e30] p-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400"><CircleDot size={12}/> Platform initialized</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">Connect your cloud infrastructure to start monitoring resources.</p>
          </div>
          <div className="mt-4 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">BK</div>
            <div><p className="text-sm font-medium text-white">Administrator</p><p className="text-xs text-slate-500">Cloud Engineer</p></div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800 bg-[#080d18]/95 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu/></button>
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-400"><span>Workspace</span><span>/</span><span className="text-white">{active}</span></div>
              <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-white"><ActiveIcon size={18} className="text-blue-400"/>{active}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-[#101827] px-3 py-2 md:flex">
              <Search size={15} className="text-slate-500"/>
              <input placeholder="Search..." className="w-28 bg-transparent text-sm outline-none placeholder:text-slate-500"/>
            </div>
            <button aria-label="Notifications" className="relative rounded-lg border border-slate-800 p-2.5 text-slate-400 hover:text-white"><Bell size={18}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500"/></button>
            <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold sm:flex">BK</div>
          </div>
        </header>

        <section className="p-5 md:p-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">{active === "Overview" ? "Welcome to InfraPilot" : active}</h1>
              <p className="mt-1 text-sm text-slate-400">{active === "Overview" ? "Your cloud infrastructure at a glance." : "Manage and monitor your cloud operations."}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400"><CheckCircle2 size={15}/> Demo environment</div>
          </div>

          {active === "Overview" ? <Overview/> : <ResourcePage page={active}/>}
          <footer className="mt-8 border-t border-slate-800 pt-5 text-center text-xs text-slate-600">InfraPilot · Cloud Operations Platform · Development Preview</footer>
        </section>
      </main>
    </div>
  );
}
