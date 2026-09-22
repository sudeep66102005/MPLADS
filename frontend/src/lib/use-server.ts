"use client";
import {useEffect, useState} from "react";
import {normalizeServer} from "./backend";

/** Public deployment configuration contains only an API origin, never a secret. */
export function useServer() {
  const [server,setServer] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || "");
  const [configured,setConfigured] = useState(!!process.env.NEXT_PUBLIC_API_BASE_URL);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),8000);
    async function load() {
      try {
        if(process.env.NEXT_PUBLIC_API_BASE_URL) return;
        const r=await fetch((process.env.NEXT_PUBLIC_BASE_PATH || "")+"/backend-config.json",{cache:"no-store",signal:controller.signal});
        const config=r.ok?await r.json():{};
        if(config.apiOrigin) {setServer(normalizeServer(config.apiOrigin));setConfigured(true);}
        else setServer(localStorage.getItem("mplads-api-origin") || "");
      } catch {setServer(localStorage.getItem("mplads-api-origin") || "");}
      finally {clearTimeout(timer);setLoading(false);}
    }
    load();return ()=>{clearTimeout(timer);controller.abort();};
  },[]);
  return {server,setServer,configured,loading};
}
