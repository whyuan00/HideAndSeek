class AsyncResponses {
    #responses = {};

    set(requestId, result) {
        const { type, data } = result;

        this.#responses[requestId] = {
            type,
            data,
        };
    }

    async get(requestId) {
        return new Promise((resolve) => {
            const awaiter = setInterval(() => {
                if (this.#responses[requestId]) {
                    // 반복 중지
                    clearInterval(awaiter);
                    // 데이터 반환
                    const result = this.#responses[requestId];
                    // 데이터 삭제
                    this.remove(requestId);

                    return resolve(result);
                }
            }, 50);
        });
    }

    remove(key) {
        delete this.#responses[key];
    }
}

export default new AsyncResponses();
