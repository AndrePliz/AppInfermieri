import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class UserRequestStatus extends Model {
  public user!: string;
  public request!: number;
  public status!: number;
  public sent_notification!: number;
  public sent_mail!: number;
  public sent_date!: Date;
}

UserRequestStatus.init({
  user: { 
    type: DataTypes.STRING(128),
    primaryKey: true, // Parte della PK
    allowNull: false
  },
  request: { 
    type: DataTypes.BIGINT,
    primaryKey: true, // Parte della PK
    allowNull: false
  },
  status: { type: DataTypes.SMALLINT, defaultValue: 1 },
  sent_notification: { type: DataTypes.SMALLINT, defaultValue: 0 },
  sent_mail: { type: DataTypes.SMALLINT, defaultValue: 0 },
  sent_date: { type: DataTypes.DATE },
}, {
  sequelize,
  tableName: 'user_request_status',
  timestamps: false
});

export default UserRequestStatus;