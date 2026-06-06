(function () {
  function loadScript(src, cb) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    document.head.appendChild(s);
  }

  function init() {
    loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
      function () {
        loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
          setup
        );
      }
    );
  }

  function setup() {
    const slides = Array.from(document.querySelectorAll('.slide'));
    if (!slides.length) return;

    const labelEl = document.querySelector('.carousel-label');
    const rawTitle = labelEl
      ? labelEl.textContent.split('—')[1]?.split('·')[0]?.trim()
      : 'carousel';
    const slug = (rawTitle || 'carousel').toLowerCase().replace(/\s+/g, '-');

    /* ── Export bar ── */
    const bar = document.createElement('div');
    bar.id = 'pitchr-export-bar';
    bar.innerHTML = `
      <style>
        #pitchr-export-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #0a0a0a; border-top: 1px solid #222;
          padding: 14px 32px; display: flex; align-items: center;
          gap: 16px; z-index: 9999;
          font-family: 'Figtree', sans-serif;
        }
        #pitchr-export-bar .eb-title {
          color: #555; font-size: 13px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase; flex: 1;
        }
        #pitchr-export-bar .eb-count {
          color: #444; font-size: 13px;
        }
        .eb-btn {
          border: none; border-radius: 100px; cursor: pointer;
          font-family: 'Figtree', sans-serif; font-weight: 700;
          font-size: 14px; padding: 11px 26px; transition: opacity .2s;
        }
        .eb-btn:disabled { opacity: .5; cursor: not-allowed; }
        .eb-btn:hover:not(:disabled) { opacity: .85; }
        .eb-btn-zip {
          background: linear-gradient(135deg, #814ac8, #df7afe);
          color: #fff;
        }
        .eb-btn-single {
          background: rgba(129,74,200,.15);
          color: #df7afe;
          border: 1px solid rgba(129,74,200,.35);
        }
        .eb-progress {
          display: none; color: #df7afe; font-size: 13px;
          font-weight: 600; min-width: 180px; text-align: right;
        }
      </style>
      <span class="eb-title">Pitchr Export</span>
      <span class="eb-count">${slides.length} slides</span>
      <span class="eb-progress" id="eb-prog"></span>
      <button class="eb-btn eb-btn-single" id="eb-single">⬇ Active Slide</button>
      <button class="eb-btn eb-btn-zip" id="eb-zip">⬇ All Slides (ZIP)</button>
    `;
    document.body.appendChild(bar);
    document.body.style.paddingBottom = '70px';

    /* ── Track which slide is in view ── */
    let activeIdx = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            activeIdx = slides.indexOf(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    slides.forEach((s) => observer.observe(s));

    /* ── Capture one slide ── */
    async function captureSlide(slide) {
      await document.fonts.ready;
      return html2canvas(slide, {
        width: 1080,
        height: 1080,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        logging: false,
        onclone: (doc) => {
          /* Hide export bar in clone */
          const bar = doc.getElementById('pitchr-export-bar');
          if (bar) bar.style.display = 'none';
          /* Force slide-num and brand-mark visible */
        },
      });
    }

    /* ── Single slide download ── */
    document.getElementById('eb-single').onclick = async function () {
      const btn = this;
      btn.disabled = true;
      btn.textContent = 'Exporting…';
      try {
        const canvas = await captureSlide(slides[activeIdx]);
        canvas.toBlob((blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `${slug}-slide-${String(activeIdx + 1).padStart(2, '0')}.png`;
          a.click();
        }, 'image/png');
      } catch (e) {
        console.error(e);
      }
      btn.textContent = '⬇ Active Slide';
      btn.disabled = false;
    };

    /* ── ZIP all slides ── */
    document.getElementById('eb-zip').onclick = async function () {
      const btn = this;
      const singleBtn = document.getElementById('eb-single');
      const prog = document.getElementById('eb-prog');
      btn.disabled = true;
      singleBtn.disabled = true;
      prog.style.display = 'block';

      const zip = new JSZip();

      for (let i = 0; i < slides.length; i++) {
        prog.textContent = `Slide ${i + 1} / ${slides.length}…`;
        try {
          const canvas = await captureSlide(slides[i]);
          const blob = await new Promise((res) =>
            canvas.toBlob(res, 'image/png')
          );
          zip.file(`${slug}-slide-${String(i + 1).padStart(2, '0')}.png`, blob);
        } catch (e) {
          console.error('Slide', i + 1, e);
        }
      }

      prog.textContent = 'Creating ZIP…';
      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `pitchr-${slug}.zip`;
      a.click();

      prog.style.display = 'none';
      btn.textContent = '⬇ All Slides (ZIP)';
      btn.disabled = false;
      singleBtn.disabled = false;
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
