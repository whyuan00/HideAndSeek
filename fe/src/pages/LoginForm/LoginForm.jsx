import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { RiChatSmile3Fill } from "react-icons/ri";

import axios, { updateAxiosAccessToken } from "../../network/AxiosClient";
import { getStompClient } from "../../network/StompClient";
import { userRepository } from "../../repository";

import { LOBBY_ROUTE_PATH } from "../Lobby/Lobby";

import "./LoginForm.css";
import "/public/rpgui/rpgui.css";

export default function LoginForm() {
    const navigate = useNavigate();

    const [action, setAction] = useState(""); // wrapper class activate
    const [username, setUsername] = useState(""); // 로그인 사용자명
    const [password, setPassword] = useState(""); // 로그인 비밀번호
    const [registUsername, setRegistUsername] = useState(""); // 회원가입 사용자명
    const [registPassword, setRegistPassword] = useState(""); // 회원가입 비밀번호
    const [nickname, setNickname] = useState(""); //회원가입 닉네임
    const [loginErrorMessage, setLoginErrormessage] = useState("");
    const [registerErrorMessage, setRegisterErrormessage] = useState("");

    const changeToRegisterForm = (e) => {
        e.preventDefault();
        setAction("active");
    };

    const changeToLoginForm = (e) => {
        e.preventDefault();
        setAction("");
    };

    const onGuestLoginBtnClicked = async () => {
        axios
            .post(`/api/auth/guest/sign-up`)
            .then((resp) => {
                const { accessToken, userProfile, webSocketConnectionToken } =
                    resp.data;
                // 인증 및 사용자 정보 초기화
                updateAxiosAccessToken(accessToken);
                userRepository.setUserProfile(userProfile);

                // STOMP Client 초기화
                getStompClient(webSocketConnectionToken);

                // 로비로 이동
                navigate(LOBBY_ROUTE_PATH);
            })
            .catch((error) => {
                throw new Error("게스트 로그인 실패");
            });
    };

    const doLoginAndMoveToLobby = async (e, username, password) => {
        e.preventDefault();
        axios
            .post(`api/auth/login`, {
                loginId: username,
                password: password,
            })
            .then((resp) => {
                const { accessToken, userProfile, webSocketConnectionToken } =
                    resp.data;
                // 인증 및 사용자 정보 초기화
                updateAxiosAccessToken(accessToken);
                userRepository.setUserProfile(userProfile);

                // STOMP Client 초기화
                getStompClient(webSocketConnectionToken);

                // 로비로 이동
                navigate(LOBBY_ROUTE_PATH);
            })
            .catch((error) => {
                const data = error.response.data;
                if (data.detailCode === "E401002") {
                    setLoginErrormessage("※존재하지 않는 아이디입니다.");
                } else if (data.detailCode === "E401003") {
                    setLoginErrormessage("※존재하지 않는 비밀번호입니다.");
                }
            });
    };

    //회원가입
    const doRegister = async (e, username, password, nickname) => {
        e.preventDefault();
        //회원가입
        try {
            // 회원가입
            const signUpResp = await axios.post(`api/auth/sign-up`, {
                loginId: username,
                password: password,
                nickname: nickname,
            });

            const userProfile = signUpResp.data;
            userRepository.setUserProfile(userProfile);

            // 로그인
            const loginResp = await axios.post(`api/auth/login`, {
                loginId: username,
                password: password,
            });
            //userProfile 초기화는 로그인단계에서는 생략
            const { accessToken, profile, webSocketConnectionToken } =
                loginResp.data;

            // 인증 및 사용자 정보 초기화
            updateAxiosAccessToken(accessToken);
            userRepository.setUserProfile(loginResp.data.userProfile);

            // STOMP Client 초기화
            getStompClient(webSocketConnectionToken);

            // 로비로 이동
            navigate(LOBBY_ROUTE_PATH);
        } catch (error) {
            const data = error.response?.data;
            if (data?.detailCode === "E409008") {
                setRegisterErrormessage("※사용 중인 닉네임 입니다");
            } else if (data?.detailCode === "E409007") {
                setRegisterErrormessage("※사용 중인 아이디 입니다");
            } else if (data?.nickname) {
                setRegisterErrormessage("※별명은 최대 8자까지 가능합니다.");
            } else if (data?.loginId) {
                setRegisterErrormessage(
                    "※ID는 알파벳과 숫자로 최대 20자 까지 가능합니다."
                );
            } else if (data?.password) {
                setRegisterErrormessage(
                    "※비밀번호는 최소 4자리 이상이어야 합니다."
                );
            } else {
                setRegisterErrormessage("※네트워크 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div id="container" className="rpgui-cursor-default">
            <div id="logo-area">
                <img id="logo-img" src="image/logo.png" alt="logo" />
            </div>
            <div className={`wrapper ${action} `}>
                <div className="form-box login rpgui-container framed">
                    <form className="input-form">
                        <h1>Welcome!</h1>
                        <div className="input-box ">
                            <FaUser className="icon" />
                            <input
                                type="text"
                                placeholder="ID"
                                id="username"
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="input-box ">
                            <FaLock className="icon" />
                            <input
                                type="password"
                                placeholder="Password"
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <p id="errorMessage"> {loginErrorMessage} </p>
                        <div className="button-box rpgui-content">
                            <div className="button-box-top">
                                <button
                                    className="rpgui-button "
                                    onClick={(e) =>
                                        doLoginAndMoveToLobby(
                                            e,
                                            username,
                                            password
                                        )
                                    }
                                >
                                    <p>LOGIN</p>
                                </button>
                                <button
                                    className="rpgui-button"
                                    onClick={changeToRegisterForm}
                                >
                                    <p>JOIN</p>
                                </button>
                            </div>
                            <div className="register-link">
                                <button
                                    className="guest rpgui-button"
                                    type="button"
                                    onClick={onGuestLoginBtnClicked}
                                >
                                    <p>GUEST</p>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="form-box register rpgui-container framed">
                    <form className="input-form">
                        <h1>Registration</h1>
                        <div className="input-box ">
                            <RiChatSmile3Fill className="icon" />
                            <input
                                type="text"
                                placeholder="nickname"
                                id="nickname"
                                onChange={(e) => setNickname(e.target.value)}
                            />
                        </div>
                        <div className="input-box">
                            <FaUser className="icon" />
                            <input
                                type="text"
                                placeholder="ID"
                                id="register-username"
                                onChange={(e) =>
                                    setRegistUsername(e.target.value)
                                }
                            />
                        </div>
                        <div className="input-box">
                            <FaLock className="icon" />
                            <input
                                type="password"
                                placeholder="Password"
                                id="register-password"
                                onChange={(e) =>
                                    setRegistPassword(e.target.value)
                                }
                            />
                        </div>
                        <p id="errorMessage">{registerErrorMessage}</p>
                        <div className="register-link rpgui-content">
                            <button
                                className="rpgui-button"
                                onClick={(e) =>
                                    doRegister(
                                        e,
                                        registUsername,
                                        registPassword,
                                        nickname
                                    )
                                }
                            >
                                <p> REGISTER</p>
                            </button>
                            <button
                                className="rpgui-button"
                                onClick={changeToLoginForm}
                            >
                                <p> Back </p>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export const LOGIN_FORM_ROUTE_PATH = "/";
