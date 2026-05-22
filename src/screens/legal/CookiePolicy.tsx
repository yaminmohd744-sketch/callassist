import type { ReactNode } from 'react';

interface CookiePolicyProps {
  nav: ReactNode;
  goSection: (id: string) => void;
}

export function CookiePolicy({ nav, goSection }: CookiePolicyProps) {
  const toc = [
    { id: 'cp-1', label: '1. What are cookies?' },
    { id: 'cp-2', label: '2. Cookies we use' },
    { id: 'cp-3', label: '3. Cookie table' },
    { id: 'cp-4', label: '4. Third-party cookies' },
    { id: 'cp-5', label: '5. How to control cookies' },
    { id: 'cp-6', label: '6. Changes to this policy' },
    { id: 'cp-7', label: '7. Contact' },
  ];
  return (
    <div className="lp">
      {nav}
      <div className="lp__legal-page">
        <div className="lp__legal-header">
          <div className="lp__sv-label">LEGAL</div>
          <h1 className="lp__legal-title">Cookie Policy</h1>
          <p className="lp__legal-meta">Effective date: 1 April 2025 &nbsp;·&nbsp; Last updated: 6 April 2026</p>
          <p className="lp__legal-intro">
            This Cookie Policy explains what cookies are, which cookies Pitchr uses, why we use them, and how you can control them. It should be read alongside our <button className="lp__legal-inline-link" onClick={() => goSection('privacy')}>Privacy Policy</button>.
          </p>
          <div className="lp__legal-links">
            <button className="lp__legal-sibling" onClick={() => goSection('privacy')}>Privacy Policy →</button>
            <button className="lp__legal-sibling" onClick={() => goSection('terms')}>Terms of Service →</button>
          </div>
        </div>

        <div className="lp__legal-layout">
          <aside className="lp__legal-toc">
            <div className="lp__legal-toc-label">On this page</div>
            {toc.map(item => (
              <a key={item.id} className="lp__legal-toc-link" href={`#${item.id}`}>{item.label}</a>
            ))}
          </aside>

          <div className="lp__legal-content">

            <section id="cp-1" className="lp__legal-section">
              <h2>1. What are cookies?</h2>
              <p>Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work, improve user experience, and provide information to site owners. Alongside cookies, we may also use similar technologies such as local storage and session storage, which are governed by this same policy.</p>
              <p>Cookies can be "session" cookies (deleted when you close your browser) or "persistent" cookies (remaining on your device for a set period or until you delete them). They can be set by us ("first-party") or by third-party services we embed.</p>
            </section>

            <section id="cp-2" className="lp__legal-section">
              <h2>2. Cookies we use</h2>
              <p>We use three categories of cookies:</p>
              <ul className="lp__legal-list">
                <li><strong>Strictly necessary cookies</strong> — essential for the Service to function. These cannot be disabled without breaking core functionality (authentication, security). They do not require your consent under applicable law.</li>
                <li><strong>Functional cookies</strong> — remember your preferences (theme, language) to improve your experience. These are set only if you have not disabled them in your browser.</li>
                <li><strong>Analytics cookies</strong> — help us understand how users interact with the Service (pages visited, features used, session duration). These are set only with your consent, expressed when you first use the Service.</li>
              </ul>
              <p>We do <strong>not</strong> use advertising, behavioural targeting, or cross-site tracking cookies.</p>
            </section>

            <section id="cp-3" className="lp__legal-section">
              <h2>3. Cookie table</h2>
              <div className="lp__cookie-table-wrap">
                <table className="lp__cookie-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                      <th>Party</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>sb-access-token</code></td>
                      <td><span className="lp__cookie-tag lp__cookie-tag--necessary">Necessary</span></td>
                      <td>Supabase authentication JWT — keeps you logged in</td>
                      <td>1 hour (auto-refreshed)</td>
                      <td>First-party</td>
                    </tr>
                    <tr>
                      <td><code>sb-refresh-token</code></td>
                      <td><span className="lp__cookie-tag lp__cookie-tag--necessary">Necessary</span></td>
                      <td>Supabase long-lived refresh token for session renewal</td>
                      <td>60 days</td>
                      <td>First-party</td>
                    </tr>
                    <tr>
                      <td><code>pp-theme</code></td>
                      <td><span className="lp__cookie-tag lp__cookie-tag--functional">Functional</span></td>
                      <td>Stores your dark/light mode preference (localStorage)</td>
                      <td>Persistent</td>
                      <td>First-party</td>
                    </tr>
                    <tr>
                      <td><code>pp-lang</code></td>
                      <td><span className="lp__cookie-tag lp__cookie-tag--functional">Functional</span></td>
                      <td>Stores your preferred coaching language (localStorage)</td>
                      <td>Persistent</td>
                      <td>First-party</td>
                    </tr>
                    <tr>
                      <td><code>pp-streak</code></td>
                      <td><span className="lp__cookie-tag lp__cookie-tag--functional">Functional</span></td>
                      <td>Tracks your daily practice streak (localStorage)</td>
                      <td>Persistent</td>
                      <td>First-party</td>
                    </tr>
                    <tr>
                      <td><code>_pp_analytics</code></td>
                      <td><span className="lp__cookie-tag lp__cookie-tag--analytics">Analytics</span></td>
                      <td>Aggregated, anonymised session analytics (feature usage, error rates). Set only with consent.</td>
                      <td>13 months</td>
                      <td>First-party</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="cp-4" className="lp__legal-section">
              <h2>4. Third-party cookies</h2>
              <p>Our payment provider <strong>Stripe</strong> may set cookies during checkout to prevent fraud and ensure payment security. These are strictly necessary for the transaction and are governed by <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer">Stripe's Cookie Policy</a>.</p>
              <p>We do not embed any social media widgets, advertising networks, or other third-party tracking scripts that would set their own cookies on our domain.</p>
            </section>

            <section id="cp-5" className="lp__legal-section">
              <h2>5. How to control cookies</h2>
              <p><strong>Browser settings.</strong> You can control or delete cookies through your browser settings. Note that disabling strictly necessary cookies (Supabase session tokens) will prevent you from logging in. Disabling analytics or functional cookies will not affect the core service.</p>
              <p>Instructions for the most common browsers:</p>
              <ul className="lp__legal-list">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
              </ul>
              <p><strong>Analytics opt-out.</strong> You may withdraw consent for analytics cookies at any time by clearing the <code>_pp_analytics</code> cookie in your browser and declining when prompted. This will not affect data collected before withdrawal.</p>
              <p><strong>Do Not Track.</strong> Some browsers allow you to set a "Do Not Track" signal. We respect this signal and do not set analytics cookies when it is active.</p>
            </section>

            <section id="cp-6" className="lp__legal-section">
              <h2>6. Changes to this policy</h2>
              <p>We may update this Cookie Policy when we add or remove cookies. Changes will be reflected with an updated "Last updated" date. For significant changes (e.g., adding new third-party cookies), we will provide in-app notice and, where required by law, ask for fresh consent.</p>
            </section>

            <section id="cp-7" className="lp__legal-section">
              <h2>7. Contact</h2>
              <p>Questions about our use of cookies? Email <a href="mailto:privacy@pitchr.org">privacy@pitchr.org</a>. We aim to respond within 5 business days.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
