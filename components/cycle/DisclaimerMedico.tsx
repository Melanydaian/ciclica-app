export default function DisclaimerMedico() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/60 px-5 py-5">
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none mt-0.5">ℹ️</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-1.5">
            Sobre estas estimaciones
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Las fases, fechas y rangos que ves acá son estimaciones basadas en
            tu historial de ciclos. Pueden variar varios días según tu cuerpo,
            estrés, hormonas o cambios de rutina.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed mt-2">
            <span className="font-semibold text-gray-700">Cíclica no es un dispositivo médico</span> ni
            reemplaza una consulta con tu ginecóloga. Si notás cambios bruscos,
            dolor fuera de lo común, sangrado inusual o cualquier síntoma que te
            preocupe, consultá con un profesional 🌸
          </p>
        </div>
      </div>
    </div>
  )
}
