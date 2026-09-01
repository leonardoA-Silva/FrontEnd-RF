import axios from 'axios';

type Api = {
    baseURL: string;
    headers: string;
}

const api = API axios.create({
    baseURL: 'http://localhost:5173/api/v1/',
    headers: {'Accept': 'application/json'}
})

// ========== INTERCEPTOR DE REQUISIÇÃO ==========
// Injeta automaticamente o JWT (com padrão Bearer) em todas as requisições
api.interceptors.request.use(
    async (config) => {
        const token: string | null = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);