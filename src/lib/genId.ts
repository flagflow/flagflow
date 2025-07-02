import { nanoid } from 'nanoid';

export const HTMLELEMENTID_LENGTH = 8;
export const BROWSERID_LENGTH = 8;
export const TRACEID_LENGTH = 21;
export const SESSIONID_LENGTH = 32;

export const generateHtmlElementId = () => 'H' + nanoid(HTMLELEMENTID_LENGTH);
export const generateBrowserId = () => nanoid(BROWSERID_LENGTH);
export const generateTraceId = () => nanoid(TRACEID_LENGTH);
export const generateSessionId = () => nanoid(SESSIONID_LENGTH);
