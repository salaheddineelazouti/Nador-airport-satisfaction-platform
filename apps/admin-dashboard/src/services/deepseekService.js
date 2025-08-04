/**
 * Service d'integration avec l'API DeepSeek pour l'analyse et les recommandations
 * Documentation: https://api-docs.deepseek.com/
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY || 'API';
    this.baseUrl = DEEPSEEK_API_URL;
    
    if (!this.apiKey || this.apiKey === 'your-deepseek-api-key') {
      console.warn('DeepSeek API Key non configuree. Veuillez definir REACT_APP_DEEPSEEK_API_KEY dans .env.local');
    }
  }

  /**
   * Appel API generique vers DeepSeek
   * @param {Array} messages - Messages pour le chat completion
   * @param {Object} options - Options supplementaires
   */
  async callAPI(messages, options = {}) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2048,
          top_p: options.top_p || 1,
          frequency_penalty: options.frequency_penalty || 0,
          presence_penalty: options.presence_penalty || 0,
          ...options
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur API DeepSeek:', error);
      throw error;
    }
  }

  /**
   * Genere des recommandations basees sur les donnees de satisfaction
   * @param {Object} dashboardData - Donnees du dashboard
   * @param {Array} recentSurveys - Enquetes recentes
   */
  async generateRecommendations(dashboardData, recentSurveys = []) {
    const prompt = this.buildAnalysisPrompt(dashboardData, recentSurveys);
    
    const messages = [
      {
        role: 'system',
        content: `Tu es un expert en gestion aeroportuaire et satisfaction client pour l'Office National Des Aeroports (ONDA) du Maroc. 
        Tu analyses les donnees de satisfaction de l'aeroport Nador Al Aroui pour fournir des recommandations strategiques precises et actionnables.
        
        Reponds UNIQUEMENT en francais dans un format JSON structure avec les champs:
        - priorities: array des 3 priorites principales
        - recommendations: array de recommandations detaillees avec actions concretes
        - trends: analyse des tendances
        - alerts: array des alertes urgentes
        - score_global: note globale sur 10
        - next_actions: array des prochaines actions a 30 jours`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await this.callAPI(messages, {
        temperature: 0.3, // Plus conservateur pour les recommandations
        max_tokens: 3000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Reponse vide de DeepSeek');
      }

      // Tenter de parser le JSON
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          // Fallback si pas de JSON trouve
          return this.parseTextResponse(content);
        }
      } catch (parseError) {
        console.warn('Impossible de parser JSON, fallback:', parseError);
        return this.parseTextResponse(content);
      }
    } catch (error) {
      console.error('Erreur generation recommandations:', error);
      return this.getFallbackRecommendations(dashboardData);
    }
  }

  /**
   * Construit le prompt d'analyse pour DeepSeek
   */
  buildAnalysisPrompt(dashboardData, recentSurveys) {
    const stats = dashboardData?.summary || {};
    const averages = stats.averageRatings || {};
    const distributions = dashboardData?.distributions || {};

    return `
ANALYSE DE SATISFACTION - AEROPORT NADOR AL AROUI (ONDA)

=== DONNEES GENERALES ===
- Total enquetes: ${stats.totalSurveys || 0}
- Periode d'analyse: ${stats.period || 'Non specifiee'}

=== MOYENNES PAR CATEGORIE (sur 5) ===
- Acces Terminal: ${averages.avg_acces_terminal || 'N/A'}/5
- Enregistrement/Controles: ${averages.avg_enregistrement_controles || 'N/A'}/5  
- Zones d'Attente: ${averages.avg_zones_attente || 'N/A'}/5
- Services/Commodites: ${averages.avg_services_commodites || 'N/A'}/5
- Hygiene/Infrastructure: ${averages.avg_hygiene_infrastructure || 'N/A'}/5
- Personnel/Service: ${averages.avg_personnel_service || 'N/A'}/5

=== REPARTITION PAR LANGUES ===
${distributions.languages?.map(lang => 
  `- ${lang.language}: ${((lang.count / stats.totalSurveys) * 100).toFixed(1)}% (${lang.count} enquetes)`
).join('\n') || '- Donnees non disponibles'}

=== ENQUETES RECENTES ===
${recentSurveys.slice(0, 5).map((survey, idx) => {
  const avgRating = survey.ratings ? 
    Object.values(survey.ratings).reduce((sum, val) => sum + parseFloat(val), 0) / Object.keys(survey.ratings).length 
    : 0;
  return `${idx + 1}. ID: ${survey.id?.slice(0, 8)} | Date: ${new Date(survey.submitted_at).toLocaleDateString('fr-FR')} | Moyenne: ${avgRating.toFixed(1)}/5 | Langue: ${survey.language}`;
}).join('\n') || '- Aucune enquete recente'}

MISSION: Fournir une analyse complete avec recommandations strategiques pour ameliorer la satisfaction des passagers de l'aeroport Nador Al Aroui.

Format de reponse attendu (JSON):
{
  "priorities": ["Priorite 1", "Priorite 2", "Priorite 3"],
  "recommendations": [
    {
      "category": "Nom categorie",
      "issue": "Probleme identifie", 
      "action": "Action concrete",
      "timeline": "Delai",
      "impact": "Impact attendu"
    }
  ],
  "trends": "Analyse des tendances",
  "alerts": ["Alerte urgente si score < 3"],
  "score_global": 7.5,
  "next_actions": ["Action 1", "Action 2", "Action 3"]
}`;
  }

  /**
   * Parse une reponse texte en structure de donnees
   */
  parseTextResponse(content) {
    return {
      priorities: ['Analyse manuelle requise'],
      recommendations: [
        {
          category: 'General',
          issue: 'Reponse IA non formatee',
          action: 'Consulter le texte complet pour analyse',
          timeline: 'Immediat',
          impact: 'Variable'
        }
      ],
      trends: content.substring(0, 200) + '...',
      alerts: [],
      score_global: 5.0,
      next_actions: ['Verifier la reponse IA', 'Reformuler la demande'],
      raw_response: content
    };
  }

  /**
   * Recommandations de secours en cas d'erreur API
   */
  getFallbackRecommendations(dashboardData) {
    const averages = dashboardData?.summary?.averageRatings || {};
    const priorities = [];
    const alerts = [];
    const recommendations = [];

    // Identifier les categories les plus faibles
    Object.entries(averages).forEach(([key, value]) => {
      const rating = parseFloat(value);
      if (rating && rating < 3) {
        alerts.push(`Score critique pour ${this.getCategoryLabel(key)}: ${rating.toFixed(1)}/5`);
        priorities.push(`Ameliorer ${this.getCategoryLabel(key)}`);
      }
    });

    if (priorities.length === 0) {
      priorities.push('Maintenir la qualite de service', 'Optimiser les processus', 'Former le personnel');
    }

    return {
      priorities: priorities.slice(0, 3),
      recommendations: [
        {
          category: 'Fallback',
          issue: 'Service IA temporairement indisponible',
          action: 'Utiliser l\'analyse manuelle des donnees',
          timeline: 'Immediat',
          impact: 'Maintien du service'
        }
      ],
      trends: 'Analyse automatique en cours de restauration',
      alerts,
      score_global: Object.values(averages).length > 0 ? 
        Object.values(averages).reduce((sum, val) => sum + parseFloat(val || 0), 0) / Object.values(averages).length : 5.0,
      next_actions: ['Verifier la connectivite API', 'Relancer l\'analyse']
    };
  }

  /**
   * Convertit une cle de categorie en label lisible
   */
  getCategoryLabel(key) {
    const labels = {
      'avg_acces_terminal': 'Acces Terminal',
      'avg_enregistrement_controles': 'Enregistrement/Controles',
      'avg_zones_attente': 'Zones d\'Attente',
      'avg_services_commodites': 'Services/Commodites',
      'avg_hygiene_infrastructure': 'Hygiene/Infrastructure',
      'avg_personnel_service': 'Personnel/Service'
    };
    return labels[key] || key;
  }

  /**
   * Genere un resume executif pour le management
   */
  async generateExecutiveSummary(dashboardData) {
    const messages = [
      {
        role: 'system',
        content: `Tu es un consultant senior en management aeroportuaire. Genere un resume executif concis (200 mots max) 
        pour la direction ONDA sur la satisfaction passagers de l'aeroport Nador Al Aroui.
        Focus sur: KPIs cles, tendances, actions prioritaires.`
      },
      {
        role: 'user',
        content: `Donnees: ${JSON.stringify(dashboardData?.summary || {}, null, 2)}`
      }
    ];

    try {
      const response = await this.callAPI(messages, {
        temperature: 0.2,
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || 'Resume non disponible';
    } catch (error) {
      console.error('Erreur generation resume:', error);
      return 'Service de resume temporairement indisponible. Consulter les donnees detaillees.';
    }
  }
}

// Export singleton
export default new DeepSeekService();
