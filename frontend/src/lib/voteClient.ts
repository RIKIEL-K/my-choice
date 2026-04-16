import axios from "axios";
const voteClient = axios.create({
    baseURL:
        import.meta.env.VITE_VOTE_SERVICE_URL || "http://127.0.0.1:8002/api/v1",
    withCredentials: true,
});

export { voteClient };
