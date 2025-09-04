import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function Signup() {
  const nav = useNavigate()
  const [form, setForm] = useState({ username:'', email:'', password:'', role:'user' })
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const { data } = await api.post('/auth/signup', form)
      localStorage.setItem('token', data.token)
      if (data.user.role === 'astrologer') nav('/dashboard/astrologer')
      else nav('/dashboard/user')
    } catch (e) {
      setErr(e?.response?.data?.error || e.message)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h3>Signup</h3>
        {err && <p style={{color:'#ff6b6b'}}>{err}</p>}
        <form onSubmit={submit}>
          <input className="input" placeholder="Username" value={form.username}
                 onChange={e => setForm({...form, username:e.target.value})} />
          <input className="input" placeholder="Email" value={form.email}
                 onChange={e => setForm({...form, email:e.target.value})} />
          <input className="input" placeholder="Password" type="password" value={form.password}
                 onChange={e => setForm({...form, password:e.target.value})} />
          <select className="input" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
            <option value="user">User</option>
            <option value="astrologer">Astrologer</option>
          </select>
          <button className="btn">Create account</button>
        </form>
      </div>
    </div>
  )
}
