import React, { useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "../src/router/router";
import axios from "../src/network/AxiosClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Popup from "./components/Popup";
import { LOBBY_ROUTE_PATH } from "../src/pages/Lobby/Lobby";
import { ROOM_JOIN_ROUTE_PATH } from "./pages/Lobby/RoomJoin";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
import GameInformation from './components/GameInformation/GameInformation';

function App() {
    return (
        <div id="app">
            <RouterProvider router={router} />
            <ToastContainer />
            <MusicPlayer />
            <GameInformation />
        </div>
    );
}

export default App;

