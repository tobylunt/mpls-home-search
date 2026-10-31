import { afterEach, describe, expect, it, vi } from 'vitest';
import { assetUrl } from './assets';

afterEach(() => vi.unstubAllEnvs());

describe('public photo URLs', () => {
  it('keeps photos on the project site instead of the account root', () => {
    vi.stubEnv('BASE_URL', '/mpls-home-search/');
    expect(assetUrl('/photos/laurel-victorian-library.jpg'))
      .toBe('/mpls-home-search/photos/laurel-victorian-library.jpg');
  });

  it('also works on the original root-hosted site', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(assetUrl('/photos/hobe.jpg')).toBe('/photos/hobe.jpg');
  });
});
