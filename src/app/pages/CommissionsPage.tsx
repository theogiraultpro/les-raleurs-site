import { motion } from 'motion/react';
import { useState } from 'react';
import { Send, CheckCircle, Clock, CreditCard, FileText, MessageSquare, Palette, Pencil } from 'lucide-react';
import exampleImage1 from '@/imports/figma/d99bfded40bf2564663270e48b1fc6c245cab8c9.jpg';
import exampleImage2 from '@/imports/figma/09c05ecf5acdacb8cbe8c64dcb9e2afd033997e2.jpg';
import exampleImage3 from '@/imports/figma/bcbbf0e2aff798b357d41be75d3085522c516aa0.jpg';
import exampleImage4 from '@/imports/figma/ac7c61240dacda776e2cd7085b803686ea6b6b52.jpg';
import exampleImage5 from '@/imports/figma/a613346acc5bd7b0d1973cfd6eecf2119cb75452.jpg';
import exampleImage6 from '@/imports/figma/48a13cc1101a6d500bf61add489ed5e9131ce42e.jpg';
import { CONTACT_EMAIL, sendForm } from '../lib/contact';
import { responsiveImage } from '../lib/image';

const SERVICE_LABELS: Record<string, string> = {
  'illustration-personnalisee': 'Illustration personnalisée',
  'portrait-personnalise': 'Portrait personnalisé',
  'illustration-commerciale': 'Illustration commerciale',
  'serie-collection': 'Série / Collection',
  collaboration: 'Collaboration événement',
};

export default function CommissionsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    serviceType: 'illustration-personnalisee',
    budget: '',
    deadline: '',
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
    const service = SERVICE_LABELS[formData.serviceType];
    try {
      const result = await sendForm(
        `Commission — ${service} — ${formData.name}`,
        {
          Nom: formData.name,
          'E-mail': formData.email,
          'Type de service': service,
          'Budget estimé': formData.budget,
          'Délai souhaité': formData.deadline,
          Projet: formData.message,
        },
        { replyTo: formData.email, botcheck },
      );
      if (result === 'mailto') return;
      setIsSubmitted(true);
      setFormData({ name: '', email: '', serviceType: 'illustration-personnalisee', budget: '', deadline: '', message: '' });
    } catch {
      setError(`La demande n'a pas pu partir. Réessayez, ou écrivez directement à ${CONTACT_EMAIL}.`);
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

  const services = [
    {
      title: 'Illustrations Personnalisées',
      description: 'Création de personnages ou scènes uniques selon votre vision',
      icon: Palette,
    },
    {
      title: 'Commandes sur Mesure',
      description: 'Adaptées à vos besoins spécifiques (format, style, utilisation)',
      icon: Pencil,
    },
    {
      title: 'Collaborations',
      description: 'Projets artistiques, événements, marques et partenariats créatifs',
      icon: MessageSquare,
    },
  ];

  const pricing = [
    {
      type: 'Portrait Personnalisé',
      price: 'À partir de 150€',
      details: 'Un personnage Râleur à votre image',
    },
    {
      type: 'Illustration Commerciale',
      price: 'À partir de 300€',
      details: 'Usage commercial et droits étendus',
    },
    {
      type: 'Série / Collection',
      price: 'Sur devis',
      details: 'Plusieurs illustrations coordonnées',
    },
    {
      type: 'Collaboration Événement',
      price: 'Sur devis',
      details: 'Projet spécifique pour votre événement',
    },
  ];

  const process = [
    {
      step: '01',
      title: 'Brief',
      description: 'Discussion de votre projet et de vos besoins',
    },
    {
      step: '02',
      title: 'Croquis',
      description: 'Proposition de concepts et esquisses',
    },
    {
      step: '03',
      title: 'Validation',
      description: 'Ajustements et approbation finale',
    },
    {
      step: '04',
      title: 'Livraison',
      description: 'Fichiers haute définition prêts à l\'emploi',
    },
  ];

  const examples = [
    { id: 1, title: 'Affiche Rave 99', image: exampleImage1 },
    { id: 2, title: 'Ladal\'Event', image: exampleImage2 },
    { id: 3, title: 'Rave - That\'s Illegal', image: exampleImage3 },
    { id: 4, title: 'The North Face', image: exampleImage4 },
    { id: 5, title: 'Nel\'oone - Trap', image: exampleImage5 },
    { id: 6, title: 'La Friche de Solvay', image: exampleImage6 },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-[15.5vw] md:text-[8rem] mb-4 md:mb-2 mt-2 md:mt-12 tracking-tight leading-[0.9] md:leading-none" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800, fontStyle: 'italic' }}>
            Commissions
          </h1>
          <p className="text-xl text-gray-600" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
            Donnons vie à vos idées ensemble
          </p>
        </motion.div>

        {/* Services Section */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl mb-12 text-center" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
            SERVICES PROPOSÉS
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="relative p-8 bg-gray-50 rounded-2xl overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="absolute inset-0 bg-black"
                  initial={{ scale: 0, borderRadius: '100%' }}
                  whileHover={{ scale: 2, borderRadius: '0%' }}
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  style={{ originX: 0.5, originY: 0.5 }}
                />
                <div className="relative z-10">
                  <service.icon className="w-12 h-12 mb-4 group-hover:text-white transition-colors duration-300" />
                  <h3 className="text-2xl mb-3 group-hover:text-white transition-colors duration-300" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                    {service.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-200 transition-colors duration-300" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-4xl md:text-5xl mb-12 text-center" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
            TARIFS
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pricing.map((item, index) => (
              <motion.div
                key={index}
                className="p-6 border-2 border-gray-100 rounded-xl hover:border-black transition-all duration-300"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                    {item.type}
                  </h3>
                  <span className="text-xl" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                    {item.price}
                  </span>
                </div>
                <p className="text-gray-600" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
                  {item.details}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Process Section */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl mb-12 text-center" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
            PROCESSUS
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-3xl"
                  style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}
                  whileHover={{ scale: 1.1, backgroundColor: '#000', color: '#fff' }}
                  transition={{ duration: 0.3 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="text-2xl mb-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                  {item.title}
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Examples Gallery */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl mb-12 text-center" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
            EXEMPLES DE TRAVAUX
          </h2>
          <div className="overflow-x-auto pb-8">
            <div className="flex gap-6 min-w-max px-6 mx-auto justify-center">
              {examples.map((example, index) => (
                <motion.div
                  key={example.id}
                  className="relative w-64 h-64 bg-gray-100 rounded-xl overflow-hidden group cursor-pointer flex-shrink-0"
                  initial={false}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-black/80 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-white text-center px-4" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                      {example.title}
                    </p>
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                  <img
                    {...responsiveImage(example.image, '(min-width: 768px) 33vw, 100vw', 1280)}
                    loading="lazy"
                    alt={example.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Commission Request Form */}
        <motion.div
          className="max-w-2xl mx-auto mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <h2 className="text-4xl md:text-5xl mb-8 text-center" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
            DEMANDE DE COMMISSION
          </h2>
          <p className="text-center mb-12 text-gray-600" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
            Partagez votre projet et recevez un devis personnalisé
          </p>

          {isSubmitted ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-2xl" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                Demande envoyée !
              </p>
              <p className="text-gray-600 mt-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
                Je vous répondrai dans les plus brefs délais.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                    style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}
                  />
                </div>
                <div>
                  <label className="block mb-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                    style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                  Type de Service *
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                  style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}
                >
                  <option value="illustration-personnalisee">Illustration Personnalisée</option>
                  <option value="portrait-personnalise">Portrait Personnalisé</option>
                  <option value="illustration-commerciale">Illustration Commerciale</option>
                  <option value="serie-collection">Série / Collection</option>
                  <option value="collaboration">Collaboration Événement</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                    Budget estimé
                  </label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Ex: 300€"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                    style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}
                  />
                </div>
                <div>
                  <label className="block mb-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                    Délai souhaité
                  </label>
                  <input
                    type="text"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    placeholder="Ex: 2 semaines"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                    style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                  Décrivez votre projet *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Parlez-moi de votre vision, des détails importants, de l'utilisation prévue..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors resize-none"
                  style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}
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
                className="w-full bg-black text-white py-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={20} />
                {isSending ? 'ENVOI EN COURS…' : 'ENVOYER LA DEMANDE'}
              </motion.button>
            </form>
          )}
        </motion.div>

        {/* Conditions Section */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2 className="text-4xl md:text-5xl mb-12 text-center" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
            CONDITIONS
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl mb-3" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                Délais
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
                2 à 4 semaines selon la complexité. Possibilité d'express sur demande.
              </p>
            </div>
            <div className="text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl mb-3" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                Paiement
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
                50% à la commande, 50% à la livraison. Virement bancaire ou PayPal.
              </p>
            </div>
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl mb-3" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 800 }}>
                Droits d'utilisation
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'aktiv-grotesk-condensed', fontWeight: 400 }}>
                Définies selon le projet. Usage commercial avec droits étendus disponibles.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}