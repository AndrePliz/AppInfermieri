import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import Service from './Service'; 

export class ServiceRequest extends Model {
  public service_request_id!: number;
  public user!: string;
  public name!: string;
  public service!: number;
  public date_time!: Date;
  public nurse_price!: string; 
  public city!: string;
  public address!: string;
  public status_request!: number;
  public processed!: number;
  public positionRequest!: any; 
  
  // FIX: Aggiunto '| null' a tutti i campi opzionali
  public phone?: string | null;
  public notes?: string | null;
  public user_assigned?: string | null; // <--- Questo risolve il tuo errore
  public blocked_time?: Date | null;
  public mail?: string | null;
  
  // Associazione
  public Service?: Service;
}

ServiceRequest.init({
  service_request_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(512),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(512),
    allowNull: false
  },
  provincia: { type: DataTypes.STRING(256) },
  city: { type: DataTypes.STRING(512) },
  service: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  notes: { type: DataTypes.TEXT },
  date_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  taxcode: { type: DataTypes.STRING(128) },
  status_request: {
    type: DataTypes.SMALLINT,
    allowNull: false
  },
  status_accept_6h: { type: DataTypes.SMALLINT, defaultValue: 0 },
  
  positionRequest: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  
  processed: { type: DataTypes.SMALLINT, defaultValue: 0 },
  phone: { type: DataTypes.STRING(64), allowNull: true },
  user_assigned: { type: DataTypes.STRING(256), allowNull: true },
  blocked_time: { type: DataTypes.DATE, allowNull: true },
  mail: { type: DataTypes.STRING(256), allowNull: true },
  
  price: { type: DataTypes.DECIMAL(12, 2) },
  total_price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.00 },
  nurse_price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.00 },
  fee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.00 },
  
  creation_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  
  status_user: { type: DataTypes.SMALLINT },
  encrypt: { type: DataTypes.SMALLINT, defaultValue: 0 },
  upload_status: { type: DataTypes.SMALLINT, defaultValue: 0 }
}, {
  sequelize,
  tableName: 'service_requests',
  timestamps: false 
});

export default ServiceRequest;