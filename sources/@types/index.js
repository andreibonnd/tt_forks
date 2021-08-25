/**
 * @typedef { Object } jwt_payload
 * @property { String } id
 * @property { String } role
 */

/**
 * @typedef { 'OK' } response_OK
 */

/**
 * @typedef { Object } user
 * @property { String } login
 * @property { String } email
 * @property { Array<{ id: String, name: String }> } [subscriptions]
 */

/**
 * @typedef { Object } fork
 * @property { String } id
 * @property { String } name
 * @property { String } description
 * @property { Number } creation_year
 * @property { Object } creator
 * @property { String } creator.id
 * @property { String } creator.login
 * @property { Object } category
 * @property { String } [category.id]
 * @property { String } [category.name]
 * @property { String } [category.description]
 */

/**
 * @typedef { Object } category
 * @property { String } id
 * @property { String } name
 * @property { String } description
 */

export {};
