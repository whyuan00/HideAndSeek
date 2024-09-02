import PropTypes from "prop-types";
import {
    forwardRef,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import StartGame from "./main";
import eventBus from "./EventBus";
import { useNavigate } from "react-router-dom";
import { LOBBY_ROUTE_PATH } from "../pages/Lobby/Lobby";
import axios from "../network/AxiosClient";

export const PhaserGame = forwardRef(function PhaserGame(
    { currentActiveScene },
    ref
) {
    const game = useRef();
    const [isGameDestroyed, setIsGameDestroyed] = useState(false);
    const navigate = useNavigate();

    useLayoutEffect(() => {
        if (game.current === undefined && isGameDestroyed === false) {
            game.current = StartGame("game-container");

            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
                setIsGameDestroyed(true);
            }
        };
    }, [ref]);

    useEffect(() => {
        eventBus.on("current-scene-ready", (currentScene) => {
            if (currentActiveScene instanceof Function) {
                currentActiveScene(currentScene);
            }
            if (ref.current) {
                ref.current.scene = currentScene;
            }
        });

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
            eventBus.removeListener("current-scene-ready");
        };
    }, [currentActiveScene, ref]);

    useEffect(() => {
        // 라우팅 이벤트 리스너 설정
        const handleRoutingEvent = (event) => {
            const { path, roomNumber, password } = event.detail;
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
                setIsGameDestroyed(true);
            }

            if (event.type === "phaser-route-lobby") {
                // 방 나가기 결과에 상관없이 로비로 이동
                axios.post(`/api/rooms/${roomNumber}/leave`).finally(() => {
                    navigate(path, { replace: true });
                });
            } else if (event.type === "phaser-route-back-to-room") {
                // 방으로 돌아가기 (비밀번호 필요)
                const roomPath = `${path}?room-number=${roomNumber}&room-password=${password}`;
                navigate(roomPath, { replace: true });
            }
        };

        window.addEventListener("phaser-route-lobby", handleRoutingEvent);
        window.addEventListener(
            "phaser-route-back-to-room",
            handleRoutingEvent
        );

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
                setIsGameDestroyed(true);
            }
            window.removeEventListener(
                "phaser-route-lobby",
                handleRoutingEvent
            );
            window.removeEventListener(
                "phaser-route-back-to-room",
                handleRoutingEvent
            );
        };
    }, [navigate]);

    return (
        <div id="game-container">
            <div
                id="rpgui-modal"
                className="rpgui-container framed"
                style={{
                    display: "none",
                    position: "absolute",
                    width: "800px",
                    height: "600px",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000,   
                    paddingBottom: "50px", // 하단 공간 확보
                }}
            >
                <div id="container" className="rpgui-cursor-default">
                    <div className="rpgui-content">
                        <div
                            id="stats-text"
                            style={{
                                maxHeight: "500px",
                                overflowY: "auto",
                                marginBottom: "20px",
                                padding: "10px",
                                boxSizing: "border-box",
                                imageRendering: "auto"
                            }}
                        >
                            Loading stats...
                        </div>
                        <div
                            className="rpgui-buttons"
                            style={{
                                position: "absolute",
                                bottom: "20px",
                                width: "100%",
                                textAlign: "center",
                            }}
                        >
                            <button id="lobby-button" className="rpgui-button">
                                <h2>로비로</h2>
                            </button>
                            <button
                                id="back-to-room-button"
                                className="rpgui-button"
                                style={{ marginLeft: "10px" }}
                            >
                                <h2>이전 방으로 돌아가기</h2>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export const PHASER_GAME_ROUTE_PATH = "/GameStart";

export default PhaserGame;

PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func,
};
