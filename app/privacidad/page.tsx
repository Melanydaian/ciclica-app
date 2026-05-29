import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidad · Cíclica',
  description: 'Cómo cuidamos tu información en Cíclica.',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#FFF9FB] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-pink-100 p-6 md:p-10">
        <Link href="/" className="text-xs text-pink-500 hover:underline">← Volver</Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-[#F4F1F5] mt-4 mb-2">Política de Privacidad</h1>
        <p className="text-xs text-gray-400 dark:text-[#8A8190] mb-8">Última actualización: 29 de mayo de 2026</p>

        <div className="prose prose-sm md:prose-base max-w-none text-gray-700 dark:text-[#E5DBE8] space-y-5 leading-relaxed">
          <p>
            Cíclica respeta tu intimidad. Los datos que registrás acá son tuyos y los tratamos
            con el máximo cuidado posible.
          </p>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Qué guardamos</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Email</strong> para que puedas entrar al dashboard.</li>
            <li><strong>Teléfono de WhatsApp</strong> para vincular tu cuenta con el bot.</li>
            <li><strong>Datos de tu ciclo</strong>: fechas de período, síntomas, estado de ánimo, vida sexual, anticoncepción.</li>
            <li><strong>Notas que escribís en el diario</strong>.</li>
            <li>Información de uso técnica (IP, navegador) para mantener el servicio seguro.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Cómo usamos esos datos</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Para mostrarte tu dashboard, calendario y estadísticas personalizadas.</li>
            <li>Para mejorar Cíclica de forma agregada y anónima (sin identificarte).</li>
            <li>Para responderte cuando nos escribís a soporte.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Qué NO hacemos</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>No vendemos tus datos a terceros.</li>
            <li>No compartimos tu información con anunciantes ni aseguradoras.</li>
            <li>No usamos tus datos para mostrarte publicidad.</li>
            <li>Solo los integrantes autorizados del equipo de Cíclica acceden a tu información, y solo para mantener el servicio.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Tus derechos</h2>
          <p>Podés en cualquier momento:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Descargar todos tus datos</strong> en formato JSON desde Perfil.</li>
            <li><strong>Borrar tu cuenta</strong> y todos tus registros para siempre desde Perfil.</li>
            <li><strong>Editar o corregir</strong> cualquier dato.</li>
            <li><strong>Revocar links compartidos</strong> con tu ginecóloga.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Compartir con tu profesional de salud</h2>
          <p>
            Podés generar un link de solo lectura con un resumen de tu ciclo
            para enviarle a tu ginecóloga. Ese link expira automáticamente y podés
            revocarlo cuando quieras.
          </p>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Seguridad técnica</h2>
          <p>
            Tu información viaja siempre encriptada (HTTPS). La base de datos está
            protegida con autenticación a nivel de fila (Row Level Security) — sólo vos podés
            acceder a tu información cuando estás logueada.
          </p>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Importante: no somos un dispositivo médico</h2>
          <p>
            Cíclica te ayuda a entender tus patrones pero <strong>no reemplaza</strong> una consulta médica.
            Las estimaciones de fechas y fases son orientativas. Si tenés dudas o síntomas
            que te preocupen, consultá a tu ginecóloga.
          </p>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Contacto</h2>
          <p>
            Para cualquier consulta sobre tus datos podés escribir a{' '}
            <a href="mailto:hola@ciclica.pro" className="text-pink-500 hover:underline">
              hola@ciclica.pro
            </a>.
          </p>

          <p className="text-xs text-gray-400 dark:text-[#8A8190] pt-6 border-t border-gray-100">
            Cíclica · Tu asistente de salud menstrual 🌸 · ciclica.pro
          </p>
        </div>
      </div>
    </div>
  )
}
