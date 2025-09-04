import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function Login() {
  const nav = useNavigate()
  const [form, setForm] = useState({ emailOrUsername:'', password:'' })
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const { data } = await api.post('/auth/login', form)
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
        <h3>Login</h3>
        {err && <p style={{color:'#ff6b6b'}}>{err}</p>}
        <form onSubmit={submit}>
          <input className="input" placeholder="Email or Username" value={form.emailOrUsername}
                 onChange={e => setForm({...form, emailOrUsername:e.target.value})} />
          <input className="input" placeholder="Password" type="password" value={form.password}
                 onChange={e => setForm({...form, password:e.target.value})} />
          <button className="btn">Login</button>
        </form>
      </div>
    </div>
  )
}
