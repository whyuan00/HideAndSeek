import React, { useState } from 'react';
import Modal from 'react-modal';
import './GameInformation.css';
import "/public/rpgui/rpgui.css";

const slides = [
    {
        text: <h1 className="custom-heading">게임 구조</h1>,
        description:
                <><p>플레이어는 랜덤으로 너구리 팀과 여우 팀으로 나뉘어지고, </p>
                <p>숨는 역할과 찾는 역할을 서로 번갈아가며 상대팀 플레이어를 찾아내야 합니다.</p>
                </>,
        image: "/image/slide-1-character.png"
    },
    {
        text: <h1 className="custom-heading">숨는 역할</h1>,
        description:"주어진 시간 동안 통 속으로 숨어야 합니다. 시간 내에 숨지 못할 경우 탈락으로 처리됩니다.",
        image: "/image/slide-2-hide.png"
    },
    {
        text: <h1 className="custom-heading">찾는 역할</h1>,
        description:"숨기가 진행될 동안 움직일 수 없습니다. 찾을 수 있는 횟수에 제한이 있습니다.",
        image: "/image/slide-3-seek.png"
    },
    {
        text: <h1 className="custom-heading">맵</h1>,
        description:"라운드가 지날수록 숨거나 탐색할 수 있는 맵의 크기가 점점 줄어듭니다.",
        image: "/image/slide-4-map.png"
    },
    {
        text: <h1 className="custom-heading">방향 힌트</h1>,
        description:
                <><p>상대팀 플레이어를 찾기 시작할 때 상대방의 대략적인 위치가 잠시 표시됩니다.</p>
                <p>이를 전략적으로 활용하여 빠르게 승리하거나, 상대를 교란할 수 있습니다.</p>
                </>,
        image: "/image/slide-5-direction.png"
    },
    {
        text: <h1 className="custom-heading">아이템</h1>,
        description:"키를 눌러서 아이템을 사용할 수 있습니다",
        image: "/image/slide-6-item.png"
    },
    {
        text: <h1 className="custom-heading">랭킹</h1>,
        description:"랭킹을 통해 순위를 확인할 수 있습니다",
        image: "/image/slide-7-ranking.png"
    }
];

const GameInformation = () => { 
    const [informationIsOpen, setInformationIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const openInformation = () => {
        setCurrentSlide(0);
        setInformationIsOpen(true); //설명을 열 때 슬라이드를 처음부터 다시 보기
    };
    const closeInformation = () => setInformationIsOpen(false);

    const handleNext = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    };

    const handlePrev = () => {
        setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
    };

    return (
        <div className='information-container'>
            <button onClick={openInformation} className='info-button'>
                <img src="/image/menu-button-ui.png" alt="게임 설명" />
            </button>
            <Modal
                isOpen={informationIsOpen}
                onRequestClose={closeInformation}
                className="modal-content rpgui-container framed"
                overlayClassName="modal-overlay"
                closeTimeoutMS={300}
            >
                <button onClick={closeInformation} className="close-button">
                    <img src="/image/close-button-ui.png" alt="닫기" />
                </button>
                <div className="slide">
                    <div className="slide-text">{slides[currentSlide].text}</div>
                    <div className="slide-description">{slides[currentSlide].description}</div>
                    <img src={slides[currentSlide].image} alt={`Slide ${currentSlide}`} className="slide-image" />
                </div>
                <button className="prev-button" onClick={handlePrev}>
                    <img src="/image/left-button-ui.png" alt="이전" />
                </button>
                <button className="next-button" onClick={handleNext}>
                    <img src="/image/right-button-ui.png" alt="다음" />
                </button>
            </Modal>
        </div>
    );
};

export default GameInformation;
