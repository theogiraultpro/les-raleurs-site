import { Link } from 'react-router';
import { CONTACT_EMAIL } from '../lib/contact';
import { LEGAL, LegalLayout, ToFill } from '../lib/legal';

export default function CGVPage() {
  return (
    <LegalLayout title="Conditions générales de vente" updated="3 novembre 2026">
      <h2>1. Vendeur et champ d'application</h2>
      <p>
        Les présentes conditions s'appliquent à toutes les ventes d'œuvres conclues sur le site lesraleurs.com entre
        {' '}{LEGAL.name} (« {LEGAL.brand} »), {LEGAL.status.toLowerCase()}, SIRET{' '}
        <ToFill value={LEGAL.siret} label="numéro SIRET" />, joignable à{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, et toute personne passant commande (« le client »).
        Passer commande vaut acceptation de ces conditions.
      </p>

      <h2>2. Œuvres et prix</h2>
      <p>
        Les œuvres sont décrites et photographiées avec le plus grand soin ; de légères différences de couleur
        peuvent exister selon les écrans. Les prix sont indiqués en euros, toutes taxes comprises. {LEGAL.vat}.
        Les frais de port ne sont pas inclus : ils sont communiqués au client avant tout paiement.
      </p>

      <h2>3. Commande</h2>
      <ul>
        <li>Le client choisit ses œuvres, remplit le formulaire de commande et accepte les présentes conditions.</li>
        <li>
          Sous 48 heures, le vendeur confirme par e-mail la disponibilité des œuvres, le total frais de port compris
          et les modalités de paiement.
        </li>
        <li>La vente est conclue à la réception du paiement. Une commande non réglée sous 7 jours est annulée.</li>
      </ul>

      <h2>4. Paiement</h2>
      <p>
        Le paiement s'effectue par virement bancaire ou par PayPal, selon les coordonnées envoyées dans l'e-mail de
        confirmation. Aucune donnée bancaire n'est collectée sur le site.
      </p>

      <h2>5. Livraison</h2>
      <p>
        Les œuvres sont livrées uniquement en France (métropole et Corse), à l'adresse indiquée par le client. Elles
        sont expédiées sous 7 jours ouvrés après réception du paiement, soigneusement emballées, avec un numéro de
        suivi. Le délai de livraison est précisé dans l'e-mail de confirmation et ne peut excéder 30 jours.
      </p>
      <p>
        En cas de colis endommagé, le client doit l'indiquer au transporteur à la réception et prévenir le vendeur
        sous 48 heures, photos à l'appui, afin de trouver une solution (remplacement ou remboursement).
      </p>

      <h2>6. Droit de rétractation</h2>
      <p>
        Le client dispose de 14 jours à compter de la réception de sa commande pour se rétracter, sans avoir à se
        justifier (article L221-18 du Code de la consommation). Il suffit de l'indiquer par e-mail à{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, puis de renvoyer l'œuvre dans son état d'origine,
        dans les 14 jours suivants. Les frais de retour sont à la charge du client.
      </p>
      <p>
        Le vendeur rembourse la totalité des sommes versées, frais de livraison initiaux compris, dans les 14 jours
        suivant la rétractation ; il peut attendre de récupérer l'œuvre avant de rembourser.
      </p>
      <p>
        Conformément à l'article L221-28 du Code de la consommation, ce droit ne s'applique pas aux œuvres réalisées
        sur mesure, selon les demandes du client (commissions, portraits, illustrations personnalisées).
      </p>

      <h2>7. Garanties</h2>
      <p>
        Le client bénéficie de la garantie légale de conformité (articles L217-3 et suivants du Code de la
        consommation) et de la garantie des vices cachés (articles 1641 et suivants du Code civil). Pour la mettre en
        œuvre, il suffit d'écrire à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>8. Commissions et œuvres sur mesure</h2>
      <p>
        Les commandes sur mesure font l'objet d'un devis accepté par le client. Un acompte de 50 % est demandé au
        démarrage, le solde à la livraison. Les droits d'utilisation de l'œuvre (usage personnel, commercial,
        durée, supports) sont précisés dans le devis.
      </p>

      <h2>9. Propriété intellectuelle</h2>
      <p>
        L'achat d'une œuvre transfère la propriété de l'objet, mais pas les droits d'auteur. Sauf accord écrit, le
        client ne peut pas reproduire, diffuser ou exploiter commercialement l'œuvre. {LEGAL.name} conserve le droit
        de la présenter dans son portfolio.
      </p>

      <h2>10. Litiges et médiation</h2>
      <p>
        En cas de difficulté, le client est invité à écrire d'abord à{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> pour trouver une solution amiable. À défaut, il peut
        recourir gratuitement au médiateur de la consommation :{' '}
        <ToFill value={LEGAL.mediator} label="nom et site du médiateur" />
        {LEGAL.mediatorUrl && (
          <>
            {' '}(<a href={LEGAL.mediatorUrl}>{LEGAL.mediatorUrl.replace('https://', '')}</a>)
          </>
        )}
        .
      </p>
      <p>Les présentes conditions sont soumises au droit français.</p>

      <p className="mt-12">
        Voir aussi les <Link to="/mentions-legales">mentions légales</Link>.
      </p>
    </LegalLayout>
  );
}
