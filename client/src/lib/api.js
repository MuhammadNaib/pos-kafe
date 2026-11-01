export async function api(path, options = {}) {
    const response = await fetch(`/api${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 204) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message ?? 'Terjadi kesalahan');
    }

    return data;
}