import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo from '../components/Seo';
import { SITE } from '../config/site';
import { BLOG_POSTS, formatPostDate, type BlogPost } from '../features/blog/posts';

function PostCover({ post }: { post: BlogPost }) {
  if (post.cover) {
    return (
      <img
        src={post.cover.src}
        alt={post.cover.alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    );
  }
  return (
    <div className="w-full h-full bg-brand-sand-dark flex items-center justify-center">
      <img src="/logo.png" alt="" className="h-24 w-auto object-contain" />
    </div>
  );
}

export default function Blog() {
  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <Seo
        title="Blog"
        description="Guías de OriginAXM: cómo reconocer un Stanley original, cómo elegir tu termo y cómo funciona tu pedido."
        path="/blog"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: `Blog de ${SITE.name}`,
          url: `${SITE.url}/blog`,
          blogPost: BLOG_POSTS.map(p => ({
            '@type': 'BlogPosting',
            headline: p.title,
            url: `${SITE.url}/blog/${p.slug}`,
            datePublished: p.date,
          })),
        }}
      />

      <header className="mb-10 sm:mb-14 max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-muted">Blog</p>
        <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl tracking-[-0.02em] text-brand-charcoal-dark">
          Guías para comprar tu Stanley con confianza
        </h1>
        <p className="mt-4 text-brand-charcoal-light leading-relaxed">
          Consejos para identificar productos originales, elegir el modelo que necesitas y entender cómo funciona tu pedido.
        </p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map(post => (
          <article key={post.slug} className="group flex flex-col">
            <Link to={`/blog/${post.slug}`} className="block aspect-[1.91/1] overflow-hidden border border-brand-line bg-brand-sand-dark">
              <PostCover post={post} />
            </Link>
            <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand-muted">
              {formatPostDate(post.date)} · {post.readMinutes} min de lectura
            </p>
            <h2 className="mt-2 font-display font-bold text-[19px] leading-snug text-brand-charcoal-dark">
              <Link to={`/blog/${post.slug}`} className="hover:text-brand-copper transition-colors">{post.title}</Link>
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-brand-charcoal-light">{post.excerpt}</p>
            <Link
              to={`/blog/${post.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-copper hover:text-brand-copper-dark transition-colors"
            >
              Leer la guía <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
