"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {useServer} from "@/lib/use-server";
import { normalizeServer, request } from "@/lib/backend";
import { Draft, Inspection, clearLocal, localDrafts, saveLocal } from "@/lib/field-store";

const control = "w-full rounded-lg border border-slate-300 bg-white p-3";
const button = "rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-50";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const editable = ["Assigned", "Draft", "Needs clarification", "Reopened"];
type User = { id: number; displayName: string; role: string };
type Project = { id: string; name: string; code: string };

export default function FieldApp() {
  const {server,setServer,configured,loading} = useServer();
  const [base, setBase] = useState(""); const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [rows, setRows] = useState<Draft[]>([]); const [current, setCurrent] = useState<Draft | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [online, setOnline] = useState(true); const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(""); const [error, setError] = useState("");
  const prefix = base + ":" + user?.id + ":";
  useEffect(() => {
    setOnline(navigator.onLine);
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update); window.addEventListener("offline", update);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register(basePath + "/field-sw.js", { scope: basePath + "/" }).then(async () => {
      const registration = await navigator.serviceWorker.ready;
      const assets = performance.getEntriesByType("resource").map(r => r.name).filter(url => new URL(url).pathname.startsWith(basePath + "/_next/static/"));
      registration.active?.postMessage({ type: "CACHE_SHELL", assets });
    }).catch(() => {});
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  async function run(fn: () => Promise<void>) {
    setBusy(true); setError(""); setNotice("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to complete action"); }
    finally { setBusy(false); }
  }
  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const values = Object.fromEntries(new FormData(e.currentTarget));
    await run(async () => {
      const b = normalizeServer(server);
      const auth = await request<{accessToken: string}>(b, "", "/auth/login", {method: "POST", body: JSON.stringify(values)});
      const me = await request<User>(b, auth.accessToken, "/auth/me");
      if (me.role !== "Inspecting / Field Officer") throw new Error("Use a field officer account. Managers review inspections in the workspace.");
      const assigned = await request<Inspection[]>(b, auth.accessToken, "/inspections");
      const p = await request<Project[]>(b, auth.accessToken, "/projects/all");
      const key = b + ":" + me.id + ":", stored = await localDrafts(key);
      const next = assigned.map(i => stored.find(d => d.inspection.id === i.id && d.dirty) || {key: key + i.id, inspection: i, photos: [], savedAt: "", dirty: false});
      setBase(b); setToken(auth.accessToken); setUser(me); setRows(next); setProjects(p);
      localStorage.setItem("mplads-api-origin", b);
    });
  }
  function update(d: Draft) { setCurrent(d); setRows(old => old.map(r => r.key === d.key ? d : r)); }
  async function persist(d: Draft) {
    const next = {...d, savedAt: new Date().toISOString()};
    await saveLocal(next); update(next); return next;
  }
  async function sync(submit: boolean) {
    if (!current) return;
    let d = await persist(current);
    const i = d.inspection;
    // Check server version before uploading. Never overwrite a reviewer or a newer device.
    const remote = await request<Inspection>(base, token, "/inspections/" + i.id);
    const findingsEqual = remote.findings === i.findings && remote.physicalProgressObservedPct === i.physicalProgressObservedPct &&
      JSON.stringify(remote.checklist) === JSON.stringify(i.checklist) &&
      [...remote.evidenceIds].sort().join() === [...i.evidenceIds].sort().join();
    if (remote.version !== i.version) {
      if (findingsEqual && d.photos.every(p => p.evidenceId) && ["Draft", "Submitted"].includes(remote.status)) {
        d = await persist({...d, inspection: remote, dirty: false});
        setNotice("Previous sync was already received by the server."); return;
      }
      throw new Error("The server has a newer version. Your local draft is preserved. Copy your findings, then reload the server record before merging.");
    }
    if (!editable.includes(remote.status)) throw new Error("This inspection is no longer editable.");
    for (let n = 0; n < d.photos.length; n++) {
      const photo = d.photos[n]; if (photo.evidenceId) continue;
      const form = new FormData(); form.set("file", photo.file); form.set("caption", photo.caption); form.set("request_key", photo.key);
      if (photo.lat !== undefined && photo.lng !== undefined) { form.set("lat", String(photo.lat)); form.set("lng", String(photo.lng)); }
      const uploaded = await request<{id: number}>(base, token, "/projects/" + i.projectId + "/photos", {method: "POST", body: form});
      d = {...d, photos: d.photos.map((p, index) => index === n ? {...p, evidenceId: uploaded.id} : p),
        inspection: {...d.inspection, evidenceIds: Array.from(new Set([...d.inspection.evidenceIds, uploaded.id]))}};
      d = await persist(d);
    }
    const saved = await request<Inspection>(base, token, "/inspections/" + i.id + (submit ? "/submit" : ""), {
      method: submit ? "POST" : "PATCH", body: JSON.stringify({version: d.inspection.version, findings: d.inspection.findings,
        physicalProgressObservedPct: d.inspection.physicalProgressObservedPct, checklist: d.inspection.checklist, evidenceIds: d.inspection.evidenceIds})});
    await persist({...d, inspection: saved, photos: [], dirty: false});
    setNotice(submit ? "Submitted for authority review." : "Draft synced to server.");
  }
  return <main className="min-h-screen bg-slate-50 text-slate-900 pb-12">
    <header className="bg-blue-950 text-white p-5"><div className="max-w-3xl mx-auto flex justify-between gap-3"><div><p className="text-xs tracking-widest">MPLADS</p><h1 className="text-2xl font-bold">Field inspections</h1></div><Link href="/workspace/" className="underline self-center">Workspace</Link></div></header>
    <div className="max-w-3xl mx-auto p-4 space-y-5">
      <p className="text-sm">{online ? "Online" : "Offline — save drafts on this device; sync when connected."}</p>
      <details className="text-sm bg-white border rounded-xl p-4"><summary className="font-semibold cursor-pointer">Install and use offline</summary><p className="mt-2">On Android choose Install app in your browser menu. On iPhone use Safari → Share → Add to Home Screen. Sign in online before visiting a site. Keep this screen open when offline; save each draft explicitly. After closing the app, reconnect and sign in to recover saved drafts. Photos and findings stay on this device until cleared; use a device you control.</p></details>
      {error && <p role="alert" className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800">{error}</p>}
      {notice && <p role="status" className="bg-emerald-50 p-4 rounded-lg text-emerald-800">{notice}</p>}
      {busy && <p role="status">Working…</p>}
      {!user ? <form className="bg-white border rounded-xl p-5 space-y-4" onSubmit={signIn}>
        <h2 className="text-xl font-semibold">Officer sign in</h2>
        {!configured && !loading && <details><summary>Connection setup</summary><label className="block mt-3">Server address<input required type="url" className={control} value={server} onChange={e => setServer(e.target.value)} /></label></details>}
        <label className="block">Username<input required name="username" autoComplete="username" className={control} /></label>
        <label className="block">Password<input required name="password" type="password" autoComplete="current-password" className={control} /></label>
        <button className={button} disabled={busy || !online || loading}>Sign in</button>
      </form> : <>
        <div className="flex flex-wrap justify-between gap-3"><p>{user.displayName}</p><button className="underline text-blue-700" disabled={busy} onClick={() => run(async () => {
          if (current?.dirty) await persist(current);
          try { if (online) await request(base, token, "/auth/logout", {method: "POST"}); }
          finally {setToken(""); setUser(null); setCurrent(null); setRows([]); setProjects([]);}
        })}>Sign out (keep local drafts)</button></div>
        <div className="grid gap-3">{rows.map(d => <button disabled={busy} key={d.key} className="rounded-xl bg-white border p-4 text-left" onClick={() => run(async () => { if (current?.dirty) await persist(current); setCurrent(d); })}>
          <strong>{projects.find(p => Number(p.id) === d.inspection.projectId)?.name || "Project " + d.inspection.projectId}</strong><p className="text-sm mt-1">Inspection #{d.inspection.id} · {d.inspection.status}{d.dirty ? " · Local changes" : ""}</p></button>)}</div>
        {!rows.length && <p>No inspections assigned. Your authority assigns them in the workspace.</p>}
        {current && <section className="rounded-xl bg-white border p-5 space-y-4">
          <h2 className="font-bold text-xl">Inspection #{current.inspection.id}</h2>
          {current.inspection.reviewNote && <p className="bg-amber-50 p-3">Reviewer: {current.inspection.reviewNote}</p>}
          <label className="block">Findings<textarea className={control} rows={5} maxLength={10000} disabled={busy || !editable.includes(current.inspection.status)} value={current.inspection.findings} onChange={e => update({...current, dirty: true, inspection: {...current.inspection, findings: e.target.value}})} /></label>
          <label className="block">Observed progress (%)<input className={control} type="number" min="0" max="100" disabled={busy || !editable.includes(current.inspection.status)} value={current.inspection.physicalProgressObservedPct ?? ""} onChange={e => update({...current, dirty: true, inspection: {...current.inspection, physicalProgressObservedPct: e.target.value === "" ? null : Number(e.target.value)}})} /></label>
          {editable.includes(current.inspection.status) && <>
            {["Site identity checked", "Reported progress checked", "Evidence reviewed"].map(label => <label key={label} className="flex gap-3"><input type="checkbox" disabled={busy} checked={!!current.inspection.checklist[label]} onChange={e => update({...current, dirty: true, inspection: {...current.inspection, checklist: {...current.inspection.checklist, [label]: e.target.checked}}})} />{label}</label>)}
            <label className="block">Add site photo (up to 8 MB)<input className={control} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy} onChange={e => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; if (f.size > 8*1024*1024) {setError("Choose a photo smaller than 8 MB."); return;} if (current.photos.length >= 10) {setError("Sync these photos before adding more."); return;} update({...current, dirty: true, photos: [...current.photos, {key: crypto.randomUUID(), file: f, caption: "Inspection #" + current.inspection.id}]}); }} /></label>
            {current.photos.map((p, n) => <div key={p.key} className="border rounded-lg p-3 text-sm space-y-2"><p>{p.file.name} · {p.evidenceId ? "Uploaded #" + p.evidenceId : "On this device"}</p>
              <label className="block">Caption<input className={control} disabled={busy || !!p.evidenceId} value={p.caption} onChange={e => update({...current, dirty: true, photos: current.photos.map((photo,index) => index === n ? {...photo, caption: e.target.value} : photo)})} /></label>
              <p>{p.lat === undefined ? "No GPS attached" : "Device GPS attached (not verified proof)"}</p>
              {!p.evidenceId && <button disabled={busy} className="underline text-blue-700" onClick={() => run(async () => {const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:15000})); update({...current,dirty:true,photos:current.photos.map((photo,index) => index===n ? {...photo,lat:pos.coords.latitude,lng:pos.coords.longitude} : photo)});})}>Attach current device location</button>}
            </div>)}
            <div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={() => run(async () => {await persist(current);setNotice("Draft saved on this device. It is not submitted yet.");})}>Save on device</button>
              <button className={button} disabled={busy || !online} onClick={() => run(() => sync(false))}>Sync draft</button>
              <button className={button} disabled={busy || !online} onClick={() => run(() => sync(true))}>Submit for review</button></div>
          </>}
          <p className="text-xs text-slate-500">{current.savedAt ? "Last device save: " + new Date(current.savedAt).toLocaleString() : "Not yet saved on device"}</p>
          <details className="text-sm"><summary>Resolve a version conflict</summary><p>Copy your local findings before replacing them. Reloading discards this inspection’s local draft and queued photos.</p><button className="underline text-blue-700" disabled={busy || !online} onClick={() => run(async () => { if (!window.confirm("Replace this local draft and queued photos with the server version?")) return; const i = await request<Inspection>(base, token, "/inspections/" + current.inspection.id); await persist({...current,inspection:i,photos:[],dirty:false}); })}>Reload from server</button></details>
        </section>}
        <button className="text-sm underline text-slate-600" disabled={busy} onClick={() => run(async () => {if (!window.confirm("Clear all saved findings and photos for this account from this device? Synced server records remain.")) return; await clearLocal(prefix); setCurrent(null); setRows([]); setUser(null); setToken(""); setNotice("Local records cleared. Sign in to reload assigned inspections.");})}>Clear this account’s device data and sign out</button>
      </>}
    </div>
  </main>;
}
