/**
 * 📊 SYSTÈME DE MONITORING ET ALERTES DE SÉCURITÉ
 * Détecte et alerte sur les comportements suspects
 */

const logger = require('./logger');
const { Survey } = require('../models');

// Compteurs en mémoire pour détecter les anomalies
let securityMetrics = {
  totalSubmissions: 0,
  suspiciousAttempts: 0,
  blockedIPs: new Set(),
  rateLimitHits: 0,
  lastReset: Date.now()
};

/**
 * 🔍 DÉTECTEUR D'ANOMALIES EN TEMPS RÉEL
 */
class SecurityMonitor {
  constructor() {
    this.alertThresholds = {
      suspiciousRatio: 0.1, // 10% de tentatives suspectes
      maxSubmissionsPerHour: 100,
      maxErrorsPerHour: 50,
      minTimeBetweenSubmissions: 30000 // 30 secondes
    };
    
    this.recentSubmissions = new Map(); // IP -> timestamp
    this.errorCounts = new Map(); // IP -> count
    
    // Reset des métriques toutes les heures
    setInterval(() => this.resetHourlyMetrics(), 3600000);
  }
  
  /**
   * 📝 Enregistrer une soumission d'enquête
   */
  recordSubmission(ip, metadata = {}) {
    const now = Date.now();
    securityMetrics.totalSubmissions++;
    
    // Vérifier si c'est trop rapide
    if (this.recentSubmissions.has(ip)) {
      const lastSubmission = this.recentSubmissions.get(ip);
      const timeDiff = now - lastSubmission;
      
      if (timeDiff < this.alertThresholds.minTimeBetweenSubmissions) {
        this.recordSuspiciousActivity(ip, 'RAPID_SUBMISSION', {
          timeDiff,
          minAllowed: this.alertThresholds.minTimeBetweenSubmissions
        });
      }
    }
    
    this.recentSubmissions.set(ip, now);
    
    // Log de l'activité normale
    logger.info('Soumission d\'enquête enregistrée', {
      ip,
      timestamp: now,
      metadata
    });
  }
  
  /**
   * 🚨 Enregistrer une activité suspecte
   */
  recordSuspiciousActivity(ip, type, details = {}) {
    securityMetrics.suspiciousAttempts++;
    
    const suspiciousEvent = {
      ip,
      type,
      details,
      timestamp: Date.now(),
      userAgent: details.userAgent || 'unknown'
    };
    
    logger.warn('Activité suspecte détectée', suspiciousEvent);
    
    // Déclencher alerte si nécessaire
    this.checkForAlerts();
    
    return suspiciousEvent;
  }
  
  /**
   * 🚫 Enregistrer une erreur de validation
   */
  recordValidationError(ip, errorType, details = {}) {
    const errorCount = this.errorCounts.get(ip) || 0;
    this.errorCounts.set(ip, errorCount + 1);
    
    // Si trop d'erreurs, considérer comme suspect
    if (errorCount + 1 > 5) {
      this.recordSuspiciousActivity(ip, 'EXCESSIVE_ERRORS', {
        errorCount: errorCount + 1,
        errorType,
        details
      });
    }
    
    logger.warn('Erreur de validation', {
      ip,
      errorType,
      errorCount: errorCount + 1,
      details
    });
  }
  
  /**
   * ⚠️ Vérifier si des alertes doivent être déclenchées
   */
  checkForAlerts() {
    const now = Date.now();
    const hoursSinceReset = (now - securityMetrics.lastReset) / 3600000;
    
    // Calculer le ratio de tentatives suspectes
    const suspiciousRatio = securityMetrics.totalSubmissions > 0 
      ? securityMetrics.suspiciousAttempts / securityMetrics.totalSubmissions 
      : 0;
    
    // ALERTE : Trop de tentatives suspectes
    if (suspiciousRatio > this.alertThresholds.suspiciousRatio) {
      this.triggerAlert('HIGH_SUSPICIOUS_RATIO', {
        ratio: suspiciousRatio,
        threshold: this.alertThresholds.suspiciousRatio,
        totalSubmissions: securityMetrics.totalSubmissions,
        suspiciousAttempts: securityMetrics.suspiciousAttempts
      });
    }
    
    // ALERTE : Trop de soumissions par heure
    const submissionsPerHour = securityMetrics.totalSubmissions / Math.max(hoursSinceReset, 1);
    if (submissionsPerHour > this.alertThresholds.maxSubmissionsPerHour) {
      this.triggerAlert('HIGH_SUBMISSION_RATE', {
        rate: submissionsPerHour,
        threshold: this.alertThresholds.maxSubmissionsPerHour,
        hoursElapsed: hoursSinceReset
      });
    }
  }
  
  /**
   * 🚨 Déclencher une alerte de sécurité
   */
  triggerAlert(alertType, details) {
    const alert = {
      type: alertType,
      severity: 'HIGH',
      timestamp: Date.now(),
      details,
      metrics: { ...securityMetrics }
    };
    
    // Log critique
    logger.error('🚨 ALERTE SÉCURITÉ DÉCLENCHÉE', alert);
    
    // Ici, on pourrait envoyer des notifications par email, Slack, etc.
    this.sendNotificationToAdmins(alert);
    
    return alert;
  }
  
  /**
   * 📧 Envoyer notification aux admins (placeholder)
   */
  sendNotificationToAdmins(alert) {
    // TODO: Implémenter l'envoi d'emails ou notifications Slack
    console.log('🚨 NOTIFICATION ADMIN:', alert.type);
    
    // Sauvegarder l'alerte en base pour le dashboard admin
    this.saveAlertToDatabase(alert);
  }
  
  /**
   * 💾 Sauvegarder l'alerte en base de données
   */
  async saveAlertToDatabase(alert) {
    try {
      // TODO: Créer un modèle SecurityAlert si nécessaire
      logger.info('Alerte sauvegardée pour le dashboard admin', alert);
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde de l\'alerte', error);
    }
  }
  
  /**
   * 🔄 Reset des métriques horaires
   */
  resetHourlyMetrics() {
    logger.info('Reset des métriques de sécurité', securityMetrics);
    
    securityMetrics = {
      totalSubmissions: 0,
      suspiciousAttempts: 0,
      blockedIPs: new Set(),
      rateLimitHits: 0,
      lastReset: Date.now()
    };
    
    this.errorCounts.clear();
    this.recentSubmissions.clear();
  }
  
  /**
   * 📊 Obtenir les métriques actuelles
   */
  getMetrics() {
    return {
      ...securityMetrics,
      blockedIPs: Array.from(securityMetrics.blockedIPs),
      recentSubmissionsCount: this.recentSubmissions.size,
      errorCountsTotal: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0)
    };
  }
  
  /**
   * 🔍 Analyser les patterns suspects dans les données
   */
  async analyzeSubmissionPatterns() {
    try {
      // Analyser les soumissions récentes pour détecter des patterns
      const recentSurveys = await Survey.findAll({
        where: {
          submitted_at: {
            [require('sequelize').Op.gte]: new Date(Date.now() - 3600000) // dernière heure
          }
        },
        order: [['submitted_at', 'ASC']]
      });
      
      // Détecter les patterns suspects
      const suspiciousPatterns = this.detectSuspiciousPatterns(recentSurveys);
      
      if (suspiciousPatterns.length > 0) {
        logger.warn('Patterns suspects détectés dans les soumissions', {
          patternsCount: suspiciousPatterns.length,
          patterns: suspiciousPatterns
        });
      }
      
      return suspiciousPatterns;
      
    } catch (error) {
      logger.error('Erreur lors de l\'analyse des patterns', error);
      return [];
    }
  }
  
  /**
   * 🔍 Détecter des patterns suspects
   */
  detectSuspiciousPatterns(surveys) {
    const patterns = [];
    
    // Pattern 1: Trop de soumissions identiques
    const duplicateData = new Map();
    surveys.forEach(survey => {
      const dataKey = JSON.stringify({
        ratings: survey.ratings,
        personalInfo: {
          age: survey.age_range,
          nationality: survey.nationality,
          travelPurpose: survey.travel_purpose
        }
      });
      
      duplicateData.set(dataKey, (duplicateData.get(dataKey) || 0) + 1);
    });
    
    for (const [data, count] of duplicateData.entries()) {
      if (count > 3) {
        patterns.push({
          type: 'DUPLICATE_SUBMISSIONS',
          count,
          description: `${count} soumissions identiques détectées`
        });
      }
    }
    
    // Pattern 2: Soumissions trop rapides du même IP
    const ipTimestamps = new Map();
    surveys.forEach(survey => {
      if (!ipTimestamps.has(survey.ip_address)) {
        ipTimestamps.set(survey.ip_address, []);
      }
      ipTimestamps.get(survey.ip_address).push(new Date(survey.submitted_at).getTime());
    });
    
    for (const [ip, timestamps] of ipTimestamps.entries()) {
      if (timestamps.length > 2) {
        const intervals = [];
        for (let i = 1; i < timestamps.length; i++) {
          intervals.push(timestamps[i] - timestamps[i-1]);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        if (avgInterval < 60000) { // moins d'1 minute entre soumissions
          patterns.push({
            type: 'RAPID_SUBMISSIONS',
            ip,
            avgInterval,
            count: timestamps.length,
            description: `Soumissions trop rapides depuis ${ip}`
          });
        }
      }
    }
    
    return patterns;
  }
}

// Instance singleton
const securityMonitor = new SecurityMonitor();

module.exports = securityMonitor;
