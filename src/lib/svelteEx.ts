export const cleanSvelteBody = (body: string) =>
	body.replaceAll(/<!--.*?-->/gs, '').replace('*{}', '');

export const cleanSvelteXmlBody = (body: string) => cleanSvelteBody(body).replaceAll(/> </gs, '><');
