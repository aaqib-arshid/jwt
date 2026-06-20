/** Featured snippet box for Google rich results */
export function quickAnswerSnippet({ keyword, type = 'guide' }) {
  const answers = {
    guide: `To ${keyword}, paste your token into our <a href="/tools/jwt-decoder.html">JWT Decoder</a>, inspect the header and payload claims, then verify the signature with the <a href="/tools/jwt-validator.html">JWT Validator</a>. All processing runs locally in your browser.`,
    error: `To fix <strong>${keyword}</strong>, decode the token first, check the <code>alg</code> header matches your verification method, confirm the secret or JWKS URL is correct, and validate <code>exp</code>, <code>iss</code>, and <code>aud</code> claims.`,
    algorithm: `<strong>${keyword}</strong> is a JWT signing algorithm. Use our <a href="/tools/jwt-decoder.html">Decoder</a> to check which algorithm a token uses, then verify with the matching key in our <a href="/tools/jwt-validator.html">Validator</a> or <a href="/tools/jwks-validator.html">JWKS Validator</a>.`,
    glossary: `See our full <a href="/glossary/">JWT Glossary</a> for related terms, or use the <a href="/tools/jwt-decoder.html">JWT Decoder</a> to inspect tokens in practice.`,
  };
  return `<p class="snippet-label">Quick Answer</p><p>${answers[type] || answers.guide}</p>`;
}

/** Programmatic content builders for SEO page types */

const TOOL_LINKS = {
  decoder: '<a href="/tools/jwt-decoder.html">JWT Decoder</a>',
  validator: '<a href="/tools/jwt-validator.html">JWT Validator</a>',
  debugger: '<a href="/tools/jwt-debugger.html">JWT Debugger</a>',
  encoder: '<a href="/tools/jwt-encoder.html">JWT Encoder</a>',
  expiry: '<a href="/tools/jwt-expiry-checker.html">JWT Expiry Checker</a>',
  jwks: '<a href="/tools/jwks-validator.html">JWKS Validator</a>',
};

export function guideContent({ title, keyword, lang, fixType }) {
  const langBlock = lang ? `<h2>${lang} Example</h2>${langExamples[lang]?.(keyword) || ''}` : '';
  const fixBlock = fixType ? fixSections[fixType]?.(keyword) : '';

  return `<h2>${title}</h2>
<p>This guide explains <strong>${keyword}</strong> — one of the most searched JWT topics by developers building authentication for APIs and web apps.</p>
${whatIsJwtSection()}
${howValidationWorksSection(keyword)}
<h2>Quick Answer</h2>
<p>Use our ${TOOL_LINKS.decoder} to inspect the token, then ${TOOL_LINKS.validator} to verify the signature. All processing runs in your browser — no upload required.</p>
${fixBlock}
<h2>Step-by-Step Guide</h2>
<ol>
<li>Copy the JWT from your app, API response, or browser dev tools (Network tab → Authorization header)</li>
<li>Paste into the ${TOOL_LINKS.decoder} — review header, payload, and claims</li>
<li>Check <code>exp</code>, <code>iss</code>, <code>aud</code>, and <code>alg</code> claims match your configuration</li>
<li>Verify signature with ${TOOL_LINKS.validator} using the correct secret (HS256) or JWKS URL (RS256)</li>
<li>Use ${TOOL_LINKS.debugger} for claim-by-claim warnings and expiration timeline</li>
<li>Fix any errors using our <a href="/errors/">JWT Error Directory</a></li>
</ol>
<h2>Real-World Example</h2>
<p>When debugging <strong>${keyword}</strong>, developers typically receive a 401 Unauthorized from an API. The token may be expired, signed with the wrong key, or missing required claims. Decode first to inspect — never skip signature verification before trusting payload data.</p>
<pre><code>Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code></pre>
${langBlock}
${commonErrorsSection()}
${securityBestPracticesSection()}
<h2>Related Resources</h2>
<p>Start with our <a href="/guides/jwt-basics.html">JWT Basics</a> guide or follow the <a href="/learning-path.html">JWT Learning Path</a>. See also <a href="/compare/jwt-io-alternative.html">JWTValidator vs jwt.io</a>, <a href="/hubs/security.html">JWT Security Hub</a>, <a href="/blog/posts/jwt-security-best-practices.html">Security Best Practices</a>, and <a href="/resources.html">full resource directory</a>.</p>`;
}

export function errorContent({ title, keyword, errorCode }) {
  return `<h2>${title}</h2>
<p>Encountering <strong>${keyword}</strong> is common when working with JWT authentication. This page explains the cause, step-by-step fix, and prevention.</p>
${errorCode ? `<p><strong>Error code:</strong> <code>${errorCode}</code></p>` : ''}
${whatIsJwtSection()}
<h2>What Causes This Error?</h2>
<p>JWT libraries throw this error when token validation fails. Common triggers include wrong secret/key, algorithm mismatch, clock skew, modified token content, or expired <code>exp</code> claim.</p>
<ul>
<li><strong>Wrong secret or key</strong> — HMAC secret mismatch or incorrect JWKS endpoint</li>
<li><strong>Algorithm mismatch</strong> — token signed with RS256 but verified as HS256</li>
<li><strong>Expired token</strong> — <code>exp</code> claim is in the past</li>
<li><strong>Invalid issuer/audience</strong> — <code>iss</code> or <code>aud</code> does not match config</li>
<li><strong>Malformed token</strong> — not exactly three Base64URL segments</li>
</ul>
<h2>How to Fix — Step by Step</h2>
<ol>
<li>Paste the token into ${TOOL_LINKS.decoder} — confirm structure is valid (3 segments)</li>
<li>Check the <code>alg</code> header claim matches your verification method</li>
<li>Verify with ${TOOL_LINKS.validator} using the correct secret (HS256) or JWKS URL (RS256)</li>
<li>Inspect claims with ${TOOL_LINKS.debugger} for expiration and issuer issues</li>
<li>Compare against provider docs (Auth0, Cognito, Firebase) for expected iss and aud values</li>
</ol>
<h2>Developer Debugging Tips</h2>
<p>Log the error message from your JWT library — it usually indicates whether signature, expiration, or claim validation failed. Never log the full token in production.</p>
${commonErrorsSection(keyword)}
<h2>Prevention</h2>
<p>Always validate <code>exp</code>, <code>iss</code>, and <code>aud</code> server-side. Use short-lived access tokens with refresh token rotation. Whitelist allowed algorithms explicitly.</p>
${securityBestPracticesSection()}`;
}

export function claimContent({ claim, name, description }) {
  return `<h2>What Is the ${claim} Claim?</h2>
<p>The <code>${claim}</code> (${name}) claim ${description}</p>
<h2>Example</h2>
<pre><code>{ "${claim}": ${claimExamples[claim] || '"value"' } }</code></pre>
<h2>How to Inspect</h2>
<p>Paste any JWT into ${TOOL_LINKS.decoder} to see the <code>${claim}</code> claim in the decoded payload. Use ${TOOL_LINKS.debugger} for validation warnings related to this claim.</p>
<h2>Validation Rules</h2>
<p>${claimValidation[claim] || 'Validate this claim matches your application requirements during token verification.'}</p>`;
}

export function compareContent({ title, a, b, keyword }) {
  return `<h2>${title}</h2>
<p>Developers frequently search for <strong>${keyword}</strong> when choosing an authentication strategy. Here is a practical comparison.</p>
<h2>${a} Overview</h2>
<p>${compareSides[a] || `${a} is a common authentication approach used in modern applications.`}</p>
<h2>${b} Overview</h2>
<p>${compareSides[b] || `${b} is widely used for API and web authentication.`}</p>
<h2>Comparison Table</h2>
<table>
<tr><th>Factor</th><th>${a}</th><th>${b}</th></tr>
<tr><td>Stateless</td><td>${a === 'JWT' ? 'Yes' : 'Varies'}</td><td>${b === 'JWT' ? 'Yes' : 'Varies'}</td></tr>
<tr><td>Scalability</td><td>High for distributed systems</td><td>Depends on implementation</td></tr>
<tr><td>Revocation</td><td>Requires blocklist or short expiry</td><td>Easier with server sessions</td></tr>
<tr><td>Best for</td><td>APIs, microservices, mobile</td><td>Varies by architecture</td></tr>
</table>
<h2>Recommendation</h2>
<p>For API authentication, JWT with short-lived tokens and refresh rotation is the industry standard. Test tokens with our ${TOOL_LINKS.decoder} and ${TOOL_LINKS.validator}.</p>`;
}

export function learnContent({ language, title, keyword }) {
  const example = langExamples[language]?.(keyword) || langExamples.nodejs(keyword);
  return `<h2>${title}</h2>
<p>Learn <strong>${keyword}</strong> with a complete ${language} example. Copy, adapt, and test with our free JWT tools.</p>
<h2>Install Dependencies</h2>
<pre><code>${langInstall[language] || 'npm install jsonwebtoken'}</code></pre>
<h2>Sign a JWT</h2>
${example}
<h2>Verify a JWT</h2>
<p>Always verify the signature and validate <code>exp</code>, <code>iss</code>, and <code>aud</code> claims. Test your tokens with ${TOOL_LINKS.validator}.</p>
<h2>Debug Issues</h2>
<p>If verification fails, use ${TOOL_LINKS.debugger} and see our <a href="/errors/invalid-signature.html">invalid signature guide</a>.</p>`;
}

export function providerContent({ provider, title, keyword }) {
  return `<h2>${title}</h2>
<p><strong>${keyword}</strong> — how to decode, validate, and debug tokens from ${provider}.</p>
<h2>${provider} JWT Structure</h2>
<p>${provider} issues JWTs with standard claims: <code>iss</code>, <code>sub</code>, <code>aud</code>, <code>exp</code>, plus provider-specific custom claims.</p>
<h2>Verify ${provider} Tokens</h2>
<ol>
<li>Get the JWKS URL from ${provider}'s documentation</li>
<li>Use our ${TOOL_LINKS.jwks} with the JWKS endpoint</li>
<li>Validate <code>iss</code> and <code>aud</code> match your application config</li>
</ol>
<h2>Decode for Debugging</h2>
<p>Paste any ${provider} token into ${TOOL_LINKS.decoder} to inspect claims during development. Never trust decoded content without signature verification.</p>`;
}

export function useCaseContent({ title, keyword, scenario }) {
  return `<h2>${title}</h2>
<p><strong>${keyword}</strong> — how JWT authentication works for ${scenario}.</p>
<h2>Architecture</h2>
<p>JWTs enable stateless authentication ideal for ${scenario}. The client stores an access token and sends it with each request via the <code>Authorization: Bearer</code> header.</p>
<h2>Implementation Checklist</h2>
<ul>
<li>Issue short-lived access tokens (5–15 min)</li>
<li>Implement refresh token rotation</li>
<li>Validate signature, exp, iss, aud on every request</li>
<li>Store tokens securely (httpOnly cookies for web)</li>
</ul>
<h2>Test Your Tokens</h2>
<p>Use ${TOOL_LINKS.decoder}, ${TOOL_LINKS.validator}, and ${TOOL_LINKS.debugger} during development.</p>`;
}

const claimExamples = {
  exp: '1735689600',
  sub: '"user-123"',
  iss: '"https://auth.example.com"',
  aud: '"api.example.com"',
  iat: '1700000000',
  nbf: '1700000000',
  jti: '"unique-token-id"',
};

const claimValidation = {
  exp: 'Reject tokens where exp is in the past. Allow small clock skew (30s) server-side.',
  sub: 'Must match the expected user ID. This is the primary identity claim.',
  iss: 'Must match your configured issuer URL exactly.',
  aud: 'Must include your API identifier or client ID.',
  iat: 'Reject tokens issued too far in the future (clock skew).',
  nbf: 'Reject tokens where current time is before nbf.',
  jti: 'Use with a revocation list to prevent token replay.',
};

const compareSides = {
  JWT: 'Self-contained signed tokens with claims. Stateless and ideal for APIs and microservices.',
  'Session Cookies': 'Server-side session store with cookie-based session ID. Easier revocation, harder to scale horizontally.',
  OAuth: 'Authorization framework — access tokens are often JWTs but OAuth defines the flow, not the format.',
  'API Keys': 'Simple static keys in headers. No claims, no expiry — less flexible than JWTs.',
};

const fixSections = {
  expired: (kw) => `<h2>Fix: Token Expired</h2><p>For <strong>${kw}</strong>, obtain a new token via refresh token flow. Never modify exp client-side. See <a href="/guides/jwt-expired-token-fix.html">JWT expired token fix</a>.</p>`,
  signature: (kw) => `<h2>Fix: Invalid Signature</h2><p>For <strong>${kw}</strong>, verify the correct secret/key and algorithm. See <a href="/guides/jwt-invalid-signature.html">invalid signature guide</a>.</p>`,
  malformed: (kw) => `<h2>Fix: Malformed Token</h2><p>For <strong>${kw}</strong>, ensure the token has exactly 3 Base64URL segments. See <a href="/errors/malformed-jwt.html">malformed JWT guide</a>.</p>`,
};

const langInstall = {
  nodejs: 'npm install jsonwebtoken',
  typescript: 'npm install jsonwebtoken @types/jsonwebtoken',
  python: 'pip install PyJWT',
  java: '// Maven: io.jsonwebtoken:jjwt-api',
  go: 'go get github.com/golang-jwt/jwt/v5',
  csharp: 'dotnet add package System.IdentityModel.Tokens.Jwt',
  php: 'composer require firebase/php-jwt',
  ruby: 'gem install jwt',
  rust: 'cargo add jsonwebtoken',
  elixir: '# {:joken, "~> 2.6"} in mix.exs',
  kotlin: '// implementation("io.jsonwebtoken:jjwt-api:0.12.3")',
  swift: '// import JWTKit // Swift Package Manager',
  scala: '// libraryDependencies += "io.jsonwebtoken" %% "jjwt-api" % "0.12.3"',
};

const langExamples = {
  nodejs: (kw) => `<pre><code class="language-javascript">const jwt = require('jsonwebtoken');
// Sign
const token = jwt.sign({ sub: 'user-1' }, process.env.JWT_SECRET, { expiresIn: '1h' });
// Verify
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch (err) {
  console.error('${kw}:', err.message);
}</code></pre>`,
  python: (kw) => `<pre><code class="language-python">import jwt
token = jwt.encode({'sub': 'user-1'}, secret, algorithm='HS256')
try:
    decoded = jwt.decode(token, secret, algorithms=['HS256'])
except jwt.InvalidTokenError as e:
    print('${kw}:', e)</code></pre>`,
  java: (kw) => `<pre><code class="language-java">// JJWT example
String token = Jwts.builder().subject("user-1").signWith(key).compact();
Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();</code></pre>`,
  go: (kw) => `<pre><code class="language-go">token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
tokenString, _ := token.SignedString([]byte(secret))
parsed, err := jwt.Parse(tokenString, keyFunc)</code></pre>`,
  csharp: (kw) => `<pre><code class="language-csharp">var token = new JwtSecurityToken(claims: claims, signingCredentials: creds);
var handler = new JwtSecurityTokenHandler();
var jsonToken = handler.WriteToken(token);</code></pre>`,
  php: (kw) => `<pre><code class="language-php">use Firebase\\JWT\\JWT;
$token = JWT::encode($payload, $key, 'HS256');
$decoded = JWT::decode($token, new Key($key, 'HS256'));</code></pre>`,
  ruby: (kw) => `<pre><code class="language-ruby">token = JWT.encode({ sub: 'user-1' }, secret, 'HS256')
decoded = JWT.decode(token, secret, true, { algorithm: 'HS256' })</code></pre>`,
  typescript: (kw) => `<pre><code class="language-typescript">import jwt from 'jsonwebtoken';
const token = jwt.sign({ sub: 'user-1' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
const decoded = jwt.verify(token, process.env.JWT_SECRET!);</code></pre>`,
  rust: (kw) => `<pre><code class="language-rust">use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(secret))?;</code></pre>`,
  elixir: (kw) => `<pre><code class="language-elixir">token = Joken.generate_and_sign(%{"sub" => "user-1"}, signer)
{:ok, claims} = Joken.verify(token, signer)</code></pre>`,
  kotlin: (kw) => `<pre><code class="language-kotlin">val token = Jwts.builder().subject("user-1").signWith(key).compact()
val claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token)</code></pre>`,
  swift: (kw) => `<pre><code class="language-swift">let token = try JWT.sign(payload, using: .hs256(key: secret))
let payload = try JWT.verify(token, using: .hs256(key: secret))</code></pre>`,
  scala: (kw) => `<pre><code class="language-scala">val token = Jwts.builder().subject("user-1").signWith(key).compact()
val claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token)</code></pre>`,
};

export function buildFaq(keyword, type = 'guide') {
  const faqs = {
    guide: [
      { q: `What is ${keyword}?`, a: `${keyword} is a common JWT authentication topic. This guide explains the concept with step-by-step instructions, code examples, and links to free decoder and validator tools.` },
      { q: 'Are JWT tools on this site free?', a: 'Yes. All 13 tools run client-side in your browser with no account required. Tokens are never uploaded to a server.' },
      { q: 'How do I debug JWT errors?', a: 'Use our JWT Decoder to inspect structure, JWT Validator to verify signatures, and JWT Debugger for claim-by-claim analysis and expiration warnings.' },
      { q: 'Is decoding the same as validating a JWT?', a: 'No. Decoding reads header and payload without proving authenticity. Always verify the signature before trusting claims in production.' },
      { q: 'Which JWT algorithm should I use?', a: 'Use RS256 or ES256 for public APIs and OAuth. HS256 is fine for internal services when you can protect the shared secret.' },
    ],
    error: [
      { q: `Why am I seeing ${keyword}?`, a: 'This error occurs when JWT validation fails — wrong secret, algorithm mismatch, expired token, or invalid claims.' },
      { q: 'Can I fix this without the secret?', a: 'You can decode the payload without the secret, but signature verification requires the correct key or JWKS endpoint.' },
      { q: 'How do I prevent this error?', a: 'Validate exp, iss, and aud on every request. Use short-lived tokens, algorithm whitelists, and correct key configuration.' },
      { q: 'Does clock skew cause JWT errors?', a: 'Yes. Allow 30–60 seconds tolerance for exp and nbf validation. Server clocks must be synchronized with NTP.' },
    ],
    claim: [
      { q: `What does this JWT claim mean?`, a: `See this page for a full explanation with JSON examples and validation rules for production APIs.` },
      { q: 'How do I view this claim in a token?', a: 'Paste your JWT into our free JWT Decoder or Claims Viewer to see all payload claims instantly.' },
      { q: 'Must I validate this claim server-side?', a: 'Registered claims like exp, iss, aud, and sub should always be validated during token verification.' },
    ],
    blog: [
      { q: `Who is this article for?`, a: 'Developers implementing JWT authentication in web apps, APIs, and microservices — from beginners to senior engineers.' },
      { q: 'Are JWT tokens safe to paste in online tools?', a: 'Our tools process everything locally. Avoid pasting production secrets; use test tokens when possible.' },
    ],
    algorithm: [
      { q: `When should I use this algorithm?`, a: 'See the comparison table on this page. RS256/ES256 for OAuth and public APIs; HS256 for trusted internal services only.' },
      { q: 'Can I switch algorithms on existing tokens?', a: 'No. Changing alg requires re-issuing tokens. Verifiers must whitelist allowed algorithms.' },
    ],
  };
  return faqs[type] || faqs.guide;
}

/** Extra on-page copy for thin programmatic pages (word count + internal links) */
export function contentSupplement({ keyword, type = 'guide' }) {
  const links = `<p>Browse related resources: <a href="/tools/jwt-decoder.html">JWT Decoder</a>, <a href="/tools/jwt-validator.html">JWT Validator</a>, <a href="/guides/jwt-basics.html">JWT Basics</a>, <a href="/guides/jwt-authentication-explained.html">JWT Authentication</a>, <a href="/errors/">JWT Errors</a>, <a href="/algorithms/">Algorithms</a>, <a href="/glossary/">Glossary</a>, and <a href="/learning-path.html">Learning Path</a>.</p>`;

  const blocks = {
    guide: `<h2>Understanding ${keyword} in Production</h2>
<p>Developers search for <strong>${keyword}</strong> when building API authentication with JSON Web Tokens. JWTs are used by OAuth 2.0, OpenID Connect, Auth0, Firebase, AWS Cognito, and Keycloak. Always validate <code>exp</code>, <code>iss</code>, and <code>aud</code> server-side — decoding alone proves nothing about authenticity.</p>
<h2>JWT Structure Recap</h2>
<p>Every JWT has three dot-separated segments: header (algorithm), payload (claims), signature (proof). Use ${TOOL_LINKS.decoder} to inspect and ${TOOL_LINKS.validator} to verify before trusting any claim value in production code.</p>
<h2>Common Pitfalls</h2>
<ul><li>Algorithm confusion (<code>none</code> attack) — whitelist allowed algorithms</li><li>Secrets in the payload — payload is only Base64-encoded, not encrypted</li><li>Ignoring clock skew on <code>exp</code> and <code>nbf</code></li><li>Weak HMAC secrets — use 256-bit random keys</li><li>Skipping signature verification — always call verify(), not decode()</li><li>Storing tokens in localStorage — XSS can steal them</li></ul>
<h2>Further Reading</h2>
${links}`,
    error: `<h2>Debugging ${keyword}</h2>
<p>The error <strong>${keyword}</strong> means JWT verification failed. Decode the token, check <code>alg</code>, verify <code>exp</code> is not past, and confirm the secret or JWKS URL matches your auth provider.</p>
${links}`,
    glossary: `<h2>${keyword} in JWT Authentication</h2>
<p>Understanding <strong>${keyword}</strong> helps you read RFC 7519, debug tokens, and design secure authentication. JWTs combine header, payload claims, and a cryptographic signature.</p>
${links}`,
    algorithm: `<h2>Using ${keyword} Safely</h2>
<p>Algorithm <strong>${keyword}</strong> defines JWT signing. Validate the header <code>alg</code> matches expectations. Use JWKS for asymmetric keys; protect HMAC secrets.</p>
${links}`,
    claim: `<h2>Validating the Claim</h2>
<p>Always verify JWT claims during token validation. Use our <a href="/tools/jwt-claims-viewer.html">Claims Viewer</a> and <a href="/tools/jwt-debugger.html">Debugger</a> to inspect claim values in real tokens.</p>
${links}`,
    compare: `<h2>Choosing the Right Approach</h2>
<p>Compare trade-offs carefully for your architecture. See <a href="/guides/jwt-authentication-explained.html">JWT Authentication Explained</a> and <a href="/hubs/security.html">Security Hub</a> for deeper guidance.</p>
${links}`,
  };
  return blocks[type] || blocks.guide;
}

/** Shared SEO sections — appended to pillar and tool pages */
export function whatIsJwtSection() {
  return `<h2>What Is a JWT?</h2>
<p>A JSON Web Token (JWT) is a compact, URL-safe string defined by <a href="/glossary/rfc7519.html">RFC 7519</a>. It encodes claims as JSON and attaches a cryptographic signature so receivers can verify the token was issued by a trusted party and was not tampered with.</p>
<p>JWTs consist of three Base64URL-encoded parts separated by dots:</p>
<ul>
<li><strong>Header</strong> — algorithm (<code>alg</code>) and token type (<code>typ</code>)</li>
<li><strong>Payload</strong> — claims such as <code>sub</code>, <code>iss</code>, <code>aud</code>, <code>exp</code></li>
<li><strong>Signature</strong> — HMAC or asymmetric signature over header + payload</li>
</ul>
<p>JWTs are used by OAuth 2.0, OpenID Connect, Auth0, Firebase, AWS Cognito, and most modern API authentication systems.</p>`;
}

export function howValidationWorksSection(keyword = 'JWT validation') {
  return `<h2>How JWT Validation Works</h2>
<p><strong>${keyword}</strong> requires more than Base64 decoding. A secure verifier performs these steps on every request:</p>
<ol>
<li><strong>Parse structure</strong> — confirm exactly three segments separated by dots</li>
<li><strong>Verify signature</strong> — HMAC with shared secret, or asymmetric verify with public key from JWKS</li>
<li><strong>Validate algorithm</strong> — reject unexpected <code>alg</code> values including <code>none</code></li>
<li><strong>Check time claims</strong> — <code>exp</code> not past, <code>nbf</code> not future, allow clock skew</li>
<li><strong>Validate iss and aud</strong> — issuer and audience match your application configuration</li>
</ol>
<p>Use ${TOOL_LINKS.validator} for HMAC verification or ${TOOL_LINKS.jwks} for RS256/ES256 with JWKS endpoints.</p>`;
}

export function commonErrorsSection(context = '') {
  return `<h2>Common JWT Errors</h2>
<p>${context ? `When troubleshooting <strong>${context}</strong>, ` : ''}developers encounter these errors frequently:</p>
<ul>
<li><a href="/errors/token-expired.html">Token expired</a> — <code>exp</code> claim is in the past</li>
<li><a href="/errors/invalid-signature.html">Invalid signature</a> — wrong secret, key, or algorithm</li>
<li><a href="/errors/malformed-jwt.html">Malformed JWT</a> — not three valid Base64URL segments</li>
<li><a href="/errors/jwt-alg-not-allowed-nodejs.html">Algorithm not allowed</a> — alg confusion or none attack attempt</li>
</ul>
<p>Browse the full <a href="/errors/">JWT Error Directory</a> for fixes with step-by-step instructions.</p>`;
}

export function securityBestPracticesSection() {
  return `<h2>Best Practices for JWT Security</h2>
<ul>
<li>Never trust decoded payload without signature verification</li>
<li>Use short-lived access tokens (5–15 minutes) with refresh rotation</li>
<li>Whitelist allowed algorithms — never accept <code>alg: none</code></li>
<li>Store tokens in httpOnly cookies, not localStorage (XSS risk)</li>
<li>Use RS256/ES256 for public APIs; protect HMAC secrets with 256+ bit random keys</li>
<li>Validate <code>exp</code>, <code>iss</code>, <code>aud</code>, and <code>sub</code> on every request</li>
<li>Never log full bearer tokens in application logs</li>
</ul>
<p>Read our <a href="/blog/posts/jwt-security-best-practices.html">JWT Security Best Practices</a> article and explore the <a href="/hubs/security.html">Security Hub</a>.</p>`;
}

/** Editorial content for tool landing pages */
export function toolPageContent(tool) {
  const slug = tool.slug;
  const intros = {
    'jwt-decoder': `<h2>What This JWT Decoder Does</h2><p>Instantly decode any JSON Web Token into readable JSON. View the header (algorithm, type), payload (claims), and signature segment. Perfect for debugging OAuth, API authentication, and Auth0/Firebase/Cognito tokens.</p>`,
    'jwt-validator': `<h2>What This JWT Validator Does</h2><p>Verify JWT signatures with your HMAC secret (HS256/384/512). Confirms the token was not modified and was signed with the correct key. Pair with our JWKS Validator for RS256 tokens.</p>`,
    'jwt-debugger': `<h2>What This JWT Debugger Does</h2><p>Deep inspection of JWT claims with expiration timeline, validation warnings, and issuer/audience checks. Built for OAuth 2.0 and OpenID Connect development workflows.</p>`,
    'jwt-encoder': `<h2>What This JWT Encoder Does</h2><p>Create signed JWT tokens with HS256, RS256, ES256, PS256, and EdDSA. Test authentication flows, generate fixtures for unit tests, and learn how signing works.</p>`,
    'jwks-validator': `<h2>What This JWKS Validator Does</h2><p>Verify RS256/ES256 JWT tokens using a JWKS endpoint. Fetches public keys client-side from your OIDC provider and validates signatures against the matching key ID.</p>`,
  };
  const intro = intros[slug] || `<h2>About This Tool</h2><p>${tool.description}</p>`;

  return `${intro}
${whatIsJwtSection()}
${howValidationWorksSection(tool.title)}
<h2>How to Use This Tool</h2>
<ol>
<li>Copy a JWT from your application, API response, or browser dev tools</li>
<li>Paste into the tool above and click the primary action button</li>
<li>Review decoded output, validation result, or error message</li>
<li>Use Copy buttons to export results for documentation or support tickets</li>
</ol>
<h2>Example Use Cases</h2>
<ul>
<li>Debug 401 Unauthorized errors from REST APIs</li>
<li>Inspect OAuth access tokens and OpenID Connect ID tokens</li>
<li>Verify token expiration before implementing refresh logic</li>
<li>Learn JWT structure during onboarding or security reviews</li>
</ul>
${commonErrorsSection()}
${securityBestPracticesSection()}
<p>Explore <a href="/guides/">JWT Guides</a>, <a href="/blog/">Blog</a>, and <a href="/learning-path.html">Learning Path</a> for deeper tutorials.</p>`;
}

/** Pillar landing page content (Phase 7 programmatic SEO) */
export function pillarPageContent(page) {
  return `<h2>${page.primaryKeyword.charAt(0).toUpperCase() + page.primaryKeyword.slice(1)} — Complete Overview</h2>
<p>This page is your starting point for <strong>${page.primaryKeyword}</strong>. JWTValidator.org provides free, privacy-first tools used by developers worldwide — all processing happens in your browser with zero server upload.</p>
${whatIsJwtSection()}
${howValidationWorksSection(page.primaryKeyword)}
<h2>Step-by-Step: ${page.primaryKeyword.charAt(0).toUpperCase() + page.primaryKeyword.slice(1)}</h2>
<ol>
<li>Open the <a href="/tools/${page.toolSlug}.html">${page.title.split('—')[0].trim()}</a> tool</li>
<li>Paste your JWT token from Authorization header or API response</li>
<li>Review decoded claims: <code>sub</code>, <code>iss</code>, <code>aud</code>, <code>exp</code>, <code>alg</code></li>
<li>Verify signature with correct secret or JWKS URL</li>
<li>Fix errors using our <a href="/errors/">error guides</a> if validation fails</li>
</ol>
<h2>Why Developers Choose JWTValidator.org</h2>
<ul>
<li><strong>vs jwt.io</strong> — 13 tools, 1,000+ guides, bulk decode, OAuth inspector (<a href="/compare/jwt-io-alternative.html">comparison</a>)</li>
<li><strong>Privacy</strong> — no account, no upload, no token storage</li>
<li><strong>Algorithms</strong> — HS256/384/512, RS256/384/512, PS256/384/512, ES256/384/512, EdDSA</li>
<li><strong>Learning</strong> — glossary, learning path, 13 language code examples</li>
</ul>
${commonErrorsSection(page.primaryKeyword)}
${securityBestPracticesSection()}
<p>Related: <a href="/jwt-decoder.html">JWT Decoder</a> · <a href="/jwt-validator.html">JWT Validator</a> · <a href="/jwt-debugger.html">JWT Debugger</a> · <a href="/jwt-signature-verification.html">Signature Verification</a></p>`;
}

export function toolHowToSteps(tool) {
  return [
    { name: 'Open the tool', text: `Navigate to the ${tool.title} page on JWTValidator.org.` },
    { name: 'Paste JWT token', text: 'Copy your token from Authorization header or API response and paste into the input field.' },
    { name: 'Run validation', text: 'Click the primary button to decode, validate, or debug the token.' },
    { name: 'Review results', text: 'Inspect output, copy results, or follow linked guides if errors occur.' },
  ];
}
