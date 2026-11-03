import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
export async function createClient() {
 const store=cookies(), url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key) throw new Error("Missing Supabase environment variables");
 return createServerClient(url,key,{cookies:{
  get(name:string){return store.get(name)?.value;},
  set(name:string,value:string,options:any){try{store.set({name,value,...options});}catch{}},
  remove(name:string,options:any){try{store.set({name,value:"",...options});}catch{}}
 }});
}
