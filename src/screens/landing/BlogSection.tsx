import type { ReactNode } from 'react';

const BLOG_POSTS = [
  {
    tag: 'TECHNIQUE', tagColor: 'purple',
    title: 'The 3-second rule that turns "think it over" into a closed deal',
    excerpt: 'Most reps go silent after a stall — and lose. Here\'s the counter-intuitive pause technique that flips hesitation into commitment.',
    date: 'Mar 18, 2025', readTime: '5 min',
  },
  {
    tag: 'TRAINING', tagColor: 'green',
    title: 'Why practicing on real prospects is killing your close rate',
    excerpt: 'Every time you rehearse on a live call, you\'re paying tuition to someone who isn\'t buying. AI roleplay changes the math.',
    date: 'Feb 28, 2025', readTime: '4 min',
  },
  {
    tag: 'MULTILINGUAL', tagColor: 'blue',
    title: 'How to close in a language that isn\'t your first',
    excerpt: 'Non-native speakers have a hidden advantage in sales. Real-time AI coaching amplifies it. Here\'s how to use it.',
    date: 'Feb 10, 2025', readTime: '6 min',
  },
  {
    tag: 'DATA', tagColor: 'yellow',
    title: 'We analysed 10,000 sales calls. Here\'s what separates the top 5%.',
    excerpt: 'Objection timing, question frequency, and silence patterns — the data reveals what elite reps do differently.',
    date: 'Jan 22, 2025', readTime: '8 min',
  },
];

interface BlogSectionProps {
  nav: ReactNode;
}

export function BlogSection({ nav }: BlogSectionProps) {
  const [featured, ...rest] = BLOG_POSTS;
  return (
    <div className="lp">
      {nav}
      <div className="lp__sv lp__sv--blog">
        <div className="lp__sv-hero">
          <div className="lp__sv-label">BLOG</div>
          <h2 className="lp__sv-h2">The Pitchbase Sales Blog</h2>
          <p className="lp__sv-sub">Techniques, data, and ideas for reps who want to close more.</p>
        </div>

        {/* Featured post */}
        <div className="lp__blog-featured">
          <div className="lp__blog-featured-inner">
            <div className="lp__blog-featured-meta">
              <span className={`lp__blog-tag lp__blog-tag--${featured.tagColor}`}>{featured.tag}</span>
              <span className="lp__blog-meta">{featured.date} · {featured.readTime} read</span>
            </div>
            <div className="lp__blog-featured-title">{featured.title}</div>
            <p className="lp__blog-featured-excerpt">{featured.excerpt}</p>
            <button className="lp__blog-read lp__blog-read--featured">Read article →</button>
          </div>
        </div>

        {/* Remaining posts */}
        <div className="lp__blog-grid">
          {rest.map((post, i) => (
            <div key={i} className="lp__blog-card">
              <div className="lp__blog-card-top">
                <span className={`lp__blog-tag lp__blog-tag--${post.tagColor}`}>{post.tag}</span>
                <span className="lp__blog-meta">{post.date} · {post.readTime} read</span>
              </div>
              <div className="lp__blog-title">{post.title}</div>
              <p className="lp__blog-excerpt">{post.excerpt}</p>
              <button className="lp__blog-read">Read article →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
