import Hashids from 'hashids';

const salt = process.env.HASHIDS_SALT || "your_secret_salt";

export const hashids = new Hashids(salt, 8);