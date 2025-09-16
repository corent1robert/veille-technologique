'use client'

import { useState } from 'react'
import { Info, X } from 'lucide-react'

interface TRLInfoProps {
  trl: number
  explication?: string
  projection?: string
  className?: string
}

const TRL_LEVELS = [
  { level: 1, title: "Observations de base", description: "Les principes scientifiques de base sont observés et rapportés" },
  { level: 2, title: "Concept technologique formulé", description: "L'application pratique est conceptualisée" },
  { level: 3, title: "Validation de preuve de concept", description: "Preuve analytique et expérimentale de la validité du concept" },
  { level: 4, title: "Prototype à échelle réduite et modélisation", description: "Validation en laboratoire des composants" },
  { level: 5, title: "Validation de prototype à échelle réduite", description: "Validation en environnement pertinent" },
  { level: 6, title: "Démonstration de prototype à échelle réelle", description: "Démonstration en environnement opérationnel" },
  { level: 7, title: "Prototype à échelle réelle en conditions commerciales", description: "Démonstration en environnement opérationnel réel" },
  { level: 8, title: "Certification du produit commercial final", description: "Système complet et qualifié" },
  { level: 9, title: "Produit commercial final financé par les banques", description: "Système réel prouvé par succès opérationnel" }
]

export function TRLInfo({ trl, explication, projection, className = "" }: TRLInfoProps) {
  const [showPopup, setShowPopup] = useState(false)
  
  const trlData = TRL_LEVELS.find(t => t.level === trl)
  const getTRLColor = (trl: number) => {
    if (trl <= 3) return 'bg-blue-100 text-blue-600 border-blue-200'
    if (trl <= 6) return 'bg-yellow-100 text-yellow-600 border-yellow-200'
    return 'bg-green-100 text-green-600 border-green-200'
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTRLColor(trl)}`}>
          TRL {trl}/9
        </span>
        <button
          onClick={() => setShowPopup(true)}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
          title="Explication des niveaux TRL"
        >
          <Info className="w-3 h-3" />
        </button>
      </div>

      {/* Pop-up explicatif TRL */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowPopup(false)}
          />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">
                  Niveaux de Maturité Technologique (TRL)
                </h2>
                <button
                  onClick={() => setShowPopup(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-neutral-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Niveau actuel mis en évidence */}
              {trlData && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Niveau actuel: TRL {trl} - {trlData.title}
                  </h3>
                  <p className="text-blue-800 mb-3">{trlData.description}</p>
                  {explication && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <h4 className="font-medium text-blue-900 mb-1">Explication spécifique :</h4>
                      <p className="text-blue-700 text-sm">{explication}</p>
                    </div>
                  )}
                  {projection && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <h4 className="font-medium text-blue-900 mb-1">Projection :</h4>
                      <p className="text-blue-700 text-sm">{projection}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tous les niveaux TRL */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Tous les niveaux TRL
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TRL_LEVELS.map((level) => (
                    <div
                      key={level.level}
                      className={`p-4 rounded-lg border-2 ${
                        level.level === trl
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-neutral-200 bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          level.level <= 3 ? 'bg-red-100 text-red-600' :
                          level.level <= 6 ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          TRL {level.level}
                        </span>
                        {level.level === trl && (
                          <span className="text-xs font-medium text-blue-600">← Actuel</span>
                        )}
                      </div>
                      <h4 className="font-medium text-neutral-900 text-sm mb-1">
                        {level.title}
                      </h4>
                      <p className="text-xs text-neutral-600">
                        {level.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Légende des couleurs */}
              <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-3">Légende des couleurs :</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                    <span>TRL 1-3 : Recherche fondamentale</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                    <span>TRL 4-6 : Développement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                    <span>TRL 7-9 : Commercialisation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

