const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration de test de la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log // Afficher les requêtes SQL
  }
);

async function testConnection() {
  try {
    console.log('🔄 Test de connexion à PostgreSQL...');
    
    // Test de la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL établie avec succès !');
    
    // Test d'une requête simple
    const [results] = await sequelize.query('SELECT version();');
    console.log('📊 Version PostgreSQL:', results[0].version);
    
    // Test de création d'une table temporaire
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Insérer des données de test
    await sequelize.query(`
      INSERT INTO test_connection (message) 
      VALUES ('Test de connexion réussi !');
    `);
    
    // Récupérer les données
    const [testData] = await sequelize.query('SELECT * FROM test_connection ORDER BY id DESC LIMIT 1;');
    console.log('📝 Test d\'insertion:', testData[0]);
    
    // Nettoyer
    await sequelize.query('DROP TABLE IF EXISTS test_connection;');
    console.log('🧹 Table de test supprimée');
    
    console.log('\n🎉 Tous les tests sont passés ! PostgreSQL est prêt.');
    
  } catch (error) {
    console.error('❌ Erreur de connexion à PostgreSQL:');
    console.error('Détails:', error.message);
    
    if (error.original?.code === 'ECONNREFUSED') {
      console.log('\n💡 Solutions possibles:');
      console.log('1. Vérifiez que PostgreSQL est démarré');
      console.log('2. Vérifiez le port (5432 par défaut)');
      console.log('3. Vérifiez les identifiants dans le fichier .env');
    }
    
    if (error.original?.code === '3D000') {
      console.log('\n💡 La base de données n\'existe pas.');
      console.log('Créez-la avec: CREATE DATABASE nador_airport_satisfaction;');
    }
    
    if (error.original?.code === '28P01') {
      console.log('\n💡 Erreur d\'authentification.');
      console.log('Vérifiez le nom d\'utilisateur et mot de passe dans .env');
    }
  } finally {
    await sequelize.close();
    console.log('🔒 Connexion fermée');
  }
}

// Lancer le test
testConnection();
