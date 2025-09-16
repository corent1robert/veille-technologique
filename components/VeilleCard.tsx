'use client'

import { Calendar, User, Building2, TrendingUp, Target, Star, Eye, ExternalLink, FileText, Video, BookOpen, FileSearch, Newspaper, Briefcase } from 'lucide-react'
import { VeilleData } from '@/types/veille'
import { TRLInfo } from './TRLInfo'

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

  const getContentTypeIcon = (typologie: string) => {
    const type = typologie?.toLowerCase() || ''
    if (type.includes('article') || type.includes('news')) return <Newspaper className="w-4 h-4" />
    if (type.includes('video') || type.includes('vidéo')) return <Video className="w-4 h-4" />
    if (type.includes('étude') || type.includes('etude') || type.includes('study')) return <BookOpen className="w-4 h-4" />
    if (type.includes('brevet') || type.includes('patent')) return <FileSearch className="w-4 h-4" />
    if (type.includes('rapport') || type.includes('report')) return <FileText className="w-4 h-4" />
    if (type.includes('entreprise') || type.includes('company')) return <Briefcase className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full max-w-full overflow-hidden">
      {/* Header de la carte */}
      <div className="p-5 border-b border-neutral-100">
        {/* Image en haut avec coins très arrondis */}
        <div className="mb-3">
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
            {data.article?.image_url ? (
              <img
                src={data.article.image_url}
                alt={data.article?.titre || 'Illustration article'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                Aucune image
              </div>
            )}
          </div>
        </div>
        {/* Contenu supérieur à hauteur fixe pour aligner toutes les cartes */}
        <div className="min-h-[220px] max-h-[220px] flex flex-col">
        {/* Ligne info clé: TRL à gauche, Priorité à droite */}
        <div className="flex items-center justify-between mb-2">
          <div>
            {data.innovation?.numero_TRL && data.innovation.numero_TRL > 0 ? (
              <TRLInfo 
                trl={data.innovation.numero_TRL}
                explication={data.innovation.explication_TRL}
                projection={data.innovation.projection_TRL}
              />
            ) : null}
          </div>
          <div>
            {data.metadata?.priorite_veille && data.metadata.priorite_veille > 0 ? (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(data.metadata.priorite_veille)}`}>
                Priorité {data.metadata.priorite_veille}/5
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2 break-words">
              {data.article?.titre || 'Titre non disponible'}
            </h3>
            {/* Domaine de la source */}
            {data.article?.source && (
              <div className="flex items-center text-xs text-neutral-500 mb-2">
                <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate block max-w-full" title={data.article.source}>
                  {data.article.source}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-2 ml-3 flex-shrink-0">
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

        {/* Description courte (scrollable seulement) */}
        <div className="mb-3 max-h-36 overflow-auto">
          <p className="text-neutral-600 text-sm break-words leading-relaxed">
            {data.article?.description_courte || 'Description non disponible'}
          </p>
        </div>

        {/* Indicateur de priorité déplacé au-dessus du titre */}
        </div>
      </div>

              {/* Métadonnées optimisées */}
        <div className="p-5 space-y-4 flex flex-col h-full">
          {/* Contenu principal à hauteur fixe pour aligner le séparateur (abaissé) */}
          <div className="flex-1 overflow-auto min-h-[80px] max-h-[80px] space-y-1">
            {/* Bloc métadonnées normalisé: 3 lignes fixes + mots-clés tronqués */}
            <div className="space-y-1">
              {/* Ligne 1: Catégories (une pastille, reste en +N) */}
              <div className="h-5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {data.article?.categorie && data.article.categorie.length > 0 ? (
                    <>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium truncate max-w-[140px]" title={data.article.categorie[0]}>
                        {data.article.categorie[0]}
                      </span>
                      {data.article.categorie.length > 1 && (
                        <span className="text-neutral-500">+{data.article.categorie.length - 1}</span>
                      )}
                    </>
                  ) : (
                    <span className="opacity-0">placeholder</span>
                  )}
                </div>
                <div className="flex items-center text-neutral-500 pl-2">
                  {data.article?.date_publication ? (
                    <>
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(data.article.date_publication).toLocaleDateString('fr-FR')}</span>
                    </>
                  ) : (
                    <span className="opacity-0">00/00/0000</span>
                  )}
                </div>
              </div>

              {/* Ligne 2: Typologie de contenu avec icône */}
              <div className="h-5 flex items-center text-xs">
                {data.article?.typologie_contenu ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full" title={data.article.typologie_contenu}>
                    {getContentTypeIcon(data.article.typologie_contenu)}
                    <span className="truncate max-w-[180px]">{data.article.typologie_contenu}</span>
                  </div>
                ) : (
                  <span className="opacity-0">placeholder</span>
                )}
              </div>

              {/* Mots-clés supprimés de la carte pour alléger l'UI. Présents dans la modal. */}
            </div>
          </div>

          {/* Boutons d'action - Toujours en bas */}
          <div className="pt-2 border-t border-neutral-100 mt-auto space-y-1.5">
            <button
              onClick={() => onViewMore(data)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors duration-200"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Voir plus de détails</span>
            </button>
            {data.article?.url && (
              <a
                href={data.article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">Article</span>
              </a>
            )}
          </div>
        </div>
    </div>
  )
}
