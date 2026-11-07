
import {
  LayoutDashboard,
  Server,
  Rocket,
  Activity,
  ShieldCheck,
  Workflow,
  Bell,
  Settings,
  Cloud
} from "lucide-react";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Infrastructure", icon: Server },
  { name: "Deployments", icon: Rocket },
  { name: "Monitoring", icon: Activity },
  { name: "Self-Healing", icon: ShieldCheck },
  { name: "Automation", icon: Workflow },
  { name: "Incidents", icon: Bell },
  { name: "Settings", icon: Settings },
];

export default function Sidebar({ active, setActive }) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-[#0d1523]">

      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <div className="rounded-xl bg-blue-600 p-2">
          <Cloud size={24} className="text-white" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">
            InfraPilot
          </h1>
          <p className="text-[10px] tracking-widest text-slate-500">
            CLOUD OPERATIONS
          </p>
        </div>
      </div>

      <div className="px-4 pt-7">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>

        <nav className="space-y-2">
          {menuItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setActive(name)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all ${
                active === name
                  ? "bg-blue-600/15 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={19} />
              {name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-800 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
            BK
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Administrator
            </p>
            <p className="text-xs text-slate-500">
              Cloud Engineer
            </p>
          </div>
        </div>
      </div>

    </aside>
  );
}
