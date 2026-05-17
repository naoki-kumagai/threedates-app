import Link from 'next/link'

export default function PreRegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">先行登録が完了しました</h1>
        <p className="text-gray-500 text-sm mb-6">
          ご登録のメールアドレスに確認メールをお送りしました。<br />
          リリース時に優先してご案内いたします。
        </p>
        <div className="bg-rose-50 rounded-xl p-4 mb-6">
          <p className="text-rose-600 font-bold text-sm mb-1">🎁 先行登録特典</p>
          <p className="text-gray-700 text-sm">
            通常料金より<span className="font-bold text-rose-500">10%オフ</span>で1年間ご利用いただけます
          </p>
        </div>
        <div className="border border-gray-100 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-600 mb-3">LINEでもリリース情報をお届けします</p>
          <a href="https://lin.ee/threedates" target="_blank" rel="noopener noreferrer" className="block w-full bg-green-500 text-white rounded-xl py-3 text-sm font-medium text-center">LINE公式アカウントを友達追加</a>
          <p className="text-xs text-gray-400 mt-2">※後日LINE公式アカウントを開設予定</p>
        </div>
        <Link href="/" className="text-sm text-gray-400">トップに戻る</Link>
      </div>
    </div>
  )
}