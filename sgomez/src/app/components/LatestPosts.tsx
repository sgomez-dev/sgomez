const BLOG_API = "https://blog.sgomez.dev/api/blog/posts"

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
  coverAlt: string | null
  category: string
  readingTime: number
  publishedAt: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
  PROYECTO: "text-blue-400",
  PODCAST: "text-purple-400",
  REFLEXION: "text-amber-400",
  TUTORIAL: "text-green-400",
  NOTICIA: "text-pink-400",
  GENERAL: "text-gray-400",
}

const CATEGORY_LABELS: Record<string, string> = {
  PROYECTO: "Proyecto",
  PODCAST: "Podcast",
  REFLEXION: "Reflexión",
  TUTORIAL: "Tutorial",
  NOTICIA: "Noticia",
  GENERAL: "General",
}

export default async function LatestPosts() {
  let posts: BlogPost[] = []

  try {
    const res = await fetch(`${BLOG_API}?pageSize=3`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    posts = data.items ?? []
  } catch {
    return null
  }

  if (posts.length === 0) return null

  return (
    <section id="blog" className="section-container">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-violet-400 font-mono text-sm mb-2">~/blog</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Últimas entradas</h2>
          <p className="mt-3 text-gray-400 max-w-md">
            Artículos sobre desarrollo, negocio y proyectos.
          </p>
        </div>
        <a
          href="https://blog.sgomez.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Ver todos
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`https://blog.sgomez.dev/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group glass rounded-2xl overflow-hidden transition-all duration-300 hover:ring-1 hover:ring-white/10"
          >
            <div className="relative aspect-video overflow-hidden">
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImage}
                  alt={post.coverAlt ?? post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <span className="font-mono text-4xl font-bold text-white/5">sg</span>
                </div>
              )}
            </div>

            <div className="p-5">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${CATEGORY_COLORS[post.category] ?? "text-gray-400"}`}>
                {CATEGORY_LABELS[post.category] ?? post.category}
              </span>

              <h3 className="mt-2 text-base font-semibold leading-snug line-clamp-2 group-hover:text-violet-400 transition-colors duration-200">
                {post.title}
              </h3>

              <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                {post.publishedAt && (
                  <time>
                    {new Intl.DateTimeFormat("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(post.publishedAt))}
                  </time>
                )}
                <span>·</span>
                <span>{post.readingTime} min</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <a
          href="https://blog.sgomez.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Ver todos los artículos →
        </a>
      </div>
    </section>
  )
}
