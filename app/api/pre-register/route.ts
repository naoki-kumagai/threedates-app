import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'メールアドレスが必要です' }, { status: 400 })
    }

    // Supabaseに保存
    const { error: dbError } = await supabase
      .from('pre_registrations')
      .insert({ email })

    if (dbError && dbError.code !== '23505') {
      console.error('DB Error:', dbError)
      return NextResponse.json({ error: 'DB エラー', detail: dbError.message }, { status: 500 })
    }

    // 確認メール送信
    const { error: emailError } = await resend.emails.send({
      from: 'スリーデート事務局 <onboarding@resend.dev>',
      to: email,
      subject: '【スリーデート】先行登録を受け付けました',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #e11d48;">スリーデート 先行登録完了</h2>
          <p>先行登録ありがとうございます。</p>
          <p>リリース時に優先してご案内いたします。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #e11d48; font-weight: bold;">🎁 先行登録特典</p>
          <p>通常料金より<strong>10%オフ</strong>で1年間ご利用いただけます。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #888; font-size: 12px;">スリーデート運営事務局</p>
        </div>
      `,
    })

    if (emailError) {
      console.error('Email Error:', emailError)
    }

    return NextResponse.json({ success: true })

  } catch (e) {
    console.error('Unexpected Error:', e)
    return NextResponse.json({ error: '予期せぬエラー' }, { status: 500 })
  }
}