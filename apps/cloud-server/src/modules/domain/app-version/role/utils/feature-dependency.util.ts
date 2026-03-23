// Verb-based feature dependency map — each verb requires the listed verbs to also be selected
const VERB_DEPENDENCIES: Record<string, string[]> = {
  create: ['view'],
  modify: ['view', 'create'],
  update: ['view', 'create'],
  delete: ['view'],
  cancel: ['view'],
  split: ['view', 'create'],
  merge: ['view', 'create'],
  transfer: ['view', 'create'],
  approve: ['view'],
  export: ['view'],
  assign: ['view'],
  configure: ['view'],
};

// Checks selected feature codes and returns any missing dependency codes
export function findMissingDependencies(selectedCodes: string[]): string[] {
  const codeSet = new Set(selectedCodes);
  const missing: string[] = [];

  for (const code of selectedCodes) {
    const segments = code.split('.');
    const verb = segments[segments.length - 1];
    const prefix = segments.slice(0, -1).join('.');
    const requiredVerbs = VERB_DEPENDENCIES[verb];

    if (!requiredVerbs || !prefix) continue;

    for (const requiredVerb of requiredVerbs) {
      const requiredCode = `${prefix}.${requiredVerb}`;
      if (!codeSet.has(requiredCode) && !missing.includes(requiredCode)) {
        missing.push(requiredCode);
      }
    }
  }

  return missing;
}
