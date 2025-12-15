import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class Notification extends Model {
  public notification_id!: number;
  public user!: string;
  public request_id!: number;
  public title!: string; // Nuovo campo
  public message!: string;
  public data!: string;  // Ex description
  public sent!: number;
}

Notification.init({
  notification_id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  user: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  request_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  title: { type: DataTypes.STRING(255), allowNull: true },
  message: { type: DataTypes.TEXT },
  // USIAMO 'data' INVECE DI 'description'
  data: { type: DataTypes.TEXT }, 
  notification_type: { type: DataTypes.SMALLINT },
  read: { type: DataTypes.SMALLINT, defaultValue: 0 },
  notification_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  sent: { type: DataTypes.SMALLINT, defaultValue: 0 },
}, {
  sequelize,
  tableName: 'notifications',
  timestamps: false,
});

export default Notification;