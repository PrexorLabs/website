export const prerender = true;
// Paraglide writes localized links with a trailing slash (/de/), so pages are built as folders to match and a
// click never goes through a redirect.
export const trailingSlash = 'always';

export const load = () => ({ namespace: 'prexorlabs:air' });
