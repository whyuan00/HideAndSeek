import { Client } from "@stomp/stompjs";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

let _stompClient;
let proxy;
export const getStompClient = async (handshakeToken) => {
    // 이미 초기화 되었다면 초기화된 인스턴스를 반환
    if (!proxy) {
        // 초기화가 안되었으면, 무조건 한 번은 handshakeToken이 있어야 함
        if (!handshakeToken) {
            throw new Error("handshakeToken is required");
        } else {
            // Socket initialization lock =================================================
            await mutex.acquire();
            // Lock을 얻고 들어와도, 이미 _stompClient가 초기화 되어 있으면 다시 초기화하지 않음
            if (!proxy) {
                // 클라이언트부터 초기화해주고
                _stompClient = new Client({
                    brokerURL: `${
                        import.meta.env.VITE_SOCKET_BASE_URL
                    }/ws?token=${handshakeToken}`,
                    onConnect: async () => {},
                });
                _stompClient.activate();
                // 프록시 객체로 감싸 반환
                proxy = new StompClientProxy(_stompClient);
            }
            mutex.release();
            // Socket initialization lock =================================================
        }
    }
    return proxy;
};

class StompClientProxy {
    constructor(stompClient) {
        this._stompClient = stompClient;
    }

    async #waitUntilConnected(callback) {
        if (this._stompClient.connected) {
            return callback();
        } else {
            let retrial = setInterval(() => {
                if (this._stompClient.connected) {
                    clearTimeout(retrial);
                    return callback();
                }
            }, 50);
        }
    }

    async subscribe(subscriptionInfo, callback, additionalHeaders) {
        return this.#waitUntilConnected(() =>
            this._stompClient.subscribe(subscriptionInfo.topic, callback, {
                subscriptionToken: subscriptionInfo.token,
                ...additionalHeaders,
            })
        );
    }

    async publish(params) {
        return this.#waitUntilConnected(() =>
            this._stompClient.publish(params)
        );
    }

    async deactivate() {
        return this.#waitUntilConnected(() => {
            this._stompClient.deactivate();
        });
    }
}
