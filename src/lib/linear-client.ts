import { LinearClient } from '@linear/sdk';
import { OAuth, getPreferenceValues } from '@raycast/api';

interface Preferences {
  linearPat?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
}

type RawOAuthTokenResponse = Partial<OAuth.TokenResponse>;

const pkceClient = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: 'Linear',
  providerIcon: 'assets/icon.png',
  providerId: 'linear',
  description: 'Connect your Linear account',
});

function mapTokenResponse(raw: RawOAuthTokenResponse, previous?: OAuth.TokenSet | null): OAuth.TokenResponse {
  const accessToken = raw.access_token ?? previous?.accessToken;
  if (!accessToken) {
    throw new Error('OAuth token response did not include an access token.');
  }

  return {
    access_token: accessToken,
    refresh_token: raw.refresh_token ?? previous?.refreshToken,
    expires_in: typeof raw.expires_in === 'number' ? raw.expires_in : previous?.expiresIn,
    scope: raw.scope ?? previous?.scope,
  };
}

async function postTokenExchange(params: URLSearchParams): Promise<RawOAuthTokenResponse> {
  const response = await fetch('https://api.linear.app/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${err}`);
  }

  return (await response.json()) as RawOAuthTokenResponse;
}

export async function getLinearClient(): Promise<LinearClient> {
  const preferences = getPreferenceValues<Preferences>();

  if (preferences.linearPat?.trim()) {
    return new LinearClient({ apiKey: preferences.linearPat.trim() });
  }

  const clientId = preferences.oauthClientId?.trim();
  if (!clientId) {
    throw new Error('Authentication required. Set a Linear PAT or OAuth Client ID in preferences.');
  }

  const tokens = await pkceClient.getTokens();

  if (tokens?.accessToken) {
    if (!tokens.isExpired()) {
      return new LinearClient({ accessToken: tokens.accessToken });
    }

    if (!tokens.refreshToken) {
      throw new Error('Authentication required');
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', tokens.refreshToken);
    params.append('client_id', clientId);
    if (preferences.oauthClientSecret?.trim()) {
      params.append('client_secret', preferences.oauthClientSecret.trim());
    }

    const raw = await postTokenExchange(params);
    const mapped = mapTokenResponse(raw, tokens);
    await pkceClient.setTokens(mapped);
    return new LinearClient({ accessToken: mapped.access_token });
  }

  throw new Error('Authentication required');
}

export async function authorize(): Promise<void> {
  const preferences = getPreferenceValues<Preferences>();
  const clientId = preferences.oauthClientId?.trim();

  if (!clientId) {
    throw new Error('Client ID missing in preferences.');
  }

  const authorizationRequest = await pkceClient.authorizationRequest({
    endpoint: 'https://linear.app/oauth/authorize',
    clientId,
    scope: 'write',
  });

  const { authorizationCode } = await pkceClient.authorize(authorizationRequest);

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', authorizationCode);
  params.append('redirect_uri', authorizationRequest.redirectURI);
  params.append('client_id', clientId);
  params.append('code_verifier', authorizationRequest.codeVerifier);
  if (preferences.oauthClientSecret?.trim()) {
    params.append('client_secret', preferences.oauthClientSecret.trim());
  }

  const raw = await postTokenExchange(params);
  const mapped = mapTokenResponse(raw);
  await pkceClient.setTokens(mapped);
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    await getLinearClient();
    return true;
  } catch {
    return false;
  }
}
