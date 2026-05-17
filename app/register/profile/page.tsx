'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const STEPS = ['基本情報', '写真', '自己紹介']

export default function ProfilePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null)

  const [form, setForm] = useState({
    gender: '',
    name: '',
    age: '',
    area: '',
    bio: '',
    job: '',
    hobby: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        router.push('/register')
        return
      }
      setUserId(authData.user.id)

      const { data: userData } = await supabase
        .from('users')
        .select('gender')
        .eq('id', authData.user.id)
        .maybeSingle()

      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, age, area_preference, bio, job, hobby, photos')
        .eq('user_id', authData.user.id)
        .maybeSingle()

      setForm({
        gender: userData?.gender || '',
        name: profileData?.name || '',
        age: profileData?.age ? String(profileData.age) : '',
        area: profileData?.area_preference || '',
        bio: profileData?.bio || '',
        job: profileData?.job || '',
        hobby: profileData?.hobby || '',
      })

      if (profileData?.photos && profileData.photos.length > 0) {
        setExistingPhotoUrl(profileData.photos[0])
        setPhotoPreview(profileData.photos[0])
      }

      setInitialLoading(false)
    }
    loadProfile()
  }, [router])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError(null)
    setPhotoLoading(true)
    try {
      let processedFile = file
      const isHeic =
        file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif')
      if (isHeic) {
        const heic2any = (await import('heic2any')).default
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
        const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
        processedFile = new File([blob], newFileName, { type: 'image/jpeg' })
      }
      setPhoto(processedFile)
      setPhotoPreview(URL.createObjectURL(processedFile))
    } catch (err) {
      console.error('画像変換エラー:', err)
      setPhotoError('画像の読み込みに失敗しました。別の写真をお試しください。')
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleNext = () => setStep((s) => s + 1)
  const handleBack = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    if (!userId) {
      console.log('❌ userIdがありません')
      return
    }
    console.log('✅ handleSubmit開始 userId:', userId)
    setLoading(true)

    let photoUrl = existingPhotoUrl || ''

    if (photo) {
      console.log('📸 写真アップロード開始')
      const ext = photo.name.split('.').pop()
      const path = `${userId}/profile.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(path, photo, { upsert: true })
      if (uploadError) {
        console.log('❌ 写真アップロードエラー:', uploadError)
      } else {
        console.log('✅ 写真アップロード成功')
        const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
        photoUrl = `${data.publicUrl}?t=${Date.now()}`
      }
    }

    console.log('📝 usersテーブルへの書き込み開始')
    const { error: userError } = await supabase.from('users').upsert({
      id: userId,
      email: (await supabase.auth.getUser()).data.user?.email,
      gender: form.gender,
      registration_step: 3,
    })

    if (userError) {
      console.log('❌ usersテーブルエラー:', JSON.stringify(userError))
    } else {
      console.log('✅ usersテーブル書き込み成功')
      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: userId,
        name: form.name,
        age: parseInt(form.age),
        area_preference: form.area,
        bio: form.bio,
        job: form.job,
        hobby: form.hobby,
        photos: photoUrl ? [photoUrl] : [],
      })
      if (profileError) {
        console.log('❌ profilesテーブルエラー:', JSON.stringify(profileError))
      } else {
        console.log('✅ profilesテーブル書き込み成功')
      }
    }

    setLoading(false)
    router.push('/mypage')
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-rose-300 border-t-rose-500 rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-8 mt-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-rose-500' : 'bg-gray-200'}`} />
              <p className={`text-xs mt-1 text-center ${i === step ? 'text-rose-500 font-medium' : 'text-gray-400'}`}>{s}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">基本情報を入力してください</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
                <div className="flex gap-3">
                  {['male', 'female'].map((g) => (
                    <button key={g} onClick={() => setForm({ ...form, gender: g })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${form.gender === g ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 text-gray-600'}`}>
                      {g === 'male' ? '男性' : '女性'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ニックネーム</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="表示される名前"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
                <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="例:28"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">希望デートエリア</label>
                <div className="flex gap-2">
                  {['渋谷', '恵比寿', '目黒'].map((area) => (
                    <button key={area} onClick={() => setForm({ ...form, area })}
                      className={`flex-1 py-2 rounded-xl border text-sm transition-colors ${form.area === area ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 text-gray-600'}`}>
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleNext} disabled={!form.gender || !form.name || !form.age || !form.area}
                className="w-full bg-rose-500 text-white rounded-xl py-3 font-medium text-sm disabled:opacity-40 transition-colors">
                次へ
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">プロフィール写真を追加</h2>
              <p className="text-sm text-gray-500">顔がはっきり写った写真を1枚アップロードしてください</p>
              <p className="text-xs text-gray-400">対応形式:JPG、PNG、HEIC(iPhone写真)</p>
              <div onClick={() => !photoLoading && document.getElementById('photo-input')?.click()}
                className={`border-2 border-dashed border-gray-200 rounded-2xl h-64 flex items-center justify-center overflow-hidden transition-colors ${photoLoading ? 'cursor-wait opacity-60' : 'cursor-pointer hover:border-rose-300'}`}>
                {photoLoading ? (
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-rose-300 border-t-rose-500 rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-500">写真を読み込み中...</p>
                  </div>
                ) : photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm text-gray-400">タップして写真を選択</p>
                  </div>
                )}
              </div>
              {photoError && <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{photoError}</p>}
              <input id="photo-input" type="file" accept="image/*,.heic,.heif" onChange={handlePhotoChange} className="hidden" />
              <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm">戻る</button>
                <button onClick={handleNext} disabled={(!photo && !existingPhotoUrl) || photoLoading}
                  className="flex-1 bg-rose-500 text-white rounded-xl py-3 font-medium text-sm disabled:opacity-40">
                  次へ
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">自己紹介(任意)</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">職業 <span className="text-gray-400">(任意)</span></label>
                <input type="text" value={form.job} onChange={(e) => setForm({ ...form, job: e.target.value })}
                  placeholder="例:IT企業 企画職"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">趣味 <span className="text-gray-400">(任意)</span></label>
                <input type="text" value={form.hobby} onChange={(e) => setForm({ ...form, hobby: e.target.value })}
                  placeholder="例:登山、サウナ"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介文 <span className="text-gray-400">(任意)</span></label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="自分のことを自由に書いてください" rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm">戻る</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-rose-500 text-white rounded-xl py-3 font-medium text-sm disabled:opacity-40">
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