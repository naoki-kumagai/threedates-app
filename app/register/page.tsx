'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const validate = () => {
    if (!email.includes('@')) {
      setError('正しいメールアドレスを入力してください')
      return false
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return false
    }
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/register/profile`,
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('このメールアドレスは既に登録されています。ログインしてください。')
      } else {
        setError('エラーが発生しました。もう一度お試しください。')
      }
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">確認メールを送信しました</h2>
          <p className="text-gray-500 text-sm">
            <span className="font-medium text-gray-700">{email}</span> に<br />
            確認メールをお送りしました。<br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <p className="text-xs text-gray-400 mt-4">メールが届かない場合は迷惑メールフォルダもご確認ください</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">スリーデート</h1>
          <p className="text-gray-500 text-sm mt-2">3回のデートで、本当の出会いを。</p>
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
            {loading ? '登録中...' : '会員登録する'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            すでにアカウントをお持ちの方は
            <button onClick={() => router.push('/login')} className="text-rose-500 font-medium ml-1 hover:underline">
              ログイン
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          登録することで利用規約・プライバシーポリシーに同意したものとみなします
        </p>
      </div>
    </div>
  )
}