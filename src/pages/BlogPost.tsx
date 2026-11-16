import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import Seo from '../components/Seo';
import { SITE, whatsappLink } from '../config/site';
import { BLOG_POSTS, formatPostDate, getPost, type BlogBlock } from '../features/blog/posts';

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case 'p':
      return <p className="text-[16px] leading-[1.75] text-brand-charcoal">{block.text}</p>;
    case 'h2':
      return (
        <h2 className="pt-4 font-display font-bold text-[22px] leading-snug tracking-[-0.01em] text-brand-charcoal-dark">
          {block.text}
        </h2>
      );
    case 'ul':
      return (
        <ul className="list-disc pl-5 space-y-2 text-[16px] leading-[1.7] text-brand-charcoal">
          {block.items.map(i => <li key={i}>{i}</li>)}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal pl-5 space-y-2 text-[16px] leading-[1.7] text-brand-charcoal">
          {block.items.map(i => <li key={i}>{i}</li>)}
        </ol>
      );
    case 'img':
      return (
        <figure>
          <img src={block.src} alt={block.alt} loading="lazy" className="w-full border border-brand-line" />
          {block.caption && <figcaption className="mt-2 text-[12.5px] text-brand-muted">{block.caption}</figcaption>}
        </figure>
      );
    case 'callout':
      return (
        <aside className="border-l-4 border-brand-copper bg-brand-sand-dark/60 px-5 py-4">
          <p className="font-display font-bold text-brand-charcoal-dark">{block.title}</p>
          <p className="mt-1 text-[15px] leading-relaxed text-brand-charcoal">{block.text}</p>
        </aside>
      );
    case 'cta': {
      const cls = 'btn-ghost inline-flex items-center justify-center gap-2 min-h-[48px]';
      return block.href ? (
        <a href={block.href} target={block.external ? '_blank' : undefined} rel="noopener noreferrer" className={cls}>
          <Download className="w-4 h-4" aria-hidden="true" /> {block.label}
        </a>
      ) : (
        <Link to={block.to ?? '/'} className={cls}>{block.label}</Link>
      );
    }
  }
}

/** Agrupa los botones (`cta`) consecutivos para pintarlos juntos en una fila. */
function groupBlocks(blocks: BlogBlock[]): (BlogBlock | BlogBlock[])[] {
  const out: (BlogBlock | BlogBlock[])[] = [];
  for (const block of blocks) {
    const last = out[out.length - 1];
    if (block.type !== 'cta') out.push(block);
    else if (Array.isArray(last)) last.push(block);
    else out.push([block]);
  }
  return out;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPost(slug);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <Seo title="Entrada no encontrada" path="/blog" noindex />
        <h1 className="font-display font-bold text-xl mb-4 text-brand-charcoal">No encontramos esta entrada</h1>
        <Link to="/blog" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-copper hover:text-brand-copper-dark">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al blog
        </Link>
      </div>
    );
  }

  const url = `${SITE.url}/blog/${post.slug}`;
  const image = post.cover?.src.startsWith('http') ? post.cover.src : post.cover ? `${SITE.url}${post.cover.src}` : `${SITE.url}/logo.png`;
  const others = BLOG_POSTS.filter(p => p.slug !== post.slug);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={image}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image,
          datePublished: post.date,
          dateModified: post.date,
          inLanguage: 'es-CO',
          mainEntityOfPage: url,
          author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
          publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/logo.png` } },
        }}
      />

      <Link to="/blog" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-copper hover:text-brand-copper-dark transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Blog
      </Link>

      <header className="mt-5 mb-8">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand-muted">
          {formatPostDate(post.date)} · {post.readMinutes} min de lectura
        </p>
        <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl leading-tight tracking-[-0.02em] text-brand-charcoal-dark">
          {post.title}
        </h1>
      </header>

      {post.cover && (
        <img src={post.cover.src} alt={post.cover.alt} className="w-full aspect-[1.91/1] object-cover border border-brand-line mb-8" />
      )}

      <div className="space-y-5">
        {groupBlocks(post.blocks).map((group, i) =>
          Array.isArray(group) ? (
            // Los botones seguidos van en una misma fila (o en columna en pantallas angostas), con espacio entre ellos.
            <div key={i} className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2">
              {group.map((block, j) => <Block key={j} block={block} />)}
            </div>
          ) : (
            <Block key={i} block={group} />
          ),
        )}
      </div>

      <div className="mt-12 border border-brand-line bg-brand-sand-dark/50 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[15px] text-brand-charcoal">¿Dudas antes de comprar? Te asesoramos por WhatsApp.</p>
        <a href={whatsappLink(`Hola, leí "${post.title}" y quisiera asesoría.`)} target="_blank" rel="noopener noreferrer" className="btn-accent">
          Escribir por WhatsApp
        </a>
      </div>

      <section className="mt-14" aria-label="Más entradas">
        <h2 className="font-display font-bold text-lg text-brand-charcoal-dark mb-4">Sigue leyendo</h2>
        <ul className="space-y-3">
          {others.map(p => (
            <li key={p.slug}>
              <Link to={`/blog/${p.slug}`} className="font-display font-semibold text-brand-charcoal hover:text-brand-copper transition-colors">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
