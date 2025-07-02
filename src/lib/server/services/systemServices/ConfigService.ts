import { config } from '../../config';

export const ConfigService = () => config;
export type ConfigService = ReturnType<typeof ConfigService>;
