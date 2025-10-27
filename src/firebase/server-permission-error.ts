export type ServerSecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: unknown;
};

export type ServerSecurityRuleRequest = {
  auth: null;
  method: ServerSecurityRuleContext['operation'];
  path: string;
  resource?: {
    data: unknown;
  };
};

function buildRequestObject(context: ServerSecurityRuleContext): ServerSecurityRuleRequest {
  return {
    auth: null,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

function buildErrorMessage(request: ServerSecurityRuleRequest): string {
  return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(request, null, 2)}`;
}

export class ServerFirestorePermissionError extends Error {
  public readonly request: ServerSecurityRuleRequest;

  constructor(context: ServerSecurityRuleContext) {
    const request = buildRequestObject(context);
    super(buildErrorMessage(request));
    this.name = 'FirebaseError';
    this.request = request;
  }
}
