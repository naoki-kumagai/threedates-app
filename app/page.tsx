'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/pre-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      router.push('/pre-register/success')
    } else {
      setError('エラーが発生しました。もう一度お試しください。')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <span className="font-bold text-gray-800 text-lg">スリーデート</span>
        <span className="text-xs text-rose-500 font-medium bg-rose-50 px-3 py-1 rounded-full">
          先行登録受付中
        </span>
      </header>

      {/* ファーストビュー */}
      <section className="px-6 pt-12 pb-10 text-center max-w-md mx-auto">
        <div className="inline-block bg-rose-50 text-rose-500 text-xs font-bold px-4 py-2 rounded-full mb-6">
          🎁 先行登録で通常料金より10%オフ
        </div>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
          3回のデートで、<br />
          本当の出会いを。
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          メッセージのやりとりは不要。<br />
          1人の相手と3回のデートで交際を決める、<br />
          新しいシリアル型婚活サービス。
        </p>

        {/* 登録フォーム */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレスを入力"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-600 disabled:opacity-50 transition-colors"
          >
            {loading ? '送信中...' : '無料で先行登録する →'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3">
          登録することで利用規約・プライバシーポリシーに同意したものとみなします
        </p>
      </section>

      {/* 3つの特徴 */}
      <section className="bg-gray-50 px-6 py-10">
        <h2 className="text-center text-lg font-bold text-gray-800 mb-8">
          スリーデートが選ばれる理由
        </h2>
        <div className="max-w-md mx-auto space-y-4">
          {[
            {
              icon: '💬',
              title: 'メッセージ不要',
              desc: 'マッチング後のメッセージやりとりは一切なし。事務局が日程・場所を設定します。',
            },
            {
              icon: '👤',
              title: '1人に集中できる',
              desc: '複数の相手と同時進行しないシリアル型。1人の相手と真剣に向き合えます。',
            },
            {
              icon: '✅',
              title: '3回で結論が出る',
              desc: '3回のデート後、双方の意思を確認。曖昧な関係が続かない設計です。',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-5 flex gap-4 shadow-sm">
              <div className="text-2xl">{item.icon}</div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 対象ユーザー */}
      <section className="px-6 py-10 max-w-md mx-auto">
        <h2 className="text-center text-lg font-bold text-gray-800 mb-6">
          こんな方におすすめ
        </h2>
        <div className="space-y-3">
          {[
            'マッチングアプリのメッセージに疲れた',
            '真剣に交際相手を探したい',
            '忙しくて婚活に時間をかけられない',
            'ヤリモクや既婚者が不安',
          ].map((text) => (
            <div key={text} className="flex items-center gap-3 bg-rose-50 rounded-xl px-4 py-3">
              <span className="text-rose-500 font-bold text-sm">✓</span>
              <span className="text-gray-700 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 安全性 */}
      <section className="bg-gray-50 px-6 py-10">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-6">安全への取り組み</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🪪', label: '本人確認必須' },
              { icon: '💍', label: '独身証明' },
              { icon: '🚫', label: '即BANシステム' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-xs text-gray-600 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="px-6 py-12 text-center max-w-md mx-auto">
        <div className="bg-rose-500 rounded-2xl p-8 text-white">
          <p className="text-sm font-bold mb-1">🎁 先行登録特典</p>
          <p className="text-2xl font-bold mb-2">通常料金より10%オフ</p>
          <p className="text-rose-100 text-xs mb-6">リリース後1年間適用</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
              required
              className="w-full rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-rose-500 rounded-xl py-3 font-bold text-sm hover:bg-rose-50 disabled:opacity-50 transition-colors"
            >
              {loading ? '送信中...' : '無料で先行登録する →'}
            </button>
          </form>
        </div>
      </section>

      {/* フッター */}
      <footer className="px-6 py-8 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">© 2025 スリーデート / andmatch株式会社</p>
      </footer>
    </div>
  )
}