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
<h2>Quick Answer</h2>
<p>Use our ${TOOL_LINKS.decoder} to inspect the token, then ${TOOL_LINKS.validator} to verify the signature. All processing runs in your browser — no upload required.</p>
${fixBlock}
<h2>Step-by-Step</h2>
<ol>
<li>Copy the JWT from your app, API response, or browser dev tools</li>
<li>Paste into the ${TOOL_LINKS.decoder} — review header, payload, and claims</li>
<li>Check <code>exp</code>, <code>iss</code>, <code>aud</code>, and <code>alg</code> claims</li>
<li>Verify signature with ${TOOL_LINKS.validator} using the correct secret or JWKS URL</li>
<li>Use ${TOOL_LINKS.debugger} for claim-by-claim warnings and timeline analysis</li>
</ol>
${langBlock}
<h2>Related Resources</h2>
<p>Start with our <a href="/guides/jwt-basics.html">JWT Basics</a> guide or follow the <a href="/learning-path.html">JWT Learning Path</a>.</p>`;
}

export function errorContent({ title, keyword, errorCode }) {
  return `<h2>${title}</h2>
<p>Encountering <strong>${keyword}</strong> is common when working with JWT authentication. This page explains the cause and how to fix it.</p>
${errorCode ? `<p><strong>Error code:</strong> <code>${errorCode}</code></p>` : ''}
<h2>What Causes This Error?</h2>
<p>JWT libraries throw this error when token validation fails. Common triggers include wrong secret/key, algorithm mismatch, clock skew, or modified token content.</p>
<h2>How to Fix</h2>
<ol>
<li>Paste the token into ${TOOL_LINKS.decoder} — confirm structure is valid (3 segments)</li>
<li>Check the <code>alg</code> header claim matches your verification method</li>
<li>Verify with ${TOOL_LINKS.validator} using the correct: correct secret (HS256) or JWKS URL (RS256)</li>
<li>Inspect claims with ${TOOL_LINKS.debugger} for expiration and issuer issues</li>
</ol>
<h2>Prevention</h2>
<p>Always validate <code>exp</code>, <code>iss</code>, and <code>aud</code> server-side. Use short-lived access tokens with refresh token rotation.</p>`;
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
      { q: `What is ${keyword}?`, a: `A common JWT authentication topic. This guide explains ${keyword} with examples and links to free decoder/validator tools.` },
      { q: 'Are JWT tools on this site free?', a: 'Yes. All tools run client-side in your browser with no account required.' },
      { q: 'How do I debug JWT errors?', a: 'Use our JWT Decoder, Validator, and Debugger tools. Paste your token to inspect claims and verify signatures.' },
    ],
    error: [
      { q: `Why am I seeing ${keyword}?`, a: 'This error occurs when JWT validation fails. Check secret/key, algorithm, expiration, and token structure.' },
      { q: 'Can I fix this without the secret?', a: 'You can decode the payload without the secret, but signature verification requires the correct key.' },
    ],
    claim: [
      { q: `What does the claim mean in JWT?`, a: `See this page for a full explanation with examples and validation rules.` },
      { q: 'How do I view this claim?', a: 'Paste your JWT into our free JWT Decoder to see all claims in the payload.' },
    ],
  };
  return faqs[type] || faqs.guide;
}
