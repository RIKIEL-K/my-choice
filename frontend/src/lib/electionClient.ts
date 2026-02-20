import axios from "axios";

/**
 * Dedicated Axios client for the Election microservice.
 * Set VITE_ELECTION_API_URL in your .env to point to the service.
 * Falls back to localhost:8001 for local development.
 */
const electionClient = axios.create({
    baseURL:
        import.meta.env.VITE_ELECTION_API_URL || "http://127.0.0.1:8001/api/v1",
    withCredentials: true,
});

export { electionClient };
