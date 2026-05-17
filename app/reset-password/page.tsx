'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password/confirm`,
    })

    if (resetError) {
      setError('エラーが発生しました。もう一度お試しください。')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">リセットメールを送信しました</h2>
          <p className="text-gray-500 text-sm">
            <span className="font-medium text-gray-700">{email}</span> に<br />
            パスワードリセット用のメールをお送りしました。<br />
            メール内のリンクをクリックして新しいパスワードを設定してください。
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 text-rose-500 text-sm font-medium hover:underline"
          >
            ログイン画面に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">パスワードをリセット</h1>
          <p className="text-gray-500 text-sm mt-2">登録したメールアドレスを入力してください</p>
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

          {error && <p className="text-rose-500 text-sm bg-rose-50 rounded-xl px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-600 disabled:opacity-50 transition-colors"
          >
            {loading ? '送信中...' : 'リセットメールを送る'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
          >
            ログイン画面に戻る
          </button>
        </div>
      </div>
    </div>
  )
}