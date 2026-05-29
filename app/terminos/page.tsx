import Link from 'next/link'

export const metadata = {
  title: 'Términos de Uso · Cíclica',
  description: 'Términos y condiciones de uso de Cíclica.',
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#FFF9FB] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-pink-100 p-6 md:p-10">
        <Link href="/" className="text-xs text-pink-500 hover:underline">← Volver</Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-[#F4F1F5] mt-4 mb-2">Términos de Uso</h1>
        <p className="text-xs text-gray-400 dark:text-[#8A8190] mb-8">Última actualización: 29 de mayo de 2026</p>

        <div className="prose prose-sm md:prose-base max-w-none text-gray-700 dark:text-[#E5DBE8] space-y-5 leading-relaxed">
          <p>Al usar Cíclica aceptás estos términos. Léelos antes de empezar.</p>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Qué es Cíclica</h2>
          <p>
            Cíclica es una herramienta de seguimiento del ciclo menstrual que vive en WhatsApp y
            tiene un dashboard web. No es un dispositivo médico ni reemplaza atención profesional.
          </p>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Tu cuenta</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Tenés que ser mayor de 13 años. Si sos menor de 18, necesitás autorización
              de tu madre/padre/tutor.</li>
            <li>Sos responsable de mantener tu sesión segura.</li>
            <li>Los datos que ingresás tienen que ser verdaderos.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Uso responsable</h2>
          <p>No podés usar Cíclica para:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Hacerte pasar por otra persona.</li>
            <li>Intentar acceder a datos de otras usuarias.</li>
            <li>Hacer scraping o ingeniería inversa de la plataforma.</li>
            <li>Usar Cíclica para fines ilegales.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Limitaciones de responsabilidad</h2>
          <p>
            Las estimaciones de fechas, fases y síntomas que ves en Cíclica son orientativas
            y se basan en lo que vos registrás. <strong>Pueden variar significativamente</strong> según tu cuerpo,
            estrés, hormonas u otras razones.
          </p>
          <p>
            Cíclica <strong>no es un método anticonceptivo</strong>. Si querés evitar un embarazo,
            consultá a tu ginecóloga sobre métodos seguros.
          </p>
          <p>
            Cíclica no se responsabiliza por decisiones médicas, embarazos no planificados ni
            cualquier consecuencia derivada del uso de las estimaciones.
          </p>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Plan gratuito y planes pagos</h2>
          <p>
            Hoy Cíclica es gratis. Si en el futuro lanzamos planes pagos, te avisaremos
            con tiempo. Las funciones actuales gratuitas seguirán siéndolo.
          </p>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Baja de servicio</h2>
          <p>
            Podés cerrar tu cuenta cuando quieras desde Perfil. Tus datos se borran completamente.
            También podemos suspender cuentas que violen estos términos.
          </p>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Cambios a estos términos</h2>
          <p>
            Si cambiamos estos términos te lo vamos a avisar por email y dentro del dashboard.
          </p>

          <h2 className="text-lg font-bold text-gray-800 dark:text-[#F4F1F5] mt-6">Contacto</h2>
          <p>
            <a href="mailto:hola@ciclica.pro" className="text-pink-500 hover:underline">hola@ciclica.pro</a>
          </p>

          <p className="text-xs text-gray-400 dark:text-[#8A8190] pt-6 border-t border-gray-100">
            Cíclica · Tu asistente de salud menstrual 🌸 · ciclica.pro
          </p>
        </div>
      </div>
    </div>
  )
}
