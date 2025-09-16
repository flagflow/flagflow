import { createJsonResponse } from '$lib/Response';

import type { RequestHandler } from './$types';
import openapi from './openapi.json';

export const GET: RequestHandler = async () => createJsonResponse(openapi);
