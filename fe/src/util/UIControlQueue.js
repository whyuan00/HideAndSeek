export class MESSAGE_TYPE {
    static TOP_CENTER_MESSAGE = "TOP_CENTER_MESSAGE";
    static HIDE_SEEK_COUNT_UI = "HIDE_SEEK_COUNT_UI";
    static SHOW_SEEK_COUNT_UI = "SHOW_SEEK_COUNT_UI";
    static UPDATE_SEEK_COUNT_UI = "UPDATE_SEEK_COUNT_UI";
    static SURPRISE_CHICKEN = "SURPRISE_CHICKEN";
    static PLAYER_DEAD = "PLAYER_DEAD";
    static GAME_END = "GAME_END";
}

class UIControlQueue {
    #gameUiControlQueue = [];

    hasGameUiControlMessage() {
        return this.#gameUiControlQueue.length > 0;
    }

    getGameUiControlMessage() {
        return this.#gameUiControlQueue.shift();
    }

    addGameUiControlMessage(type, data) {
        this.#gameUiControlQueue.push({
            type,
            data,
        });
    }

    addPhaseChangeMessage(phase, finishAfterMilliSec) {
        this.addGameUiControlMessage(MESSAGE_TYPE.TOP_CENTER_MESSAGE, {
            phase,
            finishAfterMilliSec,
        });
    }

    addHideSeekCountUiMessage() {
        this.addGameUiControlMessage(MESSAGE_TYPE.HIDE_SEEK_COUNT_UI, {});
    }

    addShowSeekCountUiMessage() {
        this.addGameUiControlMessage(MESSAGE_TYPE.SHOW_SEEK_COUNT_UI, {});
    }

    addUpdateSeekCountUiMessage(restSeekCount) {
        this.addGameUiControlMessage(MESSAGE_TYPE.UPDATE_SEEK_COUNT_UI, {
            restSeekCount,
        });
    }

    addSurpriseChickenMessage() {
        this.addGameUiControlMessage(MESSAGE_TYPE.SURPRISE_CHICKEN, {});
    }

    addDeadMessage(reasonType, data) {
        this.addGameUiControlMessage(MESSAGE_TYPE.PLAYER_DEAD, {
            reasonType,
            data,
        });
    }

    addGameEndMessage(redirectAfter) {
        this.addGameUiControlMessage(MESSAGE_TYPE.GAME_END, { redirectAfter });
    }
}

export default new UIControlQueue();
