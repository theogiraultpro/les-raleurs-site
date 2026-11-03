import { Link } from 'react-router';
import { CONTACT_EMAIL } from '../lib/contact';
import { HOST, LEGAL, LegalLayout, ToFill } from '../lib/legal';

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" updated="3 novembre 2026">
      <h2>Éditeur du site</h2>
      <p>
        Le site lesraleurs.com est édité par {LEGAL.name}, sous le nom « {LEGAL.brand} », {LEGAL.status.toLowerCase()}.
        <br />
        SIRET : <ToFill value={LEGAL.siret} label="numéro SIRET" />
        <br />
        Adresse : <ToFill value={LEGAL.address} label="adresse postale" />
        <br />
        E-mail : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <br />
        {LEGAL.vat}.
      </p>
      <p>Directeur de la publication : {LEGAL.name}.</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par {HOST.name}, {HOST.address} — <a href={HOST.url}>{HOST.url.replace('https://', '')}</a>.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L'ensemble des œuvres, illustrations, affiches, visuels, textes et logos présentés sur ce site sont la
        propriété exclusive de {LEGAL.name}, sauf mention contraire, et sont protégés par le Code de la propriété
        intellectuelle. Toute reproduction, représentation, adaptation ou diffusion, totale ou partielle, sans
        autorisation écrite préalable est interdite.
      </p>
      <p>
        Les travaux réalisés pour des clients ou des événements (affiches, identités visuelles) sont présentés à
        titre de références ; les marques et noms cités appartiennent à leurs propriétaires respectifs.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Les informations envoyées via les formulaires de contact, de commission et de commande (nom, e-mail,
        téléphone, adresse de livraison, message) servent uniquement à répondre à votre demande et à traiter votre
        commande. Elles ne sont ni vendues ni cédées à des tiers.
      </p>
      <p>
        Les formulaires sont transmis par e-mail via le service Web3Forms. Les messages sont conservés le temps
        nécessaire au traitement de la demande, et jusqu'à 10 ans pour les commandes (obligations comptables).
      </p>
      <p>
        Conformément au Règlement général sur la protection des données (RGPD), vous disposez d'un droit d'accès,
        de rectification, d'effacement et d'opposition sur vos données. Pour l'exercer, écrivez à{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Vous pouvez aussi adresser une réclamation à la
        CNIL (<a href="https://www.cnil.fr">cnil.fr</a>).
      </p>

      <h2>Cookies</h2>
      <p>
        Ce site n'utilise aucun cookie publicitaire ni de mesure d'audience. Vos favoris sont seulement enregistrés
        dans votre propre navigateur, et ne sont pas transmis.
      </p>

      <h2>Vente en ligne</h2>
      <p>
        Les conditions de vente des œuvres sont détaillées dans les{' '}
        <Link to="/cgv">conditions générales de vente</Link>.
      </p>
    </LegalLayout>
  );
}
