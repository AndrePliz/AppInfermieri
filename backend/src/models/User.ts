import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

// 1. Aggiungiamo i campi mancanti all'interfaccia
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
  device?: string;
  // --- NUOVI CAMPI AGGIUNTI ---
  phone?: string;
  address?: string;
  city?: string;
  distance?: number;
  notes?: string;
}

// 2. Aggiungiamo i campi alla classe
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
  public device!: string;
  // --- NUOVI CAMPI AGGIUNTI ---
  public phone!: string;
  public address!: string;
  public city!: string;
  public distance!: number;
  public notes!: string;
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
    device: {
      type: DataTypes.STRING(128),
      allowNull: true,
      defaultValue: null
    },
    // --- NUOVE DEFINIZIONI COLONNE ---
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    distance: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 25 // Default ragionevole se manca
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // --------------------------------
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