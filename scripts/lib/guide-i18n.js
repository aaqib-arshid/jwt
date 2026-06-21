/**
 * Localized guide content for programmatic SEO pages (decoder/validator by language).
 */

const LOCALE_FROM_SLUG = {
  deutsch: 'de', francais: 'fr', espanol: 'es', portugues: 'pt',
  italiano: 'it', nederlands: 'nl', polski: 'pl', turkce: 'tr',
  russian: 'ru', japanese: 'ja', korean: 'ko', chinese: 'zh',
  hindi: 'hi', arabic: 'ar',
};

const LOCALE_DIR = { ar: 'rtl' };

const TOOLS = {
  decoder: '/tools/jwt-decoder.html',
  validator: '/tools/jwt-validator.html',
  debugger: '/tools/jwt-debugger.html',
};

export function detectGuideLocale(slug = '') {
  for (const [key, code] of Object.entries(LOCALE_FROM_SLUG)) {
    if (slug.includes(key)) return code;
  }
  return null;
}

export function detectGuideTopic(slug = '') {
  if (slug.includes('validator') || slug.includes('validateur') || slug.includes('validador')) {
    return 'validator';
  }
  if (slug.includes('decoder') || slug.includes('decodeur') || slug.includes('decod')) {
    return 'decoder';
  }
  return 'guide';
}

export function getGuidePageDir(locale) {
  return LOCALE_DIR[locale] || 'ltr';
}

/** Native page titles for decoder/validator locale pages */
export function localizedGuideMeta(slug, fallbackTitle, fallbackDescription) {
  const locale = detectGuideLocale(slug);
  const topic = detectGuideTopic(slug);
  if (!locale) return null;

  const meta = META[locale]?.[topic];
  if (!meta) return null;

  return {
    title: meta.title,
    seoTitle: meta.seoTitle,
    description: fallbackDescription || meta.description,
    hreflang: locale,
    primaryKeyword: meta.keyword,
  };
}

const META = {
  de: {
    decoder: {
      title: 'JWT Decoder — JWT Token online dekodieren',
      seoTitle: 'JWT Decoder online | JWT Token dekodieren kostenlos',
      keyword: 'jwt decoder deutsch',
      description: 'JWT Token online dekodieren — kostenloser JWT Decoder auf Deutsch. Header, Payload und Claims sofort anzeigen.',
    },
    validator: {
      title: 'JWT Validator — JWT Signatur online verifizieren',
      seoTitle: 'JWT Validator online | Signatur verifizieren kostenlos',
      keyword: 'jwt validator deutsch',
      description: 'JWT Signatur online verifizieren kostenlos. HS256 und JWKS — 100 % im Browser, ohne Upload.',
    },
  },
  fr: {
    decoder: {
      title: 'Décodeur JWT — décoder un token JWT en ligne',
      seoTitle: 'Décodeur JWT en ligne | Décoder un token gratuitement',
      keyword: 'jwt décodeur français',
      description: 'Décoder un token JWT en ligne gratuitement en français. Affichez header, payload et claims instantanément.',
    },
    validator: {
      title: 'Validateur JWT — vérifier la signature en ligne',
      seoTitle: 'Validateur JWT en ligne | Vérifier la signature gratuitement',
      keyword: 'jwt validateur français',
      description: 'Vérifier la signature JWT en ligne gratuitement. HS256 et JWKS — 100 % dans le navigateur.',
    },
  },
  es: {
    decoder: {
      title: 'Decodificador JWT — decodificar tokens JWT online',
      seoTitle: 'Decodificador JWT online | Decodificar JWT gratis',
      keyword: 'jwt decoder español',
      description: 'Decodificar tokens JWT online gratis en español. Vea header, payload y claims al instante.',
    },
    validator: {
      title: 'Validador JWT — verificar firma JWT online',
      seoTitle: 'Validador JWT online | Verificar firma JWT gratis',
      keyword: 'jwt validador español',
      description: 'Validar firma JWT online gratis. HS256 y JWKS — 100 % en el navegador, sin subir datos.',
    },
  },
  ru: {
    decoder: {
      title: 'JWT Декодер — декодировать JWT токен онлайн',
      seoTitle: 'JWT декодер онлайн | Декодировать JWT бесплатно',
      keyword: 'jwt decoder russian',
      description: 'Декодировать JWT токен онлайн бесплатно. Мгновенно просматривайте header, payload и claims.',
    },
  },
  ja: {
    decoder: {
      title: 'JWTデコーダー — JWTトークンをオンラインでデコード',
      seoTitle: 'JWTデコーダー online | JWTトークンを無料でデコード',
      keyword: 'jwt decoder 日本語',
      description: 'JWTトークンをオンラインでデコード。ヘッダー、ペイロード、クレームを即座に確認できます。',
    },
  },
  ko: {
    decoder: {
      title: 'JWT 디코더 — JWT 토큰 온라인 디코딩',
      seoTitle: 'JWT 디코더 online | JWT 토큰 무료 디코딩',
      keyword: 'jwt decoder 한국어',
      description: 'JWT 토큰 온라인 디코더 무료. 헤더, 페이로드, 클레임을 즉시 확인하세요.',
    },
  },
  zh: {
    decoder: {
      title: 'JWT解码器 — 在线解码JWT令牌',
      seoTitle: 'JWT解码器 online | 免费在线解码JWT',
      keyword: 'jwt decoder 中文',
      description: 'JWT令牌在线解码器免费。即时查看header、payload和claims。',
    },
  },
  hi: {
    decoder: {
      title: 'JWT डिकोडर — JWT टोकन ऑनलाइन डिकोड करें',
      seoTitle: 'JWT डिकोडर online | JWT टोकन मुफ्त में डिकोड',
      keyword: 'jwt decoder hindi',
      description: 'JWT टोकन ऑनलाइन डिकोडर मुफ्त। header, payload और claims तुरंत देखें।',
    },
  },
  ar: {
    decoder: {
      title: 'فك تشفير JWT — فك JWT عبر الإنترنت',
      seoTitle: 'فك تشفير JWT online | فك JWT مجاناً',
      keyword: 'jwt decoder arabic',
      description: 'فك تشفير JWT مجاناً عبر الإنترنت. اعرض header وpayload وclaims فوراً.',
    },
  },
};

function toolLink(href, label) {
  return `<a href="${href}">${label}</a>`;
}

const CONTENT = {
  de: {
    decoder: (keyword) => `<h2>JWT Token online dekodieren</h2>
<p>Dieser Leitfaden erklärt <strong>${keyword}</strong> — wie Sie JSON Web Tokens dekodieren, Header und Payload lesen und typische Fehler erkennen. Ideal für API- und OAuth-Entwicklung.</p>
<h2>Kurzantwort</h2>
<p>Nutzen Sie unseren ${toolLink(TOOLS.decoder, 'JWT Decoder')}, um den Token zu inspizieren, und den ${toolLink(TOOLS.validator, 'JWT Validator')} zur Signaturprüfung. Alles läuft lokal im Browser — kein Upload.</p>
<h2>Was ist ein JWT?</h2>
<p>Ein JWT (JSON Web Token, RFC 7519) besteht aus drei Base64URL-kodierten Teilen: <strong>Header</strong> (Algorithmus), <strong>Payload</strong> (Claims wie <code>sub</code>, <code>exp</code>, <code>iss</code>) und <strong>Signatur</strong>.</p>
<h2>Schritt für Schritt</h2>
<ol>
<li>Kopieren Sie den JWT aus Ihrer App, API-Antwort oder den Browser-DevTools</li>
<li>Fügen Sie ihn in den ${toolLink(TOOLS.decoder, 'JWT Decoder')} ein</li>
<li>Prüfen Sie <code>exp</code>, <code>iss</code>, <code>aud</code> und <code>alg</code></li>
<li>Verifizieren Sie die Signatur mit dem ${toolLink(TOOLS.validator, 'JWT Validator')}</li>
<li>Nutzen Sie den ${toolLink(TOOLS.debugger, 'JWT Debugger')} für Warnungen und Ablaufzeiten</li>
</ol>
<h2>Sicherheit</h2>
<p>Decodieren ersetzt keine Verifizierung. Validieren Sie <code>exp</code>, <code>iss</code> und <code>aud</code> serverseitig. Speichern Sie Tokens nicht in localStorage.</p>
<h2>Weitere Ressourcen</h2>
<p><a href="/guides/jwt-basics.html">JWT Grundlagen</a> · <a href="/learning-path.html">Lernpfad</a> · <a href="/tools/jwt-decoder.html">Decoder öffnen</a></p>`,
    validator: (keyword) => `<h2>JWT Signatur online verifizieren</h2>
<p>Dieser Leitfaden erklärt <strong>${keyword}</strong> — wie Sie JWT-Signaturen mit HS256 oder JWKS (RS256) prüfen und häufige Validierungsfehler beheben.</p>
<h2>Kurzantwort</h2>
<p>Token und Secret (HS256) oder JWKS-URL (RS256) in unseren ${toolLink(TOOLS.validator, 'JWT Validator')} einfügen. Die Prüfung erfolgt vollständig im Browser.</p>
<h2>So funktioniert die Validierung</h2>
<ol>
<li>Struktur prüfen — genau drei Segmente</li>
<li>Signatur verifizieren — HMAC oder asymmetrischer Schlüssel</li>
<li>Algorithmus whitelisten — <code>none</code> ablehnen</li>
<li><code>exp</code>, <code>iss</code>, <code>aud</code> validieren</li>
</ol>
<h2>Häufige Fehler</h2>
<ul>
<li><a href="/errors/token-expired.html">Token abgelaufen</a></li>
<li><a href="/errors/invalid-signature.html">Ungültige Signatur</a></li>
<li><a href="/errors/malformed-jwt.html">Malformed JWT</a></li>
</ul>
<h2>Weitere Ressourcen</h2>
<p><a href="/guides/jwt-basics.html">JWT Grundlagen</a> · <a href="/tools/jwt-validator.html">Validator öffnen</a></p>`,
  },
  fr: {
    decoder: (keyword) => `<h2>Décoder un token JWT en ligne</h2>
<p>Ce guide explique <strong>${keyword}</strong> — comment décoder un JSON Web Token, lire le header et le payload, et diagnostiquer les erreurs courantes.</p>
<h2>Réponse rapide</h2>
<p>Utilisez notre ${toolLink(TOOLS.decoder, 'Décodeur JWT')} pour inspecter le token, puis le ${toolLink(TOOLS.validator, 'Validateur JWT')} pour vérifier la signature. Tout s'exécute dans votre navigateur.</p>
<h2>Qu'est-ce qu'un JWT ?</h2>
<p>Un JWT (RFC 7519) comporte trois parties Base64URL : <strong>header</strong>, <strong>payload</strong> (claims) et <strong>signature</strong>.</p>
<h2>Étapes</h2>
<ol>
<li>Copiez le JWT depuis votre application ou les outils de développement</li>
<li>Collez-le dans le ${toolLink(TOOLS.decoder, 'Décodeur JWT')}</li>
<li>Vérifiez <code>exp</code>, <code>iss</code>, <code>aud</code> et <code>alg</code></li>
<li>Vérifiez la signature avec le ${toolLink(TOOLS.validator, 'Validateur JWT')}</li>
<li>Utilisez le ${toolLink(TOOLS.debugger, 'Debugger JWT')} pour l'analyse détaillée</li>
</ol>
<h2>Sécurité</h2>
<p>Décoder n'est pas authentifier. Validez toujours la signature et les claims côté serveur.</p>
<h2>Ressources</h2>
<p><a href="/guides/jwt-basics.html">Bases JWT</a> · <a href="/learning-path.html">Parcours d'apprentissage</a></p>`,
    validator: (keyword) => `<h2>Vérifier la signature JWT en ligne</h2>
<p>Ce guide couvre <strong>${keyword}</strong> — vérification HS256, RS256 via JWKS, et résolution des erreurs de validation.</p>
<h2>Réponse rapide</h2>
<p>Collez le token et le secret ou l'URL JWKS dans notre ${toolLink(TOOLS.validator, 'Validateur JWT')}. Traitement 100 % local.</p>
<h2>Validation en 4 étapes</h2>
<ol>
<li>Vérifier la structure (3 segments)</li>
<li>Vérifier la signature cryptographique</li>
<li>Refuser les algorithmes non autorisés</li>
<li>Valider <code>exp</code>, <code>iss</code>, <code>aud</code></li>
</ol>
<h2>Erreurs fréquentes</h2>
<ul>
<li><a href="/errors/token-expired.html">Token expiré</a></li>
<li><a href="/errors/invalid-signature.html">Signature invalide</a></li>
</ul>`,
  },
  es: {
    decoder: (keyword) => `<h2>Decodificar tokens JWT online</h2>
<p>Esta guía explica <strong>${keyword}</strong> — cómo decodificar JSON Web Tokens, leer claims y depurar errores de autenticación API.</p>
<h2>Respuesta rápida</h2>
<p>Use nuestro ${toolLink(TOOLS.decoder, 'Decodificador JWT')} y luego el ${toolLink(TOOLS.validator, 'Validador JWT')}. Todo en el navegador, sin subir datos.</p>
<h2>¿Qué es un JWT?</h2>
<p>Un JWT tiene header, payload (claims como <code>sub</code>, <code>exp</code>) y firma criptográfica separados por puntos.</p>
<h2>Pasos</h2>
<ol>
<li>Copie el JWT de su app o herramientas de desarrollo</li>
<li>Péguelo en el ${toolLink(TOOLS.decoder, 'Decodificador JWT')}</li>
<li>Revise <code>exp</code>, <code>iss</code>, <code>aud</code> y <code>alg</code></li>
<li>Verifique la firma con el ${toolLink(TOOLS.validator, 'Validador JWT')}</li>
</ol>
<h2>Seguridad</h2>
<p>Decodificar no verifica la autenticidad. Siempre valide la firma en el servidor.</p>`,
    validator: (keyword) => `<h2>Validar firma JWT online</h2>
<p>Guía sobre <strong>${keyword}</strong> — verificación HS256, RS256 con JWKS y solución de errores comunes.</p>
<h2>Respuesta rápida</h2>
<p>Pegue el token y la clave en nuestro ${toolLink(TOOLS.validator, 'Validador JWT')}. Procesamiento 100 % local.</p>
<h2>Cómo validar</h2>
<ol>
<li>Comprobar estructura (3 segmentos)</li>
<li>Verificar firma con clave correcta</li>
<li>Validar <code>exp</code>, <code>iss</code>, <code>aud</code></li>
<li>Rechazar <code>alg: none</code></li>
</ol>`,
  },
  ru: {
    decoder: (keyword) => `<h2>Декодировать JWT токен онлайн</h2>
<p>Это руководство по теме <strong>${keyword}</strong> — как декодировать JSON Web Token, просмотреть header и payload, и найти типичные ошибки аутентификации.</p>
<h2>Краткий ответ</h2>
<p>Используйте наш ${toolLink(TOOLS.decoder, 'JWT декодер')} для просмотра токена и ${toolLink(TOOLS.validator, 'JWT валидатор')} для проверки подписи. Всё выполняется локально в браузере — без загрузки на сервер.</p>
<h2>Что такое JWT?</h2>
<p>JWT (RFC 7519) состоит из трёх частей в Base64URL: <strong>header</strong> (алгоритм), <strong>payload</strong> (claims: <code>sub</code>, <code>exp</code>, <code>iss</code>) и <strong>подпись</strong>.</p>
<h2>Пошаговая инструкция</h2>
<ol>
<li>Скопируйте JWT из приложения, ответа API или DevTools браузера</li>
<li>Вставьте в ${toolLink(TOOLS.decoder, 'JWT декодер')}</li>
<li>Проверьте <code>exp</code>, <code>iss</code>, <code>aud</code> и <code>alg</code></li>
<li>Проверьте подпись в ${toolLink(TOOLS.validator, 'JWT валидаторе')}</li>
<li>Используйте ${toolLink(TOOLS.debugger, 'JWT отладчик')} для детального анализа</li>
</ol>
<h2>Безопасность</h2>
<p>Декодирование не подтверждает подлинность. Всегда проверяйте подпись и claims на сервере. Не храните токены в localStorage.</p>
<h2>Дополнительно</h2>
<p><a href="/guides/jwt-basics.html">Основы JWT</a> · <a href="/learning-path.html">Путь обучения</a></p>`,
  },
  ja: {
    decoder: (keyword) => `<h2>JWTトークンをオンラインでデコード</h2>
<p>このガイドでは<strong>${keyword}</strong>について説明します。JSON Web Tokenのデコード方法、headerとpayloadの読み方、よくあるエラーの対処法を解説します。</p>
<h2>クイック回答</h2>
<p>${toolLink(TOOLS.decoder, 'JWTデコーダー')}でトークンを確認し、${toolLink(TOOLS.validator, 'JWTバリデーター')}で署名を検証します。すべてブラウザ内で処理され、アップロードは不要です。</p>
<h2>JWTとは？</h2>
<p>JWT（RFC 7519）はBase64URLエンコードされた3つの部分で構成されます：<strong>header</strong>、<strong>payload</strong>（<code>sub</code>、<code>exp</code>などのクレーム）、<strong>署名</strong>。</p>
<h2>手順</h2>
<ol>
<li>アプリ、APIレスポンス、またはブラウザのDevToolsからJWTをコピー</li>
<li>${toolLink(TOOLS.decoder, 'JWTデコーダー')}に貼り付け</li>
<li><code>exp</code>、<code>iss</code>、<code>aud</code>、<code>alg</code>を確認</li>
<li>${toolLink(TOOLS.validator, 'JWTバリデーター')}で署名を検証</li>
<li>${toolLink(TOOLS.debugger, 'JWTデバッガー')}で詳細分析</li>
</ol>
<h2>セキュリティ</h2>
<p>デコードだけでは認証は完了しません。サーバー側で必ず署名とクレームを検証してください。</p>`,
  },
  ko: {
    decoder: (keyword) => `<h2>JWT 토큰 온라인 디코딩</h2>
<p>이 가이드는 <strong>${keyword}</strong>에 대해 설명합니다. JSON Web Token을 디코딩하고 header, payload, claims를 확인하는 방법을 안내합니다.</p>
<h2>빠른 답변</h2>
<p>${toolLink(TOOLS.decoder, 'JWT 디코더')}로 토큰을 확인하고 ${toolLink(TOOLS.validator, 'JWT 검증기')}로 서명을 검증하세요. 모든 처리는 브라우저에서 로컬로 실행됩니다.</p>
<h2>JWT란?</h2>
<p>JWT(RFC 7519)는 Base64URL로 인코딩된 세 부분으로 구성됩니다: <strong>header</strong>, <strong>payload</strong>(<code>sub</code>, <code>exp</code> 등), <strong>서명</strong>.</p>
<h2>단계별 안내</h2>
<ol>
<li>앱, API 응답 또는 브라우저 DevTools에서 JWT 복사</li>
<li>${toolLink(TOOLS.decoder, 'JWT 디코더')}에 붙여넣기</li>
<li><code>exp</code>, <code>iss</code>, <code>aud</code>, <code>alg</code> 확인</li>
<li>${toolLink(TOOLS.validator, 'JWT 검증기')}로 서명 검증</li>
<li>${toolLink(TOOLS.debugger, 'JWT 디버거')}로 상세 분석</li>
</ol>
<h2>보안</h2>
<p>디코딩만으로는 인증이 완료되지 않습니다. 서버에서 항상 서명과 claims를 검증하세요.</p>`,
  },
  zh: {
    decoder: (keyword) => `<h2>在线解码JWT令牌</h2>
<p>本指南介绍<strong>${keyword}</strong>——如何解码JSON Web Token、查看header和payload以及排查常见认证错误。</p>
<h2>快速解答</h2>
<p>使用我们的${toolLink(TOOLS.decoder, 'JWT解码器')}查看令牌，然后用${toolLink(TOOLS.validator, 'JWT验证器')}验证签名。全部在浏览器本地处理，无需上传。</p>
<h2>什么是JWT？</h2>
<p>JWT（RFC 7519）由三个Base64URL编码部分组成：<strong>header</strong>、<strong>payload</strong>（含<code>sub</code>、<code>exp</code>等声明）和<strong>签名</strong>。</p>
<h2>操作步骤</h2>
<ol>
<li>从应用、API响应或浏览器DevTools复制JWT</li>
<li>粘贴到${toolLink(TOOLS.decoder, 'JWT解码器')}</li>
<li>检查<code>exp</code>、<code>iss</code>、<code>aud</code>和<code>alg</code></li>
<li>使用${toolLink(TOOLS.validator, 'JWT验证器')}验证签名</li>
<li>使用${toolLink(TOOLS.debugger, 'JWT调试器')}进行详细分析</li>
</ol>
<h2>安全提示</h2>
<p>解码不等于验证。务必在服务端验证签名和claims。</p>`,
  },
  hi: {
    decoder: (keyword) => `<h2>JWT टोकन ऑनलाइन डिकोड करें</h2>
<p>यह गाइड <strong>${keyword}</strong> समझाती है — JSON Web Token को कैसे डिकोड करें, header और payload पढ़ें, और सामान्य authentication errors ठीक करें।</p>
<h2>त्वरित उत्तर</h2>
<p>हमारे ${toolLink(TOOLS.decoder, 'JWT डिकोडर')} से टोकन देखें और ${toolLink(TOOLS.validator, 'JWT वैलिडेटर')} से signature verify करें। सब कुछ ब्राउज़र में locally चलता है — कोई upload नहीं।</p>
<h2>JWT क्या है?</h2>
<p>JWT (RFC 7519) तीन Base64URL parts से बना होता है: <strong>header</strong>, <strong>payload</strong> (<code>sub</code>, <code>exp</code> claims), और <strong>signature</strong>।</p>
<h2>चरण-दर-चरण</h2>
<ol>
<li>ऐप, API response, या browser DevTools से JWT कॉपी करें</li>
<li>${toolLink(TOOLS.decoder, 'JWT डिकोडर')} में paste करें</li>
<li><code>exp</code>, <code>iss</code>, <code>aud</code>, <code>alg</code> जांचें</li>
<li>${toolLink(TOOLS.validator, 'JWT वैलिडेटर')} से signature verify करें</li>
</ol>
<h2>सुरक्षा</h2>
<p>Decode करना verify नहीं है। हमेशा server-side signature और claims validate करें।</p>`,
  },
  ar: {
    decoder: (keyword) => `<h2>فك تشفير JWT عبر الإنترنت</h2>
<p>يشرح هذا الدليل <strong>${keyword}</strong> — كيفية فك JSON Web Token وقراءة header وpayload وتشخيص أخطاء المصادقة الشائعة.</p>
<h2>إجابة سريعة</h2>
<p>استخدم ${toolLink(TOOLS.decoder, 'فك JWT')} لفحص الرمز، ثم ${toolLink(TOOLS.validator, 'التحقق من JWT')} للتحقق من التوقيع. كل المعالجة محلياً في المتصفح — بدون رفع بيانات.</p>
<h2>ما هو JWT؟</h2>
<p>يتكون JWT (RFC 7519) من ثلاثة أجزاء Base64URL: <strong>header</strong> و<strong>payload</strong> (claims مثل <code>sub</code> و<code>exp</code>) و<strong>التوقيع</strong>.</p>
<h2>خطوات</h2>
<ol>
<li>انسخ JWT من التطبيق أو استجابة API أو أدوات المطور</li>
<li>الصقه في ${toolLink(TOOLS.decoder, 'فك JWT')}</li>
<li>تحقق من <code>exp</code> و<code>iss</code> و<code>aud</code> و<code>alg</code></li>
<li>تحقق من التوقيع باستخدام ${toolLink(TOOLS.validator, 'التحقق من JWT')}</li>
<li>استخدم ${toolLink(TOOLS.debugger, 'أداة تصحيح JWT')} للتحليل التفصيلي</li>
</ol>
<h2>الأمان</h2>
<p>فك التشفير لا يعني التحقق. تحقق دائماً من التوقيع والclaims على الخادم.</p>`,
  },
};

const FAQ = {
  de: {
    decoder: (kw) => [
      { q: `Was ist ${kw}?`, a: 'Ein kostenloser Online-Leitfaden zum Dekodieren von JWT-Tokens mit Header, Payload und Claims — alles im Browser.' },
      { q: 'Sind die Tools kostenlos?', a: 'Ja. Alle Tools laufen clientseitig im Browser ohne Konto.' },
      { q: 'Werden Tokens hochgeladen?', a: 'Nein. Ihre Tokens verlassen nie Ihren Browser.' },
    ],
    validator: (kw) => [
      { q: `Wie verifiziere ich ${kw}?`, a: 'Token und Secret oder JWKS-URL in den JWT Validator einfügen. Signaturprüfung erfolgt lokal.' },
      { q: 'Ist Dekodieren dasselbe wie Validieren?', a: 'Nein. Dekodieren liest nur den Inhalt. Validieren prüft die kryptografische Signatur.' },
    ],
  },
  fr: {
    decoder: (kw) => [
      { q: `Qu'est-ce que ${kw} ?`, a: 'Guide gratuit pour décoder les tokens JWT et inspecter header, payload et claims dans le navigateur.' },
      { q: 'Les outils sont-ils gratuits ?', a: 'Oui. Tout fonctionne côté client, sans compte.' },
      { q: 'Mes tokens sont-ils envoyés ?', a: 'Non. Vos tokens ne quittent jamais votre navigateur.' },
    ],
    validator: (kw) => [
      { q: `Comment vérifier ${kw} ?`, a: 'Collez le token et le secret ou l\'URL JWKS dans le Validateur JWT.' },
      { q: 'Décoder suffit-il ?', a: 'Non. La vérification de signature est obligatoire en production.' },
    ],
  },
  es: {
    decoder: (kw) => [
      { q: `¿Qué es ${kw}?`, a: 'Guía gratuita para decodificar JWT y ver header, payload y claims en el navegador.' },
      { q: '¿Son gratis las herramientas?', a: 'Sí. Todo funciona en el cliente, sin cuenta.' },
      { q: '¿Se suben mis tokens?', a: 'No. Sus tokens nunca salen del navegador.' },
    ],
    validator: (kw) => [
      { q: `¿Cómo validar ${kw}?`, a: 'Pegue el token y la clave o URL JWKS en el Validador JWT.' },
      { q: '¿Decodificar es validar?', a: 'No. Siempre verifique la firma en el servidor.' },
    ],
  },
  ru: {
    decoder: (kw) => [
      { q: `Что такое ${kw}?`, a: 'Бесплатное руководство по декодированию JWT с просмотром header, payload и claims в браузере.' },
      { q: 'Инструменты бесплатны?', a: 'Да. Всё работает локально в браузере без регистрации.' },
      { q: 'Загружаются ли токены на сервер?', a: 'Нет. Ваши токены не покидают браузер.' },
      { q: 'Декодирование — это проверка?', a: 'Нет. Для аутентификации всегда проверяйте подпись на сервере.' },
    ],
  },
  ja: {
    decoder: (kw) => [
      { q: `${kw}とは？`, a: 'JWTをデコードしてheader、payload、claimsをブラウザで確認する無料ガイドです。' },
      { q: 'ツールは無料ですか？', a: 'はい。アカウント不要で、すべてブラウザ内で動作します。' },
      { q: 'トークンはアップロードされますか？', a: 'いいえ。トークンがサーバーに送信されることはありません。' },
    ],
  },
  ko: {
    decoder: (kw) => [
      { q: `${kw}란?`, a: 'JWT를 디코딩하고 header, payload, claims를 브라우저에서 확인하는 무료 가이드입니다.' },
      { q: '도구는 무료인가요?', a: '예. 계정 없이 브라우저에서 로컬로 실행됩니다.' },
      { q: '토큰이 업로드되나요?', a: '아니요. 토큰은 브라우저를 벗어나지 않습니다.' },
    ],
  },
  zh: {
    decoder: (kw) => [
      { q: `什么是${kw}？`, a: '免费指南：在浏览器中解码JWT并查看header、payload和claims。' },
      { q: '工具免费吗？', a: '是的。无需账户，全部在浏览器本地运行。' },
      { q: '令牌会上传吗？', a: '不会。您的令牌永远不会离开浏览器。' },
    ],
  },
  hi: {
    decoder: (kw) => [
      { q: `${kw} क्या है?`, a: 'JWT decode करने और header, payload, claims browser में देखने का मुफ्त गाइड।' },
      { q: 'क्या tools मुफ्त हैं?', a: 'हाँ। बिना account के browser में locally चलते हैं।' },
      { q: 'क्या tokens upload होते हैं?', a: 'नहीं। आपके tokens browser से बाहर नहीं जाते।' },
    ],
  },
  ar: {
    decoder: (kw) => [
      { q: `ما هو ${kw}؟`, a: 'دليل مجاني لفك JWT وعرض header وpayload وclaims في المتصفح.' },
      { q: 'هل الأدوات مجانية؟', a: 'نعم. تعمل محلياً في المتصفح دون حساب.' },
      { q: 'هل تُرفع الرموز إلى الخادم؟', a: 'لا. رموزك لا تغادر متصفحك أبداً.' },
    ],
  },
};

export function localizedGuideContent({ slug, keyword }) {
  const locale = detectGuideLocale(slug);
  if (!locale) return null;
  const topic = detectGuideTopic(slug);
  const builder = CONTENT[locale]?.[topic];
  if (!builder) return null;
  const kw = keyword || META[locale]?.[topic]?.keyword || slug;
  return builder(kw);
}

export function localizedGuideFaq({ slug, keyword }) {
  const locale = detectGuideLocale(slug);
  if (!locale) return null;
  const topic = detectGuideTopic(slug);
  const builder = FAQ[locale]?.[topic];
  if (!builder) return null;
  const kw = keyword || META[locale]?.[topic]?.keyword || slug;
  return builder(kw);
}

/** Apply localization to an existing guide entry */
export function applyGuideLocalization(guide) {
  const locale = detectGuideLocale(guide.slug);
  if (!locale) return guide;

  const topic = detectGuideTopic(guide.slug);
  const keyword = guide.primaryKeyword || guide.keywords?.split(',')[0]?.trim() || guide.slug;
  const content = localizedGuideContent({ slug: guide.slug, keyword });
  if (!content) return guide;

  const meta = localizedGuideMeta(guide.slug, guide.title, guide.description);
  const faq = localizedGuideFaq({ slug: guide.slug, keyword });

  return {
    ...guide,
    ...(meta || {}),
    primaryKeyword: meta?.primaryKeyword || keyword,
    content,
    faq: faq || guide.faq,
    hreflang: locale,
    pageDir: getGuidePageDir(locale),
  };
}

export function localizeAllGuides(guides) {
  return guides.map(applyGuideLocalization);
}
