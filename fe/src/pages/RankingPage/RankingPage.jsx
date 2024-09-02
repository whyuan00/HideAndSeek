import { useState, useEffect } from "react";
import axios from "../../network/AxiosClient";
import { useInView } from "react-intersection-observer";
import { BackToLobbyButton } from "../WaitingRoom/WaitingRoomComponents";
import "./RankingPage.css";
import { LOBBY_ROUTE_PATH } from "../Lobby/Lobby";
import { useNavigate } from "react-router-dom";

export const RANKING_PAGE_ROUTE_PATH = "/ranking";

function RankingPage() {
    const [ranking, setRanking] = useState([]);
    const [myRanking, setMyRanking] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [sortCriteria, setSortCriteria] = useState("wins");
    const [error, setError] = useState(null);
    const { ref, inView } = useInView();
    const navigate = useNavigate();

    useEffect(() => {
        if (inView && hasMore) {
            loadMoreRankings();
        }
    }, [inView, hasMore]);

    useEffect(() => {
        setPage(1);
        setRanking([]);
        setHasMore(true);
        loadMoreRankings(true);
        loadMyRanking();
    }, [sortCriteria]);

    const loadMoreRankings = (reset = false) => {
        const apiUrl = `/api/rankings/${sortCriteria}?page=${page}&size=10`;

        axios
            .get(apiUrl)
            .then((response) => {
                const data = response.data;

                //let slicedData = data.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

                if (Array.isArray(data)) {
                    setRanking((prev) => (reset ? data : [...prev, ...data]));
                } else if (data.results && Array.isArray(data.results)) {
                    setRanking((prev) =>
                        reset ? data.results : [...prev, ...data.results]
                    );
                } else {
                }

                if (
                    data.length === 0 ||
                    (data.results && data.results.length === 0)
                ) {
                    setHasMore(false);
                }
            })
            .catch((error) => {
                setError("Failed to load rankings. Please try again later.");
            });
    };

    const loadMyRanking = () => {
        axios
            .get("/api/rankings/me")
            .then((response) => setMyRanking(response.data))
            .catch((error) => {
                setError("Failed to load your ranking. Please try again later.");
            });
    };

    const onBackToLobbyBtnClicked = () => {
        navigate(LOBBY_ROUTE_PATH);
    };

    return (
        <div className="ranking-wrapper rpgui-content">
            <BackToLobbyButton onClick={onBackToLobbyBtnClicked} isDisabled={false} />
            {/*{error && <div className="error-message">{error}</div>} */}
             <div className="ranking-board my-ranking rpgui-container framed" style={{ overflow: "auto" }}>
                    <h2>Your Ranking</h2>
                    {myRanking ? (
                        <>
                            <span className="nickname-style">Nickname : {myRanking.nickname}</span>
                            <p>Wins : {myRanking.wins}</p>
                            <p>Catch Count: {myRanking.catchCount}</p>
                            <p>Survival Time: {myRanking.formattedSurvivalTime}</p>
                        </>
                    ) : (
                        <span className="nickname-style">데이터가 없습니다</span>
                    )}
                </div>

                <div className="ranking-board ranking-log rpgui-container framed" style={{ overflow: "auto" }}>
                <ul>
                    {Array.isArray(ranking) &&
                        ranking.slice(0, 10).map((user, index) => (
                            <li key={index} className="ranking-item">
                                {index + 1}. <span className="nickname-style">{user.nickname}</span> - Wins: {user.wins}
                                , Catch Count: {user.catchCount}, Survival Time: {user.formattedSurvivalTime}
                            </li>
                        ))}
                    <div ref={ref} />
                </ul>
            </div>

            <div className="ranking-controls">
                <button
                    className="rpgui-button"
                    onClick={() => setSortCriteria("wins")}
                >
                    <h2>승수 순</h2>
                </button>
                <button
                    className="rpgui-button"
                    onClick={() => setSortCriteria("catch-count")}
                >
                    <h2>잡은 수 순</h2>
                </button>
                <button
                    className="rpgui-button"
                    onClick={() => setSortCriteria("survival-time")}
                >
                    <h2>생존시간 순</h2>
                </button>
            </div>
        </div>
    );
}

export default RankingPage;
