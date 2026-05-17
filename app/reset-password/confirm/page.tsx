'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordConfirmPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      setError('パスワードの更新に失敗しました。もう一度お試しください。')
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">パスワードを更新しました</h2>
          <p className="text-gray-500 text-sm mb-6">新しいパスワードでログインしてください</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-rose-500 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-600 transition-colors"
          >
            ログイン画面へ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">新しいパスワードを設定</h1>
          <p className="text-gray-500 text-sm mt-2">新しいパスワードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="8文字以上"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（確認）</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => { setPasswordConfirm(e.target.value); setError('') }}
              placeholder="もう一度入力してください"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            {password && passwordConfirm && password !== passwordConfirm && (
              <p className="text-rose-500 text-xs mt-1">パスワードが一致しません</p>
            )}
          </div>

          {error && <p className="text-rose-500 text-sm bg-rose-50 rounded-xl px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-600 disabled:opacity-50 transition-colors"
          >
            {loading ? '更新中...' : 'パスワードを更新する'}
          </button>
        </form>
      </div>
    </div>
  )
}