import { Biography } from'../types/biography';

export const INITIAL_BIOGRAPHIES: Biography[] = [
 {
 id:'bio-max-pet',
 slug:'mascota-max',
 title:'La Huella de Max',
 description:'Mi biografía oficial, bitácora de salud y registros de travesuras.',
 templateType:'mascota',
 style: {
 themeColor:'emerald',
 backgroundColor:'bg-emerald-50/50',
 bgGradient: true,
 fontStyle:'sans',
 cardStyle:'glass',
 customWallpaper:'linear-gradient(135deg, #e0f2fe 0%, #d1fae5 50%, #fef3c7 100%)'
 },
  reviews: [
  {
  id:'rev-1',
  userName:'Dra. Amelia Ortiz (Veterinaria)',
  rating: 5,
  comment:'Max es un paciente increíble, siempre muy juicioso con sus vacunas y su peso óptimo.',
  date:'2026-05-18T10:30:00Z',
  googleSynced: true,
  reply:'¡Muchas gracias Dra. Amelia! Corro entusiasmado cada vez que veo la clínica.'
  },
  {
  id:'rev-2',
  userName:'Sonia Gómez (Vecina)',
  rating: 5,
  comment:'¡Es el perro más amoroso del barrio! Siempre saluda agitando toda la cola.',
  date:'2026-05-15T15:20:00Z'
  }
  ],
  googleReviews: [
  {
  id:'grev-1',
  userName:'Carlos Mendoza',
  rating: 5,
  comment:'Excelente servicio, Max siempre sale feliz después de cada consulta.',
  date:'2026-06-01T14:00:00Z'
  },
  {
  id:'grev-2',
  userName:'Lucía Fernández',
  rating: 4,
  comment:'Muy recomendados. La atención es de primera y los precios justos.',
  date:'2026-05-28T09:15:00Z'
  }
  ],
 pet: {
 name:'Max',
 species:'Perro',
 breed:'Golden Retriever',
 age:'3 años y 4 meses',
 birthDate:'2023-01-10',
 ownerName:'Carlos Mendoza',
 ownerContact:'+311 555-8291',
 avatarUrl:'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
 medicalHistory: [
 {
 id:'med-1',
 date:'2026-05-10',
 title:'Refuerzo de Parvovirus & Distemper',
 veterinarian:'Dra. Amelia Ortiz',
 description:'Siguiente dosis administrada sin reacciones alérgicas observadas. En observación por 24 horas.',
 status:'completado',
 type:'vacuna'
 },
 {
 id:'med-2',
 date:'2026-06-15',
 title:'Refuerzo de Vacuna contra la Rabia',
 veterinarian:'Dr. Alejandro Peña',
 description:'Dosis anual mandatoria. Pendiente programar para mantener esquema de viaje internacional al día.',
 status:'pendiente',
 type:'vacuna'
 },
 {
 id:'med-3',
 date:'2026-04-02',
 title:'Control Preventivo de Desparasitación',
 veterinarian:'Dra. Amelia Ortiz',
 description:'Suministro de NexGard Spectra oral para parásitos internos y externos.',
 status:'completado',
 type:'desparasitacion'
 },
 {
 id:'med-4',
 date:'2025-11-12',
 title:'Limpieza Dental Profunda',
 veterinarian:'Dra. Amelia Ortiz',
 description:'Tratamiento de sarro leve con ultrasonido bajo sedación ligera. Recomendación de masticables duros.',
 status:'completado',
 type:'consulta'
 }
 ],
 certificates: [
 {
 id:'cert-1',
 title:'Certificado de Viaje Aéreo Internacional',
 date:'2026-03-15',
 author:'Instituto Colombiano Agropecuario (ICA)',
 description:'Max cumple con la desparasitación y condiciones aptas para viajar en aerolíneas comerciales en cabina.',
 code:'ICA-9923-MAX-GD'
 },
 {
 id:'cert-2',
 title:'Póliza de Responsabilidad Civil Extracontractual',
 date:'2026-01-05',
 author:'Seguros Bolívar S.A.',
 description:'Cobertura completa contra daños a terceros y gastos veterinarios de emergencia médica activa.',
 code:'BOL-7734-RP-PET'
 }
 ],
 externalServices: {
 trainingUrl:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600',
 travelAgencyUrl:'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
 funeralServicesUrl:'https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?auto=format&fit=crop&q=80&w=600',
 groomingUrl:'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600'
 }
 },
 customSections: [
 {
 id:'csec-max-1',
 title:'Fotos Favoritas del Parque',
 description:'Momentos capturados durante nuestras salidas de fin de semana.',
 resources: [
 {
 id:'cres-max-1',
 title:'Atrapando el disco volador',
 type:'foto',
 url:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400',
 description:'En el Parque Metropolitano, volé más de dos metros de altura!',
 dateAdded:'2026-05-10'
 },
 {
 id:'cres-max-2',
 title:'Baño de barro accidental',
 type:'foto',
 url:'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=400',
 description:'Cinco minutos después de cepillado... valió la pena.',
 dateAdded:'2026-05-12'
 }
 ]
 },
 {
 id:'csec-max-2',
 title:'Guías de Nutrición y Cuidados',
 description:'Documentos útiles de dietas barf recomendadas.',
 resources: [
 {
 id:'cres-max-3',
 title:'Guía de Alimentación BARF Golden.pdf',
 type:'documento',
 url:'#',
 description:'Porciones de proteínas y vegetales según el peso actual de Max.',
 dateAdded:'2026-04-18'
 },
 {
 id:'cres-max-4',
 title:'Contacto de Urgencias 24 Horas',
 type:'enlace',
 url:'https://wa.me/something',
 description:'Acceso directo con botón de guardián clínico activo.',
 dateAdded:'2026-05-01'
 }
 ]
 }
 ]
 },
 {
 id:'bio-sofi-mateo-wedding',
 slug:'boda-sofia-y-mateo',
 title:'Sofía & Mateo - Boda',
 description:'Nuestra historia de amor, detalles del evento e invitaciones virtuales.',
 templateType:'boda',
 style: {
 themeColor:'rose',
 backgroundColor:'bg-rose-50/40',
 bgGradient: true,
 fontStyle:'serif',
 cardStyle:'warm',
 customWallpaper:'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)'
 },
 reviews: [
 {
 id:'rev-w1',
 userName:'Marta (Madre de Sofía)',
 rating: 5,
 comment:'¡La página más linda! Me hace llorar de felicidad ver las fotos y poder confirmar la lista de mis amigas tan fácilmente.',
 date:'2026-05-20T19:10:00Z',
 reply:'¡Te amamos mamá! Gracias por ayudarnos a planear todo.'
 }
 ],
 wedding: {
 groomName:'Mateo Restrepo',
 brideName:'Sofía Valenzuela',
 date:'2026-11-28',
 locationName:'Finca Las Mariposas, Santa Elena, Medellín',
 googleMapsUrl:'https://maps.google.com/?q=Finca+Las+Mariposas+Santa+Elena+Medellin',
 story:'Nos conocimos hace 6 años tomando un café frío en una tarde lluviosa. Después de docenas de viajes, mudanzas, adoptar dos gatitos y compartir miles de sonrisas, decidimos dar el paso definitivo de nuestras vidas en el campo de las flores.',
 coverImage:'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
 rsvps: [
 {
 id:'rsvp-1',
 name:'Paula Restrepo',
 status:'confirmado',
 companions: 1,
 dietaryNotes:'Menú vegetariano, por favor',
 email:'paula.res@restrepo.com'
 },
 {
 id:'rsvp-2',
 name:'Andrés Valenzuela',
 status:'confirmado',
 companions: 2,
 dietaryNotes:'Alergia severa a los mariscos',
 email:'andres.val@valenzuela.co'
 },
 {
 id:'rsvp-3',
 name:'Mariana Calle',
 status:'pendiente',
 companions: 0,
 email:'marianacalle@gmail.com'
 },
 {
 id:'rsvp-4',
 name:'Lucas y Liliana',
 status:'rechazado',
 companions: 0,
 email:'lucasylic@hotmail.com'
 }
 ],
 photoAlbum: [
 {
 id:'photo-1',
 url:'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600',
 caption:'Compromiso frente al lago en Bariloche',
 uploadedBy:'Sofía (Novia)',
 date:'2026-02-14'
 },
 {
 id:'photo-2',
 url:'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600',
 caption:'Eligiendo los tonos de las invitaciones florales',
 uploadedBy:'Mateo (Novio)',
 date:'2026-04-30'
 },
 {
 id:'photo-3',
 url:'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600',
 caption:'Prueba de vinos de la recepción',
 uploadedBy:'Paula Restrepo',
 date:'2026-05-19'
 }
 ]
 }
 },
 {
 id:'bio-hilux-car',
 slug:'mi-toyota-hilux',
 title:'Bitácora Hilux 4x4',
 description:'Mi récord vehicular, SOAT digital, revisiones mecánicas e historial de mantenimiento.',
 templateType:'vehiculo',
 style: {
 themeColor:'slate',
 backgroundColor:'bg-slate-100',
 bgGradient: false,
 fontStyle:'mono',
 cardStyle:'neo',
 customWallpaper:'linear-gradient(135deg, #1e293b 0%, #475569 100%)'
 },
 reviews: [
 {
 id:'rev-v1',
 userName:'Mario Taller Express',
 rating: 5,
 comment:'Excelente cuidado mecánico. Esta camioneta tiene todas las revisiones a tiempo, el aceite original y se nota el amor al motor.',
 date:'2026-05-01T14:40:00Z',
 reply:'¡Gracias Mario! El motor Toyota es para toda la vida si se cuida con el mejor.'
 }
 ],
 vehicle: {
 brand:'Toyota',
 model:'Hilux Adventure',
 year: 2022,
 plate:'HHM-198',
 color:'Gris Grafito',
 soatPolicyNumber:'SOAT-AXA-827391-B',
 soatExpiryDate:'2026-11-15',
 soatUrl:'',
 technomechanicalDate:'2026-10-05',
 technomechanicalUrl:'',
 avatarUrl:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400',
 maintenanceHistory: [
 {
 id:'maint-1',
 date:'2026-05-02',
 mileage: 48500,
 type:'Cambio de Aceite 10W-30 & Filtros',
 price: 280000,
 workshop:'Taller Express Automotriz',
 notes:'Filtro de aire reemplazado por exceso de polvo de trochas.',
 imageUrl:'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400'
 },
 {
 id:'maint-2',
 date:'2026-02-18',
 mileage: 42100,
 type:'Kit de Amortiguadores Delanteros',
 price: 1250000,
 workshop:'Suspensión Medellín',
 notes:'Instalación de kit reforzado Old Man Emu para terrenos pesados.',
 imageUrl:'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=400'
 },
 {
 id:'maint-3',
 date:'2025-09-05',
 mileage: 35000,
 type:'Reemplazo de Pastillas de Freno',
 price: 360000,
 workshop:'Frenos El Diamante',
 notes:'Pastillas cerámicas instaladas en eje delantero y bandas traseras rectificadas.',
 imageUrl:'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400'
 }
 ],
 documentsPreview: [
 {
 title:'SOAT Cobertura AXA Colpatria',
 expiryDate:'2026-11-15',
 fileUrl:'soat-2026.pdf'
 },
 {
 title:'Revisión Técnico-Mecánica Diag. CDA',
 expiryDate:'2026-10-05',
 fileUrl:'tech-mech-2026.pdf'
 }
 ]
 }
 },
 {
 id:'bio-salon-stella',
 slug:'salon-stella',
 title:'Stella Beauty Studio',
 description:'Espacio de belleza integral. Agenda tus citas, califica nuestro servicio y mira nuestro catálogo.',
 templateType:'salon',
 style: {
 themeColor:'violet',
 backgroundColor:'bg-stone-50',
 bgGradient: false,
 fontStyle:'display',
 cardStyle:'flat',
 customWallpaper:'linear-gradient(135deg, #f5f5f4 0%, #fafaf9 50%, #f5f3f7 100%)'
 },
 reviews: [
 {
 id:'rev-s1',
 userName:'Elena Cardona',
 rating: 5,
 comment:'¡El mejor Balayage de la ciudad! El trato es increíble, té de cortesía y Stella tiene unas manos de ángel.',
 date:'2026-05-20T16:00:00Z',
 reply:'¡Muchísimas gracias Elena! Es nuestro absoluto placer consentirte.'
 },
 {
 id:'rev-s2',
 userName:'Gisela Ríos',
 rating: 4,
 comment:'Las manicuras son hermosas y duraderas. El fin de semana es muy lleno, sugiero agendar con tiempo aquí en la app.',
 date:'2026-05-14T11:15:00Z'
 }
 ],
 salon: {
 name:'Stella Beauty Studio',
 address:'Calle 10A #34-22, El Poblado, Medellín',
 phone:'+4 321-7290',
 schedule:'Lunes a Sábados: 9:00 AM - 7:30 PM (Con cita previa)',
 services: [
 {
 id:'srv-1',
 name:'Corte Diseñado + Hidratación de Argán',
 price: 85000,
 duration: 60,
 category:'Corte & Peinado',
 description:'Corte acorde a visagismo personalizado, incluye lavado spa y mascarilla profunda.',
 iconName:'Scissors'
 },
 {
 id:'srv-2',
 name:'Color Balayage Signature',
 price: 320000,
 duration: 180,
 category:'Coloración',
 description:'Efecto de luz degradado suave, cuidando la fibra capilar con protector de enlaces Plex.',
 iconName:'Paintbrush'
 },
 {
 id:'srv-3',
 name:'Manicura Semipermanente + Nail Art',
 price: 65000,
 duration: 75,
 category:'Uñas',
 description:'Esmaltado de alta duración, incluye limado ruso de cutículas y dos dedos decorados.',
 iconName:'Sparkles'
 },
 {
 id:'srv-4',
 name:'Tratamiento Facial Glow HydraExpress',
 price: 110000,
 duration: 45,
 category:'Facial',
 description:'Limpieza con espátula ultrasónica, ampolleta de ácido hialurónico y velo de colágeno frío.',
 iconName:'Smile'
 }
 ],
 appointments: [
 {
 id:'apt-1',
 serviceId:'srv-1',
 serviceName:'Corte Diseñado + Hidratación de Argán',
 clientName:'Alejandra Pérez',
 clientPhone:'302 991-8273',
 date:'2026-05-22',
 time:'10:00 AM',
 status:'confirmada'
 },
 {
 id:'apt-2',
 serviceId:'srv-3',
 serviceName:'Manicura Semipermanente + Nail Art',
 clientName:'Juliana Castro',
 clientPhone:'320 119-2384',
 date:'2026-05-22',
 time:'02:30 PM',
 status:'confirmada'
 }
 ]
 }
 },
 {
 id:'bio-laura-generic',
 slug:'laura-silva',
 title:'Laura Silva',
 description:'UI/UX Designer, Fotógrafa documental y Creadora de recursos web.',
 templateType:'generico',
 style: {
 themeColor:'indigo',
 backgroundColor:'bg-zinc-950',
 bgGradient: false,
 fontStyle:'display',
 cardStyle:'cyberpunk',
 customWallpaper:'linear-gradient(135deg, #09090b 0%, #171717 50%, #1e1b4b 100%)'
 },
 reviews: [
 {
 id:'rev-g1',
 userName:'Tomás Ruiz (Agencia Digital)',
 rating: 5,
 comment:'Laura entregó la maqueta del sitio web en tiempo récord. El sistema de diseño era limpio, modular y fácil de escalar.',
 date:'2026-05-19T09:00:00Z',
 reply:'¡Qué éxito trabajar contigo Tomás! Gracias por confiar en mi criterio visual.'
 }
 ],
 generic: {
 title:'Laura Silva',
 subtitle:'Creative Designer & Photographer',
 description:'Apasionada por la intersección entre ingeniería web, tipografía helvética y retrato a blanco y negro con película de 35mm. Residiendo en Buenos Aires, disponible internacionalmente.',
 avatarUrl:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
 links: [
 {
 id:'link-g1',
 title:'Consultar Portafolio UI/UX',
 url:'https://behance.net',
 description:'Echa un vistazo a mis mis últimos estudios de caso de apps móviles',
 icon:'ExternalLink',
 isHighlighted: true
 },
 {
 id:'link-g2',
 title:'Serie Fotográfica "Rostros de la Calle"',
 url:'https://unsplash.com',
 description:'Documental de fotoperiodismo urbano capturado en cámaras Leica',
 icon:'Camera',
 isHighlighted: false
 },
 {
 id:'link-g3',
 title:'Descargar mi CV Pro (English / Español)',
 url:'https://drive.google.com',
 description:'Formato resumido 2026 con experiencia técnica y educación',
 icon:'Download',
 isHighlighted: false
 },
 {
 id:'link-g4',
 title:'Curso Interactivo de Figma Autolayouts',
 url:'https://gumroad.com',
 description:'Domina los grillas fluidas de una vez por todas',
 icon:'Globe',
 isHighlighted: false
 }
 ],
 socialLinks: {
 instagram:'https://instagram.com',
 linkedin:'https://linkedin.com',
 twitter:'https://twitter.com',
 whatsapp:'https://wa.me/5491112223334',
 tiktok:'https://tiktok.com'
 }
 }
 }
];

export function getStoredBiographies(): Biography[] {
 const data = localStorage.getItem('biographies_payload');
 if (data) {
 try {
 return JSON.parse(data);
 } catch (e) {
 console.error('Error parsing loaded biographies', e);
 }
 }
 // Store default copy
 localStorage.setItem('biographies_payload', JSON.stringify(INITIAL_BIOGRAPHIES));
 return INITIAL_BIOGRAPHIES;
}

export function saveBiographies(bios: Biography[]): void {
 localStorage.setItem('biographies_payload', JSON.stringify(bios));
}
