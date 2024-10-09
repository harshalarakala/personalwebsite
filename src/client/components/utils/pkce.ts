// src/utils/pkce.ts

import pkceChallenge from 'pkce-challenge';

export const generatePKCECodes = async () => {
    const { code_verifier, code_challenge } = await pkceChallenge();
    return { code_verifier, code_challenge };
};
