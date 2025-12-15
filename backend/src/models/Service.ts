import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class Service extends Model {
  public service_id!: number;
  public service_description!: string;
  public service_description_detailed!: string;
  public type!: number;
  public cral_type!: number;
  public price!: number;
}

Service.init({
  service_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  service_description: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  service_description_detailed: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cral_type: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
  }
}, {
  sequelize,
  tableName: 'services',
  timestamps: false,
});

export default Service;