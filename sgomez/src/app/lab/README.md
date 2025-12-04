# 🖥️ SGOMEZ-OS

Sistema operativo virtual estilo Windows para el portafolio.

## 📁 Estructura

```
lab/
├── page.tsx          # Sistema de gestión de ventanas
├── Desktop.tsx       # Escritorio con iconos de apps
├── Window.tsx        # Componente de ventana (drag, resize, etc)
├── Taskbar.tsx       # Barra de tareas con reloj y menú
├── apps/            # Aplicaciones integradas
│   ├── ToDoApp.tsx
│   ├── BudgetApp.tsx
│   └── ...
└── icons/           # Iconos PNG de las apps
```

## ✨ Características

- ✅ **Múltiples ventanas** abiertas simultáneamente
- ✅ **Arrastrar** ventanas por la pantalla
- ✅ **Redimensionar** desde bordes y esquinas
- ✅ **Minimizar/Maximizar/Cerrar** ventanas
- ✅ **Z-index automático** (ventana activa al frente)
- ✅ **Taskbar** con ventanas abiertas y reloj en tiempo real
- ✅ **Soporte para iframes** para apps externas

## 🎨 Agregar Nueva Aplicación

### Opción 1: Componente React Integrado

```typescript
// En page.tsx, agrega a apps[]
{
  id: 'mi-app',
  title: 'Mi App',
  component: MiComponente,  // Importar componente
  icon: '/lab/icons/mi-app.png',
  color: 'bg-blue-500'
}
```

1. Crea tu componente en `apps/MiApp.tsx`
2. Añade el icono PNG en `public/lab/icons/mi-app.png` (64x64px recomendado)
3. Importa el componente en `page.tsx`
4. Agrégalo al array `apps`

### Opción 2: App Externa con iframe

```typescript
// En page.tsx, agrega a apps[]
{
  id: 'github',
  title: 'GitHub',
  url: 'https://github.com/sgomez-dev',  // URL externa
  icon: '/lab/icons/github.png',
  color: 'bg-gray-800'
}
```

**Ejemplos de URLs para tus proyectos:**

```typescript
export const apps: AppConfig[] = [
  // Apps integradas (componentes React)
  {
    id: "todo",
    title: "To-Do App",
    component: ToDoApp,
    icon: "/lab/icons/todo-app.png",
    color: "bg-green-500",
  },
  {
    id: "budget",
    title: "Budget App",
    component: BudgetApp,
    icon: "/lab/icons/budget.png",
    color: "bg-yellow-500",
  },

  // Apps externas (iframes)
  {
    id: "github",
    title: "GitHub",
    url: "https://github.com/sgomez-dev",
    icon: "/lab/icons/github.png",
    color: "bg-gray-800",
  },
  {
    id: "portfolio",
    title: "Portfolio 3D",
    url: "https://sgomez-3d.vercel.app",
    icon: "/lab/icons/portfolio.png",
    color: "bg-purple-500",
  },
  {
    id: "docs",
    title: "Docs",
    url: "https://sgomez-docs.vercel.app",
    icon: "/lab/icons/docs.png",
    color: "bg-orange-500",
  },
];
```

## 🔐 Seguridad de iframes

Los iframes tienen sandbox configurado con:

- `allow-same-origin` - Permite contenido del mismo origen
- `allow-scripts` - Permite JavaScript
- `allow-forms` - Permite formularios
- `allow-popups` - Permite ventanas emergentes
- `allow-modals` - Permite diálogos modales

⚠️ **Nota:** Algunos sitios web bloquean ser cargados en iframes (X-Frame-Options). En ese caso, considera usar un componente React personalizado.

## 🎯 Propiedades de WindowState

```typescript
interface WindowState {
  id: string; // Identificador único
  title: string; // Título en barra de ventana
  component?: React.ComponentType; // Componente React (opcional)
  url?: string; // URL para iframe (opcional)
  isMinimized: boolean; // Estado minimizado
  isMaximized: boolean; // Estado maximizado
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number; // Orden de apilamiento
  icon?: string; // Ruta al icono PNG
}
```

## 🖼️ Formato de Iconos

- **Formato:** PNG con transparencia
- **Tamaño recomendado:** 64x64px o 128x128px
- **Ubicación:** `public/lab/icons/`
- **Nombrado:** kebab-case (ej: `mi-app.png`)

## 🚀 Desarrollo

```bash
npm run dev
```

Navega a `http://localhost:3000/lab`

## 📝 Notas

- Las ventanas se posicionan automáticamente con cascade
- El tamaño por defecto es 800x600px
- Z-index incrementa automáticamente al hacer focus
- Las ventanas minimizadas se ocultan pero permanecen en la taskbar
