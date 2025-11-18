export function getNpzNamespace(): string {
  return process.env.NPZ_NAMESPACE || 'npz';
}

export default { getNpzNamespace };
