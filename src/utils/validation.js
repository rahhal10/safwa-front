export function validatePersonalInfo(data) {
  const errors = {};

  if (!data.phoneNumber || data.phoneNumber.trim().length === 0)
    errors.phoneNumber = 'validation.phoneInvalid';

  return errors;
}

export function validateAssetSelection(selected) {
  if (!selected || selected.length === 0)
    return { selection: 'validation.assetSelectionRequired' };
  return {};
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
