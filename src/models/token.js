'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('Token', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: 'Access Token'
    },
    client_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Client ID'
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: 'User ID'
    },
    ttl: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'token',
    comment: 'Token table，use to get info'
  });
}
