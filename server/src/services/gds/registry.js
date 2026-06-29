/**
 * GDS Provider Registry — single entry point for all GDS adapters.
 */

export const GDS_PROVIDERS = {
  amadeus: {
    id: 'amadeus',
    label: 'Amadeus',
    description: 'GDS Amadeus — réservations, PNR, billetterie',
    status: 'available',
    configFields: ['agencyName', 'officeId', 'pcc', 'environment', 'endpointUrl', 'apiKey', 'apiSecret', 'username', 'password'],
  },
  sabre: {
    id: 'sabre',
    label: 'Sabre',
    description: 'GDS Sabre — connecteur prévu',
    status: 'planned',
    configFields: ['agencyName', 'officeId', 'pcc', 'environment', 'endpointUrl', 'apiKey', 'apiSecret', 'username', 'password'],
  },
  travelport: {
    id: 'travelport',
    label: 'Travelport',
    description: 'GDS Travelport (Galileo / Worldspan)',
    status: 'planned',
    configFields: ['agencyName', 'officeId', 'pcc', 'environment', 'endpointUrl', 'apiKey', 'apiSecret', 'username', 'password'],
  },
  galileo: {
    id: 'galileo',
    label: 'Galileo',
    description: 'Travelport Galileo',
    status: 'planned',
    configFields: ['agencyName', 'officeId', 'pcc', 'environment', 'endpointUrl', 'username', 'password'],
  },
  worldspan: {
    id: 'worldspan',
    label: 'Worldspan',
    description: 'Travelport Worldspan',
    status: 'planned',
    configFields: ['agencyName', 'officeId', 'pcc', 'environment', 'endpointUrl', 'username', 'password'],
  },
  ndc: {
    id: 'ndc',
    label: 'NDC Direct Connect',
    description: 'Connexion directe compagnies aériennes (NDC)',
    status: 'planned',
    configFields: ['agencyName', 'endpointUrl', 'apiKey', 'apiSecret'],
  },
}

export const getProviderMeta = (providerId) => GDS_PROVIDERS[providerId] ?? null

export const listProviders = () => Object.values(GDS_PROVIDERS)

export const isProviderAvailable = (providerId) =>
  GDS_PROVIDERS[providerId]?.status === 'available'
