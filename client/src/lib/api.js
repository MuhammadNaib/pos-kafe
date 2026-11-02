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

export async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/uploads', { method: 'POST', body: formData });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message ?? 'Upload gambar gagal');
    }

    return data.url;
}