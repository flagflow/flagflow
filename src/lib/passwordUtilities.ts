import { passwordStrength } from 'check-password-strength';

import { generatePassword } from './genId';

export const generateRandomPassword = async (): Promise<string> => {
	let password = generatePassword(8 + Math.random() * 8);
	while (passwordStrength(password).id < 3) password = generatePassword();
	return password;
};

export const validatePasswordStrength = (password: string): boolean =>
	passwordStrength(password).id >= 2;
