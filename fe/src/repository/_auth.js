class AuthRepository {
    #accessToken;

    constructor() {
        this.#accessToken = null;
    }

    setAccessToken(token) {
        this.#accessToken = token;
    }

    getAccessToken() {
        return this.#accessToken;
    }
}

export default AuthRepository;
