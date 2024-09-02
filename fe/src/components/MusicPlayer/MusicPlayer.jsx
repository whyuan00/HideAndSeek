import { useState, useEffect, useRef } from "react";

import { PHASER_GAME_ROUTE_PATH } from "../../game/PhaserGame";

import "./MusicPlayer.css";
export const NORMAL_MUSIC = "/sounds/music/default_music.wav";
export const FAST_MUSIC = "/sounds/music/fast_music.wav";

class SoundTrackByRoute {
    constructor() {
        this.defaultSoundTrack = NORMAL_MUSIC;

        this.soundTrackByRoute = {
            [PHASER_GAME_ROUTE_PATH]: FAST_MUSIC,
        };
    }

    getSoundTrackByRoute = (route) => {
        return this.soundTrackByRoute[route] || this.getDefaultSoundTrack();
    };

    getDefaultSoundTrack = () => {
        return this.defaultSoundTrack;
    };

    getRouteBySoundTrack = (soundTrack) => {
        return Object.keys(this.soundTrackByRoute).find(
            (route) => this.soundTrackByRoute[route] === soundTrack
        );
    };

    isCorrectSoundTrack = (route, soundTrack) => {
        const expectedSoundTrack = this.getSoundTrackByRoute(route);
        return soundTrack.endsWith(expectedSoundTrack);
    };
}

const soundTrackByRoute = new SoundTrackByRoute();

export default function MusicPlayer() {
    const [bgmTrack, setBgmTrack] = useState(NORMAL_MUSIC);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const onAudioPlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
        }
    };

    const onAudioPause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const onMusicEnded = () => {
        if (isPlaying) {
            onAudioPlay();
        }
    };

    const onSoundButtonClick = () => {
        if (isPlaying) {
            onAudioPause();
        } else {
            onAudioPlay();
        }
        setIsPlaying(!isPlaying);
    };

    // TODO : 게임 화면으로 이동했을 때 배경 음악 바꿔줘야 함
    useEffect(() => {
        audioRef.current.volume = 0.5;

        const checkUrlAndUpdateBgm = () => {
            const currentPath = window.location.pathname;
            if (
                soundTrackByRoute.isCorrectSoundTrack(
                    currentPath,
                    audioRef.current.src
                )
            ) {
                return;
            }

            audioRef.current.src =
                soundTrackByRoute.getSoundTrackByRoute(currentPath);
            if (isPlaying) {
                audioRef.current.play();
            }
        };

        // Check URL and update BGM track immediately
        checkUrlAndUpdateBgm();

        // Set up an interval to check the URL periodically
        const intervalId = setInterval(checkUrlAndUpdateBgm, 1000); // Check every second

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, [isPlaying]);

    return (
        <div className="music-player">
            <audio ref={audioRef} src={bgmTrack} onEnded={onMusicEnded} />
            <img
                className="music-player__sound-button"
                src={
                    isPlaying
                        ? "/image/sound-playing-button.png"
                        : "/image/sound-muted-button.png"
                }
                alt="Sound Button"
                onClick={onSoundButtonClick}
            />
        </div>
    );
}
