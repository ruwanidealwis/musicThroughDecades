module.exports = {
  development: {
    username: 'ruwani',
    password: null,
    database: 'musicthroughdecades',
    host: 'localhost',
    dialect: 'postgres',
  },
  production: {
    username: 'ruwani',
    password: null,
    database: 'musicthroughdecades',
    host: 'localhost',
    dialect: 'postgres',
    use_env_variable: 'DATABASE_URL',
  },
};
