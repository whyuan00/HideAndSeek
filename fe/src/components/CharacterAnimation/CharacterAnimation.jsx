// // CharacterAnimation.js
// import React, { useEffect, useState } from "react";
// import "./CharacterAnimation.css";

// const CharacterAnimation = () => {
//     const [characters, setCharacters] = useState([]);

//     useEffect(() => {
//         const addCharacter = () => {
//             setCharacters((prevCharacters) => [
//                 ...prevCharacters,
//                 { id: Date.now(), key: Math.random() },
//             ]);
//         };

//         // 랜덤 시간마다 새로운 캐릭터 추가
//         const interval = Math.floor(Math.random() * 4000) + 1000;
//         const timer = setInterval(() => {
//             addCharacter();
//             // 다음 랜덤 시간 계산
//             const newInterval = Math.floor(Math.random() * 4000) + 1000;
//             clearInterval(timer);
//             setInterval(() => {
//                 addCharacter();
//                 const newInterval = Math.floor(Math.random() * 4000) + 1000;
//                 clearInterval(timer);
//                 setInterval(() => addCharacter(), newInterval);
//             }, newInterval);
//         }, interval);

//         return () => clearInterval(timer);
//     }, []);

//     return (
//         <div className="animation-container">
//             {characters.map((character) => (
//                 <div
//                     key={character.id}
//                     className="character"
//                     style={{ animationDelay: `${Math.random() * 5}s` }} // 애니메이션 시작 지연 시간
//                 ></div>
//             ))}
//         </div>
//     );
// };

// export default CharacterAnimation;
