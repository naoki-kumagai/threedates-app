'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function MyPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/register'); return }
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)
      setLoading(false)
    }
    getProfile()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <span className="font-bold text-gray-800">スリーデート</span>
        <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600">ログアウト</button>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4 pt-6">
        {/* プロフィールカード */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            {profile?.photos?.[0] ? (
              <img src={profile.photos[0]} alt="profile" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-2xl">👤</div>
            )}
            <div>
              <h2 className="font-bold text-gray-800 text-lg">{profile?.name || '未設定'}</h2>
              <p className="text-gray-500 text-sm">{profile?.age ? `${profile.age}歳` : ''} {profile?.area_preference ? `・${profile.area_preference}エリア` : ''}</p>
            </div>
          </div>
          {profile?.bio && <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-4">{profile.bio}</p>}
        </div>

        {/* ステータスカード */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">現在のステータス</h3>
          <div className="bg-rose-50 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-rose-600 font-bold text-sm">マッチング待ち</p>
            <p className="text-gray-500 text-xs mt-1">事務局がマッチング相手を探しています</p>
          </div>
        </div>

        {/* プロフィール情報 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">プロフィール</h3>
          <div className="space-y-3">
            {[
              { label: '職業', value: profile?.job },
              { label: '趣味', value: profile?.hobby },
              { label: 'エリア', value: profile?.area_preference },
            ].map((item) => item.value && (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">{item.label}</span>
                <span className="text-gray-800 text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/register/profile')}
            className="w-full mt-4 border border-rose-200 text-rose-500 rounded-xl py-2 text-sm font-medium hover:bg-rose-50 transition-colors"
          >
            プロフィールを編集する
          </button>
        </div>

        {/* メールアドレス */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 text-center">{user?.email}</p>
        </div>
      </div>
    </div>
  )
}