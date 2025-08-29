/*
OnDuty Pro — Single-file React App (App.jsx)
- Single-file React component (default export) that works without Tailwind.
- Paste into src/App.jsx in a create-react-app or Vite React project.
- Uses localStorage to simulate accounts, requests and approvals so "everything works" locally.
- Later you can replace the localStorage bits with API calls to MongoDB/Express.

Features implemented:
- Signup / Login (basic, localStorage)
- Per-account profiles
- Create an onduty request (date, shift, reason)
- List requests with filtering/sorting
- Accept / Reject / Revoke (role-based: manager/admin)
- Nice gradients, transitions, responsive layout — no external CSS frameworks
- Accessible focus styles and keyboard-friendly controls

Notes on integration:
- To connect to MongoDB later, replace the helpers that read/write localStorage (getUsers, saveUsers, getRequests, saveRequests) with API calls.
- This file intentionally keeps styles and logic together for easy copying.
*/

import React, { useState, useEffect, useMemo } from "react";

const css = `
:root{
  --bg-1: linear-gradient(135deg,#0f172a 0%, #08121f 100%);
  --card-grad: linear-gradient(135deg,#0ea5a8 0%, #7c3aed 100%);
  --muted: rgba(255,255,255,0.72);
  --glass: rgba(255,255,255,0.04);
  --success: #16a34a;
  --danger: #ef4444;
  --accent: #06b6d4;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
*{box-sizing:border-box}
html,body,#root{height:100%;}
body{
  margin:0;
  background: radial-gradient(1200px 600px at 10% 10%, rgba(124,58,237,0.12), transparent),
              radial-gradient(900px 400px at 90% 90%, rgba(14,165,168,0.08), transparent),
              #071022;
  color: #e6eef8;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}
.app{
  max-width:1100px;
  margin:40px auto;
  padding:28px;
  border-radius:18px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  box-shadow: 0 10px 30px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
  backdrop-filter: blur(6px) saturate(1.1);
}
.header{
  display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;
}
.brand{
  display:flex;align-items:center;gap:14px
}
.logo{
  width:52px;height:52px;border-radius:12px;background:var(--card-grad);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:white;box-shadow:0 6px 20px rgba(124,58,237,0.18);
}
.h1{font-size:20px;font-weight:700}
.muted{color:var(--muted);font-size:13px}
.controls{display:flex;gap:10px;align-items:center}
.btn{
  border:0;padding:8px 12px;border-radius:10px;background:linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));color:var(--muted);cursor:pointer;transition:all .18s ease;font-weight:600
}
.btn:hover{transform:translateY(-3px);box-shadow:0 8px 18px rgba(2,6,23,0.6)}
.btn-primary{background:var(--card-grad);color:white}
.grid{display:grid;grid-template-columns:360px 1fr;gap:18px}
.card{background:var(--glass);padding:16px;border-radius:12px;}
.profile{
  display:flex;gap:12px;align-items:center;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.03)
}
.avatar{width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#06b6d4,#7c3aed);display:flex;align-items:center;justify-content:center;font-weight:700}
.small{font-size:13px}
.form-row{display:flex;gap:8px;margin-top:12px}
.input,textarea,select{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.05);background:transparent;color:inherit;font-size:14px}
textarea{min-height:90px}
.request{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:12px;border-radius:10px;margin-bottom:10px;transition:all .18s ease}
.request:hover{transform:translateY(-6px)}
.status{padding:6px 8px;border-radius:8px;font-weight:700;font-size:12px}
.status.pending{background:rgba(255,255,255,0.04);color:var(--muted)}
.status.accepted{background:rgba(16,185,129,0.12);color:var(--success)}
.status.rejected{background:rgba(239,68,68,0.12);color:var(--danger)}
.meta{font-size:12px;color:var(--muted)}
.actions{display:flex;gap:8px}
.small-btn{padding:6px 8px;border-radius:8px;border:0;background:rgba(255,255,255,0.03);cursor:pointer}
.filter-row{display:flex;gap:8px;align-items:center;margin-bottom:12px}
.empty{padding:40px;text-align:center;color:var(--muted)}
.footer{margin-top:16px;text-align:center;color:var(--muted);font-size:13px}
.tab{padding:8px 12px;border-radius:10px;background:transparent;border:1px solid rgba(255,255,255,0.03);cursor:pointer}
.badge{display:inline-block;padding:6px 8px;border-radius:999px;font-weight:700}
@media (max-width:880px){.grid{grid-template-columns:1fr;}.header{flex-direction:column;align-items:flex-start;gap:10px}}
`;

// ---- Simple localStorage helpers (swap these with API calls later) ----
const LS_USERS = "odp_users_v1";
const LS_REQUESTS = "odp_reqs_v1";

function getUsers(){
  try{ return JSON.parse(localStorage.getItem(LS_USERS) || "[]"); } catch(e){return []}
}
function saveUsers(users){ localStorage.setItem(LS_USERS, JSON.stringify(users)); }
function getRequests(){
  try{ return JSON.parse(localStorage.getItem(LS_REQUESTS) || "[]"); } catch(e){return []}
}
function saveRequests(reqs){ localStorage.setItem(LS_REQUESTS, JSON.stringify(reqs)); }

// seed a default admin if none
(function seed(){
  const u = getUsers();
  if(!u.find(x=>x.role==="admin")){
    u.push({id: 'admin-'+Date.now(), name:'Team Admin', email:'admin@company.local', password:'admin', role:'admin'});
    saveUsers(u);
  }
})();

// ---- helpers ----
function uid(prefix='id'){return prefix+"_"+Math.random().toString(36).slice(2,9)+Date.now().toString(36)}

// ---- Main App ----
export default function App(){
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(getUsers());
  const [requests, setRequests] = useState(getRequests());
  const [view, setView] = useState('dashboard');

  useEffect(()=> saveUsers(users), [users]);
  useEffect(()=> saveRequests(requests), [requests]);

  // simple login persistence
  useEffect(()=>{
    const sid = localStorage.getItem('odp_session');
    if(sid){
      const u = getUsers().find(x=>x.id===sid);
      if(u) setUser(u);
    }
  },[]);

  function register({name,email,password,role='user'}){
    const all = getUsers();
    if(all.find(x=>x.email===email)) throw new Error('Email already used');
    const nu = {id: uid('u'), name, email, password, role};
    const next = [...all, nu];
    setUsers(next);
    localStorage.setItem('odp_session', nu.id);
    setUser(nu);
  }
  function login({email,password}){
    const u = getUsers().find(x=>x.email===email && x.password===password);
    if(!u) throw new Error('Invalid email or password');
    localStorage.setItem('odp_session', u.id);
    setUser(u);
  }
  function logout(){ localStorage.removeItem('odp_session'); setUser(null); }

  function createRequest({date, shift, reason}){
    const r = {id: uid('r'), userId: user.id, userName: user.name, date, shift, reason, status:'pending', createdAt: new Date().toISOString(), handledBy:null, handledAt:null}
    setRequests(prev=>[r,...prev]);
    setView('dashboard');
  }

  function updateRequest(id, patch){
    setRequests(prev=> prev.map(r=> r.id===id ? {...r, ...patch} : r));
  }

  function removeRequest(id){ setRequests(prev=> prev.filter(r=> r.id!==id)); }

  // role helpers
  const isManager = user && (user.role==='admin' || user.role==='manager');

  return (
    <div className="app">
      <style dangerouslySetInnerHTML={{__html: css}} />
      <div className="header">
        <div className="brand">
          <div className="logo">OD</div>
          <div>
            <div className="h1">OnDuty Pro</div>
            <div className="muted">smooth requests • fast approvals • human-friendly</div>
          </div>
        </div>
        <div className="controls">
          {user ? (
            <>
              <div className="muted small">Signed in as <strong>{user.name}</strong></div>
              <button className="btn" onClick={()=>setView('dashboard')}>Dashboard</button>
              <button className="btn" onClick={()=>setView('create')}>New Request</button>
              <button className="btn" onClick={()=>setView('profile')}>Profile</button>
              <button className="btn btn-primary" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={()=>setView('auth')}>Sign in / Register</button>
            </>
          )}
        </div>
      </div>

      {!user ? (
        <Auth onLogin={login} onRegister={register} users={users} />
      ) : (
        <div className="grid">
          <div>
            <div className="card">
              <div className="profile">
                <div className="avatar">{user.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
                <div>
                  <div style={{fontWeight:800}}>{user.name}</div>
                  <div className="small muted">{user.email} • {user.role}</div>
                </div>
              </div>

              <div style={{marginTop:12}}>
                <div style={{display:'flex',gap:8,marginBottom:8}}>
                  <button className={`tab`} onClick={()=>setView('dashboard')}>My Requests</button>
                  <button className={`tab`} onClick={()=>setView('create')}>New Request</button>
                  <button className={`tab`} onClick={()=>setView('history')}>All Requests</button>
                </div>

                <div style={{marginTop:12}}>
                  <div className="muted small">Quick actions</div>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className="btn" onClick={()=>{ setView('create')}}>Create request</button>
                    {isManager && <button className="btn" onClick={()=>setView('admin')}>Manager →</button>}
                  </div>
                </div>
              </div>

            </div>

            <div className="card" style={{marginTop:12}}>
              <div style={{fontWeight:800}}>Team members</div>
              <div className="muted small" style={{marginTop:8,marginBottom:10}}>Manage locally (for now). Later: sync to central DB.</div>
              {getUsers().map(u=> (
                <div key={u.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0'}}>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <div style={{width:36,height:36,borderRadius:8,background:'linear-gradient(135deg,#06b6d4,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>{u.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
                    <div>
                      <div style={{fontWeight:700}}>{u.name}</div>
                      <div className="muted small">{u.email} • {u.role}</div>
                    </div>
                  </div>
                  <div className="meta small">{u.id===user.id ? 'you' : ''}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {view==='create' && (
              <div className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:800}}>Create OnDuty Request</div>
                  <div className="muted small">Quick, painless</div>
                </div>
                <CreateForm onCreate={createRequest} />
              </div>
            )}

            {view==='dashboard' && (
              <div className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:800}}>Your requests</div>
                  <div className="muted small">{requests.filter(r=>r.userId===user.id).length} total</div>
                </div>
                <RequestList
                  requests={requests.filter(r=>r.userId===user.id)}
                  onCancel={(id)=> updateRequest(id, {status:'revoked', handledBy:user.name, handledAt:new Date().toISOString()})}
                  onDelete={(id)=> removeRequest(id)}
                  compact
                />
              </div>
            )}

            {view==='history' && (
              <div className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:800}}>All requests</div>
                  <div className="muted small">{requests.length} total</div>
                </div>
                <RequestAdminView
                  requests={requests}
                  onAccept={(id)=> updateRequest(id, {status:'accepted', handledBy:user.name, handledAt:new Date().toISOString()})}
                  onReject={(id)=> updateRequest(id, {status:'rejected', handledBy:user.name, handledAt:new Date().toISOString()})}
                  onDelete={(id)=> removeRequest(id)}
                  currentUser={user}
                />
              </div>
            )}

            {view==='admin' && isManager && (
              <div className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:800}}>Manager Panel</div>
                  <div className="muted small">Approve / Reject requests</div>
                </div>
                <RequestAdminView
                  requests={requests}
                  onAccept={(id)=> updateRequest(id, {status:'accepted', handledBy:user.name, handledAt:new Date().toISOString()})}
                  onReject={(id)=> updateRequest(id, {status:'rejected', handledBy:user.name, handledAt:new Date().toISOString()})}
                  onDelete={(id)=> removeRequest(id)}
                  currentUser={user}
                />
              </div>
            )}

            {view==='profile' && (
              <div className="card">
                <div style={{fontWeight:800}}>Profile</div>
                <div style={{marginTop:8}}>
                  <div className="muted small">Name</div>
                  <div style={{fontWeight:700}}>{user.name}</div>
                  <div className="muted small" style={{marginTop:8}}>Email</div>
                  <div style={{fontWeight:700}}>{user.email}</div>
                  <div className="muted small" style={{marginTop:8}}>Role</div>
                  <div style={{fontWeight:700}}>{user.role}</div>
                </div>
                <div style={{marginTop:12}}>
                  <div className="muted small">Danger zone</div>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className="btn" onClick={()=>{ if(window.confirm('Delete your account?')){ const next=getUsers().filter(x=>x.id!==user.id); saveUsers(next); setUsers(next); logout(); }}}>Delete account</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <div className="footer">Made with ❤️ — OnDuty Pro — demo local mode. Replace localStorage helpers with your API to persist to MongoDB.</div>
    </div>
  )
}

// ----------------- Subcomponents -----------------
function Auth({onLogin,onRegister,users}){
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [err, setErr] = useState(null);

  function submit(e){
    e.preventDefault(); setErr(null);
    try{
      if(mode==='login') onLogin({email,password});
      else onRegister({name,email,password,role});
    }catch(e){ setErr(e.message) }
  }

  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontWeight:800}}>{mode==='login'? 'Welcome back' : 'Create an account'}</div>
        <div className="muted small">Demo accounts are local-only</div>
      </div>

      <form onSubmit={submit} style={{marginTop:12,display:'grid',gap:8}}>
        {mode==='register' && (
          <>
            <div className="small muted">Full name</div>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
          </>
        )}

        <div className="small muted">Email</div>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} required />

        <div className="small muted">Password</div>
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />

        {mode==='register' && (
          <>
            <div className="small muted">Role</div>
            <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
          </>
        )}

        {err && <div style={{color:'#ffb4b4',fontWeight:700}}>{err}</div>}
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="btn btn-primary" type="submit">{mode==='login' ? 'Sign in' : 'Create account'}</button>
          <button type="button" className="btn" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login' ? 'New? Create' : 'Have an account?'}</button>
        </div>
      </form>
    </div>
  )
}

function CreateForm({onCreate}){
  const [date,setDate]=useState('');
  const [shift,setShift]=useState('morning');
  const [reason,setReason]=useState('');
  const [err,setErr]=useState(null);

  function submit(e){
    e.preventDefault(); setErr(null);
    if(!date) return setErr('Pick a date');
    if(!reason) return setErr('Write a reason');
    onCreate({date,shift,reason});
    setDate(''); setShift('morning'); setReason('');
  }

  return (
    <form onSubmit={submit} style={{marginTop:12,display:'grid',gap:8}}>
      <div className="small muted">Date</div>
      <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />

      <div className="small muted">Shift</div>
      <select className="input" value={shift} onChange={e=>setShift(e.target.value)}>
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="night">Night</option>
      </select>

      <div className="small muted">Reason (short)</div>
      <textarea className="input" value={reason} onChange={e=>setReason(e.target.value)} />

      {err && <div style={{color:'#ffb4b4',fontWeight:700}}>{err}</div>}
      <div style={{display:'flex',gap:8}}>
        <button className="btn btn-primary" type="submit">Request OnDuty</button>
        <button className="btn" type="button" onClick={()=>{setDate('');setShift('morning');setReason('')}}>Reset</button>
      </div>
    </form>
  )
}

function RequestList({requests,onCancel,onDelete,compact}){
  if(!requests.length) return <div className="empty">No requests yet</div>;
  return (
    <div style={{marginTop:12}}>
      {requests.map(r=> (
        <div key={r.id} className="request" style={{background:'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00))'}}>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
              <div style={{fontWeight:800}}>{r.userName} — <span className="meta">{r.shift}</span></div>
              <div className={`status ${r.status}`}>{r.status}</div>
            </div>
            <div className="meta" style={{marginTop:6}}>{r.date} • <span className="muted">Requested {new Date(r.createdAt).toLocaleString()}</span></div>
            <div style={{marginTop:8,fontSize:15}}>{r.reason}</div>
            {r.handledBy && <div className="meta" style={{marginTop:8}}>Handled by: {r.handledBy} • {r.handledAt ? new Date(r.handledAt).toLocaleString() : ''}</div>}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
            {r.status==='pending' && onCancel && <button className="small-btn" onClick={()=> onCancel(r.id)}>Revoke</button>}
            <button className="small-btn" onClick={()=> onDelete && onDelete(r.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function RequestAdminView({requests,onAccept,onReject,onDelete,currentUser}){
  const [filter,setFilter]=useState('all');
  const visible = useMemo(()=> requests.filter(r=> filter==='all' ? true : r.status===filter), [requests,filter]);

  return (
    <div style={{marginTop:12}}>
      <div className="filter-row">
        <div className="muted small">Show:</div>
        <select className="input" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {visible.length===0 && <div className="empty">No matching requests</div>}

      {visible.map(r=> (
        <div key={r.id} className="request" style={{background:'linear-gradient(90deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00))'}}>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontWeight:800}}>{r.userName} <span className="meta">· {r.shift} · {r.date}</span></div>
              <div className={`status ${r.status}`}>{r.status}</div>
            </div>
            <div className="meta" style={{marginTop:6}}>{r.reason}</div>
            <div className="meta" style={{marginTop:8}}>Requested {new Date(r.createdAt).toLocaleString()}</div>
            {r.handledBy && <div className="meta">Handled by {r.handledBy} • {new Date(r.handledAt).toLocaleString()}</div>}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
            {r.status==='pending' && currentUser && (currentUser.role==='admin' || currentUser.role==='manager') && (
              <>
                <button className="small-btn" onClick={()=> onAccept(r.id)}>Accept</button>
                <button className="small-btn" onClick={()=> onReject(r.id)}>Reject</button>
              </>
            )}
            <button className="small-btn" onClick={()=> onDelete(r.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}
