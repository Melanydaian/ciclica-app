import type { CyclePhase } from './cycle-utils'

export type PhaseSection = {
  emoji: string
  title: string
  paragraphs: string[]
  list?: string[]
}

export type PhaseKnowledge = {
  hero: string
  sections: PhaseSection[]
}

export const PHASE_KNOWLEDGE: Record<CyclePhase, PhaseKnowledge> = {
  menstrual: {
    hero:
      'El día 1 de tu ciclo arranca con tu período. Tu cuerpo descama el endometrio que se formó preparando un posible embarazo. Es tu fase de reseteo: hormonas en su punto más bajo, energía interior fluyendo hacia adentro.',
    sections: [
      {
        emoji: '🔬',
        title: 'Lo que pasa en tu cuerpo',
        paragraphs: [
          'Los niveles de estrógeno y progesterona están en su mínimo. Esto le dice al útero que tire la capa que armó durante el ciclo anterior — eso es la menstruación.',
          'Tu cuerpo libera prostaglandinas para contraer el útero (de ahí los cólicos). Mientras tanto, en el ovario ya hay folículos preparándose para la próxima ovulación.',
          'Estudios de neuroimagen muestran que en esta fase el hemisferio derecho del cerebro (intuición, creatividad, conexión emocional) está más activo de lo habitual.',
        ],
      },
      {
        emoji: '💫',
        title: 'Cómo te sentís',
        paragraphs: [
          'Energía baja, necesidad de introspección, sueño más profundo, mayor sensibilidad emocional. Posibles cólicos, dolor lumbar, dolor de cabeza, cansancio.',
          'Tu cuerpo te está pidiendo recogimiento: no es flojera, es biología. La civilización moderna nos enseñó a ignorarlo. Cíclica te invita a escucharlo.',
        ],
      },
      {
        emoji: '🚀',
        title: 'Cómo aprovecharla',
        paragraphs: [
          'Esta es tu fase más reflexiva del ciclo. Revisá lo que viviste el mes pasado, escribí, meditá, soñá.',
          'Las decisiones tomadas en esta fase suelen ser más profundas y honestas — bajan los filtros sociales y vienen las claridades.',
        ],
        list: [
          'Journaling: escribí cómo te sentiste el ciclo pasado',
          'Planificá el próximo mes (sin compromisos pesados en los primeros días)',
          'Evitá reuniones grandes o presentaciones si podés',
          'Pedí ayuda con cosas que no querés hacer hoy',
        ],
      },
      {
        emoji: '🍎',
        title: 'Qué comer',
        paragraphs: [
          'Es la fase donde más perdés hierro — repostalo activamente. Si te sentís con frío extremo o muy débil, podría ser bajo hierro.',
        ],
        list: [
          'Hierro: espinaca, lentejas, carne roja magra, hígado, garbanzos',
          'Vitamina C (potencia la absorción de hierro): cítricos, kiwi, morrón rojo',
          'Magnesio para los cólicos: chocolate amargo 70%+, palta, almendras',
          'Té de jengibre o canela — antiinflamatorios naturales',
          'Reducí: cafeína, alcohol, sal (empeoran retención y dolor)',
        ],
      },
      {
        emoji: '🏋️',
        title: 'Cómo moverte',
        paragraphs: [
          'Tu cuerpo necesita descanso, pero el movimiento suave libera endorfinas que alivian el dolor menstrual.',
        ],
        list: [
          'Sí: yoga restaurativo, caminatas tranquilas, estiramientos',
          'Sí: natación suave (no si tenés cólicos fuertes)',
          'Evitá: HIIT, CrossFit, pesas pesadas, running largo',
          'Si dormiste mal o tenés dolor fuerte, descansar es válido y necesario',
        ],
      },
    ],
  },

  folicular: {
    hero:
      'Tu menstruación terminó y empieza la ascensión. El estrógeno sube progresivamente, tu energía se renueva, tu cerebro está más despierto. Es la fase del impulso creativo y la expansión.',
    sections: [
      {
        emoji: '🔬',
        title: 'Lo que pasa en tu cuerpo',
        paragraphs: [
          'La FSH (hormona folículo-estimulante) viaja de tu hipófisis al ovario y activa varios folículos. Uno va a ganar y madurar para liberar un óvulo en la ovulación.',
          'El estrógeno aumenta de forma constante y le pide al útero que arme una nueva capa (endometrio) por si hay embarazo.',
          'En el cerebro, el estrógeno acelera la neurogénesis: estás formando nuevas conexiones neuronales más rápido que en cualquier otra fase. Tu capacidad de aprender está en pico.',
        ],
      },
      {
        emoji: '💫',
        title: 'Cómo te sentís',
        paragraphs: [
          'Energía en alza, ánimo positivo, mente clara y curiosa. Mejor memoria, mayor tolerancia al dolor, piel más luminosa.',
          'Te sentís más sociable, abierta a probar cosas nuevas. Es una de las mejores fases para sentirte vos misma en tu mejor versión.',
        ],
      },
      {
        emoji: '🚀',
        title: 'Cómo aprovecharla',
        paragraphs: [
          'Esta es tu fase de iniciar: proyectos, cursos, viajes, presentaciones, decisiones grandes. Tu cuerpo está optimizado para crear y crecer.',
          'La impulsividad sana de esta fase es buena combustión — usala antes de que llegue la lútea, donde naturalmente vas a ser más conservadora.',
        ],
        list: [
          'Arrancá ese proyecto que venís postergando',
          'Anotate en ese curso, leé el libro denso, aprendé el idioma',
          'Reuniones de brainstorming, ideas frescas',
          'Citas, networking, conocer gente nueva',
          'Negociaciones importantes',
        ],
      },
      {
        emoji: '🍎',
        title: 'Qué comer',
        paragraphs: [
          'Tu cuerpo necesita combustible de calidad para sostener la energía. Apuntá a comidas balanceadas, no salteás comidas.',
        ],
        list: [
          'Proteínas magras: pollo, pescado, huevos, tofu, lentejas',
          'Granos enteros: avena, arroz integral, quinoa',
          'Verduras crucíferas: brócoli, coliflor, kale (ayudan al hígado a metabolizar estrógeno)',
          'Probióticos: yogur natural, kéfir (microbiota afecta hormonas)',
          'Hidratación constante — el estrógeno alto retiene agua, pero tu cuerpo la necesita',
        ],
      },
      {
        emoji: '🏋️',
        title: 'Cómo moverte',
        paragraphs: [
          'Es el momento de subir intensidad. Tu fuerza, resistencia y capacidad de recuperación están en lo más alto.',
        ],
        list: [
          'Pesas pesadas — buscá récords personales',
          'HIIT, CrossFit, running, ciclismo',
          'Deportes nuevos, clases que nunca hiciste',
          'Cardio largo — tu resistencia está en pico',
          'Buena idea: programar tus entrenamientos más exigentes en esta fase',
        ],
      },
    ],
  },

  ovulatoria: {
    hero:
      'Estás en tu pico hormonal del ciclo. El estrógeno toca techo, la testosterona aumenta brevemente, y tu cuerpo libera el óvulo maduro. Es tu fase más extrovertida, magnética y poderosa socialmente.',
    sections: [
      {
        emoji: '🔬',
        title: 'Lo que pasa en tu cuerpo',
        paragraphs: [
          'El pico de estrógeno dispara un pico de LH (hormona luteinizante) — esa señal hace que el folículo libere el óvulo, que vive 12-24 horas esperando ser fecundado.',
          'En paralelo, los niveles de testosterona suben brevemente, lo que aumenta tu libido y energía.',
          'El moco cervical se vuelve transparente y elástico (parecido a clara de huevo) — es el ambiente que ayuda al espermatozoide a llegar al óvulo.',
          'Si estás buscando embarazo: estos son los 3-5 días más fértiles del ciclo (los 2-3 días antes de la ovulación + el día de ovulación).',
          'Si estás evitando embarazo: este es el período de máximo cuidado.',
        ],
      },
      {
        emoji: '💫',
        title: 'Cómo te sentís',
        paragraphs: [
          'Energía y ánimo en su pico. Te sentís magnética, con ganas de socializar, conversar, conocer.',
          'Piel más luminosa, ojos más brillantes, voz más clara. Mayor confianza en vos misma.',
          'Algunas mujeres sienten un dolor leve en uno de los ovarios (Mittelschmerz) durante la ovulación — es normal y dura unas horas.',
        ],
      },
      {
        emoji: '🚀',
        title: 'Cómo aprovecharla',
        paragraphs: [
          'Acomodá las cosas importantes que requieren presencia, carisma y comunicación en esta ventana. Tu impacto social va a ser máximo.',
          'Es la fase ideal para vender, negociar, presentar, defender tu posición. La gente te escucha distinto.',
        ],
        list: [
          'Presentaciones importantes, pitches',
          'Primera citas, reuniones de equipo grandes',
          'Conversaciones difíciles que venías postergando',
          'Eventos sociales, fiestas, reuniones',
          'Crear contenido (foto, video) — tu energía se nota en cámara',
        ],
      },
      {
        emoji: '🍎',
        title: 'Qué comer',
        paragraphs: [
          'Tu cuerpo está produciendo más calor y procesando muchas hormonas. Antioxidantes y fibra son clave.',
        ],
        list: [
          'Frutas y verduras crudas (la fibra ayuda a eliminar estrógenos en exceso)',
          'Berries, té verde — antioxidantes',
          'Proteínas magras: pescado azul (omega-3), pollo, huevos',
          'Semillas de lino y sésamo — fitoestrógenos balanceadores',
          'Evitá comidas ultra-procesadas: la inflamación se nota más esta semana',
        ],
      },
      {
        emoji: '🏋️',
        title: 'Cómo moverte',
        paragraphs: [
          'Pico de rendimiento físico. Cualquier deporte intenso te va a salir bien.',
        ],
        list: [
          'Pesas con cargas máximas',
          'Bailar, escalar, correr largas distancias',
          'Deportes grupales — vas a estar al máximo socialmente también',
          'HIIT con intervalos cortos e intensos',
          'Ojo: posible mayor riesgo de lesión por sentirte invencible — calentá bien',
        ],
      },
    ],
  },

  lutea: {
    hero:
      'Después de la ovulación tu cuerpo entra en modo de "espera con preparación". La progesterona toma el protagonismo. Si no hay embarazo, hacia el final de esta fase las hormonas caen y aparece el SPM. Es la fase del detalle, la organización y la introspección.',
    sections: [
      {
        emoji: '🔬',
        title: 'Lo que pasa en tu cuerpo',
        paragraphs: [
          'El folículo vacío se transforma en el cuerpo lúteo y empieza a producir progesterona — la hormona que sostendría un embarazo si lo hubiera.',
          'La progesterona engrosa más el endometrio, sube tu temperatura corporal basal medio grado y enlentece tu metabolismo un poco.',
          'Si no hay embarazo, alrededor del día 21-26 las hormonas (estrógeno + progesterona) caen abruptamente. Esa caída brusca es la responsable del SPM (síndrome premenstrual).',
          'Esta caída afecta los niveles de serotonina en el cerebro — por eso sentís más ansiedad, irritabilidad o tristeza en los últimos días.',
        ],
      },
      {
        emoji: '💫',
        title: 'Cómo te sentís',
        paragraphs: [
          'Primera mitad de la lútea (días 17-21): tranquila, enfocada, productiva en tareas detallistas. Buena para terminar lo que iniciaste en folicular.',
          'Segunda mitad (días 22-28): SPM. Posibles antojos (sal, dulce), hinchazón abdominal, sensibilidad mamaria, ansiedad, irritabilidad, sueño irregular, fatiga.',
          'Tu cerebro detecta errores y problemas más rápido — útil para revisión y control de calidad, pesado para tu propia autocrítica.',
        ],
      },
      {
        emoji: '🚀',
        title: 'Cómo aprovecharla',
        paragraphs: [
          'Es tu fase de "rematar". Tu mente nota detalles, encuentra errores, cierra cabos sueltos. Aprovechá esa lupa para terminar proyectos.',
          'En la segunda mitad bajá el ritmo social y subí el autocuidado. No es momento para conversaciones difíciles ni decisiones críticas.',
        ],
        list: [
          'Tareas de detalle: revisar contratos, balancear cuentas, ordenar archivos',
          'Cerrar pendientes, mandar emails que postergabas',
          'Organizar la casa, la agenda, el armario',
          'Evitá: peleas, decisiones importantes, conversaciones difíciles en la segunda mitad',
          'Programá actividades cortas y placenteras: baño caliente, película, paseo',
        ],
      },
      {
        emoji: '🍎',
        title: 'Qué comer',
        paragraphs: [
          'Tu cuerpo te va a pedir azúcar y sal — son antojos hormonales reales, no falta de voluntad. Pero podés aliviarlos con buena alimentación.',
        ],
        list: [
          'Magnesio: cacao puro 85%+, almendras, espinaca (alivia hinchazón, ansiedad, dolor)',
          'Vitamina B6: banana, papa, pollo (ayuda con SPM y retención)',
          'Omega-3: pescado azul, chía, lino (antiinflamatorio natural)',
          'Triptófano: avena, pavo, banana (sube serotonina)',
          'Reducí: cafeína, alcohol, azúcar refinada — todos empeoran el SPM',
          'Aumentá agua: la progesterona te deshidrata más',
        ],
      },
      {
        emoji: '🏋️',
        title: 'Cómo moverte',
        paragraphs: [
          'Primera mitad: podés seguir con la intensidad de folicular. Segunda mitad: tu cuerpo necesita movimiento más amable, no más estrés.',
        ],
        list: [
          'Primera mitad lútea: pesas moderadas, cardio sostenido',
          'Segunda mitad: pilates, yoga, natación suave, caminatas largas',
          'Estiramientos profundos — la progesterona hace que tus ligamentos estén más laxos',
          'Evitá HIIT en la última semana — sube cortisol y empeora SPM',
          'Movete aunque te sientas cansada: el movimiento alivia los síntomas',
        ],
      },
    ],
  },
}
