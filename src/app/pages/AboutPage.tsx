import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useState } from 'react';
import { Instagram, Mail, Send } from 'lucide-react';
import { CONTACT_EMAIL, sendForm } from '../lib/contact';

const REQUEST_LABELS: Record<string, string> = {
  projet: 'Proposer un projet',
  renseignement: 'Demander un renseignement',
  autre: 'Autre',
};

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'projet',
    message: '',
  });
  const [botcheck, setBotcheck] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');
    try {
      const result = await sendForm(
        `Contact — ${REQUEST_LABELS[formData.projectType]} — ${formData.name}`,
        {
          Nom: formData.name,
          'E-mail': formData.email,
          'Type de demande': REQUEST_LABELS[formData.projectType],
          Message: formData.message,
        },
        { replyTo: formData.email, botcheck },
      );
      if (result === 'mailto') return;
      setIsSubmitted(true);
      setFormData({ name: '', email: '', projectType: 'projet', message: '' });
    } catch {
      setError(`Le message n'a pas pu partir. Réessayez, ou écrivez directement à ${CONTACT_EMAIL}.`);
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl sm:text-7xl md:text-[8rem] mb-2 mt-8 md:mt-12 tracking-tight leading-none" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800, fontStyle: 'italic' }}>
            Contact
          </h1>
          <p className="text-xl text-gray-600" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
            Une idée de projet ? Une question ? N'hésitez pas à me contacter.
          </p>
        </motion.div>

        {/* Contact Form Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {isSubmitted ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block p-8 bg-gray-50 rounded-2xl">
                <Send size={48} className="mx-auto mb-4 text-black" />
                <h3 className="text-2xl mb-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                  Message envoyé !
                </h3>
                <p style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
                  Je vous répondrai dans les plus brefs délais.
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <LiquidInput
                  label="Nom"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <LiquidInput
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                  Type de demande
                </label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                  style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}
                >
                  <option value="projet">Proposer un projet</option>
                  <option value="renseignement">Demander un renseignement</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block mb-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
                  style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}
                  placeholder="Parlez-moi de votre projet..."
                />
              </div>

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

              {error && (
                <p className="text-red-600" role="alert" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
                  {error}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={isSending}
                className="w-full bg-black text-white py-4 rounded-lg overflow-hidden relative disabled:opacity-60"
                style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Send size={20} />
                  {isSending ? 'ENVOI EN COURS…' : 'ENVOYER'}
                </span>
              </motion.button>

              <p className="text-center text-gray-500 text-sm" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
                Vous pouvez aussi écrire directement à{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-black">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </form>
          )}
        </motion.div>

        {/* Social Media Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl mb-8" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
            SUIVEZ-MOI
          </h2>
          <div className="flex justify-center gap-6 flex-wrap">
            <motion.a
              href="https://www.instagram.com/raleurs_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Instagram size={24} />
              <span style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                @raleurs_
              </span>
            </motion.a>

            <motion.a
              href="https://www.behance.net/theogirault"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.5 4.5h3.8c1.7 0 3.1.3 4.2 1 1.1.7 1.7 1.8 1.7 3.3 0 1-.3 1.9-.9 2.6-.6.7-1.4 1.1-2.4 1.3 1.2.2 2.1.7 2.8 1.5.7.8 1 1.8 1 3 0 1.6-.6 2.9-1.8 3.7-1.2.9-2.8 1.3-4.8 1.3H6.5V4.5zm3.5 5.3h.8c.8 0 1.4-.2 1.9-.5.4-.3.6-.8.6-1.4 0-.6-.2-1.1-.7-1.4-.5-.3-1.1-.4-2-.4h-.6v3.7zm0 6.4h1.2c.9 0 1.6-.2 2.1-.6.5-.4.7-1 .7-1.7 0-.7-.2-1.3-.7-1.7-.5-.4-1.2-.6-2.2-.6h-1.1v4.6z"/>
              </svg>
              <span style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                Behance
              </span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface LiquidInputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

function LiquidInput({ label, type, name, value, onChange, required }: LiquidInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const borderRadiusTL = useSpring(useTransform(mouseX, [-1, 1], [8, 20]), {
    stiffness: 150,
    damping: 20,
  });
  const borderRadiusTR = useSpring(useTransform(mouseY, [-1, 1], [8, 20]), {
    stiffness: 150,
    damping: 20,
  });
  const borderRadiusBL = useSpring(useTransform(mouseY, [-1, 1], [20, 8]), {
    stiffness: 150,
    damping: 20,
  });
  const borderRadiusBR = useSpring(useTransform(mouseX, [-1, 1], [20, 8]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div>
      <label className="block mb-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
        {label}
      </label>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          borderTopLeftRadius: borderRadiusTL,
          borderTopRightRadius: borderRadiusTR,
          borderBottomLeftRadius: borderRadiusBL,
          borderBottomRightRadius: borderRadiusBR,
        }}
        className="overflow-hidden"
      >
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 py-3 border-2 ${
            isFocused ? 'border-black' : 'border-gray-200'
          } focus:outline-none transition-colors`}
          style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400, borderRadius: 'inherit' }}
        />
      </motion.div>
    </div>
  );
}