function pick(value, ...keys) {
  for (const key of keys) {
    if (value?.[key] !== undefined && value?.[key] !== null) return value[key];
  }
  return undefined;
}

export function mapUserFromApi(dto) {
  if (!dto) return null;
  return {
    id: pick(dto, 'id'),
    username: pick(dto, 'username') || '',
    email: pick(dto, 'email') || '',
    fullName: pick(dto, 'fullName', 'full_name') || '',
    phone: pick(dto, 'phone') || '',
    address: pick(dto, 'address') || '',
    role: pick(dto, 'role') || 'CUSTOMER',
    status: pick(dto, 'status') || 'ACTIVE',
    avatar: pick(dto, 'avatar') || '',
    createdAt: pick(dto, 'createdAt', 'created_at') || null,
  };
}

export function mapUserToApi(model) {
  return {
    fullName: model.fullName,
    email: model.email,
    phone: model.phone,
    address: model.address,
  };
}

export function mapAuthPayloadFromApi(payload) {
  const data = payload?.data ?? payload ?? {};
  return {
    token: data.token || data.accessToken || data.access_token || null,
    user: mapUserFromApi(data.user),
  };
}
