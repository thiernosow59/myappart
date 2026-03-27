export default function Confidentialite() {
  return (
    <div className="min-h-screen pt-16 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Politique de confidentialité</h1>
        <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : mars 2025</p>

        <div className="space-y-10 text-slate-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles collectées via MyAppart est <strong className="text-slate-900">TS Group</strong>, société basée à Conakry, Guinée, joignable à l'adresse{' '}
              <a href="mailto:contact@ts-group.fr" className="text-blue-600 hover:underline">contact@ts-group.fr</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">2. Données collectées</h2>
            <p>Lors de votre utilisation de la plateforme, nous collectons les données suivantes :</p>
            <div className="mt-4 space-y-3">
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <p className="font-medium text-slate-900 mb-1">Données d'inscription</p>
                <p className="text-slate-500">Nom, prénom, adresse e-mail, numéro de téléphone, mot de passe (chiffré), rôle (utilisateur, propriétaire ou agence).</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <p className="font-medium text-slate-900 mb-1">Données d'annonce</p>
                <p className="text-slate-500">Titre, description, type de bien, superficie, prix, localisation (commune/quartier), photos du bien.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <p className="font-medium text-slate-900 mb-1">Données de messagerie</p>
                <p className="text-slate-500">Contenu des messages échangés entre utilisateurs via la plateforme.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <p className="font-medium text-slate-900 mb-1">Données de navigation</p>
                <p className="text-slate-500">Annonces consultées, favoris enregistrés (stockés localement dans votre navigateur).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">3. Finalités du traitement</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li>Création et gestion de votre compte utilisateur</li>
              <li>Publication et gestion de vos annonces immobilières</li>
              <li>Mise en relation entre acheteurs/locataires et propriétaires/agences</li>
              <li>Fonctionnement de la messagerie entre utilisateurs</li>
              <li>Amélioration de la plateforme et de ses fonctionnalités</li>
              <li>Envoi de notifications relatives à votre compte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">4. Base légale</h2>
            <p>
              Le traitement de vos données est fondé sur votre <strong className="text-slate-900">consentement</strong>, recueilli lors de votre inscription à la plateforme. Vous pouvez retirer ce consentement à tout moment en supprimant votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">5. Durée de conservation</h2>
            <p>
              Vos données sont conservées pendant toute la durée de votre compte actif sur la plateforme. À la suppression de votre compte, vos données personnelles sont supprimées dans un délai de <strong className="text-slate-900">30 jours</strong>, à l'exception des données nécessaires au respect de nos obligations légales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">6. Vos droits</h2>
            <p>Conformément à la législation applicable, vous disposez des droits suivants sur vos données :</p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li><strong className="text-slate-900">Droit d'accès :</strong> obtenir une copie des données vous concernant</li>
              <li><strong className="text-slate-900">Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
              <li><strong className="text-slate-900">Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong className="text-slate-900">Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong className="text-slate-900">Droit d'opposition :</strong> vous opposer à certains traitements</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à :{' '}
              <a href="mailto:contact@ts-group.fr" className="text-blue-600 hover:underline">contact@ts-group.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">7. Cookies</h2>
            <p>
              MyAppart utilise uniquement des <strong className="text-slate-900">cookies techniques</strong> nécessaires au bon fonctionnement de la plateforme (session utilisateur). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">8. Hébergement et sécurité</h2>
            <p>Vos données sont hébergées sur des infrastructures sécurisées :</p>
            <ul className="mt-3 space-y-1 pl-4">
              <li><strong className="text-slate-900">Authentification :</strong> Supabase (infrastructure en Union Européenne), chiffrement des données au repos et en transit</li>
              <li><strong className="text-slate-900">Photos et fichiers :</strong> Cloudflare R2 (Europe de l'Ouest), accès sécurisé HTTPS</li>
              <li><strong className="text-slate-900">Frontend :</strong> Netlify, Inc. (CDN mondial, HTTPS obligatoire)</li>
            </ul>
            <p className="mt-3">
              Les mots de passe sont systématiquement chiffrés (hachage bcrypt via Supabase Auth). Nous ne stockons jamais vos mots de passe en clair.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">9. Modifications</h2>
            <p>
              Cette politique de confidentialité peut être mise à jour à tout moment. La date de dernière modification est indiquée en haut de cette page. En continuant à utiliser la plateforme après une modification, vous acceptez la nouvelle version de la politique.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">10. Contact</h2>
            <p>
              Pour toute question relative à cette politique ou à vos données personnelles :{' '}
              <a href="mailto:contact@ts-group.fr" className="text-blue-600 hover:underline">contact@ts-group.fr</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
