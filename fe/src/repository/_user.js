class UserRepository {
    #userProfile;
    #isLoggedIn;

    constructor() {
        this.#userProfile = null;
        this.#isLoggedIn = false;
    }

    setUserProfile(userProfile) {
        this.#userProfile = userProfile;
    }

    getUserProfile() {
        return this.#userProfile;
    }

    setNickname(nickname) {
        this.#userProfile.nickname = nickname;
    }

    getNickname() {
        return this.#userProfile.nickname;
    }

    getRole() {
        return this.#userProfile.role;
    }

    setIsLoggedIn(isLoggedIn) {
        this.#isLoggedIn = isLoggedIn;
    }

    getIsLoggedIn() {
        return this.#isLoggedIn;
    }
}

export default UserRepository;
