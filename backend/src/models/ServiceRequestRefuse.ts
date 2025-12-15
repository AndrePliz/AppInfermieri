import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class ServiceRequestRefuse extends Model {}

ServiceRequestRefuse.init({
  idservice_request_refuse: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  user: { type: DataTypes.STRING(45) },
  service_request: { type: DataTypes.STRING(56) },
  
  // Colonne specifiche per i motivi (Varchar nel DB legacy)
  price: { type: DataTypes.STRING(45), defaultValue: "0" },             // Il compenso è troppo basso
  distance: { type: DataTypes.STRING(45), defaultValue: "0" },          // È troppo distante
  cant_be_performed: { type: DataTypes.STRING(45), defaultValue: "0" }, // Non sono interessato/Non posso
  different_request: { type: DataTypes.STRING(45), defaultValue: "0" }, // (Non usato per ora, ma presente)
  resp_phone: { type: DataTypes.STRING(45), defaultValue: "0" },        // (Non usato per ora)
  
  // Campo libero
  another: { type: DataTypes.STRING(256), allowNull: true },            // Altro (Testo)
  
  inserted_price: { type: DataTypes.STRING(45), allowNull: true }       // Se volessero contrattare (non usato ora)
}, {
  sequelize,
  tableName: 'service_request_refuse',
  timestamps: false
});

export default ServiceRequestRefuse;