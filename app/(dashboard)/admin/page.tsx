'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/layout/PageShell'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { UserPlus, Check, X, Trash2, Copy, Users, Inbox, Eye, EyeOff } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  padding: '10px 14px',
  color: 'white',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const qc = useQueryClient()

  const [tab, setTab] = useState<'requests' | 'users'>('requests')
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'analyst' })
  const [showPw, setShowPw] = useState(false)
  const [approvedUser, setApprovedUser] = useState<{ email: string; tempPassword: string } | null>(null)
  const [addError, setAddError] = useState('')

  // Guard: admin only
  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router])

  const { data: requests = [], isLoading: reqLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: () => fetch('/api/admin/requests').then(r => r.json()),
    enabled: tab === 'requests',
  })

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetch('/api/admin/users').then(r => r.json()),
    enabled: tab === 'users',
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => fetch('/api/admin/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'approve' }),
    }).then(r => r.json()),
    onSuccess: (data) => {
      if (data.tempPassword) setApprovedUser({ email: data.email, tempPassword: data.tempPassword })
      qc.invalidateQueries({ queryKey: ['admin-requests'] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => fetch('/api/admin/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'reject' }),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-requests'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const addUserMutation = useMutation({
    mutationFn: () => fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).then(r => r.json()),
    onSuccess: (data) => {
      if (data.error) { setAddError(data.error); return }
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setNewUser({ name: '', email: '', password: '', role: 'analyst' })
      setShowAddUser(false)
      setAddError('')
    },
  })

  const pending = Array.isArray(requests) ? requests.filter((r: any) => r.status === 'pending') : []
  const allRequests = Array.isArray(requests) ? requests : []
  const allUsers = Array.isArray(users) ? users : []

  if (status === 'loading') return null

  return (
    <PageShell
      title="Admin Panel"
      description="Manage team access and user accounts"
    >
      {/* Approved user modal */}
      {approvedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl p-8 w-full max-w-sm" style={{ background: '#0D0D0D', border: '1px solid rgba(97,209,220,0.2)' }}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(97,209,220,0.1)' }}>
                <Check size={22} style={{ color: '#61D1DC' }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">User Approved</h3>
              <p className="text-xs text-gray-500">Share these credentials with {approvedUser.email}</p>
            </div>
            <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: 'rgba(97,209,220,0.05)', border: '1px solid rgba(97,209,220,0.1)' }}>
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Email</div>
                <div className="text-sm text-white font-mono">{approvedUser.email}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Temporary Password</div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-white font-mono flex-1">{approvedUser.tempPassword}</div>
                  <button onClick={() => navigator.clipboard.writeText(approvedUser.tempPassword)} className="text-gray-600 hover:text-white transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-4 text-center">Ask the user to change their password after first login.</p>
            <button
              onClick={() => setApprovedUser(null)}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-black"
              style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Add User modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl p-8 w-full max-w-sm" style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-white">Add User</h3>
              <button onClick={() => { setShowAddUser(false); setAddError('') }} className="text-gray-600 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-gray-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input style={inputStyle} value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = 'rgba(97,209,220,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  placeholder="Full name" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-600 mb-1.5 uppercase tracking-wider">Email</label>
                <input style={inputStyle} type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = 'rgba(97,209,220,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  placeholder="user@riceberg.vc" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-600 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input style={{ ...inputStyle, paddingRight: '40px' }} type={showPw ? 'text' : 'password'} value={newUser.password}
                    onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = 'rgba(97,209,220,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    placeholder="Temporary password" />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-600 mb-1.5 uppercase tracking-wider">Role</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                  <option value="analyst">Analyst</option>
                  <option value="partner">Partner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {addError && (
                <div className="rounded-xl px-3 py-2 text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  {addError}
                </div>
              )}
              <button
                onClick={() => addUserMutation.mutate()}
                disabled={!newUser.name || !newUser.email || !newUser.password || addUserMutation.isPending}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-black mt-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
              >
                {addUserMutation.isPending ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 max-w-5xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl p-5" style={{ background: 'rgba(97,209,220,0.05)', border: '1px solid rgba(97,209,220,0.1)' }}>
            <div className="text-xs text-gray-500 mb-1">Total Users</div>
            <div className="text-2xl font-bold text-white">{allUsers.length}</div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,110,66,0.05)', border: '1px solid rgba(255,110,66,0.1)' }}>
            <div className="text-xs text-gray-500 mb-1">Pending Requests</div>
            <div className="text-2xl font-bold text-white">{pending.length}</div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-xs text-gray-500 mb-1">Total Requests</div>
            <div className="text-2xl font-bold text-white">{allRequests.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { id: 'requests', label: 'Access Requests', icon: Inbox, count: pending.length },
              { id: 'users', label: 'Users', icon: Users },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={tab === t.id ? { background: 'rgba(97,209,220,0.1)', color: '#61D1DC' } : { color: 'rgba(255,255,255,0.4)' }}
              >
                <t.icon size={14} />
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-black font-bold" style={{ background: '#FF6E42' }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          {tab === 'users' && (
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-black"
              style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
            >
              <UserPlus size={14} />
              Add User
            </button>
          )}
        </div>

        {/* Access Requests */}
        {tab === 'requests' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <span className="text-xs font-medium text-gray-400">All Requests</span>
              <span className="text-[10px] text-gray-700 ml-auto">{allRequests.length} total</span>
            </div>
            {reqLoading ? (
              <div className="p-8 text-center text-sm text-gray-600 animate-pulse">Loading...</div>
            ) : allRequests.length === 0 ? (
              <div className="p-10 text-center">
                <Inbox size={28} className="mx-auto mb-3 text-gray-700" />
                <p className="text-sm text-gray-600">No access requests yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {allRequests.map((req: any) => (
                  <div key={req.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #61D1DC, #B4E9E9)' }}>
                      {req.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{req.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                          req.status === 'pending' ? 'text-orange-400 bg-orange-400/10' :
                          req.status === 'approved' ? 'text-green-400 bg-green-400/10' :
                          'text-red-400 bg-red-400/10'
                        }`}>{req.status}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">{req.email}{req.company ? ` · ${req.company}` : ''}</div>
                      {req.message && <div className="text-xs text-gray-700 mt-1 truncate max-w-md">{req.message}</div>}
                    </div>
                    <div className="text-[10px] text-gray-700 flex-shrink-0">
                      {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => approveMutation.mutate(req.id)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-black disabled:opacity-50 transition-all"
                          style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
                          title="Approve"
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(req.id)}
                          disabled={rejectMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                          title="Reject"
                        >
                          <X size={12} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <span className="text-xs font-medium text-gray-400">Team Members</span>
              <span className="text-[10px] text-gray-700 ml-auto">{allUsers.length} users</span>
            </div>
            {usersLoading ? (
              <div className="p-8 text-center text-sm text-gray-600 animate-pulse">Loading...</div>
            ) : allUsers.length === 0 ? (
              <div className="p-10 text-center">
                <Users size={28} className="mx-auto mb-3 text-gray-700" />
                <p className="text-sm text-gray-600">No users found</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {allUsers.map((user: any) => (
                  <div key={user.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #61D1DC, #B4E9E9)' }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{user.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                          user.role === 'admin' ? 'text-cyan-400 bg-cyan-400/10' :
                          user.role === 'partner' ? 'text-purple-400 bg-purple-400/10' :
                          'text-gray-400 bg-white/5'
                        }`}>{user.role}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">{user.email}</div>
                    </div>
                    <div className="text-[10px] text-gray-700 flex-shrink-0">
                      Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {user.id !== 'admin-001' && (
                      <button
                        onClick={() => { if (confirm(`Remove ${user.name}?`)) deleteMutation.mutate(user.id) }}
                        className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Remove user"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  )
}
