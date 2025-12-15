import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class CityServices extends Model {
  public service_description_city!: string;
  // altri campi se servono...
}

CityServices.init({
  idcity_services: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  service: { type: DataTypes.BIGINT, allowNull: false },
  city: { type: DataTypes.STRING(256), allowNull: false, defaultValue: '1' },
  price: { type: DataTypes.STRING(256) },
  price_gvm: { type: DataTypes.STRING(255) },
  service_description_city: { type: DataTypes.STRING(256) },
  service_description_detailed: { type: DataTypes.STRING(1024) },
  user_status: { type: DataTypes.TINYINT, defaultValue: 0 }
}, {
  sequelize,
  tableName: 'city_services',
  timestamps: false
});

export default CityServices;