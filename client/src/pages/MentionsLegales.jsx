export default function MentionsLegales() {
  return (
    <div className="min-h-screen pt-16 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mentions légales</h1>
        <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : mars 2025</p>

        <div className="space-y-10 text-slate-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">1. Éditeur du site</h2>
            <p>Le site <strong className="text-slate-900">MyAppart</strong> (accessible à l'adresse <span className="text-blue-600">appart.ts-group.fr</span>) est édité par :</p>
            <ul className="mt-3 space-y-1 pl-4">
              <li><strong className="text-slate-900">Société :</strong> TS Group</li>
              <li><strong className="text-slate-900">Siège social :</strong> Conakry, République de Guinée</li>
              <li><strong className="text-slate-900">Année de création :</strong> 2024</li>
              <li><strong className="text-slate-900">Activité :</strong> Transformation digitale, développement d'applications modernes, audit IT, gestion d'infrastructure IT et modélisation IA</li>
              <li><strong className="text-slate-900">Contact :</strong>{' '}
                <a href="mailto:contact@ts-group.fr" className="text-blue-600 hover:underline">contact@ts-group.fr</a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">2. Directeur de la publication</h2>
            <p>Le directeur de la publication est le représentant légal de <strong className="text-slate-900">TS Group</strong>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">3. Hébergement</h2>
            <p>Le site est hébergé par :</p>
            <ul className="mt-3 space-y-1 pl-4">
              <li><strong className="text-slate-900">Hébergeur frontend :</strong> Netlify, Inc. — 44 Montgomery Street, Suite 300, San Francisco, CA 94104, États-Unis</li>
              <li><strong className="text-slate-900">Base de données :</strong> Supabase, Inc. — infrastructure hébergée en Union Européenne</li>
              <li><strong className="text-slate-900">Stockage fichiers :</strong> Cloudflare R2 — infrastructure hébergée en Europe de l'Ouest</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">4. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur MyAppart — textes, images, logos, icônes, code source — sont la propriété exclusive de <strong className="text-slate-900">TS Group</strong> ou de leurs auteurs respectifs, et sont protégés par les lois applicables en matière de propriété intellectuelle.
            </p>
            <p className="mt-2">
              Toute reproduction, distribution, modification ou utilisation de ces contenus sans autorisation préalable et écrite de TS Group est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">5. Responsabilité</h2>
            <p>
              TS Group s'efforce de maintenir les informations publiées sur MyAppart à jour et exactes, mais ne saurait être tenu responsable des erreurs ou omissions, ni des dommages directs ou indirects résultant de l'utilisation du site.
            </p>
            <p className="mt-2">
              Les annonces immobilières publiées sur la plateforme sont de la responsabilité exclusive de leurs auteurs. TS Group n'est pas responsable des informations communiquées par les propriétaires ou agences inscrits.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">6. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont régies par le droit guinéen. Tout litige relatif à l'utilisation du site sera soumis à la compétence exclusive des juridictions de Conakry, Guinée.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">7. Contact</h2>
            <p>
              Pour toute question relative aux présentes mentions légales :{' '}
              <a href="mailto:contact@ts-group.fr" className="text-blue-600 hover:underline">contact@ts-group.fr</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
