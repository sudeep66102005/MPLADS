"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
const LiveMap = dynamic(() => import("@/components/LiveMap"), {ssr:false});
import { normalizeServer, request, download } from "@/lib/backend";

type Project = { id: string; name: string; code: string; constituency: string; agency: string; aiScore: number;
  aiHealthScore: number; physicalProgressPct: number; financialProgressPct: number; expenditureCr: number;
  updatedAt: string; status: string; sector: string; location: {lat:number;lng:number}; releasedAmountCr: number; sanctionedAmountCr: number; expectedEndDate: string; riskLevel: string };
type Inspection = { id: number; projectId: number; inspectorId: number; status: string; version: number;
  findings: string; physicalProgressObservedPct: number | null; evidenceIds: number[]; checklist: Record<string, boolean>;
  outcome: string | null; reviewNote: string | null };
type User = { id: number; username: string; displayName: string; role: string; isActive: boolean };
type Named = { id: number | string; name: string };
type Analysis = { aiHealthScore: number; priorityScore: number; overdueDays: number; ruleVersion: string;
  explanations: { factor: string; detail: string; severity: string }[]; limitations: string[] };
type Photo = { id: number; caption: string; distanceKm: number | null; duplicateCandidates: { evidenceId: number; exact: boolean }[]; filePath: string };

const control = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
const button = "rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const managers = ["Admin", "District Nodal Authority", "State Nodal Authority", "MoSPI / Central Nodal Agency"];
function fields(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  return Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
}
function Input({ label, name, type = "text", value, required = true }: { label: string; name: string; type?: string; value?: string | number; required?: boolean }) {
  return <label className="block text-sm text-slate-700">{label}<input className={control + " mt-1"} name={name} type={type} defaultValue={value} required={required} step={type === "number" ? "any" : undefined} /></label>;
}

export default function Workspace({initialTab = "Overview"}: {initialTab?: string}) {
  const [server, setServer] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "");
  const [base, setBase] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [demo, setDemo] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [agencies, setAgencies] = useState<Named[]>([]);
  const [constituencies, setConstituencies] = useState<Named[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [current, setCurrent] = useState<Inspection | null>(null);
  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadKey, setUploadKey] = useState("");
  const canManage = !!user && managers.includes(user.role);
  const isOfficer = user?.role === "Inspecting / Field Officer";
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) setServer(localStorage.getItem("mplads-api-origin") || "");
  }, []);

  async function run(action: () => Promise<void>) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : "Request failed"); }
    finally { setBusy(false); }
  }
  const api = <T,>(path: string, options?: RequestInit) => request<T>(base, token, path, options);
  const post = <T,>(path: string, body: unknown, method = "POST") => api<T>(path, { method, body: JSON.stringify(body) });

  async function load(b = base, t = token, u = user) {
    const get = <T,>(path: string) => request<T>(b, t, path);
    const [p, i, a, c] = await Promise.all([get<Project[]>("/projects/all"), get<Inspection[]>("/inspections"),
      get<Named[]>("/agencies"), get<Named[]>("/constituencies")]);
    setProjects(p); setInspections(i); setAgencies(a); setConstituencies(c);
    if (u && managers.includes(u.role)) setUsers(await get<User[]>("/users"));
  }
  async function openProject(p: Project) {
    const [a, ph] = await Promise.all([api<Analysis>("/projects/" + p.id + "/ai-analysis"), api<Photo[]>("/projects/" + p.id + "/photos")]);
    setSelected(p); setAnalysis(a); setPhotos(ph); setCurrent(null);
  }
  async function signIn(event: FormEvent<HTMLFormElement>) {
    const values = fields(event);
    await run(async () => {
      const origin = normalizeServer(server);
      const result = await request<{ accessToken: string }>(origin, "", "/auth/login", { method: "POST", body: JSON.stringify(values) });
      const me = await request<User>(origin, result.accessToken, "/auth/me");
      const health = await fetch(origin + "/health").then(r => r.json());
      setBase(origin); setToken(result.accessToken); setUser(me); setDemo(health.demoMode);
      localStorage.setItem("mplads-api-origin", origin);
      await load(origin, result.accessToken, me);
    });
  }
  async function signOut() {
    await run(async () => {
      try { await api("/auth/logout", { method: "POST" }); }
      finally { setToken(""); setUser(null); setProjects([]); setInspections([]); setSelected(null); setCurrent(null); setPhotos([]); }
    });
  }

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b bg-white px-5 py-5 sm:px-8 flex flex-wrap justify-between items-center gap-3">
      <div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">MPLADS</p><h1 className="text-2xl font-bold">Connected Workspace</h1></div>
      <div className="flex items-center gap-4 text-sm"><Link href="/field/" className="text-blue-700 underline">Field app</Link><Link href="/demo/" className="text-blue-700 underline">Sample dashboard</Link>
        {user && <><span>{user.displayName} · {user.role}</span><button className={button} onClick={signOut} disabled={busy}>Sign out</button></>}</div>
    </header>
    <div className="mx-auto max-w-7xl p-4 sm:p-8 space-y-5">
      <p className="text-sm text-slate-600">Project records, evidence and inspections are saved to your connected server. Analysis uses explainable rules and requires human review.</p>
      {error && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">{error}</div>}
      {message && <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-800">{message}</div>}
      {busy && <p role="status" className="text-sm text-blue-700">Working…</p>}
      {!user ? <section className={card + " max-w-lg mx-auto"}>
        <h2 className="text-xl font-semibold mb-2">Connect and sign in</h2>
        <p className="mb-5 text-sm text-slate-600">Your administrator supplies the server address and account. If hosting is not set up, follow the backend setup guide in the repository.</p>
        <form onSubmit={signIn} className="space-y-4">
          <label className="block text-sm">Server address<input className={control + " mt-1"} type="url" placeholder="https://your-api.example.com" value={server} onChange={e => setServer(e.target.value)} required /></label>
          <Input label="Username" name="username" /><Input label="Password" name="password" type="password" />
          <button className={button} disabled={busy}>Sign in</button>
        </form>
        <a className="mt-5 block text-sm text-blue-700 underline" href="https://github.com/sudeep66102005/MPLADS/blob/feature/mplads-ai-dashboard/backend/README.md">Backend setup guide</a>
      </section> : <>
        <div className={"rounded-lg px-4 py-3 text-sm " + (demo ? "bg-amber-100 text-amber-950" : "bg-blue-50 text-blue-900")}>
          {demo ? "Connected to a synthetic demonstration database." : "Connected to your configured database."} <span className="break-all">{base}</span>
        </div>
        <nav className="flex gap-2 flex-wrap" aria-label="Workspace sections">
          {["Overview", "Projects", "Map", "Inspections", "Reports", ...(isAdmin ? ["Administration"] : [])].map(item =>
            <button key={item} className={tab === item ? button : "rounded-lg border px-4 py-2 text-sm bg-white"} onClick={() => { setTab(item); setSelected(null); setCurrent(null); }}>{item}</button>)}
          <button className="ml-auto text-sm text-blue-700 underline" disabled={busy} onClick={() => run(() => load())}>Refresh records</button>
        </nav>

        {tab === "Overview" && <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[["Visible projects",projects.length], ["Completed", projects.filter(p => p.physicalProgressPct >= 100).length], ["Awaiting review", inspections.filter(i => i.status === "Submitted").length], ["Allocated (crore)","₹ " + projects.reduce((s,p) => s+p.sanctionedAmountCr,0).toFixed(2)]].map(([label,value]) => <div className={card} key={label}><p className="text-sm text-slate-500">{label}</p><p className="text-3xl font-bold mt-2">{value}</p></div>)}</div>
          <div className="grid md:grid-cols-2 gap-5"><section className={card}><h2 className="text-lg font-bold mb-4">Project status</h2>{Array.from(new Set(projects.map(p => p.status))).map(status => {const count=projects.filter(p => p.status === status).length; return <div key={status} className="mb-4"><p className="flex justify-between text-sm mb-1"><span>{status}</span><strong>{count}</strong></p><div className="bg-slate-100 h-3 rounded"><div className="bg-blue-600 h-3 rounded" style={{width: (100*count/projects.length)+"%"}} /></div></div>;})}{!projects.length && <p>No projects in this account’s scope yet.</p>}</section>
          <section className={card}><h2 className="text-lg font-bold mb-4">MP attention centre</h2><p className="text-sm text-slate-500 mb-3">Highest monitoring priorities in your authorized scope. Open a project to review the reasons.</p>{[...projects].sort((a,b)=>b.aiScore-a.aiScore).slice(0,5).map(p => <button key={p.id} disabled={busy} className="w-full border-b py-3 text-left flex justify-between gap-3" onClick={() => run(async () => {setTab("Projects"); await openProject(p);})}><span>{p.name}</span><strong>{p.aiScore}/100</strong></button>)}</section></div>
          <section className={card}><h2 className="font-bold mb-3">Fund utilization</h2><div className="flex flex-wrap gap-8">{[["Sanctioned",projects.reduce((s,p)=>s+p.sanctionedAmountCr,0)],["Released",projects.reduce((s,p)=>s+p.releasedAmountCr,0)],["Spent",projects.reduce((s,p)=>s+p.expenditureCr,0)]].map(([label,value])=><div key={label}><p className="text-sm text-slate-500">{label}</p><strong className="text-xl">₹ {Number(value).toFixed(2)} Cr</strong></div>)}</div><p className="text-xs text-slate-500 mt-4">Snapshot of saved records. Health and priority scores are explainable monitoring indicators, not proof of wrongdoing.</p></section>
        </>}
        {tab === "Map" && <section className={card + " space-y-4"}><h2 className="text-xl font-bold">Project locations</h2><p className="text-sm text-slate-500">Red markers indicate high or critical monitoring priority. Basemap tiles use OpenStreetMap and need an internet connection.</p><LiveMap projects={projects} onOpen={id => run(async () => { const p=projects.find(p=>p.id===id); if(p){setTab("Projects"); await openProject(p);} })} /></section>}
        {tab === "Projects" && <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[["Visible projects", projects.length], ["High priority", projects.filter(p => ["High", "Critical"].includes(p.riskLevel)).length],
              ["Inspections", inspections.length], ["Awaiting review", inspections.filter(i => i.status === "Submitted").length]].map(([label, value]) =>
              <div key={label} className={card}><p className="text-sm text-slate-500">{label}</p><p className="text-3xl font-semibold mt-2">{value}</p></div>)}
          </div>
          <section className={card}>
            <div className="flex flex-wrap gap-3 mb-4"><h2 className="text-lg font-semibold mr-auto">Project priority queue</h2>
              <input aria-label="Search projects" className={control + " sm:!w-72"} placeholder="Search name or code" value={search} onChange={e => setSearch(e.target.value)} />
              {canManage && <button className={button} disabled={busy} onClick={() => run(async () => { await post("/ai/rescore-all", {}); await load(); setMessage("Analysis refreshed and saved."); })}>Refresh analysis</button>}
            </div>
            <div className="overflow-x-auto"><table className="w-full text-sm text-left">
              <thead><tr className="border-b text-slate-500">{["Project", "Reported progress", "Funds spent", "Priority", ""].map((h, i) => <th key={i} className="p-3">{h}</th>)}</tr></thead>
              <tbody>{projects.filter(p => (p.name + p.code).toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.aiScore-a.aiScore).map(p =>
                <tr key={p.id} className="border-b"><td className="p-3"><strong>{p.name}</strong><p className="text-xs text-slate-500">{p.code} · {p.constituency}</p></td>
                  <td className="p-3">{p.physicalProgressPct}%</td><td className="p-3">{p.financialProgressPct}%</td><td className="p-3">{p.aiScore}/100 · {p.riskLevel}</td>
                  <td className="p-3"><button className="text-blue-700 underline" disabled={busy} onClick={() => run(() => openProject(p))}>Open project</button></td></tr>)}</tbody>
            </table></div>
            {!projects.length && <p className="p-5 text-slate-500">No projects are available in your assigned scope. An administrator can import records or assign an inspection.</p>}
          </section>
          {selected && <section className={card + " space-y-5"}>
            <div><h2 className="text-xl font-semibold">{selected.name}</h2><p className="text-sm text-slate-500">{selected.agency} · Due {selected.expectedEndDate}</p></div>
            {analysis && <div className="rounded-lg bg-slate-50 p-4"><p className="font-semibold">Health {analysis.aiHealthScore}/100 · Priority {analysis.priorityScore}/100 · {analysis.overdueDays} days overdue</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">{analysis.explanations.map((r,i) => <li key={i}><strong>{r.factor}:</strong> {r.detail}</li>)}</ul>
              {!analysis.explanations.length && <p className="mt-2">No monitoring rules currently flag this project.</p>}
              <p className="mt-3 text-xs text-slate-500">{analysis.ruleVersion}: {analysis.limitations.join(" ")}</p></div>}
            {canManage && <form key={selected.id + selected.physicalProgressPct} className="grid sm:grid-cols-3 gap-3" onSubmit={e => {
              const v = fields(e); run(async () => { const p = await post<Project>("/projects/" + selected.id, { physicalProgressPct: Number(v.progress), expenditureCr: Number(v.spent), expectedUpdatedAt: selected.updatedAt }, "PATCH"); await load(); await openProject(p); setMessage("Project updated and rescored."); });
            }}>
              <Input label="Reported physical progress (%)" name="progress" type="number" value={selected.physicalProgressPct} />
              <Input label="Expenditure (crore)" name="spent" type="number" value={selected.expenditureCr} />
              <button className={button + " self-end"} disabled={busy}>Save project update</button>
            </form>}
            {canManage && <form className="grid sm:grid-cols-3 gap-3 border-t pt-4" onSubmit={e => { const v = fields(e); run(async () => {
              await post("/inspections", { projectId: Number(selected.id), inspectorId: Number(v.officer), inspectionDate: v.date, requestKey: crypto.randomUUID() });
              await load(); setMessage("Inspection assigned.");
            }); }}>
              <label className="text-sm">Assign officer<select className={control + " mt-1"} name="officer" required><option value="">Choose officer</option>
                {users.filter(u => u.role === "Inspecting / Field Officer").map(u => <option key={u.id} value={u.id}>{u.displayName}</option>)}</select></label>
              <Input label="Inspection date" name="date" type="date" /><button className={button + " self-end"} disabled={busy}>Assign inspection</button>
            </form>}
            <h3 className="font-semibold">Photo evidence</h3>
            {photos.map(p => <div key={p.id} className="rounded-lg border p-3 text-sm flex flex-wrap gap-3 justify-between">
              <span>#{p.id} {p.caption} · {p.distanceKm === null ? "Location unavailable" : p.distanceKm + " km from project"}
                {p.duplicateCandidates.length > 0 && <strong className="block text-amber-800">Possible duplicate: evidence {p.duplicateCandidates.map(d => "#" + d.evidenceId).join(", ")}. Review required.</strong>}</span>
              <button className="text-blue-700 underline" onClick={() => run(() => download(base, token, p.filePath.replace("/api/v1", ""), "evidence-" + p.id))}>Download original</button>
            </div>)}
            {!photos.length && <p className="text-sm text-slate-500">No uploaded evidence yet.</p>}
            {(canManage || isOfficer || user.role === "Implementing Agency") && <form className="grid sm:grid-cols-2 gap-3" onSubmit={e => {
              const v = fields(e); run(async () => {
                if (!file) throw new Error("Choose a photo first.");
                const form = new FormData(); form.set("file", file); form.set("request_key", uploadKey); form.set("caption", v.caption);
                if (v.lat || v.lng) { form.set("lat", v.lat); form.set("lng", v.lng); }
                await api("/projects/" + selected.id + "/photos", { method: "POST", body: form });
                setFile(null); setUploadKey(crypto.randomUUID()); await openProject(selected); setMessage("Evidence saved.");
              });
            }}>
              <label className="text-sm">Photo (JPEG, PNG or WebP; up to 8 MB)<input className={control + " mt-1"} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { setFile(e.target.files?.[0] || null); setUploadKey(crypto.randomUUID()); }} required /></label>
              <Input label="Caption" name="caption" /><Input label="Latitude (optional)" name="lat" type="number" required={false} /><Input label="Longitude (optional)" name="lng" type="number" required={false} />
              <button className={button} disabled={busy}>Upload evidence</button>
            </form>}
          </section>}
          {canManage && <details className={card}><summary className="font-bold cursor-pointer">Create project</summary><form className="grid sm:grid-cols-2 gap-4 mt-5" onSubmit={e => {const v=fields(e);run(async()=>{const c=constituencies.find(c=>Number(c.id)===Number(v.constituencyId)); const a=agencies.find(a=>Number(a.id)===Number(v.agencyId)); await post("/projects", {...v, constituencyId:Number(v.constituencyId),agencyId:Number(v.agencyId),constituency:c?.name,state:"",district:"",agency:a?.name,location:{lat:Number(v.lat),lng:Number(v.lng)},sanctionedAmountCr:Number(v.sanctionedAmountCr),releasedAmountCr:Number(v.releasedAmountCr),expenditureCr:Number(v.expenditureCr),physicalProgressPct:Number(v.physicalProgressPct),financialProgressPct:0});await load();setMessage("Project created.");});}}>
            <Input label="Project code" name="code"/><Input label="Project name" name="name"/><Input label="Sector" name="sector"/>
            <label>Constituency<select name="constituencyId" className={control} required>{constituencies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Agency<select name="agencyId" className={control} required>{agencies.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
            <label>Status<select className={control} name="status">{["Not Started","In Progress","Completed","Delayed"].map(s=><option key={s}>{s}</option>)}</select></label>
            <Input label="Latitude" name="lat" type="number"/><Input label="Longitude" name="lng" type="number"/>
            <Input label="Sanctioned amount (crore)" name="sanctionedAmountCr" type="number"/><Input label="Released amount (crore)" name="releasedAmountCr" type="number" value={0}/><Input label="Expenditure (crore)" name="expenditureCr" type="number" value={0}/><Input label="Physical progress (%)" name="physicalProgressPct" type="number" value={0}/><Input label="Start date" name="startDate" type="date"/><Input label="Expected completion" name="expectedEndDate" type="date"/><button disabled={busy} className={button}>Create project</button>
          </form></details>}
          {canManage && <section className={card + " space-y-4"}>
            <h2 className="font-semibold">Import project records</h2><p className="text-sm text-slate-500">Use existing constituency and agency IDs from Administration or the API. Reimporting the same project code updates its record. The whole file is rejected if a row is invalid.</p>
            <button className="text-sm text-blue-700 underline" onClick={() => run(() => download(base, token, "/imports/template", "import-template.csv"))}>Download CSV template</button>
            <form className="flex flex-wrap gap-3" onSubmit={e => {
              e.preventDefault(); const form = new FormData(e.currentTarget);
              run(async () => { const r = await api<{created: number; updated: number}>("/imports/projects", {method: "POST", body: form}); await load(); setMessage(r.created + " created, " + r.updated + " updated."); });
            }}><input aria-label="CSV import file" type="file" name="file" accept=".csv" required /><button className={button} disabled={busy}>Import CSV</button></form>
          </section>}
        </>}

        {tab === "Inspections" && <section className={card + " space-y-4"}>
          <h2 className="text-xl font-semibold">Inspections</h2>
          {!inspections.length && <p className="text-slate-500">No inspections assigned yet.</p>}
          <div className="grid md:grid-cols-2 gap-3">{inspections.map(i => <button key={i.id} className="text-left rounded-lg border p-4 hover:border-blue-500" onClick={() => setCurrent(i)}>
            <strong>Inspection #{i.id} · {projects.find(p => Number(p.id) === i.projectId)?.name || "Project " + i.projectId}</strong>
            <p className="text-sm mt-1">{i.status} · Version {i.version}</p></button>)}</div>
          {current && <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Inspection #{current.id}: {current.status}</h3>
            <button className="text-sm text-blue-700 underline" onClick={() => run(() => download(base, token, "/inspections/" + current.id + "/dossier", "inspection-" + current.id + ".json"))}>Download inspection dossier</button>
            {current.reviewNote && <p className="rounded-lg bg-blue-50 p-3">Reviewer: {current.reviewNote} ({current.outcome})</p>}
            {isOfficer && ["Assigned", "Draft", "Needs clarification", "Reopened"].includes(current.status) ?
              <form key={current.id + ":" + current.version} className="space-y-3" onSubmit={e => {
                const native = e.nativeEvent as SubmitEvent;
                const action = (native.submitter as HTMLButtonElement)?.value || "draft";
                const v = fields(e); run(async () => {
                  const data = { version: current.version, findings: v.findings, physicalProgressObservedPct: v.progress === "" ? null : Number(v.progress),
                    checklist: current.checklist, evidenceIds: v.evidence.split(",").map(s => s.trim()).filter(Boolean).map(Number) };
                  const result = await post<Inspection>("/inspections/" + current.id + (action === "submit" ? "/submit" : ""), data, action === "submit" ? "POST" : "PATCH");
                  setCurrent(result); await load(); setMessage(action === "submit" ? "Submitted for authority review." : "Draft saved to the server.");
                });
              }}>
                <label className="text-sm block">Findings<textarea name="findings" className={control + " mt-1"} rows={4} defaultValue={current.findings} /></label>
                <Input label="Observed physical progress (%)" name="progress" type="number" value={current.physicalProgressObservedPct ?? ""} required={false} />
                <Input label="Evidence IDs, separated by commas (upload through the project first)" name="evidence" value={current.evidenceIds.join(",")} required={false} />
                <div className="flex gap-3"><button className={button} value="draft" disabled={busy}>Save draft</button><button className={button} value="submit" disabled={busy}>Submit findings</button></div>
              </form> : <p className="whitespace-pre-wrap text-sm">{current.findings || "No findings recorded."}</p>}
            {canManage && ["Submitted", "Closed"].includes(current.status) && <form className="space-y-3" onSubmit={e => {
              const v = fields(e); run(async () => {
                const result = await post<Inspection>("/inspections/" + current.id + "/review", { version: current.version, decision: v.decision, outcome: v.outcome, note: v.note });
                setCurrent(result); await load(); setMessage("Review decision saved.");
              });
            }}>
              <label className="block text-sm">Decision<select className={control} name="decision">{(current.status === "Closed" ? ["Reopened"] : ["Closed", "Needs clarification"]).map(s => <option key={s}>{s}</option>)}</select></label>
              <label className="block text-sm">Outcome<select className={control} name="outcome">{["Issue confirmed", "False positive", "Needs evidence", "Resolved"].map(s => <option key={s}>{s}</option>)}</select></label>
              <Input label="Review reason" name="note" /><button className={button} disabled={busy}>Save review</button>
            </form>}
          </div>}
        </section>}

        {tab === "Reports" && <section className={card + " space-y-4"}><h2 className="text-xl font-semibold">Reports and audit history</h2>
          <p className="text-sm text-slate-600">Downloads contain only records you are authorized to access.</p>
          <div className="flex gap-3 flex-wrap">
            {[["/reports/export", "projects.csv", "Export projects"], ["/reports/fund-utilization", "fund-utilization.json", "Fund utilization"],
              ["/audit", "audit-history.json", "Audit history"]].map(([path,name,label]) => <button key={path} className={button} disabled={busy} onClick={() => run(() => download(base,token,path,name))}>{label}</button>)}
          </div></section>}

        {tab === "Administration" && isAdmin && <div className="grid md:grid-cols-2 gap-5">
          <section className={card}><h2 className="font-semibold mb-4">Constituencies</h2>
            <ul className="text-sm mb-4">{constituencies.map(c => <li key={c.id}>ID {c.id}: {c.name}</li>)}</ul>
            <form className="space-y-3" onSubmit={e => { const v = fields(e); run(async () => { await post("/constituencies", v); await load(); setMessage("Constituency created."); }); }}>
              <Input label="Name" name="name" /><Input label="State" name="state" /><Input label="District" name="district" /><button className={button} disabled={busy}>Add constituency</button></form>
          </section>
          <section className={card}><h2 className="font-semibold mb-4">Agencies</h2>
            <ul className="text-sm mb-4">{agencies.map(a => <li key={a.id}>ID {a.id}: {a.name}</li>)}</ul>
            <form className="space-y-3" onSubmit={e => { const v = fields(e); run(async () => { await post("/agencies", v); await load(); setMessage("Agency created."); }); }}>
              <Input label="Agency name" name="name" /><button className={button} disabled={busy}>Add agency</button></form>
          </section>
          <section className={card + " md:col-span-2"}><h2 className="font-semibold mb-4">Account access</h2>{users.map(u=><div key={u.id} className="flex flex-wrap justify-between gap-3 py-3 border-b text-sm"><span>{u.displayName} · {u.role} · {u.isActive ? "Active" : "Inactive"}</span><button disabled={busy || u.id===user.id} className="text-blue-700 underline disabled:opacity-40" onClick={()=>run(async()=>{await post("/users/"+u.id,{isActive:!u.isActive},"PATCH");await load();setMessage("Account access updated.");})}>{u.isActive ? "Deactivate" : "Activate"}</button></div>)}</section>
          <section className={card}><h2 className="font-semibold mb-4">Create account</h2>
            <form className="space-y-3" onSubmit={e => { const v = fields(e); run(async () => {
              await post("/auth/register", { ...v, constituencyId: v.constituencyId ? Number(v.constituencyId) : null }); await load(); setMessage("Account created.");
            }); }}>
              <Input label="Username" name="username" /><Input label="Display name" name="displayName" /><Input label="Password (at least 10 characters)" name="password" type="password" />
              <label className="block text-sm">Role<select className={control} name="role">{["MP", "Inspecting / Field Officer", "District Nodal Authority", "State Nodal Authority", "Implementing Agency", "MoSPI / Central Nodal Agency", "Admin"].map(r => <option key={r}>{r}</option>)}</select></label>
              <label className="block text-sm">Constituency<select className={control} name="constituencyId"><option value="">Unassigned</option>{constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <button className={button} disabled={busy}>Create account</button></form>
          </section>
          <section className={card}><h2 className="font-semibold mb-4">Additional access</h2>
            <p className="text-sm mb-3 text-slate-600">Agency accounts need a constituency and agency grant. Officers need a constituency assignment before receiving an inspection.</p>
            <form className="space-y-3" onSubmit={e => { const v = fields(e); run(async () => {
              await post("/users/" + v.userId + "/grants", { constituencyId: Number(v.constituencyId), agencyId: v.agencyId ? Number(v.agencyId) : null }); setMessage("Access granted.");
            }); }}>
              <label className="block text-sm">Account<select className={control} name="userId" required>{users.map(u => <option key={u.id} value={u.id}>{u.displayName} ({u.role})</option>)}</select></label>
              <label className="block text-sm">Constituency<select className={control} name="constituencyId" required>{constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <label className="block text-sm">Agency (for agency accounts)<select className={control} name="agencyId"><option value="">None</option>{agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
              <button className={button} disabled={busy}>Grant access</button></form>
          </section>
        </div>}
      </>}
    </div>
  </main>;
}
