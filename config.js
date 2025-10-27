const isProd = import.meta.env.PROD;

export const SERVER_URL = isProd
  ? 'wss://regicide-backend-colyseus.onrender.com'
  : 'ws://localhost:2567';