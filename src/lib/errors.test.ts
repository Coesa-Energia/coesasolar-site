import { describe, expect, it } from 'vitest';
import { getErrorCode, getErrorMessage } from './errors';

describe('error normalization', () => {
  it('normalizes Error, object and primitive failures', () => {
    expect(getErrorMessage(new Error('falhou'))).toBe('falhou');
    expect(getErrorMessage({ message: 'objeto' })).toBe('objeto');
    expect(getErrorMessage(null)).toBe('Erro desconhecido');
    expect(getErrorCode({ error_code: 'FOLDER_EXISTS' })).toBe('FOLDER_EXISTS');
  });
});
