import type { ReactNode } from 'react';

interface TermsOfServiceProps {
  nav: ReactNode;
  goSection: (id: string) => void;
}

export function TermsOfService({ nav, goSection }: TermsOfServiceProps) {
  const toc = [
    { id: 'tos-1',  label: '1. Acceptance & eligibility' },
    { id: 'tos-2',  label: '2. Description of service' },
    { id: 'tos-3',  label: '3. Account registration' },
    { id: 'tos-4',  label: '4. Subscription & billing' },
    { id: 'tos-5',  label: '5. Free plan' },
    { id: 'tos-6',  label: '6. Cancellation & refunds' },
    { id: 'tos-7',  label: '7. Acceptable use' },
    { id: 'tos-8',  label: '8. Prohibited conduct' },
    { id: 'tos-9',  label: '9. Intellectual property' },
    { id: 'tos-10', label: '10. User content & data' },
    { id: 'tos-11', label: '11. Third-party integrations' },
    { id: 'tos-12', label: '12. Disclaimers' },
    { id: 'tos-13', label: '13. Limitation of liability' },
    { id: 'tos-14', label: '14. Indemnification' },
    { id: 'tos-15', label: '15. Dispute resolution' },
    { id: 'tos-16', label: '16. Governing law' },
    { id: 'tos-17', label: '17. General provisions' },
    { id: 'tos-18', label: '18. Changes to these terms' },
    { id: 'tos-19', label: '19. Contact' },
  ];
  return (
    <div className="lp">
      {nav}
      <div className="lp__legal-page">
        <div className="lp__legal-header">
          <div className="lp__sv-label">LEGAL</div>
          <h1 className="lp__legal-title">Terms of Service</h1>
          <p className="lp__legal-meta">Effective date: 1 April 2025 &nbsp;·&nbsp; Last updated: 6 April 2026</p>
          <p className="lp__legal-intro">
            These Terms of Service ("Terms") form a legally binding agreement between <strong>Pitchr Ltd</strong> ("Pitchr", "we", "us") and you ("User", "you"). Please read them carefully before using the service. By creating an account or using Pitchr, you agree to be bound by these Terms and our Privacy Policy.
          </p>
          <div className="lp__legal-links">
            <button className="lp__legal-sibling" onClick={() => goSection('privacy')}>Privacy Policy →</button>
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

            <section id="tos-1" className="lp__legal-section">
              <h2>1. Acceptance &amp; eligibility</h2>
              <p>By accessing or using Pitchr, you confirm that: (a) you are at least 18 years of age; (b) you have the legal capacity to enter into binding contracts; and (c) your use of the service complies with all applicable laws and regulations in your jurisdiction.</p>
              <p>If you are using Pitchr on behalf of an organisation, you represent and warrant that you have the authority to bind that organisation to these Terms, and references to "you" shall include that organisation.</p>
            </section>

            <section id="tos-2" className="lp__legal-section">
              <h2>2. Description of service</h2>
              <p>Pitchr is an AI-powered sales coaching platform that provides real-time coaching suggestions during sales calls, training scenarios, post-call analysis, CRM functionality, and related tools ("Service"). The Service is provided via a web application and optional desktop client.</p>
              <p>We reserve the right to modify, suspend, or discontinue any feature or aspect of the Service at any time with reasonable notice, except where immediate action is required for security, legal, or operational reasons.</p>
            </section>

            <section id="tos-3" className="lp__legal-section">
              <h2>3. Account registration &amp; security</h2>
              <p>You must register for an account to use the Service. You agree to: (a) provide accurate, current, and complete registration information; (b) maintain and promptly update your information; (c) keep your password confidential and not share it with any third party; and (d) notify us immediately at <a href="mailto:support@pitchr.org">support@pitchr.org</a> if you suspect unauthorised access to your account.</p>
              <p>You are responsible for all activity that occurs under your account. Pitchr will not be liable for any loss or damage arising from your failure to comply with these security obligations.</p>
            </section>

            <section id="tos-4" className="lp__legal-section">
              <h2>4. Subscription plans &amp; billing</h2>
              <p><strong>Billing cycle.</strong> Paid plans are billed monthly in advance on the anniversary of your subscription start date. Prices are displayed in USD. All fees are exclusive of applicable taxes (VAT, GST, etc.), which are added at checkout where required by law.</p>
              <p><strong>Payment.</strong> You authorise us (via Stripe) to charge your designated payment method for all fees due. If payment fails, we will retry and may suspend your account after 7 days of non-payment, with prior notice.</p>
              <p><strong>Price changes.</strong> We may change subscription prices with at least 30 days' advance notice by email. Continued use of the Service after the notice period constitutes acceptance of the new pricing. If you do not accept the new price, you may cancel before the new pricing takes effect.</p>
              <p><strong>Taxes.</strong> You are responsible for all taxes associated with your purchase except those based on Pitchr's net income. Where we are legally required to collect taxes, they will appear on your invoice.</p>
            </section>

            <section id="tos-5" className="lp__legal-section">
              <h2>5. Free plan</h2>
              <p>We may offer a free tier with limited functionality. Free plans are provided "as is" without service level commitments, and we reserve the right to modify or discontinue free tiers at any time with 30 days' notice. Accounts that are inactive for 12 consecutive months on the free plan may be deleted after notice.</p>
            </section>

            <section id="tos-6" className="lp__legal-section">
              <h2>6. Cancellation &amp; refunds</h2>
              <p><strong>Cancellation.</strong> You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until the end of the period for which you have already paid.</p>
              <p><strong>Money-back guarantee.</strong> Paid plans include a <strong>7-day money-back guarantee</strong> from the date of your first paid payment. To request a refund under this guarantee, email <a href="mailto:support@pitchr.org">support@pitchr.org</a> within 7 days of your initial charge. Refunds are not available after this period except where required by applicable consumer protection law (including UK Consumer Contracts Regulations 2013).</p>
              <p><strong>No partial refunds.</strong> We do not provide prorated refunds for unused time within a billing period, except where required by law.</p>
            </section>

            <section id="tos-7" className="lp__legal-section">
              <h2>7. Acceptable use</h2>
              <p>You agree to use Pitchr only for lawful business sales and communication purposes and in accordance with these Terms. In particular:</p>
              <ul className="lp__legal-list">
                <li>You must obtain all legally required consents before recording or processing any call or conversation involving a third party, in compliance with applicable wiretapping, recording, and data protection laws in your jurisdiction (including but not limited to the Electronic Communications Privacy Act (ECPA) in the US, the Regulation of Investigatory Powers Act (RIPA) in the UK, and equivalent laws elsewhere).</li>
                <li>You must not use the Service to make misleading, deceptive, or fraudulent representations to prospects in violation of applicable consumer protection, telemarketing, or unfair commercial practices law.</li>
                <li>You must not use the Service to contact individuals on Do Not Call registries in any jurisdiction where such registries apply.</li>
              </ul>
            </section>

            <section id="tos-8" className="lp__legal-section">
              <h2>8. Prohibited conduct</h2>
              <p>You must not, directly or indirectly:</p>
              <ul className="lp__legal-list">
                <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of the Service.</li>
                <li>Copy, modify, distribute, sell, resell, or sublicense access to the Service.</li>
                <li>Use automated scripts, bots, scrapers, or crawlers to access or extract data from the Service.</li>
                <li>Attempt to probe, scan, or test the vulnerability of the Service or any related infrastructure.</li>
                <li>Circumvent or disable any security, rate-limiting, or access control mechanism.</li>
                <li>Upload, transmit, or store any content that is unlawful, harmful, threatening, abusive, defamatory, or that infringes third-party intellectual property rights.</li>
                <li>Use the Service in any way that could damage, disable, overburden, or impair our infrastructure or interfere with other users.</li>
                <li>Impersonate any person or entity, or falsely claim affiliation with any person or entity.</li>
              </ul>
              <p>Violation of this section may result in immediate account termination without refund and, where applicable, referral to law enforcement authorities.</p>
            </section>

            <section id="tos-9" className="lp__legal-section">
              <h2>9. Intellectual property</h2>
              <p><strong>Our IP.</strong> Pitchr, its logo, software, design, code, algorithms, text, graphics, and all other content comprising the Service are owned by or licensed to Pitchr Ltd and protected by copyright, trade mark, and other intellectual property laws. No rights are granted to you except as expressly set out in these Terms.</p>
              <p><strong>Feedback.</strong> If you provide us with feedback, suggestions, or ideas about the Service, you grant us an irrevocable, perpetual, royalty-free, worldwide licence to use that feedback for any purpose without compensation to you.</p>
            </section>

            <section id="tos-10" className="lp__legal-section">
              <h2>10. User content &amp; data</h2>
              <p><strong>Ownership.</strong> You retain full ownership of all data you generate using the Service, including call transcripts, notes, CRM records, and follow-up emails ("User Data").</p>
              <p><strong>Licence to us.</strong> You grant Pitchr a limited, non-exclusive, royalty-free licence to store, process, and display your User Data solely to the extent necessary to provide the Service to you. This licence terminates when you delete your account or the relevant data.</p>
              <p><strong>No training use.</strong> We will not use your User Data to train or fine-tune any AI model without your explicit, separately obtained written consent.</p>
              <p><strong>Data export.</strong> You may export your data at any time from your account settings in JSON format. Following account deletion, data is permanently deleted within 30 days as described in our Privacy Policy.</p>
            </section>

            <section id="tos-11" className="lp__legal-section">
              <h2>11. Third-party integrations</h2>
              <p>The Service uses third-party providers including OpenAI (AI model inference), Supabase (data storage), and Stripe (payment processing). These providers have their own terms and privacy policies. Pitchr is not responsible for the acts or omissions of third-party providers. We select third-party processors carefully and hold them to strict data processing standards, but we cannot guarantee their continuous availability or service quality.</p>
              <p>Service availability may be affected by the availability of third-party APIs. We do not guarantee uninterrupted service and will not be liable for downtime caused by third-party dependencies.</p>
            </section>

            <section id="tos-12" className="lp__legal-section">
              <h2>12. Disclaimers &amp; warranties</h2>
              <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
              <p>In particular, we make no warranty that: (a) speech recognition will be accurate or error-free; (b) AI coaching suggestions will be appropriate for every sales situation; (c) the Service will improve your individual sales results; or (d) the Service will be uninterrupted, timely, secure, or free from errors.</p>
              <p>Nothing in these Terms limits or excludes any warranties that cannot be excluded under applicable law (including the UK Consumer Rights Act 2015 where applicable).</p>
            </section>

            <section id="tos-13" className="lp__legal-section">
              <h2>13. Limitation of liability</h2>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PITCHR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES) ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
              <p>OUR AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE TOTAL AMOUNT YOU PAID TO US IN THE <strong>12 MONTHS</strong> PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR £100 (GBP), WHICHEVER IS GREATER.</p>
              <p>Nothing in these Terms limits our liability for: (a) death or personal injury caused by our negligence; (b) fraud or fraudulent misrepresentation; or (c) any other liability that cannot be limited or excluded by law.</p>
            </section>

            <section id="tos-14" className="lp__legal-section">
              <h2>14. Indemnification</h2>
              <p>You agree to indemnify, defend, and hold harmless Pitchr Ltd, its officers, directors, employees, and agents from and against any third-party claims, liabilities, damages, judgments, awards, losses, costs, and expenses (including reasonable legal fees) arising out of or relating to: (a) your violation of these Terms; (b) your use of the Service in breach of applicable law; or (c) any content you submit to or transmit through the Service that infringes third-party rights.</p>
            </section>

            <section id="tos-15" className="lp__legal-section">
              <h2>15. Dispute resolution</h2>
              <p><strong>Good faith resolution.</strong> Before initiating formal proceedings, you agree to contact us at <a href="mailto:legal@pitchr.org">legal@pitchr.org</a> and give us 30 days to attempt to resolve the dispute informally.</p>
              <p><strong>Consumer ADR.</strong> If you are a consumer located in the UK or EU and your dispute cannot be resolved informally, you may be entitled to use an Alternative Dispute Resolution (ADR) scheme. We are willing to participate in ADR proceedings conducted by the Centre for Effective Dispute Resolution (CEDR) or equivalent EU ADR entity.</p>
              <p><strong>Class action waiver.</strong> To the extent permitted by applicable law, you and Pitchr agree that any dispute resolution proceedings will be conducted on an individual basis only, and not as a class, consolidated, or representative action.</p>
            </section>

            <section id="tos-16" className="lp__legal-section">
              <h2>16. Governing law &amp; jurisdiction</h2>
              <p>These Terms are governed by and construed in accordance with the laws of <strong>England and Wales</strong>, without regard to its conflict of law principles. Subject to Section 15, each party submits to the exclusive jurisdiction of the courts of England and Wales.</p>
              <p>If you are a consumer residing in the EU, you may also bring proceedings in the courts of your country of residence under applicable EU consumer protection law. If you are a consumer residing in the UK, the mandatory consumer protection provisions of UK law apply regardless of the governing law chosen here.</p>
            </section>

            <section id="tos-17" className="lp__legal-section">
              <h2>17. General provisions</h2>
              <p><strong>Entire agreement.</strong> These Terms (together with the Privacy Policy and Cookie Policy) constitute the entire agreement between you and Pitchr regarding the Service and supersede all prior agreements and understandings.</p>
              <p><strong>Severability.</strong> If any provision of these Terms is held invalid or unenforceable, the remaining provisions will continue in full force and effect.</p>
              <p><strong>No waiver.</strong> Our failure to enforce any provision of these Terms will not be construed as a waiver of our right to enforce that or any other provision in the future.</p>
              <p><strong>Assignment.</strong> You may not assign your rights or obligations under these Terms without our prior written consent. We may assign our rights to any affiliate or successor in connection with a merger, acquisition, or sale of assets.</p>
              <p><strong>Force majeure.</strong> Neither party shall be liable for failure or delay in performance caused by circumstances beyond its reasonable control, including natural disasters, government actions, or third-party network failures.</p>
            </section>

            <section id="tos-18" className="lp__legal-section">
              <h2>18. Changes to these Terms</h2>
              <p>We may modify these Terms at any time. For material changes, we will provide at least <strong>14 days' notice</strong> via email and/or an in-app notification before changes take effect. Your continued use of the Service after the notice period constitutes your acceptance of the revised Terms. If you do not accept the changes, you must stop using the Service and cancel your subscription before they take effect.</p>
            </section>

            <section id="tos-19" className="lp__legal-section">
              <h2>19. Contact</h2>
              <p>For legal queries, please contact us at:</p>
              <div className="lp__legal-contact-block">
                <div><strong>Legal matters:</strong> <a href="mailto:legal@pitchr.org">legal@pitchr.org</a></div>
                <div><strong>Support:</strong> <a href="mailto:support@pitchr.org">support@pitchr.org</a></div>
                <div><strong>Privacy matters:</strong> <a href="mailto:privacy@pitchr.org">privacy@pitchr.org</a></div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
