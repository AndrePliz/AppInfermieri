import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import User from './User';

class UserDevice extends Model {
  public id!: number;
  public user_id!: number;
  public device_token!: string;
  public platform!: string;
  public last_seen!: Date;
}

UserDevice.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    device_token: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING(20), // 'ios' | 'android' | 'web'
      allowNull: true,
    },
    last_seen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_devices',
    timestamps: false,
  }
);

export default UserDevice;
