import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GiFastForwardButton } from "react-icons/gi";
import axios from "../../network/AxiosClient";

import { userRepository } from "../../repository";
import { ROOM_CREATE_ROUTE_PATH } from "./RoomCreate";
import { ROOM_JOIN_ROUTE_PATH } from "./RoomJoin";

import "./Lobby.css";
import { ImPencil2 } from "react-icons/im";
import { WAITING_ROOM_ROUTE_PATH } from "../WaitingRoom/WaitingRoom";

import { Link } from "react-router-dom";
import { RANKING_PAGE_ROUTE_PATH } from "../RankingPage/RankingPage";

export default function Lobby() {
    const navigate = useNavigate();

    const [userProfile, setUserProfile] = useState(
        userRepository.getUserProfile()
    );
    // 현재 닉네임 상태 (TODO : 수정 가능)
    const [currentNickname, setNickname] = useState("");

    useEffect(() => {
        if (userProfile === null) {
            navigate("/");
        } else {
            setNickname(userProfile.nickname);
        }
    }, [userProfile, navigate]);

    const onNicknameChangeBtnClicked = (e) => {
        e.preventDefault();
        // TODO : 닉네임 변경 기능 구현 (관련 API가 없어 현재 disabled 상태)
        // userRepository.setUserProfile({
        //     ...userProfile,
        //     nickname: currentNickname,
        // });
        // setUserProfile({ ...userProfile, nickname: currentNickname });
    };

    const onCreateRoomBtnClicked = (e) => {
        e.preventDefault();
        navigate(ROOM_CREATE_ROUTE_PATH);
    };

    const onExistRoomJoinBtnClicked = (e) => {
        e.preventDefault();
        navigate(ROOM_JOIN_ROUTE_PATH);
    };

    const onRandomRoomJoinBtnClicked = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`/api/rooms/join`);
            if (res.status === 200) {
                navigate(
                    `${WAITING_ROOM_ROUTE_PATH}?room-number=${res.data.roomId}&room-password=`
                );
            } else {
                toast.error("방을 새로 만들어 주세요.");
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    toast.error("해당하는 방이 없습니다.");
                } else if (error.response.status === 401) {
                    toast.error("비밀번호가 틀립니다.");
                } else if (error.response.status === 409) {
                    toast.error("이미 8명이 참가한 방입니다.");
                } else {
                    toast.error("방 참가 중 오류가 발생했습니다.");
                }
            } else if (error.request) {
                toast.error("서버로부터 응답을 받지 못했습니다.");
            } else {
                toast.error("요청을 보내는 중 오류가 발생했습니다.");
            }
        }
    };

    const onRankingPageBtnClicked = (e) => {
        e.preventDefault();
        navigate(RANKING_PAGE_ROUTE_PATH);
    };

    return (
        <div id="container" className="rpgui-cursor-default">
            <div className="wrapper rpgui-content">
                <div className="background-overlay"></div>
                <div>
                    <div className="rpgui-container framed main-frame">
                        <h1> Hi !! </h1>
                        <h2>{currentNickname} </h2>
                        <h1>Enjoy your game by</h1>
                    </div>
                    <div className="button-box-lobby">
                        <button onClick={onCreateRoomBtnClicked}>
                            click!
                            <GiFastForwardButton />
                            <h2>새로운 방으로 시작하기</h2>
                        </button>
                    </div>
                    <hr className="grey"></hr>
                    <div className="button-box-lobby">
                        <button onClick={onExistRoomJoinBtnClicked}>
                            click!
                            <GiFastForwardButton />
                            <h2>초대 받은 방으로 이동</h2>
                        </button>
                    </div>
                    <hr className="grey"></hr>
                    <div className="button-box-lobby">
                        <button onClick={onRandomRoomJoinBtnClicked}>
                            click!
                            <GiFastForwardButton />
                            <h2>즉시 게임 시작하기!</h2>
                        </button>
                    </div>
                    <hr className="grey"></hr>
                    {/* 랭킹 페이지로 이동하는 버튼 추가 */}
                    <div className="button-box-lobby">
                        <button onClick={onRankingPageBtnClicked}>
                            click!
                            <GiFastForwardButton />
                            <h2>랭킹 보기</h2>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const LOBBY_ROUTE_PATH = "/Lobby";
