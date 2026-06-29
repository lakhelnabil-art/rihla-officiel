/**
 * GDS Connector Layer — shared types & constants.
 * Rihla Core stays independent; adapters implement this contract.
 */

/** @typedef {'none'|'amadeus'|'sabre'|'travelport'|'galileo'|'worldspan'|'ndc'|'other'} GdsProviderId */
/** @typedef {'test'|'production'} GdsEnvironment */
/** @typedef {'connected'|'disconnected'|'error'|'pending'} GdsConnectionStatus */

/** @typedef {Object} GdsCredentials
 * @property {string} [apiKey]
 * @property {string} [apiSecret]
 * @property {string} [username]
 * @property {string} [password]
 */

/** @typedef {Object} GdsConnectionConfig
 * @property {string} agencyName
 * @property {string} officeId
 * @property {string} pcc
 * @property {GdsEnvironment} environment
 * @property {string} [endpointUrl]
 * @property {GdsCredentials} credentials
 */

/** @typedef {Object} GdsPassenger
 * @property {string} type ADT|CHD|INF
 * @property {string} lastName
 * @property {string} firstName
 * @property {string} [title]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [dateOfBirth]
 */

/** @typedef {Object} GdsSegment
 * @property {number} sequence
 * @property {string} carrier
 * @property {string} flightNumber
 * @property {string} origin
 * @property {string} destination
 * @property {string} departureDate
 * @property {string} departureTime
 * @property {string} arrivalDate
 * @property {string} arrivalTime
 * @property {string} cabin
 * @property {string} status HK|HL|UN|etc
 * @property {string} [bookingClass]
 */

/** @typedef {Object} GdsTicket
 * @property {string} ticketNumber
 * @property {string} passengerName
 * @property {string} issueDate
 * @property {number} baseFare
 * @property {number} taxes
 * @property {number} total
 * @property {number} [commission]
 * @property {string} currency
 * @property {string} status issued|void|refund|exchange
 */

/** @typedef {Object} GdsPnr
 * @property {string} recordLocator
 * @property {string} provider
 * @property {string} status
 * @property {GdsPassenger[]} passengers
 * @property {GdsSegment[]} segments
 * @property {GdsTicket[]} tickets
 * @property {string[]} ssr
 * @property {string[]} osi
 * @property {Object} [raw]
 * @property {Object} [future] NDC, BSP, ADM, EMD, ancillaries
 */

/** Future-ready extensions (stored in PNR metadata). */
export const GDS_FUTURE_CAPABILITIES = [
  'ndc', 'bsp', 'adm', 'emd', 'ancillary', 'seat_maps',
  'baggage', 'group_bookings', 'corporate', 'tour_operating', 'dynamic_packaging',
]

export const GDS_ENVIRONMENTS = ['test', 'production']

export const GDS_MODES = [
  { id: 'none', label: 'Non, nous utilisons uniquement Rihla' },
  { id: 'amadeus', label: 'Oui, nous disposons d\'un accès Amadeus' },
  { id: 'sabre', label: 'Oui, nous disposons d\'un accès Sabre' },
  { id: 'travelport', label: 'Oui, nous disposons d\'un accès Travelport' },
  { id: 'other', label: 'Autre GDS' },
]
