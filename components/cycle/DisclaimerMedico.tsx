export default function DisclaimerMedico() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-[#3A2F3F] bg-gray-50/60 dark:bg-[#1F1822]/60 px-5 py-5">
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none mt-0.5">ℹ️</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-[#B4ABB8] mb-1.5">
            Sobre estas estimaciones
          </div>
          <p className="text-xs text-gray-600 dark:text-[#C9BFCB] leading-relaxed">
            Las fases, fechas y rangos que ves acá son estimaciones basadas en
            tu historial de ciclos. Pueden variar varios días según tu cuerpo,
            estrés, hormonas o cambios de rutina.
          </p>
          <p className="text-xs text-gray-600 dark:text-[#C9BFCB] leading-relaxed mt-2">
            <span className="font-semibold text-gray-700 dark:text-[#E5DBE8]">Cíclica no es un dispositivo médico</span> ni
            reemplaza una consulta con tu ginecóloga. Si notás cambios bruscos,
            dolor fuera de lo común, sangrado inusual o cualquier síntoma que te
            preocupe, consultá con un profesional 🌸
          </p>
        </div>
      </div>
    </div>
  )
}
