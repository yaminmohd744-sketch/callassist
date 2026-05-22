import type { ReactNode } from 'react';

interface PrivacyPolicyProps {
  nav: ReactNode;
  goSection: (id: string) => void;
}

export function PrivacyPolicy({ nav, goSection }: PrivacyPolicyProps) {
  const toc = [
    { id: 'pp-1',  label: '1. Who we are' },
    { id: 'pp-2',  label: '2. Information we collect' },
    { id: 'pp-3',  label: '3. Legal bases for processing' },
    { id: 'pp-4',  label: '4. How we use your data' },
    { id: 'pp-5',  label: '5. Sharing & disclosure' },
    { id: 'pp-6',  label: '6. International transfers' },
    { id: 'pp-7',  label: '7. Data retention' },
    { id: 'pp-8',  label: '8. Security' },
    { id: 'pp-9',  label: '9. Your rights' },
    { id: 'pp-10', label: "10. Children's privacy" },
    { id: 'pp-11', label: '11. Cookies' },
    { id: 'pp-12', label: '12. Changes to this policy' },
    { id: 'pp-13', label: '13. Contact & complaints' },
  ];
  return (
    <div className="lp">
      {nav}
      <div className="lp__legal-page">
        <div className="lp__legal-header">
          <div className="lp__sv-label">LEGAL</div>
          <h1 className="lp__legal-title">Privacy Policy</h1>
          <p className="lp__legal-meta">Effective date: 1 April 2025 &nbsp;·&nbsp; Last updated: 6 April 2026</p>
          <p className="lp__legal-intro">
            Pitchr ("we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains what information we collect, why we collect it, how we use it, and what rights you have in relation to it. It applies to all users of <strong>pitchr.org</strong> and the Pitchr desktop and web application.
          </p>
          <div className="lp__legal-links">
            <button className="lp__legal-sibling" onClick={() => goSection('terms')}>Terms of Service →</button>
            <button className="lp__legal-sibling" onClick={() => goSection('cookies')}>Cookie Policy →</button>
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

            <section id="pp-1" className="lp__legal-section">
              <h2>1. Who we are</h2>
              <p>Pitchr is operated by <strong>Pitchr Ltd</strong>, a company incorporated in England and Wales. We are the data controller for the personal data described in this policy. Our registered address is available upon written request to <a href="mailto:privacy@pitchr.org">privacy@pitchr.org</a>.</p>
            </section>

            <section id="pp-2" className="lp__legal-section">
              <h2>2. Information we collect</h2>
              <p><strong>Account data.</strong> When you create an account, we collect your name, email address, and (for paid plans) payment information. Payment card details are never stored by us — they are handled directly by Stripe, our PCI-DSS Level 1 certified payment processor.</p>
              <p><strong>Call and session data.</strong> During live calls and training sessions, speech recognition is performed locally in your browser using the Web Speech API. Raw audio is <em>never</em> transmitted to our servers. We receive only the transcribed text output. This text, along with AI suggestions, lead scores, call duration, and call stage, is saved to your account after each session.</p>
              <p><strong>Usage and technical data.</strong> We automatically collect standard technical information including your IP address, browser type and version, operating system, referring URL, pages visited within the application, feature interactions, session duration, and error logs. This information is used exclusively for product improvement and security monitoring.</p>
              <p><strong>Support communications.</strong> If you contact us for support, we retain the content of that communication and any information you choose to share to resolve your query.</p>
              <p><strong>Cookies and local storage.</strong> We use session cookies, local storage, and similar browser technologies. See Section 11 and our Cookie Policy for full details.</p>

              <div className="lp__privacy-summary">
                <div className="lp__privacy-summary-title">◉ At a glance — what we store per call</div>
                <div className="lp__privacy-summary-row lp__privacy-summary-row--safe">
                  <span className="lp__privacy-summary-icon">✓</span>
                  <span>Transcript text &amp; AI suggestions — stored per session, linked to your account only</span>
                </div>
                <div className="lp__privacy-summary-row lp__privacy-summary-row--safe">
                  <span className="lp__privacy-summary-icon">✓</span>
                  <span>Session stats (duration, objection count, close probability) — used for your Analytics</span>
                </div>
                <div className="lp__privacy-summary-row lp__privacy-summary-row--neutral">
                  <span className="lp__privacy-summary-icon">◎</span>
                  <span>Call config (prospect name, company, pitch) — stored locally in your browser &amp; in Supabase</span>
                </div>
                <div className="lp__privacy-summary-row lp__privacy-summary-row--never">
                  <span className="lp__privacy-summary-icon">✕</span>
                  <span>Audio — <strong>never</strong> recorded, never transmitted. Speech-to-text runs entirely in your browser</span>
                </div>
                <div className="lp__privacy-summary-row lp__privacy-summary-row--never">
                  <span className="lp__privacy-summary-icon">✕</span>
                  <span>Your data is <strong>never</strong> sold or shared with third parties for any commercial purpose</span>
                </div>
              </div>
            </section>

            <section id="pp-3" className="lp__legal-section">
              <h2>3. Legal bases for processing (GDPR / UK GDPR)</h2>
              <p>For users in the European Economic Area (EEA) and the United Kingdom, we rely on the following legal bases under Article 6 of the GDPR / UK GDPR:</p>
              <ul className="lp__legal-list">
                <li><strong>Contract (Art. 6(1)(b)):</strong> Processing your account data, call sessions, and CRM data is necessary to perform the contract (our Terms of Service) you have with us.</li>
                <li><strong>Legitimate interests (Art. 6(1)(f)):</strong> We process technical and usage data to detect fraud, secure our systems, and improve the product. Our legitimate interests do not override your rights where they would cause you harm.</li>
                <li><strong>Legal obligation (Art. 6(1)(c)):</strong> We may process data where required to comply with applicable law, including tax and financial record-keeping obligations.</li>
                <li><strong>Consent (Art. 6(1)(a)):</strong> Where we rely on consent (e.g., optional analytics cookies or marketing communications), you may withdraw that consent at any time without affecting the lawfulness of processing before withdrawal.</li>
              </ul>
            </section>

            <section id="pp-4" className="lp__legal-section">
              <h2>4. How we use your data</h2>
              <ul className="lp__legal-list">
                <li>To provide, operate, and maintain the Pitchr service.</li>
                <li>To process payments and send transactional communications (receipts, billing alerts, password resets).</li>
                <li>To generate and display AI-powered coaching suggestions, post-call analysis, lead scores, and follow-up emails within your account.</li>
                <li>To provide customer support and respond to queries.</li>
                <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
                <li>To monitor and improve the performance, security, and reliability of the service.</li>
                <li>To send product update emails where you have opted in.</li>
              </ul>
              <p><strong>We do not sell your personal data.</strong> We do not share your call transcripts, CRM data, or any personally identifiable information with third parties for marketing or advertising purposes. We do not use your call transcripts to train our own or third-party AI models without your explicit, freely given consent.</p>
            </section>

            <section id="pp-5" className="lp__legal-section">
              <h2>5. Sharing &amp; disclosure</h2>
              <p>We share data only in the following limited circumstances:</p>
              <ul className="lp__legal-list">
                <li><strong>Service providers (processors).</strong> We use third-party vendors who act as data processors on our behalf: <strong>Supabase</strong> (database, authentication, and storage), <strong>Stripe</strong> (payment processing), and <strong>OpenAI</strong> (AI-generated coaching suggestions, post-call analysis, and follow-up email generation). Each vendor is bound by a Data Processing Agreement (DPA) and may not use your data for their own purposes. A full list of sub-processors is available on request.</li>
                <li><strong>Legal requirements.</strong> We may disclose your data where required by law, court order, or to cooperate with law enforcement agencies, provided we are legally permitted to notify you before doing so.</li>
                <li><strong>Business transfers.</strong> If Pitchr Ltd is acquired by or merges with another company, your data may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our website before any transfer and before your data becomes subject to a different privacy policy.</li>
                <li><strong>With your consent.</strong> We may share information for any other purpose with your explicit prior consent.</li>
              </ul>
            </section>

            <section id="pp-6" className="lp__legal-section">
              <h2>6. International data transfers</h2>
              <p>Your data may be stored or processed in countries outside the EEA and UK, including the United States, where our service providers operate infrastructure. Where such transfers occur, we ensure they are protected by appropriate safeguards:</p>
              <ul className="lp__legal-list">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission and/or the UK Information Commissioner's Office (ICO).</li>
                <li>Adequacy decisions where applicable.</li>
                <li>Binding corporate rules where applicable.</li>
              </ul>
              <p>You may request a copy of the relevant transfer mechanism by contacting <a href="mailto:privacy@pitchr.org">privacy@pitchr.org</a>.</p>
            </section>

            <section id="pp-7" className="lp__legal-section">
              <h2>7. Data retention</h2>
              <p>We retain your personal data only for as long as necessary to fulfil the purposes described in this policy, or as required by law. Specifically:</p>
              <ul className="lp__legal-list">
                <li><strong>Account and CRM data:</strong> Retained for the duration of your active account.</li>
                <li><strong>Call transcripts and session data:</strong> Retained for the duration of your active account. You may delete individual sessions at any time from your dashboard.</li>
                <li><strong>Post-cancellation:</strong> Following account cancellation, your data remains accessible for 30 days to allow data export. After 30 days, all personal data is permanently and irreversibly deleted from our systems, except where retention is required by applicable law (e.g., financial records required for 7 years under UK law).</li>
                <li><strong>Support communications:</strong> Retained for 3 years from the date of last interaction.</li>
                <li><strong>Anonymised usage analytics:</strong> May be retained indefinitely as they cannot be linked to you personally.</li>
              </ul>
            </section>

            <section id="pp-8" className="lp__legal-section">
              <h2>8. Security</h2>
              <p>We implement industry-standard technical and organisational measures to protect your data against accidental or unlawful destruction, loss, alteration, and unauthorised disclosure or access. These measures include:</p>
              <ul className="lp__legal-list">
                <li>Encryption at rest using AES-256.</li>
                <li>Encryption in transit using TLS 1.2 or higher (TLS 1.3 preferred).</li>
                <li>Role-based access controls: only authorised personnel can access personal data, on a need-to-know basis.</li>
                <li>Regular security reviews and dependency audits.</li>
                <li>Supabase Row-Level Security (RLS) ensuring each user can only access their own data.</li>
              </ul>
              <p>In the event of a personal data breach that is likely to result in a high risk to your rights and freedoms, we will notify you without undue delay and in any event within 72 hours of becoming aware of it, in accordance with applicable law.</p>
            </section>

            <section id="pp-9" className="lp__legal-section">
              <h2>9. Your rights</h2>
              <p>Depending on your location, you have the following rights regarding your personal data. We will respond to all verified requests within <strong>30 days</strong> (extendable by a further two months for complex requests, with notice).</p>
              <ul className="lp__legal-list">
                <li><strong>Right of access (Art. 15 GDPR):</strong> You may request a copy of all personal data we hold about you.</li>
                <li><strong>Right to rectification (Art. 16 GDPR):</strong> You may ask us to correct inaccurate or incomplete data.</li>
                <li><strong>Right to erasure / "right to be forgotten" (Art. 17 GDPR):</strong> You may request deletion of your data where it is no longer necessary, you withdraw consent, or you object to processing.</li>
                <li><strong>Right to data portability (Art. 20 GDPR):</strong> You may request your data in a structured, commonly used, machine-readable format (JSON/CSV).</li>
                <li><strong>Right to restriction of processing (Art. 18 GDPR):</strong> You may ask us to restrict processing of your data in certain circumstances.</li>
                <li><strong>Right to object (Art. 21 GDPR):</strong> You may object to processing based on legitimate interests at any time. We will cease processing unless we demonstrate compelling legitimate grounds that override your interests.</li>
                <li><strong>Rights related to automated decision-making (Art. 22 GDPR):</strong> Our AI-generated lead scores and coaching suggestions are tools to assist you — they do not constitute automated decisions that produce legal or similarly significant effects about you.</li>
                <li><strong>California residents (CCPA/CPRA):</strong> You have the right to know what personal information is collected, disclosed, or sold, the right to delete, the right to opt out of sale (we do not sell data), and the right to non-discrimination for exercising these rights.</li>
              </ul>
              <p>To exercise any of these rights, email <a href="mailto:privacy@pitchr.org">privacy@pitchr.org</a> from the email address associated with your account, or use the data export/deletion tools in your account settings.</p>
            </section>

            <section id="pp-10" className="lp__legal-section">
              <h2>10. Children's privacy</h2>
              <p>Pitchr is a business-to-business sales tool. We do not knowingly collect personal data from anyone under the age of 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:privacy@pitchr.org">privacy@pitchr.org</a> and we will delete the information promptly.</p>
            </section>

            <section id="pp-11" className="lp__legal-section">
              <h2>11. Cookies</h2>
              <p>We use cookies and similar tracking technologies to operate the service and, with your consent, to understand how it is used. Please see our <button className="lp__legal-inline-link" onClick={() => goSection('cookies')}>Cookie Policy</button> for a full list of cookies, their purposes, and instructions on how to control them.</p>
            </section>

            <section id="pp-12" className="lp__legal-section">
              <h2>12. Changes to this policy</h2>
              <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email (to the address associated with your account) and by posting a notice in the application at least 14 days before the changes take effect. The "Last updated" date at the top of this page will always reflect the most recent revision. Your continued use of Pitchr after changes take effect constitutes acceptance of the updated policy.</p>
            </section>

            <section id="pp-13" className="lp__legal-section">
              <h2>13. Contact &amp; complaints</h2>
              <p>For any questions, concerns, or requests relating to this Privacy Policy or your personal data, please contact us at:</p>
              <div className="lp__legal-contact-block">
                <div><strong>Email:</strong> <a href="mailto:privacy@pitchr.org">privacy@pitchr.org</a></div>
                <div><strong>Response time:</strong> Within 5 business days for general queries; within 30 days for formal rights requests.</div>
              </div>
              <p>If you are in the EEA or UK and are not satisfied with our response, you have the right to lodge a complaint with your local data protection supervisory authority. In the UK, this is the <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">Information Commissioner's Office (ICO)</a>. In Ireland, it is the <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer">Data Protection Commission (DPC)</a>.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
