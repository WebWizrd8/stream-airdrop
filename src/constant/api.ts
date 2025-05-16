export const API_BASE_URL = 'https://staging-api.streamflow.finance/v2/api/airdrops';

export const SOLANA_CLUSTER_URL = 'https://api.devnet.solana.com';

export const getAllPayload = {
    "actor": "",
    "limit": 1000,
    "offset": 0,
    "filters": {
      "include": {
        "isOnChain": true,
        "isActive": true
      }
    },
    "sorters": [
      {
        "by": "id",
        "order": "desc"
      }
    ]
  }