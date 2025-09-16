export interface OpenApiSpec {
	openapi: string;
	info: OpenApiInfo;
	servers: OpenApiServer[];
	components: OpenApiComponents;
	paths: Record<string, OpenApiPathItem>;
}

export interface OpenApiInfo {
	version: string;
	title: string;
	description: string;
}

export interface OpenApiServer {
	url: string;
	description: string;
}

export interface OpenApiComponents {
	schemas: Record<string, OpenApiSchema>;
	parameters?: Record<string, OpenApiParameter>;
	securitySchemes: Record<string, OpenApiSecurityScheme>;
}

export interface OpenApiPathItem {
	get?: OpenApiOperation;
	post?: OpenApiOperation;
	patch?: OpenApiOperation;
	put?: OpenApiOperation;
	delete?: OpenApiOperation;
	head?: OpenApiOperation;
	options?: OpenApiOperation;
}

export interface OpenApiOperation {
	summary: string;
	description: string;
	tags?: string[];
	parameters?: OpenApiParameter[];
	requestBody?: OpenApiRequestBody;
	responses: Record<string, OpenApiResponse>;
	security?: OpenApiSecurityRequirement[];
}

export interface OpenApiParameter {
	name: string;
	in: 'query' | 'path' | 'header' | 'cookie';
	description?: string;
	required?: boolean;
	schema: OpenApiSchema;
}

export interface OpenApiRequestBody {
	description?: string;
	required?: boolean;
	content: Record<string, OpenApiMediaType>;
}

export interface OpenApiResponse {
	description: string;
	content?: Record<string, OpenApiMediaType>;
}

export interface OpenApiMediaType {
	schema: OpenApiSchema;
}

export interface OpenApiSchema {
	type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
	format?: string;
	description?: string;
	properties?: Record<string, OpenApiSchema>;
	items?: OpenApiSchema;
	required?: string[];
	enum?: string[];
	minLength?: number;
	maxLength?: number;
	minimum?: number;
	maximum?: number;
	additionalProperties?: boolean | OpenApiSchema;
	$ref?: string;
}

export interface OpenApiSecurityScheme {
	type: 'http' | 'apiKey' | 'oauth2' | 'openIdConnect';
	scheme?: string;
	bearerFormat?: string;
	description?: string;
}

export interface OpenApiSecurityRequirement {
	[key: string]: string[];
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface EndpointInfo {
	path: string;
	method: HttpMethod;
	operation: OpenApiOperation;
	pathParams: OpenApiParameter[];
	queryParams: OpenApiParameter[];
	headerParams: OpenApiParameter[];
	requestBody?: OpenApiRequestBody;
}

export interface ApiRequest {
	url: string;
	method: HttpMethod;
	headers: Record<string, string>;
	body?: string;
}

export interface ApiResponse {
	status: number;
	statusText: string;
	headers: Record<string, string>;
	body: string;
	json?: unknown;
	timing?: number;
}

export interface FormValues {
	pathParams: Record<string, string>;
	queryParams: Record<string, string>;
	headerParams: Record<string, string>;
	body: string;
}
