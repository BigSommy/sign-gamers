'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FaUsers, FaCrown, FaShieldAlt, FaGamepad, FaUser, FaSearch, FaEdit } from 'react-icons/fa'
import { UserProfile } from '@/types/database'
import BlogAdmin from './BlogAdmin'
import MediaUpload from './MediaUpload'

interface UserWithRoles extends UserProfile {
  roles: string[]
  email?: string
}

export default function AdminPage() {
  // Simple password gate (public page)
  const [auth, setAuth] = useState(false)
  const [passInput, setPassInput] = useState('')

  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sg_admin_auth') : null
    if (stored === 'true') setAuth(true)
  }, [])

  useEffect(() => {
    if (auth) fetchUsers()
  }, [auth])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passInput })
      })
      const data = await res.json()
      if (data.success) {
        setAuth(true)
        localStorage.setItem('sg_admin_auth', 'true')
      } else {
        alert('Wrong password')
      }
    } catch {
      alert('Error connecting to server.')
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load users')
      }
      const profiles: any[] = data.profiles || []
      const roles: any[] = data.roles || []
      // Group roles by user_id for fast lookup
      const rolesByUserId: Record<string, string[]> = {}
      for (const r of roles) {
        if (!rolesByUserId[r.user_id]) rolesByUserId[r.user_id] = []
        rolesByUserId[r.user_id].push(r.role)
      }
      const usersWithRoles: UserWithRoles[] = profiles.map((p) => ({
        ...(p as any),
        roles: rolesByUserId[p.user_id] || []
      }))
      setUsers(usersWithRoles)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, role: string, action: 'add' | 'remove') => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, user_id: userId, role })
      })
      const data = await res.json()
      if (!res.ok) {
        console.error('Error updating role via server:', data)
        alert('Failed to update role: ' + (data?.error?.message || JSON.stringify(data)))
        return
      }
      fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <FaCrown className="text-yellow-400" />
      case 'moderator':
        return <FaShieldAlt className="text-blue-400" />
      case 'game_host':
        return <FaGamepad className="text-green-400" />
      default:
        return <FaUser className="text-gray-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-500 text-white'
      case 'moderator':
        return 'bg-blue-500 text-white'
      case 'game_host':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Password gate
  if (!auth) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#18181b] text-white">
        <form
          onSubmit={(e) => { e.preventDefault(); checkAuth(); }}
          className="bg-[#222] p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-orange-400/30"
        >
          <h2 className="text-2xl font-bold text-orange-400 mb-2">Admin Login</h2>
          <input
            type="password"
            value={passInput}
            onChange={e => setPassInput(e.target.value)}
            placeholder="Enter admin password"
            className="px-4 py-2 rounded bg-[#18181b] border border-orange-400/40 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            className="super-btn bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-lg font-bold mt-2"
          >
            Login
          </button>
        </form>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#18181b] pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FaCrown className="text-yellow-400" />
            Admin Panel
          </h1>
          <p className="text-gray-400">Manage users and roles</p>
        </div>

        <div className="bg-[#222] rounded-xl shadow-2xl p-6 border border-orange-400/20 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by username or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#18181b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="bg-[#222] rounded-xl shadow-2xl border border-orange-400/20 overflow-hidden">
          <div className="p-6 border-b border-gray-600">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaUsers className="text-orange-400" />
              Users ({filteredUsers.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-gray-300">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#18181b]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Roles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {filteredUsers.map((u) => (
                    <tr key={u.user_id} className="hover:bg-[#18181b] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-400/20 rounded-full flex items-center justify-center">
                            <FaUser className="text-orange-400" />
              </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{u.username}</div>
                            <div className="text-sm text-gray-400">{u.bio ? u.bio.substring(0, 50) + '...' : 'No bio'}</div>
              </div>
          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {u.roles.map((role) => (
                            <span key={role} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                              {getRoleIcon(role)}
                              <span className="ml-1">{role}</span>
                            </span>
                          ))}
                          {u.roles.length === 0 && <span className="text-gray-400 text-sm">No roles</span>}
            </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button
                          onClick={() => { setSelectedUser(u); setIsEditing(true) }}
                          className="text-orange-400 hover:text-orange-300 mr-3"
            >
                          <FaEdit className="text-sm" />
            </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>

        {/* Blog and Media admin tools */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <BlogAdmin />
          <MediaUpload />
        </div>

        {isEditing && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#222] rounded-xl shadow-2xl p-6 border border-orange-400/20 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-white mb-4">Manage Roles: {selectedUser.username}</h3>
              <div className="space-y-4">
                {['admin', 'moderator', 'game_host', 'user'].map((role) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role)}
                      <span className="text-white capitalize">{role}</span>
            </div>
                <button
                      onClick={() => {
                        const hasRole = selectedUser.roles.includes(role)
                        updateUserRole(selectedUser.user_id, role, hasRole ? 'remove' : 'add')
                      }}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedUser.roles.includes(role) ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                      {selectedUser.roles.includes(role) ? 'Remove' : 'Add'}
              </button>
          </div>
        ))}
      </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => { setIsEditing(false); setSelectedUser(null) }} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

