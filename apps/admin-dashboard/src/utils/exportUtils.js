import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ondaLogo from '../assets/images/logo-onda.png';

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
    
    // Configuration des couleurs
    const colors = {
      primary: [41, 128, 185],    // Bleu professionnel
      secondary: [52, 152, 219],  // Bleu clair
      accent: [231, 76, 60],      // Rouge accent
      success: [39, 174, 96],     // Vert
      text: [44, 62, 80],         // Gris foncé
      lightGray: [236, 240, 241], // Gris clair
      white: [255, 255, 255]
    };
    
    // En-tete avec design moderne
    pdf.setFillColor(...colors.primary);
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Ajouter le logo ONDA (ameliore)
    try {
      pdf.addImage(ondaLogo, 'PNG', 12, 6, 30, 30);
    } catch (error) {
      console.log('Logo non disponible:', error);
    }
    
    // Logo/Titre principal en blanc (ameliore)
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);  // Legerement plus petit pour equilibrer avec le logo
    pdf.setFont('helvetica', 'bold');
    pdf.text('RAPPORT DE SATISFACTION', 50, 18);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Aeroport Nador Al Aroui - ONDA', 50, 26);
    
    // Ligne decorative sous le titre
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.5);
    pdf.line(50, 30, 180, 30);
    
    // Bande coloree sous l'en-tete
    pdf.setFillColor(...colors.secondary);
    pdf.rect(0, 40, 210, 5, 'F');
    
    // Informations generales avec style ameliore
    let yPos = 55;
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    // Boite d'information avec fond colore et ombre (marges corrigees)
    const boxWidth = 170;
    const maxX = 210 - 20; // Largeur page - marge droite
    const actualBoxWidth = Math.min(boxWidth, maxX - 20); // S'assurer que ca rentre
    
    pdf.setFillColor(245, 245, 245);  // Gris tres clair
    pdf.roundedRect(21, yPos - 4, actualBoxWidth, 28, 4, 4, 'F');
    pdf.setFillColor(...colors.lightGray);
    pdf.roundedRect(20, yPos - 5, actualBoxWidth, 28, 4, 4, 'F');
    
    // Icone et titre
    pdf.setFillColor(...colors.primary);
    pdf.circle(30, yPos + 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('i', 29, yPos + 4);
    
    pdf.setTextColor(...colors.text);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('INFORMATIONS GENERALES', 38, yPos + 4);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Genere le: ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`, 25, yPos + 12);
    pdf.text(`Nombre total d'enquetes analysees: ${surveys.length}`, 25, yPos + 18);
    
    yPos += 35;
    
    // Section Statistiques Générales avec design moderne
    if (dashboardData?.summary) {
      // Titre de section avec barre colorée
      pdf.setFillColor(...colors.success);
      pdf.rect(20, yPos, 5, 20, 'F');
      
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('STATISTIQUES GENERALES', 30, yPos + 8);
      
      yPos += 25;
      
      // Total des enquêtes avec mise en valeur
      pdf.setFillColor(...colors.lightGray);
      pdf.roundedRect(20, yPos - 3, 80, 15, 2, 2, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Total des enquêtes:', 25, yPos + 5);
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(14);
      pdf.text(`${dashboardData.summary.totalSurveys}`, 75, yPos + 5);
      
      yPos += 25;
      
      // Moyennes par catégorie avec barres de progression
      if (dashboardData.summary.averageRatings) {
        pdf.setTextColor(...colors.text);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MOYENNES PAR CATEGORIE', 25, yPos);
        yPos += 15;
        
        const categoryEntries = Object.entries(dashboardData.summary.averageRatings);
        const validEntries = categoryEntries.filter(([key, value]) => value && !isNaN(value));
        
        validEntries.forEach(([key, value], index) => {
          const rating = parseFloat(value);
          const percentage = (rating / 5) * 100;
          
          // Nom de la categorie (limite pour eviter debordement)
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(...colors.text);
          const categoryName = getCategoryLabel(key);
          let displayName = categoryName;
          if (categoryName.length > 30) {
            displayName = categoryName.substring(0, 27) + '...';
          }
          pdf.text(displayName, 25, yPos + 5);
          
          // Barre de progression amelioree avec marges corrigees
          const barStartX = 100;
          const barWidth = 60; // Reduit pour rester dans les marges
          
          // Ombre de la barre
          pdf.setFillColor(200, 200, 200);
          pdf.roundedRect(barStartX + 1, yPos + 1, barWidth, 8, 3, 3, 'F');
          // Base de la barre
          pdf.setFillColor(235, 235, 235);
          pdf.roundedRect(barStartX, yPos, barWidth, 8, 3, 3, 'F');
          
          // Barre coloree selon le score
          const barColor = rating >= 4 ? colors.success : 
                          rating >= 3 ? [241, 196, 15] : 
                          colors.accent;
          pdf.setFillColor(...barColor);
          const filledWidth = (barWidth * percentage / 100);
          pdf.roundedRect(barStartX, yPos, filledWidth, 8, 3, 3, 'F');
          
          // Score numerique
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(...barColor);
          pdf.text(`${rating.toFixed(2)}/5`, 165, yPos + 6);
          
          yPos += 15;
        });
      }
    }
    
    yPos += 20;
    
    // Vérifier si on a assez de place pour la section langues
    const estimatedLangHeight = dashboardData?.distributions?.languages ? 
      (dashboardData.distributions.languages.length * 15) + 50 : 0;
    
    if (yPos + estimatedLangHeight > 250) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Section Repartition par Langue avec design moderne
    if (dashboardData?.distributions?.languages) {
      // Titre de section avec barre colorée
      pdf.setFillColor(...colors.accent);
      pdf.rect(20, yPos, 5, 20, 'F');
      
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REPARTITION PAR LANGUE', 30, yPos + 8);
      
      yPos += 25;
      
      // Création d'un mini graphique circulaire avec des barres
      const langColors = {
        'fr': colors.primary,
        'en': colors.success,
        'ar': colors.accent
      };
      
      dashboardData.distributions.languages.forEach((lang, index) => {
        const percentage = ((lang.count / surveys.length) * 100).toFixed(1);
        
        // Barres avec marges corrigees
        const maxBarWidth = 80; // Reduit de 120 a 80
        const barWidth = (percentage / 100) * maxBarWidth;
        const barStartX = 90;
        
        // Indicateur de couleur (petit carre)
        const langColor = langColors[lang.language.toLowerCase()] || [149, 165, 166];
        pdf.setFillColor(...langColor);
        pdf.roundedRect(25, yPos - 2, 8, 8, 1, 1, 'F');
        
        // Nom de la langue
        pdf.setTextColor(...colors.text);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        const langName = lang.language.toUpperCase() === 'FR' ? 'Francais' :
                        lang.language.toUpperCase() === 'EN' ? 'Anglais' :
                        lang.language.toUpperCase() === 'AR' ? 'Arabe' : lang.language.toUpperCase();
        pdf.text(langName, 40, yPos + 4);
        
        // Barre de progression de base (taille reduite)
        pdf.setFillColor(230, 230, 230);
        pdf.roundedRect(barStartX, yPos - 1, maxBarWidth, 6, 2, 2, 'F');
        
        // Barre de progression coloree
        pdf.setFillColor(...langColor);
        pdf.roundedRect(barStartX, yPos - 1, barWidth, 6, 2, 2, 'F');
        
        // Pourcentage et nombre
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...langColor);
        pdf.text(`${percentage}%`, 95 + barWidth, yPos + 3);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...colors.text);
        pdf.text(`(${lang.count} enquetes)`, 95 + barWidth + 20, yPos + 3);
        
        yPos += 15;
      });
    }
    
    yPos += 25;
    
    // Verifier si on a besoin d'une nouvelle page pour les enquetes
    if (yPos > 200) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Section Dernieres Enquetes avec design moderne
    pdf.setFillColor(...colors.secondary);
    pdf.rect(20, yPos, 5, 20, 'F');
    
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DERNIERES ENQUETES', 30, yPos + 8);
    
    yPos += 30;
    
    // En-tete du tableau avec style ameliore et marges corrigees
    const headerHeight = 14;
    const tableWidth = 160; // Reduit de 170 a 160
    // Ombre de l'en-tete
    pdf.setFillColor(30, 90, 150);
    pdf.roundedRect(21, yPos - 4, tableWidth, headerHeight, 3, 3, 'F');
    // En-tete principal
    pdf.setFillColor(...colors.primary);
    pdf.roundedRect(20, yPos - 5, tableWidth, headerHeight, 3, 3, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9); // Taille reduite
    pdf.text('ID ENQUETE', 25, yPos + 3);
    pdf.text('DATE', 65, yPos + 3);
    pdf.text('LANGUE', 100, yPos + 3);
    pdf.text('SATISFACTION', 130, yPos + 3);
    
    yPos += headerHeight + 5;
    
    const recentSurveys = surveys.slice(0, 6); // 6 dernieres enquetes pour un meilleur rendu
    recentSurveys.forEach((survey, index) => {
      const avgRating = survey.ratings ? 
        Object.values(survey.ratings).reduce((sum, val) => sum + parseFloat(val), 0) / Object.keys(survey.ratings).length 
        : 0;
      
      // Alternance de couleurs pour les lignes (largeur corrigee)
      if (index % 2 === 0) {
        pdf.setFillColor(248, 249, 250);
        pdf.roundedRect(20, yPos - 3, 160, 10, 1, 1, 'F'); // 160 au lieu de 170
      }
      
      // Contenu de la ligne
      pdf.setTextColor(...colors.text);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8); // Taille reduite
      
      // ID (raccourci)
      pdf.text(survey.id.slice(0, 6) + '...', 25, yPos + 2);
      
      // Date
      pdf.text(new Date(survey.submitted_at).toLocaleDateString('fr-FR'), 65, yPos + 2);
      
      // Langue avec indicateur colore
      const langColors = {
        'fr': colors.primary,
        'en': colors.success,
        'ar': colors.accent
      };
      const langColor = langColors[survey.language?.toLowerCase()] || [149, 165, 166];
      pdf.setFillColor(...langColor);
      pdf.circle(103, yPos, 2, 'F'); // Position ajustee
      pdf.setTextColor(...colors.text);
      pdf.text(survey.language?.toUpperCase() || 'N/A', 105, yPos + 2); // Position ajustee
      
      // Satisfaction avec couleur (position corrigee)
      const satisfactionColor = avgRating >= 4 ? colors.success : 
                               avgRating >= 3 ? [241, 196, 15] : 
                               colors.accent;
      pdf.setTextColor(...satisfactionColor);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(`${avgRating.toFixed(1)}/5`, 130, yPos + 2); // Position ajustee
      
      // Indicateur de qualite (position dans les marges)
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      const qualite = avgRating >= 4 ? 'Exc.' : avgRating >= 3 ? 'Bon' : 'Faible';
      pdf.text(qualite, 150, yPos + 2); // Position ajustee
      
      yPos += 12;
      
      // Nouvelle page si necessaire
      if (yPos > 270) {
        pdf.addPage();
        yPos = 30;
      }
    });
    
    // Pied de page professionnel
    const addFooter = (pageNumber = 1) => {
      const pageHeight = pdf.internal.pageSize.height;
      
      // Ligne de séparation
      pdf.setDrawColor(...colors.lightGray);
      pdf.setLineWidth(0.5);
      pdf.line(20, pageHeight - 25, 190, pageHeight - 25);
      
      // Informations du pied de page
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      // Gauche: Informations ONDA
      pdf.text('Office National Des Aeroports - Aeroport Nador Al Aroui', 20, pageHeight - 15);
      pdf.text(`Rapport genere le ${new Date().toLocaleString('fr-FR')}`, 20, pageHeight - 10);
      
      // Droite: Numéro de page
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Page ${pageNumber}`, 180, pageHeight - 15);
      
      // Logo/watermark discret
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(6);
      pdf.text('Confidentiel - Usage interne uniquement', 20, pageHeight - 5);
    };
    
    // Ajouter le pied de page a toutes les pages
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(i);
    }
    
    // Telecharger le PDF
    const fileName = `rapport_satisfaction_nador_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    console.log(`PDF genere avec succes: ${fileName}`);
    console.log(`Nombre de pages generees: ${pdf.internal.getNumberOfPages()}`);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export des recommandations IA en PDF
 * @param {Object} recommendations - Donnees des recommandations IA
 * @param {Object} dashboardData - Donnees du dashboard pour contexte
 * @param {string} executiveSummary - Resume executif
 */
export const exportRecommendationsToPDF = async (recommendations, dashboardData, executiveSummary) => {
  try {
    const pdf = new jsPDF();
    
    // Configuration des couleurs ONDA
    const colors = {
      primary: [52, 152, 219],    // Bleu ONDA
      secondary: [231, 76, 60],   // Rouge
      success: [46, 204, 113],    // Vert
      warning: [241, 196, 15],    // Jaune
      accent: [155, 89, 182],     // Violet
      text: [44, 62, 80],         // Gris fonce
      lightGray: [236, 240, 241]  // Gris clair
    };

    // En-tete avec logo et titre
    pdf.setFillColor(...colors.primary);
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Titre principal
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text('RECOMMANDATIONS IA', 20, 25);
    
    pdf.setFontSize(12);
    pdf.text('Aide a la Decision - Aeroport Nador Al Aroui', 20, 32);
    
    // Logo ONDA (si disponible)
    pdf.setFontSize(10);
    pdf.text('ONDA - Office National Des Aeroports', 140, 32);
    
    // Barre decorative
    pdf.setFillColor(...colors.secondary);
    pdf.rect(0, 40, 210, 3, 'F');
    
    let yPos = 55;
    
    // Informations generales
    pdf.setFillColor(...colors.lightGray);
    pdf.roundedRect(20, yPos - 5, 170, 25, 4, 4, 'F');
    
    pdf.setTextColor(...colors.text);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('INFORMATIONS GENERALES', 25, yPos + 5);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Date d'analyse: ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`, 25, yPos + 12);
    pdf.text(`Score global: ${recommendations.score_global?.toFixed(1) || 'N/A'}/10`, 25, yPos + 19);
    pdf.text(`Nombre d'alertes: ${recommendations.alerts?.length || 0}`, 120, yPos + 12);
    pdf.text(`Recommandations: ${recommendations.recommendations?.length || 0}`, 120, yPos + 19);
    
    yPos += 35;
    
    // Resume executif
    if (executiveSummary) {
      pdf.setFillColor(...colors.accent);
      pdf.rect(20, yPos, 5, 15, 'F');
      
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUME EXECUTIF', 30, yPos + 8);
      
      yPos += 20;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const summaryLines = pdf.splitTextToSize(executiveSummary, 170);
      pdf.text(summaryLines, 20, yPos);
      yPos += summaryLines.length * 5 + 10;
    }
    
    // Verifier si nouvelle page necessaire
    if (yPos > 240) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Priorites strategiques
    if (recommendations.priorities?.length > 0) {
      pdf.setFillColor(...colors.secondary);
      pdf.rect(20, yPos, 5, 15, 'F');
      
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PRIORITES STRATEGIQUES', 30, yPos + 8);
      
      yPos += 20;
      
      recommendations.priorities.forEach((priority, index) => {
        const priorityColors = [
          [231, 76, 60],   // Rouge pour priorite 1
          [243, 156, 18],  // Orange pour priorite 2  
          [52, 152, 219]   // Bleu pour priorite 3
        ];
        
        const color = priorityColors[index] || [149, 165, 166];
        
        // Numero de priorite
        pdf.setFillColor(...color);
        pdf.circle(25, yPos + 3, 4, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text((index + 1).toString(), 24, yPos + 4);
        
        // Texte de la priorite
        pdf.setTextColor(...colors.text);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        const priorityText = pdf.splitTextToSize(priority, 160);
        pdf.text(priorityText, 35, yPos + 4);
        
        yPos += Math.max(priorityText.length * 5, 10) + 5;
      });
      
      yPos += 10;
    }
    
    // Verifier si nouvelle page necessaire
    if (yPos > 220) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Alertes critiques
    if (recommendations.alerts?.length > 0) {
      pdf.setFillColor(243, 156, 18); // Orange
      pdf.rect(20, yPos, 5, 15, 'F');
      
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ALERTES CRITIQUES', 30, yPos + 8);
      
      yPos += 20;
      
      recommendations.alerts.forEach((alert, index) => {
        // Icone d'alerte
        pdf.setFillColor(231, 76, 60); // Rouge
        pdf.roundedRect(20, yPos - 2, 8, 8, 1, 1, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.text('!', 23, yPos + 2);
        
        // Texte de l'alerte
        pdf.setTextColor(...colors.text);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const alertText = pdf.splitTextToSize(alert, 160);
        pdf.text(alertText, 35, yPos + 2);
        
        yPos += Math.max(alertText.length * 4, 8) + 5;
      });
      
      yPos += 10;
    }
    
    // Verifier si nouvelle page necessaire
    if (yPos > 200) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Recommandations detaillees
    if (recommendations.recommendations?.length > 0) {
      pdf.setFillColor(...colors.success);
      pdf.rect(20, yPos, 5, 15, 'F');
      
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RECOMMANDATIONS DETAILLEES', 30, yPos + 8);
      
      yPos += 25;
      
      recommendations.recommendations.forEach((rec, index) => {
        // Verifier si nouvelle page necessaire
        if (yPos > 220) {
          pdf.addPage();
          yPos = 30;
        }
        
        // Boite de recommendation
        pdf.setFillColor(248, 249, 250);
        const boxHeight = 35;
        pdf.roundedRect(20, yPos - 5, 170, boxHeight, 3, 3, 'F');
        
        // Categorie et timeline
        pdf.setTextColor(...colors.primary);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text(rec.category || 'General', 25, yPos + 2);
        
        pdf.setTextColor(...colors.accent);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(rec.timeline || 'N/A', 160, yPos + 2);
        
        // Probleme identifie
        pdf.setTextColor(231, 76, 60); // Rouge
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text('Probleme:', 25, yPos + 8);
        pdf.setTextColor(...colors.text);
        pdf.setFont('helvetica', 'normal');
        const issueText = pdf.splitTextToSize(rec.issue || 'Non specifie', 120);
        pdf.text(issueText, 45, yPos + 8);
        
        // Action recommandee
        pdf.setTextColor(46, 204, 113); // Vert
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text('Action:', 25, yPos + 15);
        pdf.setTextColor(...colors.text);
        pdf.setFont('helvetica', 'normal');
        const actionText = pdf.splitTextToSize(rec.action || 'Non specifiee', 130);
        pdf.text(actionText, 40, yPos + 15);
        
        // Impact attendu
        pdf.setTextColor(155, 89, 182); // Violet
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text('Impact:', 25, yPos + 22);
        pdf.setTextColor(...colors.text);
        pdf.setFont('helvetica', 'normal');
        const impactText = pdf.splitTextToSize(rec.impact || 'Non specifie', 130);
        pdf.text(impactText, 40, yPos + 22);
        
        yPos += boxHeight + 10;
      });
    }
    
    // Verifier si nouvelle page necessaire pour le plan d'action
    if (yPos > 200) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Plan d'action 30 jours
    if (recommendations.next_actions?.length > 0) {
      pdf.setFillColor(...colors.primary);
      pdf.rect(20, yPos, 5, 15, 'F');
      
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PLAN D\'ACTION 30 JOURS', 30, yPos + 8);
      
      yPos += 25;
      
      recommendations.next_actions.forEach((action, index) => {
        // Numero d'etape
        pdf.setFillColor(...colors.primary);
        pdf.circle(25, yPos + 3, 4, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text((index + 1).toString(), 24, yPos + 4);
        
        // Texte de l'action
        pdf.setTextColor(...colors.text);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const actionText = pdf.splitTextToSize(action, 160);
        pdf.text(actionText, 35, yPos + 4);
        
        yPos += Math.max(actionText.length * 4, 8) + 5;
      });
    }
    
    // Pied de page professionnel
    const addFooter = (pageNumber = 1) => {
      const pageHeight = pdf.internal.pageSize.height;
      
      // Ligne de separation
      pdf.setDrawColor(...colors.lightGray);
      pdf.line(20, pageHeight - 20, 190, pageHeight - 20);
      
      // Informations de bas de page
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(8);
      pdf.text('ONDA - Office National Des Aeroports', 20, pageHeight - 12);
      pdf.text('Aeroport Nador Al Aroui - Recommandations IA', 20, pageHeight - 8);
      
      // Numero de page
      pdf.text(`Page ${pageNumber}`, 180, pageHeight - 8);
      
      // Watermark discret
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(6);
      pdf.text('Genere automatiquement par DeepSeek AI', 20, pageHeight - 4);
    };
    
    // Ajouter le pied de page a toutes les pages
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(i);
    }
    
    // Telecharger le PDF
    const fileName = `recommandations_ia_nador_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    console.log(`PDF des recommandations genere: ${fileName}`);
    return { success: true, fileName };
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des recommandations:', error);
    return { success: false, error: error.message };
  }
};
