'use client'

import { X, Calendar, User, Building2, Target, Star, TrendingUp, FileText, Lightbulb, Settings } from 'lucide-react'
import { VeilleData } from '@/types/veille'

interface VeilleModalProps {
  data: VeilleData | null
  isOpen: boolean
  onClose: () => void
}

export function VeilleModal({ data, isOpen, onClose }: VeilleModalProps) {
  if (!isOpen || !data) return null

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-neutral-100 text-neutral-600'
      case 2: return 'bg-blue-100 text-blue-600'
      case 3: return 'bg-yellow-100 text-yellow-600'
      case 4: return 'bg-orange-100 text-orange-600'
      case 5: return 'bg-red-100 text-red-600'
      default: return 'bg-neutral-100 text-neutral-600'
    }
  }

  const getTRLColor = (trl: number) => {
    if (trl <= 3) return 'bg-blue-100 text-blue-600'
    if (trl <= 6) return 'bg-yellow-100 text-yellow-600'
    return 'bg-green-100 text-green-600'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay - cliquable pour fermer */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                {data.article?.titre || 'Titre non disponible'}
              </h2>
              
              {/* Lien vers l'article original */}
              {data.article?.url && (
                <div className="mb-3">
                  <a 
                    href={data.article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Consulter l'article original
                  </a>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                {data.metadata?.priorite_veille && data.metadata.priorite_veille > 0 && (
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(data.metadata.priorite_veille)}`}>
                    Priorité {data.metadata.priorite_veille}/5
                  </span>
                )}
                {data.innovation?.numero_TRL && data.innovation.numero_TRL > 0 && (
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTRLColor(data.innovation.numero_TRL)}`}>
                    TRL {data.innovation.numero_TRL}/9
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Section Article */}
          <div className="bg-neutral-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Informations Article
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Description Courte</h4>
                <p className="text-neutral-600">{data.article?.description_courte || 'Non disponible'}</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Description Longue</h4>
                <p className="text-neutral-600">{data.article?.description_longue || 'Non disponible'}</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Source</h4>
                <div className="flex items-center text-neutral-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  {data.article?.source || 'Non disponible'}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Date de Publication</h4>
                <div className="flex items-center text-neutral-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {data.article?.date_publication ? new Date(data.article.date_publication).toLocaleDateString('fr-FR') : 'Non disponible'}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Auteur</h4>
                <div className="flex items-center text-neutral-600">
                  <User className="w-4 h-4 mr-2" />
                  {data.article?.auteur || 'Non disponible'}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Pays Source</h4>
                <p className="text-neutral-600">{data.article?.pays_source || 'Non disponible'}</p>
              </div>
            </div>

            {/* Mots-clés et Catégories */}
            <div className="mt-6 space-y-4">
              {data.article?.mots_cles && data.article.mots_cles.length > 0 && (
                <div>
                  <h4 className="font-medium text-neutral-700 mb-2">Mots-clés</h4>
                  <div className="flex flex-wrap gap-2 max-w-full">
                    {data.article.mots_cles.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-neutral-100 text-neutral-600 text-sm rounded-full truncate max-w-[150px]" title={keyword}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data.article?.categorie && data.article.categorie.length > 0 && (
                <div>
                  <h4 className="font-medium text-neutral-700 mb-2">Catégories</h4>
                  <div className="flex flex-wrap gap-2 max-w-full">
                    {data.article.categorie.map((cat, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full truncate max-w-[120px]" title={cat}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Évaluation - Maintenant avec vraies données */}
          <div className="bg-neutral-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Évaluation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Pertinence</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-semibold">
                    {data.evaluation?.pertinence ? `${data.evaluation.pertinence}/4` : 'Non évalué'}
                  </span>
                </div>
                <p className="text-sm text-neutral-600">{data.evaluation?.pertinence_explication || 'Aucune explication disponible'}</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Fiabilité</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="text-lg font-semibold">
                    {data.evaluation?.fiabilite ? `${data.evaluation.fiabilite}/4` : 'Non évalué'}
                  </span>
                </div>
                <p className="text-sm text-neutral-600">{data.evaluation?.fiabilite_explication || 'Aucune explication disponible'}</p>
              </div>
            </div>
          </div>

          {/* Section Innovation & TRL - Maintenant avec vraies données */}
          <div className="bg-neutral-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Innovation & TRL
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Niveau TRL Actuel</h4>
                <div className="flex items-center space-x-2 mb-2">
                  {data.innovation?.numero_TRL && data.innovation.numero_TRL > 0 ? (
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTRLColor(data.innovation.numero_TRL)}`}>
                      TRL {data.innovation.numero_TRL}/9
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-neutral-100 text-neutral-500">
                      TRL non précisé
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-600">{data.innovation?.estimation_TRL || 'Non précisé'}</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Projection TRL</h4>
                <p className="text-neutral-600">{data.innovation?.projection_TRL || 'Non précisée'}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium text-neutral-700 mb-2">Explication TRL</h4>
                <p className="text-neutral-600">{data.innovation?.explication_TRL || 'Aucune explication disponible'}</p>
              </div>
              {data.innovation?.application_secteur && data.innovation.application_secteur.length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="font-medium text-neutral-700 mb-2">Secteurs d'Application</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.innovation.application_secteur.map((secteur, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">
                        {secteur}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Entreprises Citées - Maintenant avec vraies données */}
          {data.article?.entreprises_citees && data.article.entreprises_citees.length > 0 && (
            <div className="bg-neutral-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Entreprises Citées
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.article.entreprises_citees.map((entreprise, index) => (
                  <div key={index} className="px-3 py-2 bg-white rounded-lg border border-neutral-200">
                    <span className="text-sm text-neutral-700">{entreprise}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
