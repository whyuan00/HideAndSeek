import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GiFastForwardButton } from "react-icons/gi";
import axios from "../../network/AxiosClient";
import { userRepository } from "../../repository";
import { WAITING_ROOM_ROUTE_PATH } from "../WaitingRoom/WaitingRoom";

import "./Lobby.css";

export default function RoomCreate() {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(
        userRepository.getUserProfile()
    );
    const [roomPassword, setRoomPassword] = useState("");

    useEffect(() => {
        if (userProfile === null) {
            navigate("/");
        }
    }, []);

    // 방 만들기
    const onCreateRoomBtnClicked = async (e) => {
        e.preventDefault();
        // 방을 생성하여 정보를 받아오고
        const res = await axios.post(`/api/rooms`, {
            password: roomPassword,
        });
        const { roomNumber } = res.data;

        navigate(
            `${WAITING_ROOM_ROUTE_PATH}?room-number=${roomNumber}&room-password=${roomPassword}`
        );
    };

    return (
        <div id="container" className="rpgui-cursor-default">
            <div className="wrapper rpgui-content">
                <div className="rpgui-container framed main-frame">
                    <h2>비밀번호 입력 시 새로운 방이 만들어집니다</h2>
                    <input
                        className="input-box"
                        type="number"
                        placeholder="(생략시 방에 누구나 들어올 수 있음)"
                        onChange={(e) => setRoomPassword(e.target.value)}
                    ></input>
                    <button
                        className="rpgui-button"
                        onClick={onCreateRoomBtnClicked}
                    >
                        <p>Start!</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

export const ROOM_CREATE_ROUTE_PATH = "/RoomCreate";
