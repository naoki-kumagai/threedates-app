'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const STEPS = ['基本情報', '写真', '自己紹介']

export default function ProfilePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState({
    gender: '',
    name: '',
    age: '',
    area: '',
    bio: '',
    job: '',
    hobby: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/register')
      } else {
        setUserId(data.user.id)
      }
    })
  }, [router])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleNext = () => setStep((s) => s + 1)
  const handleBack = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    if (!userId) return
    setLoading(true)

    let photoUrl = ''

    if (photo) {
      const ext = photo.name.split('.').pop()
      const path = `${userId}/profile.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(path, photo, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(path)
        photoUrl = data.publicUrl
      }
    }

    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: (await supabase.auth.getUser()).data.user?.email,
        gender: form.gender,
        registration_step: 3,
      })

    if (!userError) {
      await supabase.from('profiles').upsert({
        user_id: userId,
        name: form.name,
        age: parseInt(form.age),
        area_preference: form.area,
        bio: form.bio,
        job: form.job,
        hobby: form.hobby,
        photos: photoUrl ? [photoUrl] : [],
      })
    }

    setLoading(false)
    router.push('/mypage')
  }

  return (
    <div className="min-h-screen bg-rose-50 p-4">
      <div className="max-w-md mx-auto">
        {/* プログレスバー */}
        <div className="flex items-center gap-2 mb-8 mt-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-rose-500' : 'bg-gray-200'}`} />
              <p className={`text-xs mt-1 text-center ${i === step ? 'text-rose-500 font-medium' : 'text-gray-400'}`}>{s}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* STEP 0: 基本情報 */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">基本情報を入力してください</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
                <div className="flex gap-3">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${form.gender === g ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 text-gray-600'}`}
                    >
                      {g === 'male' ? '男性' : '女性'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ニックネーム</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="表示される名前"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="例：28"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">希望デートエリア</label>
                <div className="flex gap-2">
                  {['渋谷', '恵比寿', '目黒'].map((area) => (
                    <button
                      key={area}
                      onClick={() => setForm({ ...form, area })}
                      className={`flex-1 py-2 rounded-xl border text-sm transition-colors ${form.area === area ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 text-gray-600'}`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!form.gender || !form.name || !form.age || !form.area}
                className="w-full bg-rose-500 text-white rounded-xl py-3 font-medium text-sm disabled:opacity-40 transition-colors"
              >
                次へ
              </button>
            </div>
          )}

          {/* STEP 1: 写真 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">プロフィール写真を追加</h2>
              <p className="text-sm text-gray-500">顔がはっきり写った写真を1枚アップロードしてください</p>

              <div
                onClick={() => document.getElementById('photo-input')?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl h-64 flex items-center justify-center cursor-pointer hover:border-rose-300 transition-colors overflow-hidden"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm text-gray-400">タップして写真を選択</p>
                  </div>
                )}
              </div>
              <input id="photo-input" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

              <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm">戻る</button>
                <button
                  onClick={handleNext}
                  disabled={!photo}
                  className="flex-1 bg-rose-500 text-white rounded-xl py-3 font-medium text-sm disabled:opacity-40"
                >
                  次へ
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: 自己紹介 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">自己紹介（任意）</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">職業 <span className="text-gray-400">（任意）</span></label>
                <input
                  type="text"
                  value={form.job}
                  onChange={(e) => setForm({ ...form, job: e.target.value })}
                  placeholder="例：IT企業 企画職"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">趣味 <span className="text-gray-400">（任意）</span></label>
                <input
                  type="text"
                  value={form.hobby}
                  onChange={(e) => setForm({ ...form, hobby: e.target.value })}
                  placeholder="例：登山、サウナ"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介文 <span className="text-gray-400">（任意）</span></label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="自分のことを自由に書いてください"
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm">戻る</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-rose-500 text-white rounded-xl py-3 font-medium text-sm disabled:opacity-40"
                >
                  {loading ? '保存中...' : '登録完了'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}