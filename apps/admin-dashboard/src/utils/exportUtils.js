import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Fonction pour convertir les clés techniques en labels lisibles
const getCategoryLabel = (key) => {
  const categoryLabels = {
    // Catégories principales
    'acces_terminal': 'Accès et Terminal',
    'enregistrement_controles': 'Enregistrement & Contrôles',
    'zones_attente': 'Zones d\'Attente & Embarquement',
    'services_commodites': 'Services & Commodités',
    'hygiene_infrastructure': 'Hygiène & Infrastructure',
    'personnel_service': 'Personnel & Service Global',
    
    // Questions détaillées
    'acces_terminal_0': 'Facilité de se rendre à l\'aéroport',
    'acces_terminal_1': 'Options de transport terrestre',
    'acces_terminal_2': 'Signalisation pour accéder à l\'aérogate',
    'acces_terminal_3': 'Distance à parcourir à pied dans le terminal',
    'acces_terminal_4': 'Facilité à s\'orienter dans l\'aéroport',
    'acces_terminal_5': 'Ambiance générale de l\'aéroport',
    'enregistrement_controles_0': 'Facilité à trouver la zone d\'enregistrement',
    'enregistrement_controles_1': 'Temps d\'attente à l\'enregistrement',
    'enregistrement_controles_2': 'Courtoisie et serviabilité du personnel enregistrement',
    'enregistrement_controles_3': 'Facilité à passer le contrôle de sécurité',
    'enregistrement_controles_4': 'Rapidité/efficacité du contrôle de sécurité',
    'enregistrement_controles_5': 'Temps d\'attente au contrôle de sécurité',
    'enregistrement_controles_6': 'Courtoisie et serviabilité du personnel de sécurité',
    'enregistrement_controles_7': 'Temps d\'attente au contrôle des passeports',
    'enregistrement_controles_8': 'Courtoisie et serviabilité du personnel de contrôle des passeports',
    'zones_attente_0': 'Disponibilité des sièges dans les zones d\'embarquement',
    'zones_attente_1': 'Confort des salles d\'attente dans les zones d\'embarquement',
    'zones_attente_2': 'Disponibilité de l\'information sur les vols',
    'zones_attente_3': 'Facilité de correspondance',
    'services_commodites_0': 'Restaurants, Bars, Cafés',
    'services_commodites_1': 'Rapport qualité/prix Restaurants, Bars, Cafés',
    'services_commodites_2': 'Boutiques',
    'services_commodites_3': 'Rapport qualité/prix des boutiques',
    'services_commodites_4': 'Courtoisie et serviabilité du personnel des boutiques et restaurants',
    'services_commodites_5': 'Qualité du service WiFi',
    'hygiene_infrastructure_0': 'Propreté du terminal de l\'aéroport',
    'hygiene_infrastructure_1': 'Propreté des toilettes',
    'hygiene_infrastructure_2': 'Disponibilité des toilettes',
    'hygiene_infrastructure_3': 'Sécurité sanitaire',
    'personnel_service_0': 'Courtoisie et serviabilité du personnel de l\'aéroport',
    'personnel_service_1': 'Disponibilité de la borne de retouche'
  };
  
  return categoryLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

// Fonction pour récupérer toutes les enquêtes depuis l'API
export const fetchAllSurveys = async () => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Récupérer d'abord le nombre total d'enquêtes
    const initialResponse = await fetch(`${apiUrl}/api/surveys?page=1&limit=1`);
    const initialResult = await initialResponse.json();
    
    if (!initialResult.success) {
      throw new Error('Erreur lors de la récupération des données');
    }
    
    const totalItems = initialResult.data.pagination?.totalItems || 0;
    
    // Récupérer toutes les enquêtes en une seule fois
    const allResponse = await fetch(`${apiUrl}/api/surveys?page=1&limit=${totalItems}`);
    const allResult = await allResponse.json();
    
    if (!allResult.success) {
      throw new Error('Erreur lors de la récupération de toutes les données');
    }
    
    return allResult.data.surveys || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des enquêtes:', error);
    throw error;
  }
};

// Export Excel (.xlsx)
export const exportToExcel = async () => {
  try {
    const surveys = await fetchAllSurveys();
    
    // Préparer les données pour Excel
    const excelData = surveys.map(survey => {
      const row = {
        'ID': survey.id,
        'Session ID': survey.session_id,
        'Date de soumission': new Date(survey.submitted_at).toLocaleString('fr-FR'),
        'Langue': survey.language?.toUpperCase(),
        'Âge': survey.age_range || 'Non spécifié',
        'Nationalité': survey.nationality || 'Non spécifiée',
        'Objectif du voyage': survey.travel_purpose || 'Non spécifié',
        'Fréquence': survey.frequency || 'Non spécifiée'
      };
      
      // Ajouter les évaluations avec des labels lisibles
      if (survey.ratings) {
        Object.entries(survey.ratings).forEach(([key, value]) => {
          row[getCategoryLabel(key)] = `${value}/5`;
        });
      }
      
      // Ajouter les commentaires
      if (survey.comments) {
        Object.entries(survey.comments).forEach(([key, comment]) => {
          if (comment) {
            row[`Commentaire - ${getCategoryLabel(key)}`] = comment;
          }
        });
      }
      
      return row;
    });
    
    // Créer le workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Ajuster la largeur des colonnes
    const colWidths = [];
    Object.keys(excelData[0] || {}).forEach(key => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map(row => String(row[key] || '').length)
      );
      colWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Enquêtes de Satisfaction');
    
    // Télécharger le fichier
    const fileName = `enquetes_satisfaction_nador_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    return { success: false, error: error.message };
  }
};

// Export CSV
export const exportToCSV = async () => {
  try {
    const surveys = await fetchAllSurveys();
    
    // Préparer les données pour CSV
    const csvData = surveys.map(survey => {
      const row = {
        'ID': survey.id,
        'Session ID': survey.session_id,
        'Date de soumission': new Date(survey.submitted_at).toLocaleString('fr-FR'),
        'Langue': survey.language?.toUpperCase(),
        'Âge': survey.age_range || 'Non spécifié',
        'Nationalité': survey.nationality || 'Non spécifiée',
        'Objectif du voyage': survey.travel_purpose || 'Non spécifié',
        'Fréquence': survey.frequency || 'Non spécifiée'
      };
      
      // Ajouter les évaluations
      if (survey.ratings) {
        Object.entries(survey.ratings).forEach(([key, value]) => {
          row[getCategoryLabel(key)] = value;
        });
      }
      
      return row;
    });
    
    // Créer le workbook temporaire pour générer le CSV
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(csvData);
    XLSX.utils.book_append_sheet(wb, ws, 'Enquêtes');
    
    // Télécharger en CSV
    const fileName = `enquetes_satisfaction_nador_${new Date().toISOString().split('T')[0]}.csv`;
    XLSX.writeFile(wb, fileName, { bookType: 'csv' });
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    return { success: false, error: error.message };
  }
};

// Export PDF
export const exportToPDF = async (dashboardData) => {
  try {
    const surveys = await fetchAllSurveys();
    
    const pdf = new jsPDF();
    
    // Configuration du PDF
    pdf.setFontSize(20);
    pdf.text('Rapport de Satisfaction - Aéroport Nador Al Aroui', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 45);
    pdf.text(`Nombre total d'enquêtes: ${surveys.length}`, 20, 55);
    
    let yPosition = 75;
    
    // Statistiques générales
    if (dashboardData?.summary) {
      pdf.setFontSize(16);
      pdf.text('Statistiques Générales', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.text(`Total des enquêtes: ${dashboardData.summary.totalSurveys}`, 25, yPosition);
      yPosition += 10;
      
      // Moyennes par catégorie
      if (dashboardData.summary.averageRatings) {
        pdf.text('Moyennes par catégorie:', 25, yPosition);
        yPosition += 10;
        
        Object.entries(dashboardData.summary.averageRatings).forEach(([key, value]) => {
          if (value && !isNaN(value)) {
            pdf.text(`• ${getCategoryLabel(key)}: ${parseFloat(value).toFixed(2)}/5`, 30, yPosition);
            yPosition += 8;
          }
        });
      }
    }
    
    yPosition += 10;
    
    // Répartition par langue
    if (dashboardData?.distributions?.languages) {
      pdf.setFontSize(16);
      pdf.text('Répartition par Langue', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      dashboardData.distributions.languages.forEach(lang => {
        const percentage = ((lang.count / surveys.length) * 100).toFixed(1);
        pdf.text(`• ${lang.language.toUpperCase()}: ${lang.count} enquêtes (${percentage}%)`, 25, yPosition);
        yPosition += 8;
      });
    }
    
    yPosition += 20;
    
    // Liste simple des enquêtes récentes (sans autoTable pour éviter l'erreur)
    pdf.setFontSize(16);
    pdf.text('Dernières Enquêtes', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(10);
    pdf.text('ID        | Date       | Langue | Satisfaction', 20, yPosition);
    yPosition += 8;
    pdf.text('----------|------------|--------|-------------', 20, yPosition);
    yPosition += 10;
    
    const recentSurveys = surveys.slice(0, 8); // 8 dernières enquêtes pour tenir sur la page
    recentSurveys.forEach(survey => {
      const avgRating = survey.ratings ? 
        Object.values(survey.ratings).reduce((sum, val) => sum + parseFloat(val), 0) / Object.keys(survey.ratings).length 
        : 0;
      
      const line = `${survey.id.slice(0, 8).padEnd(10)} | ${new Date(survey.submitted_at).toLocaleDateString('fr-FR').padEnd(10)} | ${(survey.language?.toUpperCase() || 'N/A').padEnd(6)} | ${(avgRating.toFixed(1) + '/5').padEnd(6)}`;
      pdf.text(line, 20, yPosition);
      yPosition += 8;
      
      // Nouvelle page si nécessaire
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 30;
      }
    });
    
    // Télécharger le PDF
    const fileName = `rapport_satisfaction_nador_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    return { success: false, error: error.message };
  }
};
