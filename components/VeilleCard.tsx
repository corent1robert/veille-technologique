'use client'

import { Calendar, User, Building2, TrendingUp, Target, Star, Eye } from 'lucide-react'
import { VeilleData } from '@/types/veille'

interface VeilleCardProps {
  data: VeilleData
  onViewMore: (data: VeilleData) => void
}

export function VeilleCard({ data, onViewMore }: VeilleCardProps) {
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
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Header de la carte */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 mb-2">
              {data.article?.titre || 'Titre non disponible'}
            </h3>
            {/* Domaine de la source */}
            {data.article?.source && (
              <div className="flex items-center text-xs text-neutral-500 mb-2">
                <Building2 className="w-3 h-3 mr-1" />
                <span className="truncate">{data.article.source}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-2 ml-3">
            {/* Scores d'évaluation */}
            {data.evaluation?.pertinence && (
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                <span className="text-xs font-bold text-yellow-700">{data.evaluation.pertinence}</span>
              </div>
            )}
            {data.evaluation?.fiabilite && (
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <span className="text-xs font-bold text-blue-700">{data.evaluation.fiabilite}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description courte */}
        <p className="text-neutral-600 text-sm line-clamp-3 mb-3">
          {data.article?.description_courte || 'Description non disponible'}
        </p>

        {/* Indicateurs TRL et Priorité */}
        <div className="flex items-center justify-between">
          {data.innovation?.numero_TRL && data.innovation.numero_TRL > 0 ? (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTRLColor(data.innovation.numero_TRL)}`}>
              TRL {data.innovation.numero_TRL}/9
            </span>
          ) : null}
          {data.metadata?.priorite_veille && data.metadata.priorite_veille > 0 ? (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(data.metadata.priorite_veille)}`}>
              Priorité {data.metadata.priorite_veille}/5
            </span>
          ) : null}
        </div>
      </div>

              {/* Métadonnées optimisées */}
        <div className="p-6 space-y-4 flex flex-col h-full">
          {/* Contenu principal qui peut varier en hauteur */}
          <div className="flex-1 space-y-4">
            {/* Catégorie et Date */}
            <div className="flex items-center justify-between text-sm">
              {data.article?.categorie && data.article.categorie.length > 0 && (
                <div className="flex items-center max-w-full">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium truncate max-w-[100px]" title={data.article.categorie[0]}>
                    {data.article.categorie[0]}
                  </span>
                  {data.article.categorie.length > 1 && (
                    <span className="ml-1 text-xs text-neutral-500">
                      +{data.article.categorie.length - 1}
                    </span>
                  )}
                </div>
              )}
              {data.article?.date_publication && (
                <div className="flex items-center text-neutral-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="text-xs">{new Date(data.article.date_publication).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </div>

            {/* Mots-clés essentiels */}
            {data.article?.mots_cles && Array.isArray(data.article.mots_cles) && data.article.mots_cles.length > 0 && (
              <div className="flex flex-wrap gap-1 max-w-full">
                {data.article.mots_cles.slice(0, 3).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full truncate max-w-[120px]"
                    title={keyword}
                  >
                    {keyword}
                  </span>
                ))}
                {data.article.mots_cles.length > 3 && (
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                    +{data.article.mots_cles.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bouton Voir plus - Toujours en bas */}
          <div className="pt-3 border-t border-neutral-100 mt-auto">
            <button
              onClick={() => onViewMore(data)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors duration-200"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Voir plus de détails</span>
            </button>
          </div>
        </div>
    </div>
  )
}
