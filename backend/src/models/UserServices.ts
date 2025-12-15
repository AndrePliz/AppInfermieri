import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class UserServices extends Model {
  public user_service_id!: number;
  public user!: string;
  public service!: number;
  public selected!: string; // Char(1) nel DB
}

UserServices.init({
  user_service_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  service: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Char(1) che funge da boolean ('0' o '1')
  selected: {
    type: DataTypes.CHAR(1),
    defaultValue: '0', 
    allowNull: false
  },
  // Altri campi presenti ma opzionali per la logica attuale
  description: { type: DataTypes.STRING(512) },
  min: { type: DataTypes.DECIMAL(12, 2) },
  max: { type: DataTypes.DECIMAL(12, 2) }
}, {
  sequelize,
  tableName: 'user_services',
  timestamps: false
});

export default UserServices;