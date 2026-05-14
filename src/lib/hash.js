import Hashids from 'hashids';

// Pro-tip: Store this salt in your .env.local file! 
// If someone steals your salt, they can reverse-engineer your IDs.
const salt = process.env.HASHIDS_SALT || "your_secret_salt";

export const hashids = new Hashids(salt, 8);