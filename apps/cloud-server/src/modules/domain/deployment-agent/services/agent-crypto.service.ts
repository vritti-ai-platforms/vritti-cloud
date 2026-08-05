import { Injectable } from '@nestjs/common';
import { generateSigningKeyPair } from '@vritti/api-sdk/signing';
import { CryptoService } from '@/services';

// Agent-domain crypto: names the raw Ed25519 / seal / token primitives (owned by CryptoService) in the
// terms the enrollment + desired-state signing flows use. All agent crypto goes through here so the
// deployment-agent service (and the Connect auth layer) never touch byte-level key handling directly.
@Injectable()
export class AgentCryptoService {
  constructor(private readonly cryptoService: CryptoService) {}

  // Generates the deployment signing keypair (Keypair B): pkcs8-DER private + SPKI-DER public, both base64
  generateDeploymentKeypair(): { privateKey: string; publicKey: string } {
    return generateSigningKeyPair();
  }

  // The deploymentPubKey wire form the agent verifies cloud signatures with — raw 32-byte Ed25519 (base64) from the stored SPKI key
  toWirePublicKey(spkiDerBase64: string): string {
    return this.cryptoService.ed25519SpkiToRaw(spkiDerBase64);
  }

  // Signs a message (nonce / canonical desired-state) with the deployment private key (Keypair B)
  signWithDeploymentKey(deploymentSigningKeyPkcs8B64: string, message: string | Buffer): string {
    return this.cryptoService.ed25519Sign(deploymentSigningKeyPkcs8B64, message);
  }

  // Verifies a signature produced by the agent's signing key (raw 32-byte Ed25519 pubkey, base64); malformed input ⇒ false
  verifyAgentSignature(agentPublicKeyRawB64: string, message: string | Buffer, signatureB64: string): boolean {
    return this.cryptoService.ed25519Verify(agentPublicKeyRawB64, message, signatureB64);
  }

  // Random opaque token for the bearer credential, the one-time enroll token, and the connectivity nonce
  generateToken(bytes?: number): string {
    return this.cryptoService.generateOpaqueToken(bytes);
  }

  // Seals an operator secret to the enrolled agent's X25519 sealing pubkey (base64) so cloud never ships plaintext
  sealToAgent(plaintext: string, agentSealingPubKeyB64: string): Promise<string> {
    return this.cryptoService.sealAnonymous(plaintext, agentSealingPubKeyB64);
  }
}
