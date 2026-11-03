// Coordonnées et envoi des formulaires du site.
//
// Les formulaires passent par Web3Forms (https://web3forms.com), qui transfère
// chaque message vers CONTACT_EMAIL. La clé d'accès Web3Forms n'est pas secrète :
// elle identifie seulement la boîte de réception, elle peut donc rester dans le code.
//
// Tant que la clé est vide, les formulaires ouvrent la messagerie du visiteur
// avec un e-mail pré-rempli adressé à CONTACT_EMAIL : aucun message n'est perdu.

export const CONTACT_EMAIL = 'contact@lesraleurs.com';

export const WEB3FORMS_KEY: string = '27867f84-ae67-42ea-a92d-0297d2374fa4';

export type SendResult = 'sent' | 'mailto';

export async function sendForm(
  subject: string,
  fields: Record<string, string>,
  options: { replyTo?: string; botcheck?: boolean } = {},
): Promise<SendResult> {
  // Champ piège coché par un robot : on fait comme si tout allait bien.
  if (options.botcheck) return 'sent';

  if (!WEB3FORMS_KEY) {
    const body = Object.entries(fields)
      .filter(([, value]) => value.trim() !== '')
      .map(([label, value]) => `${label} : ${value}`)
      .join('\n');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return 'mailto';
  }

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject,
      from_name: 'Site Les Râleurs',
      ...(options.replyTo ? { replyto: options.replyTo } : {}),
      ...fields,
    }),
  });

  const result = await response.json().catch(() => ({ success: false }));
  if (!response.ok || !result.success) {
    throw new Error(result.message || "L'envoi a échoué");
  }
  return 'sent';
}
