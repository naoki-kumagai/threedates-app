'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('メールアドレスまたはパスワードが正しくありません')
    } else {
      router.push('/mypage')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">スリーデート</h1>
          <p className="text-gray-500 text-sm mt-2">ログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="example@email.com"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="パスワードを入力"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {error && <p className="text-rose-500 text-sm bg-rose-50 rounded-xl px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <button
            onClick={() => router.push('/reset-password')}
            className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
          >
            パスワードを忘れた方
          </button>
          <p className="text-sm text-gray-500">
            アカウントをお持ちでない方は
            <button onClick={() => router.push('/register')} className="text-rose-500 font-medium ml-1 hover:underline">
              会員登録
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}