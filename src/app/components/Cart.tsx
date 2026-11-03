import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { X, Minus, Plus, Trash2, ArrowLeft, CheckCircle } from 'lucide-react';
import { CONTACT_EMAIL, sendForm } from '../lib/contact';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onOrderSent: () => void;
}

type Step = 'cart' | 'checkout' | 'done';

const EMPTY_CUSTOMER = {
  name: '',
  email: '',
  phone: '',
  address: '',
  postalCode: '',
  city: '',
  message: '',
};

const euros = (value: number) => `${value.toFixed(2).replace('.', ',')} €`;

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onOrderSent }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [step, setStep] = useState<Step>('cart');
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [botcheck, setBotcheck] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    onClose();
    // Après une commande envoyée, on revient au panier pour la prochaine visite.
    if (step === 'done') setStep('cart');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');
    const lines = items
      .map((item) => `- ${item.name} × ${item.quantity} = ${euros(item.price * item.quantity)}`)
      .join('\n');
    try {
      const result = await sendForm(
        `Nouvelle commande — ${customer.name} — ${euros(total)}`,
        {
          Client: customer.name,
          'E-mail': customer.email,
          Téléphone: customer.phone,
          'Adresse de livraison': `${customer.address}, ${customer.postalCode} ${customer.city}, France`,
          Articles: lines,
          'Total des œuvres (hors frais de port)': euros(total),
          'Message du client': customer.message,
          'CGV acceptées': 'Oui',
        },
        { replyTo: customer.email, botcheck },
      );
      // En mode secours (messagerie du visiteur), le panier reste en place :
      // la commande n'est partie que quand le visiteur aura envoyé l'e-mail.
      if (result === 'mailto') return;
      setStep('done');
      setCustomer(EMPTY_CUSTOMER);
      setAcceptedTerms(false);
      onOrderSent();
    } catch {
      setError(`La commande n'a pas pu partir. Réessayez, ou écrivez directement à ${CONTACT_EMAIL}.`);
    } finally {
      setIsSending(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Cart Panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {step === 'checkout' && (
                  <button
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => setStep('cart')}
                    aria-label="Retour au panier"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h2 className="text-2xl">{step === 'checkout' ? 'Commande' : 'Panier'}</h2>
              </div>
              <motion.button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                aria-label="Fermer"
              >
                <X size={24} />
              </motion.button>
            </div>

            {step === 'done' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h3 className="text-2xl">Commande envoyée, merci !</h3>
                <p className="text-gray-600">
                  Je vous réponds sous 48 h par e-mail avec le total frais de port compris et les modalités de
                  paiement (virement ou PayPal). Rien n'est débité pour l'instant.
                </p>
                <motion.button
                  className="mt-4 px-8 py-3 bg-black text-white rounded-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                >
                  Continuer la visite
                </motion.button>
              </div>
            )}

            {step === 'cart' && (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-auto p-6">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p>Votre panier est vide</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                          <motion.div
                            key={item.id}
                            className="flex gap-4 bg-gray-50 rounded-2xl p-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{
                              opacity: 0,
                              x: -20,
                              height: 0,
                              marginBottom: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                            }}
                            layout
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          >
                            <motion.img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-xl"
                              whileHover={{ scale: 1.05 }}
                            />
                            <div className="flex-1">
                              <h3 className="mb-1">{item.name}</h3>
                              <p className="text-gray-600">{euros(item.price)}</p>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 mt-3">
                                <motion.button
                                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                  aria-label="Retirer un exemplaire"
                                >
                                  <Minus size={14} />
                                </motion.button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <motion.button
                                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  aria-label="Ajouter un exemplaire"
                                >
                                  <Plus size={14} />
                                </motion.button>
                              </div>
                            </div>
                            <motion.button
                              className="p-2 hover:bg-red-50 rounded-full transition-colors self-start"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onRemoveItem(item.id)}
                              aria-label="Supprimer du panier"
                            >
                              <Trash2 size={18} className="text-red-500" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                  <motion.div
                    className="border-t border-gray-100 p-6 space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex justify-between items-center text-lg">
                      <span>Total</span>
                      <motion.span key={total} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-2xl">
                        {euros(total)}
                      </motion.span>
                    </div>
                    <p className="text-sm text-gray-500">Hors frais de port. Livraison en France uniquement.</p>
                    <motion.button
                      className="w-full bg-black text-white py-4 rounded-full hover:bg-gray-800 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep('checkout')}
                    >
                      Commander
                    </motion.button>
                  </motion.div>
                )}
              </>
            )}

            {step === 'checkout' && (
              <form onSubmit={handleOrder} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto p-6 space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-4">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>{euros(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 pt-2 mt-2 border-t border-gray-200 text-base">
                      <span>Total des œuvres</span>
                      <span>{euros(total)}</span>
                    </div>
                  </div>

                  <input name="name" value={customer.name} onChange={handleChange} required placeholder="Prénom et nom *" autoComplete="name" className={inputClass} />
                  <input name="email" type="email" value={customer.email} onChange={handleChange} required placeholder="E-mail *" autoComplete="email" className={inputClass} />
                  <input name="phone" type="tel" value={customer.phone} onChange={handleChange} placeholder="Téléphone (facultatif)" autoComplete="tel" className={inputClass} />
                  <input name="address" value={customer.address} onChange={handleChange} required placeholder="Adresse de livraison *" autoComplete="street-address" className={inputClass} />
                  <div className="grid grid-cols-[2fr_3fr] gap-3">
                    <input
                      name="postalCode"
                      value={customer.postalCode}
                      onChange={handleChange}
                      required
                      inputMode="numeric"
                      pattern="[0-9]{5}"
                      title="Code postal français à 5 chiffres"
                      placeholder="Code postal *"
                      autoComplete="postal-code"
                      className={inputClass}
                    />
                    <input name="city" value={customer.city} onChange={handleChange} required placeholder="Ville *" autoComplete="address-level2" className={inputClass} />
                  </div>
                  <textarea name="message" value={customer.message} onChange={handleChange} rows={3} placeholder="Un mot, une précision ? (facultatif)" className={`${inputClass} resize-none`} />

                  {/* Champ piège invisible pour les robots */}
                  <input
                    type="checkbox"
                    name="botcheck"
                    checked={botcheck}
                    onChange={(e) => setBotcheck(e.target.checked)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <p className="text-sm text-gray-600">
                    Livraison en France uniquement. Après réception de votre commande, je vous envoie par e-mail
                    le total frais de port compris et les modalités de paiement (virement ou PayPal). Rien n'est
                    débité maintenant.
                  </p>

                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      required
                      className="mt-1"
                    />
                    <span>
                      J'ai lu et j'accepte les{' '}
                      <a href="/cgv" target="_blank" rel="noopener" className="underline">
                        conditions générales de vente
                      </a>
                      .
                    </span>
                  </label>

                  {error && (
                    <p className="text-red-600 text-sm" role="alert">
                      {error}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-100 p-6">
                  <motion.button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-black text-white py-4 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-60"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSending ? 'Envoi en cours…' : 'Envoyer ma commande'}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
