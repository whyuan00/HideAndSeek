import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../network/AxiosClient";

import "./Lobby.css";
import { WAITING_ROOM_ROUTE_PATH } from "../WaitingRoom/WaitingRoom";

export default function RoomJoin() {
    const navigate = useNavigate();

    const [roomNumber, setRoomNumber] = useState("");
    const [roomPassword, setRoomPassword] = useState("");

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        navigate(
            `${WAITING_ROOM_ROUTE_PATH}?room-number=${roomNumber}&room-password=${roomPassword}`
        );
    };

    return (
        <div id="container" className="rpgui-cursor-default">
            <div className="wrapper rpgui-content">
                <div className="rpgui-container framed main-frame">
                    <h2>초대받은 방의 번호와 비밀번호를 입력하세요</h2>
                    <form onSubmit={handleJoinRoom}>
                            <input
                            className="input-box"
                            type="number"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="방 번호"
                            required
                            />
                            <input
                            className="input-box"
                            type="number"
                            value={roomPassword}
                            onChange={(e) => setRoomPassword(e.target.value)}
                            placeholder="비밀번호"
                            />
                        <button className="rpgui-button" type="submit">
                            <p>Start!</p>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export const ROOM_JOIN_ROUTE_PATH = "/RoomJoin";
