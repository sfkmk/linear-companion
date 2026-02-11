import { LinearClient } from '@linear/sdk';
import { OAuth, getPreferenceValues } from '@raycast/api';

// Defined in package.json
interface Preferences {
  linearPat?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
}

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: 'Linear',
  providerIcon: 'linear-icon.png',
  providerId: 'linear',
  description: 'Connect your Linear account',
});

// Helper to get authorized client or throw
export async function getLinearClient(): Promise<LinearClient> {
  const preferences = getPreferenceValues<Preferences>();

  // 1. Priority: Personal Access Token
  if (preferences.linearPat && preferences.linearPat.trim().length > 0) {
    return new LinearClient({ apiKey: preferences.linearPat });
  }

  // 2. OAuth
  const clientId = preferences.oauthClientId;

  if (!clientId) {
    throw new Error('Authentication required. Please set a Personal Access Token or OAuth Client ID in preferences.');
  }

  const tokens = await client.getTokens();

  if (tokens?.accessToken) {
    if (tokens.isExpired()) {
      if (tokens.refreshToken) {
        try {
          // Manual Refresh
          const params = new URLSearchParams();
          params.append('grant_type', 'refresh_token');
          params.append('refresh_token', tokens.refreshToken);
          params.append('client_id', clientId);
          if (preferences.oauthClientSecret) {
             params.append('client_secret', preferences.oauthClientSecret);
          }

          const response = await fetch('https://api.linear.app/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
          });

          if (!response.ok) {
              const err = await response.text();
              throw new Error(`Refresh failed: ${response.status} ${err}`);
          }

          const newTokens = await response.json();
          // Ensure scope is preserved if not returned

          await client.setTokens(newTokens);
          return new LinearClient({ accessToken: newTokens.accessToken });
        } catch (error) {
          console.error('Failed to refresh Linear token:', error);
          // Fall through to throw (re-login needed)
        }
      }
    } else {
      return new LinearClient({ accessToken: tokens.accessToken });
    }
  }

  throw new Error('Authentication required');
}

export async function authorize(): Promise<void> {
  const preferences = getPreferenceValues<Preferences>();
  const clientId = preferences.oauthClientId;

  if (!clientId) {
    throw new Error("Client ID missing in preferences.");
  }

  const authorizationRequest = await client.authorizationRequest({
    endpoint: 'https://linear.app/oauth/authorize',
    clientId: clientId,
    scope: 'write',
  });

  const authorizationCode = await client.authorize(authorizationRequest);

  // Manual Token Exchange
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', authorizationCode);
  params.append('redirect_uri', authorizationRequest.redirectURI);
  params.append('client_id', clientId);
  params.append('code_verifier', authorizationRequest.codeVerifier);
  if (preferences.oauthClientSecret) {
      params.append('client_secret', preferences.oauthClientSecret);
  }

  const response = await fetch('https://api.linear.app/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
      const err = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${err}`);
  }

  const tokens = await response.json();
  await client.setTokens(tokens);
}

export async function isAuthenticated(): Promise<boolean> {
    try {
        await getLinearClient();
        return true;
    } catch {
        return false;
    }
}
