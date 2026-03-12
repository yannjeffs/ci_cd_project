import { useState } from 'react'

export default function UserGuide() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition text-sm font-medium"
                title="Guide d'utilisation"
            >
                <span>❓</span>
                <span className="hidden md:inline">Aide</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-800">📖 Comment utiliser la plateforme ?</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Étape 1 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-lg">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg mb-2">Compléter votre profil</h3>
                                    <p className="text-gray-600 mb-2">
                                        Lors de votre première connexion, vous serez redirigé vers le formulaire de profil.
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                                        <li>Remplissez vos informations personnelles.</li>
                                        <li>Choisissez votre <strong>Concours</strong>, Filière et Centre d'examen.</li>
                                        <li>Validez pour créer votre dossier.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Étape 2 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg mb-2">Téléverser vos documents</h3>
                                    <p className="text-gray-600 mb-2">
                                        Allez dans le menu <strong>"Mes Documents"</strong>.
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                                        <li>Scannez vos pièces (Acte de naissance, Diplôme, CNI, Photo).</li>
                                        <li>Formats acceptés : PDF, JPG, PNG.</li>
                                        <li>Attendez que l'administration valide vos documents.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Étape 3 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg mb-2">Effectuer le paiement</h3>
                                    <p className="text-gray-600 mb-2">
                                        Une fois vos documents validés, allez dans <strong>"Mes Paiements"</strong>.
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                                        <li>Payez les frais de concours (OM/MOMO).</li>
                                        <li>Entrez la référence de la transaction.</li>
                                        <li>Votre inscription sera finalisée après validation du paiement.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Étape 4 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
                                    4
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg mb-2">Télécharger votre fiche</h3>
                                    <p className="text-gray-600">
                                        Une fois tout validé, rendez-vous dans <strong>"Mon Enrôlement"</strong> pour télécharger votre fiche d'inscription avec QR Code.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t text-center rounded-b-xl">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                            >
                                J'ai compris, commencer !
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
