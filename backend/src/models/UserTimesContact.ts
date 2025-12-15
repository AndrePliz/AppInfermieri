import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class UserTimesContact extends Model {
  public user!: string;
  public days!: string; 
  public receive_push_notification!: number;
}

UserTimesContact.init({
  user: {
    type: DataTypes.STRING(128),
    primaryKey: true,
  },
  days: {
    type: DataTypes.TEXT,
  },
  ever_available: { type: DataTypes.SMALLINT, defaultValue: 0 },
  receive_mail: { type: DataTypes.SMALLINT, defaultValue: 0 },
  receive_push_notification: { type: DataTypes.SMALLINT, defaultValue: 0 },
  receive_sms: { type: DataTypes.SMALLINT, defaultValue: 0 },
  receive_call: { type: DataTypes.SMALLINT, defaultValue: 0 },
  morning_available: { type: DataTypes.SMALLINT, defaultValue: 0 },
  afternoon_available: { type: DataTypes.SMALLINT, defaultValue: 0 },
  evening_available: { type: DataTypes.SMALLINT, defaultValue: 0 },
  night_available: { type: DataTypes.SMALLINT, defaultValue: 0 },
}, {
  sequelize,
  tableName: 'user_times_contactme',
  timestamps: false,
});

export default UserTimesContact;