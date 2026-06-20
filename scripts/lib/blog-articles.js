/** Long-form blog articles (Phase 8) — merged at build time */

const TOOLS = {
  decoder: '<a href="/tools/jwt-decoder.html">JWT Decoder</a>',
  validator: '<a href="/tools/jwt-validator.html">JWT Validator</a>',
  debugger: '<a href="/tools/jwt-debugger.html">JWT Debugger</a>',
  encoder: '<a href="/tools/jwt-encoder.html">JWT Encoder</a>',
  jwks: '<a href="/tools/jwks-validator.html">JWKS Validator</a>',
  expiry: '<a href="/tools/jwt-expiry-checker.html">Expiry Checker</a>',
};

function article({ slug, title, seoTitle, description, keywords, date, relatedTools, relatedGuides, relatedArticles, faq, sections }) {
  const content = sections.join('\n');
  return {
    slug, title, seoTitle, description, keywords, date,
    author: 'JWTValidator.org',
    relatedTools: relatedTools || ['jwt-decoder', 'jwt-validator'],
    relatedGuides: relatedGuides || ['jwt-authentication-explained', 'jwt-basics'],
    relatedArticles: relatedArticles || [],
    faq,
    content,
  };
}

export const extendedBlogPosts = [
  article({
    slug: 'how-jwt-authentication-works',
    title: 'How JWT Authentication Works — Complete Guide',
    seoTitle: 'How JWT Authentication Works | Complete Guide',
    description: 'Complete guide to JWT authentication: token structure, signing, verification, OAuth flows, and production patterns for APIs.',
    keywords: 'how jwt authentication works,jwt auth flow,jwt explained,json web token authentication',
    date: '2026-06-18',
    relatedArticles: ['jwt-beginner-guide', 'jwt-vs-sessions', 'oauth-vs-jwt'],
    faq: [
      { q: 'How does JWT authentication work?', a: 'A server signs a token with claims; the client sends it on each request; the server verifies signature and validates exp, iss, and aud before granting access.' },
      { q: 'Is JWT authentication stateless?', a: 'Yes. The server does not store session state — claims live in the token. Revocation requires short expiry, blocklists, or refresh token rotation.' },
      { q: 'Where should clients store JWTs?', a: 'Prefer httpOnly Secure cookies for web apps. Avoid localStorage due to XSS. Mobile apps use secure storage.' },
    ],
    sections: [
      `<h2>Introduction</h2><p>JSON Web Token (JWT) authentication is the dominant pattern for REST APIs, microservices, and mobile backends. Unlike server-side sessions, JWTs carry identity and authorization claims inside a signed, self-contained string. This guide explains the full lifecycle from issuance to verification.</p>`,
      `<h2>What Is a JWT?</h2><p>A JWT has three Base64URL-encoded parts separated by dots: <strong>header</strong> (algorithm, type), <strong>payload</strong> (claims), and <strong>signature</strong> (cryptographic proof). Paste any token into our ${TOOLS.decoder} to see this structure instantly.</p>`,
      `<h2>The Authentication Flow</h2><ol><li>User authenticates (password, OAuth, SSO)</li><li>Authorization server issues access token (often a JWT)</li><li>Client stores token securely</li><li>Client sends <code>Authorization: Bearer &lt;token&gt;</code> on API calls</li><li>Resource server verifies signature and validates claims</li></ol>`,
      `<h2>Signing Algorithms</h2><p><strong>HS256</strong> uses a shared secret — simple but both parties must protect the same key. <strong>RS256/ES256</strong> use asymmetric keys: private key signs, public key verifies via JWKS. Public APIs and OAuth almost always use asymmetric algorithms.</p>`,
      `<h2>Critical Claims</h2><ul><li><code>sub</code> — subject (user ID)</li><li><code>iss</code> — issuer URL</li><li><code>aud</code> — intended audience</li><li><code>exp</code> — expiration (Unix timestamp)</li><li><code>scope</code> — OAuth scopes</li></ul><p>Validate all of these server-side. Use our ${TOOLS.debugger} to inspect claims during development.</p>`,
      `<h2>Production Checklist</h2><ol><li>Short-lived access tokens (5–15 minutes)</li><li>Refresh token rotation</li><li>Algorithm whitelist (reject <code>none</code>)</li><li>Verify signature on every request</li><li>Validate exp, iss, aud with clock skew tolerance</li></ol>`,
      `<h2>Common Mistakes</h2><p>Trusting decoded payload without verification, storing tokens in localStorage, accepting <code>alg: none</code>, and using weak HMAC secrets. See <a href="/blog/posts/common-jwt-security-mistakes.html">Common JWT Security Mistakes</a>.</p>`,
    ],
  }),
  article({
    slug: 'jwt-vs-sessions',
    title: 'JWT vs Sessions — Which Is Better?',
    seoTitle: 'JWT vs Sessions | Which Should You Use?',
    description: 'JWT vs session cookies compared: scalability, revocation, security, and when to use each for web apps and APIs.',
    keywords: 'jwt vs sessions,jwt vs session cookies,stateless vs stateful auth',
    date: '2026-06-18',
    relatedArticles: ['how-jwt-authentication-works', 'oauth-vs-jwt'],
    faq: [
      { q: 'Are JWTs better than sessions?', a: 'Neither is universally better. JWTs excel at distributed APIs; sessions excel when you need instant revocation and simpler web auth.' },
      { q: 'Can I use both?', a: 'Yes. Many apps use session cookies for web UI and JWT access tokens for API calls.' },
    ],
    sections: [
      `<h2>Overview</h2><p>Developers constantly debate JWT vs server-side sessions. Both authenticate users; they differ in storage, revocation, and scaling characteristics.</p>`,
      `<h2>Server Sessions</h2><p>The server stores session data and sends a session ID cookie. Pros: easy revocation, smaller cookies, mature patterns. Cons: session store required, harder to scale across regions without sticky sessions or shared store.</p>`,
      `<h2>JWT Tokens</h2><p>Claims live in the token; server only verifies signature. Pros: stateless, scales horizontally, works across microservices. Cons: harder revocation, larger payloads, more crypto complexity.</p>`,
      `<h2>Comparison Table</h2><table><tr><th>Factor</th><th>JWT</th><th>Sessions</th></tr><tr><td>Revocation</td><td>Short expiry + rotation</td><td>Delete session instantly</td></tr><tr><td>Scale</td><td>Excellent for APIs</td><td>Needs shared session store</td></tr><tr><td>Size</td><td>Larger (claims in token)</td><td>Small cookie (ID only)</td></tr><tr><td>Mobile/SPA</td><td>Common pattern</td><td>Cookie-based works for same-origin</td></tr></table>`,
      `<h2>Recommendation</h2><p>Use JWTs for API-first architectures, microservices, and mobile. Use sessions for traditional server-rendered apps where instant logout matters. See <a href="/compare/jwt-vs-session-cookies.html">JWT vs Session Cookies</a>.</p>`,
    ],
  }),
  article({
    slug: 'common-jwt-security-mistakes',
    title: 'Common JWT Security Mistakes Developers Make',
    seoTitle: 'Common JWT Security Mistakes | Avoid These',
    description: 'Top JWT security mistakes: alg none attack, weak secrets, skipping verification, localStorage storage, and algorithm confusion.',
    keywords: 'jwt security mistakes,jwt vulnerabilities,jwt security errors',
    date: '2026-06-19',
    relatedArticles: ['jwt-security-best-practices', 'how-jwt-authentication-works'],
    faq: [
      { q: 'What is the most dangerous JWT mistake?', a: 'Skipping signature verification and trusting decoded payload — equivalent to accepting unsigned credentials.' },
      { q: 'What is algorithm confusion?', a: 'Verifying an RS256 token with HS256 using the RSA public key as HMAC secret. Always whitelist allowed algorithms.' },
    ],
    sections: [
      `<h2>Introduction</h2><p>JWT libraries make token creation easy; security failures usually come from misconfiguration. These are the mistakes we see most often in production incidents.</p>`,
      `<h2>1. Accepting alg: none</h2><p>Attackers set the algorithm header to <code>none</code> hoping servers skip verification. Fix: whitelist allowed algorithms in your JWT library configuration.</p>`,
      `<h2>2. Decoding Without Verifying</h2><p>Base64 decoding is not authentication. Always call <code>verify()</code>, not just <code>decode()</code>. Test with our ${TOOLS.validator}.</p>`,
      `<h2>3. Storing Tokens in localStorage</h2><p>Any XSS script can steal localStorage tokens. Use httpOnly, Secure, SameSite cookies for web applications.</p>`,
      `<h2>4. Weak HMAC Secrets</h2><p>Secrets like "secret" or "password" are brute-forced in minutes. Use 256-bit cryptographically random secrets.</p>`,
      `<h2>5. Ignoring exp, iss, aud</h2><p>Signature alone is insufficient. Validate expiration, issuer, and audience on every request. Use ${TOOLS.expiry} during debugging.</p>`,
      `<h2>6. Long-Lived Access Tokens</h2><p>Access tokens should expire in minutes, not days. Use refresh token rotation for session continuity.</p>`,
      `<h2>7. Logging Full Tokens</h2><p>Tokens in logs become credential leaks. Log jti or sub only, never the full bearer token.</p>`,
    ],
  }),
  article({
    slug: 'decode-jwt-javascript',
    title: 'How to Decode JWT Tokens in JavaScript',
    seoTitle: 'Decode JWT in JavaScript | Node & Browser Guide',
    description: 'Decode and verify JWT tokens in JavaScript and Node.js with jsonwebtoken, jose, and Web Crypto. Examples and security notes.',
    keywords: 'decode jwt javascript,jwt decode nodejs,verify jwt javascript',
    date: '2026-06-19',
    relatedArticles: ['jwt-beginner-guide', 'how-jwt-authentication-works'],
    faq: [
      { q: 'How do I decode JWT in browser JavaScript?', a: 'Split on dots, Base64URL-decode header and payload segments, JSON.parse each. Never skip signature verification in production.' },
      { q: 'Which library should I use?', a: 'jsonwebtoken for Node.js, jose for modern Node/browser, or Web Crypto API for zero-dependency verification.' },
    ],
    sections: [
      `<h2>Quick Start</h2><pre><code class="language-javascript">import jwt from 'jsonwebtoken';

// Verify (recommended)
const payload = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ['HS256'],
  issuer: 'https://auth.example.com',
  audience: 'my-api',
});

// Decode only (debugging — NOT for auth)
const decoded = jwt.decode(token, { complete: true });</code></pre>`,
      `<h2>Manual Decode (Browser)</h2><pre><code class="language-javascript">function decodePart(part) {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(padded));
}
const [headerB64, payloadB64] = token.split('.');
const header = decodePart(headerB64);
const payload = decodePart(payloadB64);</code></pre>`,
      `<h2>Using jose (Modern)</h2><pre><code class="language-javascript">import { jwtVerify } from 'jose';
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const { payload } = await jwtVerify(token, secret);</code></pre>`,
      `<h2>Security Notes</h2><p>Never use decode-only paths for authorization. Always verify signature and validate exp, iss, aud. Test tokens with our ${TOOLS.decoder} and ${TOOLS.validator}.</p>`,
      `<h2>Learn More</h2><p>See <a href="/learn/nodejs/jwt-decode.html">Node.js JWT Decode</a> and <a href="/learn/typescript/jwt-verify.html">TypeScript Verify</a> examples.</p>`,
    ],
  }),
  article({
    slug: 'jwt-expiration-handling',
    title: 'JWT Expiration Handling — exp Claim Best Practices',
    seoTitle: 'JWT Expiration Handling | exp Claim Guide',
    description: 'Handle JWT expiration correctly: exp claim validation, clock skew, refresh flows, and client-side expiry checking.',
    keywords: 'jwt expiration,jwt exp claim,handle expired jwt,token expiry',
    date: '2026-06-19',
    relatedArticles: ['refresh-token-rotation', 'jwt-security-best-practices'],
    faq: [
      { q: 'What is the exp claim?', a: 'A Unix timestamp after which the JWT must be rejected. Always validate server-side with small clock skew tolerance.' },
      { q: 'Should clients check exp?', a: 'Yes for UX (proactive refresh), but server validation is mandatory — clients can be manipulated.' },
    ],
    sections: [
      `<h2>Understanding exp</h2><p>The <code>exp</code> (expiration) claim defines when a token becomes invalid. It is a NumericDate — seconds since Unix epoch. Our ${TOOLS.expiry} shows exact expiry and time remaining.</p>`,
      `<h2>Server Validation</h2><pre><code class="language-javascript">jwt.verify(token, secret, {
  clockTolerance: 30, // 30s skew
});</code></pre>`,
      `<h2>Refresh Pattern</h2><p>When access token expires, exchange refresh token for new pair. Implement rotation to detect theft. See <a href="/blog/posts/refresh-token-rotation.html">Refresh Token Rotation</a>.</p>`,
      `<h2>Client UX</h2><p>Decode exp client-side to show "session expiring" warnings. Redirect to login when refresh fails. Never extend exp client-side.</p>`,
      `<h2>Related Errors</h2><p>See <a href="/errors/token-expired.html">Token Expired</a> and <a href="/guides/jwt-expired-token-fix.html">JWT Expired Token Fix</a>.</p>`,
    ],
  }),
  article({
    slug: 'jwt-rs256-explained',
    title: 'RS256 JWT Explained — RSA Signature Verification',
    seoTitle: 'RS256 JWT Explained | RSA Verification Guide',
    description: 'Understand RS256 JWT signing: RSA keys, JWKS endpoints, OIDC verification, and when to choose RS256 over HS256.',
    keywords: 'rs256 jwt,jwt rs256 verification,rsa jwt signature,jwks rs256',
    date: '2026-06-19',
    relatedArticles: ['how-jwt-authentication-works', 'jwt-security-best-practices'],
    faq: [
      { q: 'What is RS256?', a: 'JWT signed with RSA-SHA256. Private key signs; public key verifies. Standard for OAuth and OpenID Connect.' },
      { q: 'How do I get the public key?', a: 'Fetch from the provider JWKS endpoint (.well-known/jwks.json). Use our JWKS Validator tool.' },
    ],
    sections: [
      `<h2>Why RS256?</h2><p>Asymmetric signing lets authorization servers sign with a private key while resource servers verify with public keys from JWKS — no shared secret distribution.</p>`,
      `<h2>Verification Flow</h2><ol><li>Fetch JWKS from issuer</li><li>Match <code>kid</code> in JWT header to JWK</li><li>Verify signature with public key</li><li>Validate iss, aud, exp</li></ol>`,
      `<h2>Node.js Example</h2><pre><code class="language-javascript">import jwksClient from 'jwks-rsa';
const client = jwksClient({ jwksUri: 'https://issuer/.well-known/jwks.json' });
// Use getSigningKey + jwt.verify with dynamic key</code></pre>`,
      `<h2>Tools</h2><p>Validate RS256 tokens with ${TOOLS.jwks} or read <a href="/algorithms/rs256-explained.html">RS256 Explained</a>.</p>`,
    ],
  }),
  article({
    slug: 'jwt-auth0-decode-guide',
    title: 'How to Decode and Verify Auth0 JWT Tokens',
    seoTitle: 'Decode Auth0 JWT | Verify Auth0 Tokens',
    description: 'Decode and verify Auth0 JWT access tokens and ID tokens. JWKS URL, audience validation, and common Auth0 errors.',
    keywords: 'auth0 jwt decode,verify auth0 token,auth0 jwt validation',
    date: '2026-06-19',
    relatedArticles: ['how-jwt-authentication-works', 'decode-jwt-javascript'],
    faq: [
      { q: 'Where is Auth0 JWKS URL?', a: 'https://YOUR_DOMAIN/.well-known/jwks.json — replace YOUR_DOMAIN with your Auth0 tenant domain.' },
      { q: 'What audience should I validate?', a: 'Your API identifier for access tokens; your Auth0 client ID for ID tokens.' },
    ],
    sections: [
      `<h2>Auth0 Token Types</h2><p><strong>Access tokens</strong> authorize API calls. <strong>ID tokens</strong> authenticate users (OpenID Connect). Both are typically JWTs.</p>`,
      `<h2>Decode for Debugging</h2><p>Paste into ${TOOLS.decoder}. Check <code>iss</code> matches <code>https://YOUR_DOMAIN/</code>, <code>aud</code> matches your API, and <code>exp</code> is future.</p>`,
      `<h2>Verify with JWKS</h2><p>Use ${TOOLS.jwks} with your tenant JWKS URL. See also <a href="/providers/auth0-jwt.html">Auth0 JWT Guide</a>.</p>`,
      `<h2>Common Errors</h2><ul><li>Wrong audience — API identifier mismatch</li><li>Expired token — refresh or re-authenticate</li><li>Wrong issuer — tenant domain typo</li></ul>`,
    ],
  }),
  article({
    slug: 'jwt-firebase-verification',
    title: 'Firebase JWT Verification — ID Token Guide',
    seoTitle: 'Firebase JWT Verification | ID Token Guide',
    description: 'Verify Firebase ID tokens on your backend. Project ID as audience, Google JWKS, and Node.js admin SDK patterns.',
    keywords: 'firebase jwt verify,firebase id token,verify firebase token',
    date: '2026-06-19',
    relatedArticles: ['how-jwt-authentication-works', 'jwt-auth0-decode-guide'],
    faq: [
      { q: 'Is Firebase ID token a JWT?', a: 'Yes. Firebase ID tokens are JWTs signed by Google. Verify on your server, never trust client-side decode alone.' },
      { q: 'What is the Firebase audience?', a: 'Your Firebase project ID.' },
    ],
    sections: [
      `<h2>Overview</h2><p>Firebase Authentication issues ID tokens as JWTs. Your backend must verify them using Firebase Admin SDK or Google public keys.</p>`,
      `<h2>Admin SDK (Recommended)</h2><pre><code class="language-javascript">const decoded = await admin.auth().verifyIdToken(idToken);
// decoded.uid is the user ID</code></pre>`,
      `<h2>Manual Verification</h2><p>Fetch Google JWKS, verify RS256 signature, validate aud (project ID), iss (securetoken.google.com), and exp.</p>`,
      `<h2>Debug</h2><p>Use ${TOOLS.decoder} during development. See <a href="/providers/firebase-jwt.html">Firebase JWT Guide</a>.</p>`,
    ],
  }),
  article({
    slug: 'jwt-claims-reference',
    title: 'JWT Claims Reference — Registered & Custom Claims',
    seoTitle: 'JWT Claims Reference | Registered Claims Guide',
    description: 'Complete JWT claims reference: iss, sub, aud, exp, nbf, iat, jti, scope, and custom claims with validation rules.',
    keywords: 'jwt claims,jwt claims reference,registered claims jwt,custom jwt claims',
    date: '2026-06-19',
    relatedArticles: ['jwt-beginner-guide', 'how-jwt-authentication-works'],
    faq: [
      { q: 'What are registered JWT claims?', a: 'Standard claims defined in RFC 7519: iss, sub, aud, exp, nbf, iat, jti. Libraries often validate exp automatically.' },
      { q: 'Can I add custom claims?', a: 'Yes. Any JSON key works, but avoid putting secrets in the payload — it is only Base64-encoded, not encrypted.' },
    ],
    sections: [
      `<h2>Registered Claims</h2><table><tr><th>Claim</th><th>Meaning</th><th>Validate?</th></tr><tr><td>iss</td><td>Issuer</td><td>Yes — exact match</td></tr><tr><td>sub</td><td>Subject (user ID)</td><td>Yes</td></tr><tr><td>aud</td><td>Audience</td><td>Yes</td></tr><tr><td>exp</td><td>Expiration</td><td>Yes</td></tr><tr><td>nbf</td><td>Not before</td><td>Yes</td></tr><tr><td>iat</td><td>Issued at</td><td>Optional</td></tr><tr><td>jti</td><td>Token ID</td><td>For revocation</td></tr></table>`,
      `<h2>OAuth Claims</h2><p><code>scope</code>, <code>azp</code>, <code>client_id</code> appear in OAuth access tokens. Use ${TOOLS.debugger} to inspect.</p>`,
      `<h2>Custom Claims</h2><p>Store roles, permissions, tenant ID — but keep tokens small. Large payloads increase every request header size.</p>`,
      `<h2>Deep Dive</h2><p>Browse <a href="/claims/">JWT Claims Hub</a> and <a href="/glossary/">Glossary</a>.</p>`,
    ],
  }),
  article({
    slug: 'jwt-microservices-auth',
    title: 'JWT Authentication in Microservices',
    seoTitle: 'JWT Microservices Auth | Distributed API Guide',
    description: 'JWT patterns for microservices: gateway validation, service-to-service tokens, claim propagation, and zero-trust considerations.',
    keywords: 'jwt microservices,microservices authentication,jwt api gateway',
    date: '2026-06-19',
    relatedArticles: ['how-jwt-authentication-works', 'jwt-vs-sessions'],
    faq: [
      { q: 'Should every microservice verify JWT?', a: 'Yes, or use a gateway that verifies and forwards trusted internal identity. Never trust unverified headers from clients.' },
      { q: 'How do services communicate?', a: 'Use service accounts with separate tokens, mTLS, or internal OAuth client credentials — not forwarded user JWTs alone.' },
    ],
    sections: [
      `<h2>Architecture</h2><p>API gateway validates JWT once, extracts claims, forwards to services. Each service can re-verify or trust mTLS-internal headers from gateway.</p>`,
      `<h2>Token Propagation</h2><p>Pass original bearer token or issue internal service token with reduced scope. Avoid amplifying privilege across service boundaries.</p>`,
      `<h2>Key Management</h2><p>Central JWKS from identity provider. Cache keys with TTL. Rotate keys without downtime using kid header matching.</p>`,
      `<h2>Testing</h2><p>Validate tokens at each hop with ${TOOLS.validator}. See <a href="/use-cases/microservices-api-auth.html">Microservices API Auth</a>.</p>`,
    ],
  }),
  article({
    slug: 'jwt-testing-strategies',
    title: 'JWT Testing Strategies for Developers',
    seoTitle: 'JWT Testing Strategies | Unit & Integration Tests',
    description: 'Test JWT authentication: mock tokens, fixture secrets, exp manipulation, integration tests with real verify paths.',
    keywords: 'jwt testing,test jwt authentication,mock jwt token unit test',
    date: '2026-06-19',
    relatedArticles: ['decode-jwt-javascript', 'jwt-beginner-guide'],
    faq: [
      { q: 'How do I create test JWTs?', a: 'Use our JWT Encoder or sign in tests with a known test secret. Never use production keys in tests.' },
      { q: 'Should I test expired tokens?', a: 'Yes. Assert your API returns 401 for expired, wrong aud, and invalid signature cases.' },
    ],
    sections: [
      `<h2>Unit Tests</h2><pre><code class="language-javascript">const testToken = jwt.sign(
  { sub: 'test-user', aud: 'test-api' },
  'test-secret-256-bits-minimum!!',
  { expiresIn: '1h', algorithm: 'HS256' }
);</code></pre>`,
      `<h2>Integration Tests</h2><p>Hit real middleware with valid, expired, and malformed tokens. Verify 401/403 responses and error messages.</p>`,
      `<h2>Fixtures</h2><p>Store sample tokens in test fixtures. Generate fresh tokens in CI with fixed clock if testing exp edge cases.</p>`,
      `<h2>Tools</h2><p>Create test tokens with ${TOOLS.encoder}. Debug failures with ${TOOLS.debugger}.</p>`,
    ],
  }),
  article({
    slug: 'jwt-oauth-openid-connect',
    title: 'JWT in OAuth 2.0 and OpenID Connect',
    seoTitle: 'JWT OAuth OpenID Connect | ID Token Guide',
    description: 'How JWT fits in OAuth 2.0 and OpenID Connect: access tokens, ID tokens, scopes, and validation requirements.',
    keywords: 'jwt oauth,openid connect jwt,id token vs access token',
    date: '2026-06-19',
    relatedArticles: ['oauth-vs-jwt', 'how-jwt-authentication-works'],
    faq: [
      { q: 'Is every OAuth token a JWT?', a: 'No. Access tokens can be opaque strings. ID tokens in OpenID Connect are always JWTs.' },
      { q: 'What is an ID token?', a: 'A JWT proving user authentication event — contains profile claims. Not for API authorization.' },
    ],
    sections: [
      `<h2>OAuth vs OIDC</h2><p>OAuth 2.0 authorizes access. OpenID Connect adds identity layer with ID tokens (JWTs) proving who logged in.</p>`,
      `<h2>Token Roles</h2><ul><li><strong>Access token</strong> — call APIs (may or may not be JWT)</li><li><strong>ID token</strong> — user identity (always JWT in OIDC)</li><li><strong>Refresh token</strong> — obtain new access token (usually opaque)</li></ul>`,
      `<h2>Validation</h2><p>ID tokens: verify signature, iss, aud (client_id), exp, nonce. Access tokens: verify signature, iss, aud (API id), exp, scope.</p>`,
      `<h2>Inspect Tokens</h2><p>Use ${TOOLS.debugger} and <a href="/tools/oauth-token-inspector.html">OAuth Token Inspector</a>.</p>`,
    ],
  }),
  article({
    slug: 'jwt-algorithm-confusion-attack',
    title: 'JWT Algorithm Confusion Attack Explained',
    seoTitle: 'JWT Algorithm Confusion Attack | Prevention',
    description: 'Understand the JWT algorithm confusion vulnerability: RS256 to HS256 switch, prevention, and secure library configuration.',
    keywords: 'jwt algorithm confusion,alg confusion attack,jwt rs256 hs256 attack',
    date: '2026-06-19',
    relatedArticles: ['common-jwt-security-mistakes', 'jwt-security-best-practices'],
    faq: [
      { q: 'What is algorithm confusion?', a: 'Attacker changes alg to HS256 and signs with the RSA public key as HMAC secret. Server verifies with same public key string as secret.' },
      { q: 'How do I prevent it?', a: 'Whitelist allowed algorithms explicitly. Never derive verification algorithm from token header alone.' },
    ],
    sections: [
      `<h2>The Attack</h2><p>Server expects RS256 and uses public key for RSA verify. Attacker sets alg=HS256 and signs with public key as HMAC secret. If server switches verify mode based on header, attack succeeds.</p>`,
      `<h2>Real-World Impact</h2><p>CVE-class vulnerability in multiple libraries over the years. Always pinned algorithm lists.</p>`,
      `<h2>Prevention</h2><pre><code class="language-javascript">jwt.verify(token, getKey, { algorithms: ['RS256'] }); // never ['RS256','HS256'] from header</code></pre>`,
      `<h2>Related</h2><p><a href="/errors/invalid-signature.html">Invalid Signature</a>, <a href="/hubs/security.html">Security Hub</a>.</p>`,
    ],
  }),
  article({
    slug: 'jwt-localstorage-danger',
    title: 'Why Storing JWT in localStorage Is Dangerous',
    seoTitle: 'JWT localStorage Danger | Secure Storage Guide',
    description: 'Why localStorage JWT storage enables XSS token theft. Secure alternatives: httpOnly cookies, memory storage, and CSP.',
    keywords: 'jwt localstorage,xss jwt theft,secure jwt storage,httpOnly cookie jwt',
    date: '2026-06-19',
    relatedArticles: ['jwt-security-best-practices', 'common-jwt-security-mistakes'],
    faq: [
      { q: 'Is localStorage safe for JWT?', a: 'No. Any XSS vulnerability exposes all tokens in localStorage. httpOnly cookies are not accessible to JavaScript.' },
      { q: 'What about sessionStorage?', a: 'Same XSS risk as localStorage. Not a security improvement.' },
    ],
    sections: [
      `<h2>The XSS Problem</h2><p>Cross-site scripting lets attackers run JavaScript in your origin. localStorage is fully readable by scripts — one XSS equals full account takeover.</p>`,
      `<h2>Secure Alternatives</h2><ul><li><strong>httpOnly Secure SameSite cookies</strong> — best for traditional web</li><li><strong>Memory only</strong> — SPAs that accept re-login on refresh</li><li><strong>BFF pattern</strong> — backend holds tokens, frontend gets session cookie</li></ul>`,
      `<h2>CSP Helps But Is Not Enough</h2><p>Content-Security-Policy reduces XSS risk but misconfigurations happen. Defense in depth: httpOnly + CSP + input sanitization.</p>`,
      `<h2>Mobile</h2><p>Use Keychain (iOS) and Keystore (Android) — never plain SharedPreferences for tokens.</p>`,
    ],
  }),
  article({
    slug: 'jwt-api-gateway-patterns',
    title: 'JWT Validation at the API Gateway',
    seoTitle: 'JWT API Gateway Validation | Patterns Guide',
    description: 'Validate JWT at API gateway: Kong, AWS API Gateway, NGINX, Envoy. Centralized auth, claim forwarding, and rate limiting.',
    keywords: 'jwt api gateway,api gateway jwt validation,kong jwt,aws api gateway jwt',
    date: '2026-06-19',
    relatedArticles: ['jwt-microservices-auth', 'how-jwt-authentication-works'],
    faq: [
      { q: 'Should gateway or service validate JWT?', a: 'Gateway for coarse auth (valid token, right issuer). Services for fine-grained authorization (roles, tenant).' },
      { q: 'How to pass claims to backends?', a: 'Trusted internal headers set by gateway after verification — never accept client-supplied X-User-Id without verification.' },
    ],
    sections: [
      `<h2>Centralized Validation</h2><p>Gateway verifies JWT once per request, reducing crypto load on microservices and ensuring consistent policy.</p>`,
      `<h2>AWS API Gateway</h2><p>Configure JWT authorizer with issuer and audience. API Gateway validates before Lambda invocation.</p>`,
      `<h2>NGINX / Envoy</h2><p>JWT auth filters with JWKS fetch and caching. Forward validated claims as internal headers.</p>`,
      `<h2>Testing</h2><p>Validate gateway config with ${TOOLS.validator} and ${TOOLS.jwks} before production rollout.</p>`,
    ],
  }),
  article({
    slug: 'jwt-io-alternative-comparison',
    title: 'JWTValidator.org vs jwt.io — Feature Comparison',
    seoTitle: 'JWTValidator vs jwt.io | Best JWT Tool?',
    description: 'Compare JWTValidator.org and jwt.io: tools, privacy, guides, algorithms supported, and why developers choose each.',
    keywords: 'jwt.io alternative,jwtvalidator vs jwt.io,best jwt decoder',
    date: '2026-06-19',
    relatedArticles: ['decode-jwt-javascript', 'jwt-beginner-guide'],
    faq: [
      { q: 'Is JWTValidator.org free like jwt.io?', a: 'Yes. All tools are free, client-side, and require no account.' },
      { q: 'What does JWTValidator offer beyond jwt.io?', a: '13 specialized tools, 1,000+ guides, glossary, learning path, bulk decoder, OAuth inspector, and programmatic SEO resources.' },
    ],
    sections: [
      `<h2>Both Are Private-First</h2><p>jwt.io and JWTValidator.org process tokens in the browser. Neither should receive production secrets — but we emphasize privacy on every page.</p>`,
      `<h2>Tool Comparison</h2><table><tr><th>Feature</th><th>JWTValidator.org</th><th>jwt.io</th></tr><tr><td>Decoder</td><td>✓</td><td>✓</td></tr><tr><td>Validator</td><td>✓ HMAC + JWKS</td><td>✓</td></tr><tr><td>Encoder</td><td>✓ 13 algorithms</td><td>✓</td></tr><tr><td>Guides</td><td>1,000+</td><td>Limited</td></tr><tr><td>Bulk decode</td><td>✓</td><td>—</td></tr><tr><td>OAuth inspector</td><td>✓</td><td>—</td></tr></table>`,
      `<h2>When to Use JWTValidator</h2><p>Learning JWT, debugging OAuth, finding error fixes, comparing algorithms, and language-specific implementation guides.</p>`,
      `<h2>Try It</h2><p>Start with ${TOOLS.decoder} or read <a href="/compare/jwt-io-alternative.html">full comparison</a>.</p>`,
    ],
  }),
];
