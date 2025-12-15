import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

// 1. Aggiungiamo 'device' all'interfaccia
export interface UserAttributes {
  id: number;
  username: string;
  password: string;
  mail: string;
  name: string; 
  pharmacist: number;
  login_counter: number;
  account_blocked: number;
  status: number;
  device?: string; // <--- AGGIUNTO QUI (Opzionale perché può essere null)
}

// 2. Aggiungiamo 'device' alla classe
export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public mail!: string;
  public name!: string; 
  public pharmacist!: number;
  public login_counter!: number;
  public account_blocked!: number;
  public status!: number;
  public device!: string; // <--- AGGIUNTO QUI
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(512),
      allowNull: true, 
    },
    // 3. Aggiungiamo la definizione della colonna 'device'
    device: {
      type: DataTypes.STRING(128),
      allowNull: true,
      defaultValue: null
    },
    pharmacist: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    login_counter: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    account_blocked: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);

export default User;