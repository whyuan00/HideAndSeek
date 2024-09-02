import { createBrowserRouter } from "react-router-dom";

import LoginForm, { LOGIN_FORM_ROUTE_PATH } from "../pages/LoginForm/LoginForm";
import Lobby, { LOBBY_ROUTE_PATH } from "../pages/Lobby/Lobby";
import RoomCreate, { ROOM_CREATE_ROUTE_PATH } from "../pages/Lobby/RoomCreate";
import RoomJoin, { ROOM_JOIN_ROUTE_PATH } from "../pages/Lobby/RoomJoin";
import WaitingRoom, {
    WAITING_ROOM_ROUTE_PATH,
} from "../pages/WaitingRoom/WaitingRoom";
import PhaserGame, { PHASER_GAME_ROUTE_PATH } from "../game/PhaserGame";
import GameResult, {
    RESULT_ROOM_ROUTE_PATH,
} from "../pages/GameResult/GameResult";
import RankingPage, { RANKING_PAGE_ROUTE_PATH } from "../pages/RankingPage/RankingPage";

const Router = createBrowserRouter([
    {
        path: LOGIN_FORM_ROUTE_PATH,
        element: <LoginForm />,
        // errorElement:<NotFound />
    },
    {
        path: LOBBY_ROUTE_PATH,
        element: <Lobby />,
        // errorElement:<NotFound />
    },
    {
        path: ROOM_CREATE_ROUTE_PATH,
        element: <RoomCreate />,
        // errorElement:<NotFound />
    },
    {
        path: ROOM_JOIN_ROUTE_PATH,
        element: <RoomJoin />,
        // errorElement:<NotFound />
    },
    {
        path: WAITING_ROOM_ROUTE_PATH,
        element: <WaitingRoom />,
        // errorElement:<NotFound />
    },
    {
        path: PHASER_GAME_ROUTE_PATH,
        element: <PhaserGame />,
        // errorElement:<NotFound />
    },
    {
        path: RESULT_ROOM_ROUTE_PATH,
        element: <GameResult />,
    },
    {
        path: RANKING_PAGE_ROUTE_PATH,
        element: <RankingPage />,
    },
]);

export default Router;
