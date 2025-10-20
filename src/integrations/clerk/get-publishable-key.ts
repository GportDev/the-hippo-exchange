const normalizeKey = (value: string | undefined | null) => value?.trim() ?? '';

export const getClerkPublishableKey = (): string => {
  const rawKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
    import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
    import.meta.env.CLERK_PUBLISHABLE_KEY ??
    '';

  const publishableKey = normalizeKey(rawKey);

  if (
    !publishableKey ||
    publishableKey === 'YOUR_PUBLISHABLE_KEY' ||
    publishableKey.toLowerCase().includes('your_publishable_key')
  ) {
    throw new Error(
      'Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY (or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) in your environment, e.g. inside the-hippo-exchange/.env.local, docker-compose env file, or shell session before starting the dev server.',
    );
  }

  return publishableKey;
};

export const getClerkFrontendApi = (): string | undefined => {
  const rawApi =
    import.meta.env.VITE_CLERK_FRONTEND_API ??
    import.meta.env.NEXT_PUBLIC_CLERK_FRONTEND_API ??
    import.meta.env.CLERK_FRONTEND_API ??
    '';

  const frontendApi = normalizeKey(rawApi);

  return frontendApi || undefined;
};
