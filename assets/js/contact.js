/** Static contact form — opens mailto, no backend */

const SUPPORT_EMAIL = 'support@ratpdf.com';

document.getElementById('contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const subject = document.getElementById('contact-subject').value;
  const message = document.getElementById('contact-message').value.trim();

  if (!name || !email || !message) {
    window.JWTUI?.showToast('Please fill in all required fields');
    return;
  }

  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    message,
    '',
    '---',
    'Sent via jwtvalidator.org contact form',
  ].join('\n');

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[JWTValidator] ${subject}`)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
});
