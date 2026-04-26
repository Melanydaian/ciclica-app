import { NextResponse } from 'next/server'

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Tu enlace de acceso — Cíclica</title>
</head>
<body style="margin:0;padding:0;background:#FFF9FB;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF9FB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:32px;">🌸</span>
              <div style="font-size:22px;font-weight:700;color:#9D174D;letter-spacing:-0.5px;margin-top:6px;">Cíclica</div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;border:1px solid #FCE7F3;padding:40px 36px;box-shadow:0 2px 16px rgba(236,72,153,0.06);">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">
                Hola 👋
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#6B7280;line-height:1.6;">
                Recibimos tu pedido de acceso al dashboard de Cíclica.<br/>
                Hacé click en el botón para entrar — sin contraseña, sin complicaciones.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display:inline-block;background:linear-gradient(135deg,#EC4899,#db2777);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 40px;border-radius:14px;letter-spacing:0.2px;">
                      Entrar a mi dashboard ✨
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #FCE7F3;margin:0 0 24px;" />

              <!-- Fallback link -->
              <p style="margin:0 0 6px;font-size:13px;color:#9CA3AF;">
                ¿El botón no funciona? Copiá este enlace en tu navegador:
              </p>
              <p style="margin:0;font-size:12px;color:#EC4899;word-break:break-all;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">
                Si no pediste este acceso, podés ignorar este email.
              </p>
              <p style="margin:0;font-size:12px;color:#C4B5C0;">
                Cíclica · Tu asistente de salud menstrual 🌸
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
