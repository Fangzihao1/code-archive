"use client";
import {FormEvent,useState} from "react";import Link from "next/link";import {useRouter} from "next/navigation";import {createClient} from "@/lib/supabase/client";
export default function LoginPage(){
 const router=useRouter();const [mode,setMode]=useState<"signin"|"signup">("signin");
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState("");
 const [busy,setBusy]=useState(false),[demoBusy,setDemoBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
 async function enterDemo(){setError("");setMessage("");setDemoBusy(true);try{const response=await fetch("/api/demo-login",{method:"POST"});const result=await response.json();if(!response.ok)throw new Error(result.error||"体验登录失败");router.replace("/home");router.refresh();}catch(e:any){setError(e.message||"体验登录失败，请稍后重试。");}finally{setDemoBusy(false);}}
 async function submit(e:FormEvent){e.preventDefault();setError("");setMessage("");setBusy(true);
 if(mode==="signup"&&password!==confirm){setBusy(false);setError("两次输入的密码不一致。");return;}
 try{const sb=createClient();if(mode==="signup"){const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:`${window.location.origin}/auth/callback?next=/home`}});if(error)throw error;if(data.session)router.replace("/home");else setMessage("注册成功！请查看邮箱并点击验证链接，然后登录。");}
 else{const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;router.replace("/home");router.refresh();}}
 catch(e:any){setError(e.message||"操作失败，请稍后重试。");}finally{setBusy(false);}}
 return <main className="auth-screen"><div className="auth-orbit auth-orbit-one"/><div className="auth-orbit auth-orbit-two"/><section className="auth-card">
 <Link href="/login" className="auth-brand">CODE ARCHIVE <span>/ PYTHON</span></Link><div className="auth-eyebrow"><i/> PRIVATE LEARNING SPACE</div>
 <h1>{mode==="signin"?"欢迎回来":"创建你的学习账号"}<span>。</span></h1><p className="auth-copy">{mode==="signin"?"登录后继续探索 Python 学习档案。":"注册个人账号，开启你的代码收藏之旅。"}</p>
 <form onSubmit={submit} className="auth-form"><label>邮箱地址<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label>
 <label>密码<input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="至少 6 位字符"/></label>
 {mode==="signup"&&<label>确认密码<input type="password" required minLength={6} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="再次输入密码"/></label>}
 {error&&<div className="auth-alert auth-error">{error}</div>}{message&&<div className="auth-alert auth-success">{message}</div>}
 <button className="auth-submit" disabled={busy}>{busy?"请稍候…":mode==="signin"?"登录作品集":"创建账号"} <span>↗</span></button></form>
 <div className="auth-switch">{mode==="signin"?"还没有账号？":"已经拥有账号？"} <button onClick={()=>{setMode(mode==="signin"?"signup":"signin");setError("");setMessage("");}}>{mode==="signin"?"立即注册":"返回登录"}</button></div>
 {mode==="signin"&&<div className="auth-demo"><div><strong>想先体验网站？</strong><span>使用公共体验账号，无需注册。</span></div><button type="button" onClick={enterDemo} disabled={demoBusy}>{demoBusy?"正在进入…":"进入体验账号 ↗"}</button></div>}
 <div className="auth-foot">SECURE ACCESS · CODE ARCHIVE © 2026</div>
 </section></main>;
}
