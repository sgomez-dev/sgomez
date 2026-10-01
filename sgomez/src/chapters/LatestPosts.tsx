import Image from "next/image";
import { getDictionary } from "@/i18n";
import { fill } from "@/i18n/fill";
import type { Lang } from "@/i18n/languages";

const BLOG_API = "https://blog.sgomez.dev/api/blog/posts";
const BLOG_URL = "https://blog.sgomez.dev";
/**
 * Hosts de las portadas que `next.config.ts` deja optimizar (`remotePatterns`).
 * Una portada de otro host haría fallar el render de `next/image`, y mostrarla
 * con un `<img>` directo rompería la promesa de la política de privacidad (el
 * navegador no pide nada a terceros), así que esa tarjeta sale sin imagen.
 */
const COVER_HOSTS = ["veelwadirgvhyvquvfnn.supabase.co"];

function coverSrc(url: string | null): string | null {
  if (!url) return null;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && COVER_HOSTS.includes(hostname) ? url : null;
  } catch {
    return null;
  }
}

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  coverAlt: string | null;
  category: string;
  readingTime: number;
  publishedAt: string | null;
}

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";

export function blogApiDisabled(): boolean {
  return process.env.BLOG_API_DISABLED === "1";
}

/**
 * Últimas entradas del blog, dentro del capítulo 08. Si el blog no responde,
 * la API falla o no hay entradas, no renderiza nada: la página no se rompe.
 * Las entradas están escritas en español, y así se marcan en `lang`.
 */
export default async function LatestPosts({ lang }: { lang: Lang }) {
  // Interruptor para los e2e (playwright.config.ts): el fetch ocurre en el
  // servidor al construir o revalidar, así que el navegador no puede
  // interceptarlo. Con BLOG_API_DISABLED=1 no se llama al blog y no se pinta
  // nada, y las pruebas no dependen de blog.sgomez.dev. Sin la variable el
  // comportamiento de producción no cambia.
  if (blogApiDisabled()) return null;
  let posts: BlogPost[] = [];
  try {
    const res = await fetch(`${BLOG_API}?pageSize=3`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    posts = data.items ?? [];
  } catch {
    return null;
  }
  if (posts.length === 0) return null;

  const d = getDictionary(lang);
  const categories = d.chapters.proof.categories as Record<string, string>;
  const date = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "es-ES", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div id="blog" className="mt-16 scroll-mt-[calc(4rem+var(--safe-top))] lg:mt-24" role="group" aria-labelledby="proof-blog">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <h3 id="proof-blog" className="text-[length:var(--step--1)] font-medium uppercase tracking-[0.14em] text-[color:var(--text-2)]">
          {d.chapters.proof.blog}
        </h3>
        <a href={BLOG_URL} rel="noopener" className={`inline-flex min-h-11 items-center gap-1.5 text-[length:var(--step-0)] font-medium text-[color:var(--light-2)] underline-offset-4 hover:underline ${focus}`}>
          {d.chapters.proof.blogAll}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
      <ul className="mt-4 grid list-none gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug} className="flex min-w-0">
            <a
              href={`${BLOG_URL}/${post.slug}`}
              rel="noopener"
              className={`group flex min-h-11 w-full flex-col overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] transition-colors hover:bg-[color:var(--bg-3)] ${focus}`}
            >
              {coverSrc(post.coverImage) ? (
                <div className="relative aspect-video overflow-hidden bg-[color:var(--bg-3)]">
                  {/* Decorativa: el título de la tarjeta ya dice de qué va. El servidor la descarga y la optimiza. */}
                  <Image
                    src={coverSrc(post.coverImage)!}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                <span className="text-[length:var(--step--1)] font-medium uppercase tracking-[0.1em] text-[color:var(--light-1)]">
                  {categories[post.category] ?? post.category}
                </span>
                <span lang="es" className="text-[length:var(--step-1)] font-semibold leading-[1.2] tracking-[-0.02em] text-[color:var(--text)] [overflow-wrap:anywhere]">
                  {post.title}
                </span>
                <span className="mt-auto flex flex-wrap gap-x-2 pt-2 text-[length:var(--step--1)] text-[color:var(--text-2)]">
                  {post.publishedAt ? <time dateTime={post.publishedAt}>{date.format(new Date(post.publishedAt))}</time> : null}
                  {post.publishedAt ? <span aria-hidden="true">·</span> : null}
                  <span>{fill(d.chapters.proof.minutes, { n: post.readingTime })}</span>
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
