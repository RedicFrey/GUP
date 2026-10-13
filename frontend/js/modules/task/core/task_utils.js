const API_BASE = "http://localhost:5000";

export const escapeHtml = (v = '') => String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const isResponsible = (profile_type) => profile_type === "responsible";

export const proofFileName = (path = '') => String(path).split(/[\\/]/).pop();

export const proofUrl = (path = '') => {
    const clean = String(path).replace(/\\/g, '/').replace(/^\/+/, '');
    if (!clean) return '';

    if (clean.startsWith('http://') || clean.startsWith('https://')) {
        return clean;
    }

    if (clean.startsWith('static/')) {
        return `${API_BASE}/${clean}`;
    }
    
    if (clean.startsWith('uploads/')) {
        return `${API_BASE}/static/${clean}`;
    }

    return `${API_BASE}/static/uploads/proofs/${clean}`;
};

