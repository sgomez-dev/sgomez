// src/content/index.ts

// Hero / Presentación (optimizado con palabras clave SEO)
export const hero = {
  name: 'Santiago Gómez de la Torre Romero',
  title: 'Ingeniero Informático | Desarrollador Full-Stack | Apasionado por crear soluciones digitales',
  subtitle: 'Diseño soluciones que combinan funcionalidad, escalabilidad y experiencia de usuario.',
  gif: 'https://media.tenor.com/NOYF3f82b_gAAAAC/programmer.gif',
}

// About / Historia
export const about = {
  description: `
Soy ingeniero informático con sólidos conocimientos en TI y desarrollo web.
Mi trayectoria combina administración de sistemas (SysAdmin), TI y desarrollo de software, impulsado por una mentalidad autodidacta.
Desde 2021, participé en programas de formación como FUNIBER y PROFER (Universidad Europea del Atlántico), donde perfeccioné mis conocimientos técnicos y fortalecí mis habilidades de colaboración.
Actualmente, trabajo como desarrollador de software en Evenbytes usando Angular, Node.js, Firebase y Google Cloud Platform, creando soluciones escalables y de alto impacto.
Formo parte de la comunidad tecnológica como organizador de GDG Santander y participo en eventos como Hack2Progress.
Uno de mis proyectos más destacados es EliteEstate Manager, una PWA de gestión inmobiliaria desarrollada junto con Irma Romero Morales, integrando gestión de propiedades, citas y zonas.
  `,
  timeline: [
    { age: 18, desc: 'Primeros proyectos personales y PWAs' },
    { age: 19, desc: 'Portafolio 3D en Next.js' },
    { age: 20, desc: 'Trabajo en Evenbytes: Angular, Node.js, Firebase, Google Cloud' },
    { age: 21, desc: 'Proyectos ambiciosos: EliteEstate Manager, SGOMEZ Browser' },
    { age: 22, desc: 'SGOMEZ-OS y consolidación full-stack' },
  ],
}

// Projects / Proyectos destacados
export const projects = [
  {
    title: 'EliteEstate Manager',
    desc: 'Gestión inmobiliaria completa con autenticación, propiedades y citas.',
    stack: 'React, Firebase, Framer Motion',
    link: 'https://github.com/sgomez-dev/EliteEstate-Manager',
  },
  {
    title: 'SGOMEZ Portfolio',
    desc: 'Portafolio animado 3D, minimalista y moderno.',
    stack: 'Tailwind, Framer Motion',
    link: 'https://github.com/sgomez-dev/sgomez-3d',
  },
  {
    title: 'Docs Page',
    desc: 'Documentación de stacks y guías de instalación/inicialización de proyectos.',
    stack: 'React, Tailwind',
    link: 'https://github.com/sgomez-dev/docs',
  },
]

// Education / Formación académica
export const education = [
  {
    title: 'Universidad Europea del Atlántico',
    desc: '2021 - Actualidad | PROFER y estudios en ingeniería informática',
  },
  {
    title: 'FUNIBER',
    desc: 'Programas de formación en desarrollo de software y tecnologías modernas',
  },
]

// Experience / Experiencia profesional y proyectos
export const experience = [
  {
    title: 'Evenbytes',
    role: 'Desarrollador de Software',
    desc: 'Diseño y desarrollo de aplicaciones web usando Angular, Node.js, Firebase y Google Cloud.',
    period: 'Actualidad',
  },
  {
    title: 'EliteEstate Manager',
    role: 'Desarrollador Full-Stack',
    desc: 'PWA para gestión inmobiliaria junto a Irma Romero Morales, integrando propiedades, citas y zonas.',
    period: '2021 - 2023',
  },
  {
    title: 'GDG Santander',
    role: 'Organizador',
    desc: 'Coordinación de charlas, talleres y eventos para la comunidad tecnológica.',
    period: 'Actualidad',
  },
  {
    title: 'PROFER',
    role: 'Participante',
    desc: 'Programa de formación y especialización en tecnologías modernas.',
    period: '2021 - Actualidad',
  },
  {
    title: 'FUNIBER',
    role: 'Participante',
    desc: 'Programa de becas para formación en desarrollo y gestión de software.',
    period: '2021 - 2022',
  },
]

// Recommendations / Testimonios
export const recommendations = [
  { name: 'Irma Romero', role: 'Agente Inmobiliaria', comment: 'Santi es increíble, combina creatividad y profesionalismo.' },
  { name: 'GDG Santander', role: 'Organización', comment: 'Ha aportado muchísimo a la comunidad tecnológica.' },
]

// Technologies / Stack tecnológico
export const technologies = [
  {
    category: 'Frontend',
    skills: [
      { name: 'React', years: 4, icon: '⚛️' },
      { name: 'Angular', years: 3, icon: '🅰️' },
      { name: 'Next.js', years: 3, icon: '▲' },
      { name: 'TypeScript', years: 4, icon: '📘' },
      { name: 'Tailwind CSS', years: 3, icon: '🎨' },
    ]
  },
  {
    category: 'Backend',
    skills: [
      { name: 'Node.js', years: 3, icon: '🟢' },
      { name: 'Firebase', years: 3, icon: '🔥' },
      { name: 'Python', years: 2, icon: '🐍' },
      { name: 'Express', years: 3, icon: '🚂' },
      { name: 'PostgreSQL', years: 2, icon: '🐘' },
    ]
  },
  {
    category: 'DevOps & Cloud',
    skills: [
      { name: 'Google Cloud', years: 2, icon: '☁️' },
      { name: 'Docker', years: 2, icon: '🐳' },
      { name: 'Git', years: 5, icon: '📦' },
      { name: 'CI/CD', years: 2, icon: '🔄' },
    ]
  },
  {
    category: 'Mobile & Tools',
    skills: [
      { name: 'React Native', years: 2, icon: '📱' },
      { name: 'PWA', years: 3, icon: '📲' },
      { name: 'Figma', years: 3, icon: '🎯' },
      { name: 'VS Code', years: 5, icon: '💻' },
    ]
  }
]

// Contact / Links
export const contactLinks = [
  { label: 'LinkedIn', url: 'https://linkedin.com/in/sgomez-dev', color: 'bg-blue-700' },
  { label: 'GitHub', url: 'https://github.com/sgomez-dev', color: 'bg-gray-800' },
  { label: 'Instagram', url: 'https://instagram.com/santigt1503', color: 'bg-pink-500' },
  { label: 'Facebook', url: 'https://fb.com/santi.gomez.568847', color: 'bg-blue-600' },
]
