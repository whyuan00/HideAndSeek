import AuthRepository from "./_auth";
import UserRepository from "./_user";
import RoomRepository from "./_room";

export const authRepository = new AuthRepository();
export const userRepository = new UserRepository();

let roomRepository = null;
export const getRoomRepository = function (roomNumber, roomPassword) {
    if (roomNumber) {
        roomRepository = new RoomRepository(roomNumber, roomPassword);
    }
    if (!roomRepository) {
        if (!roomNumber) {
            throw new Error("RoomRepository is not initialized");
        } else {
            roomRepository = new RoomRepository(roomNumber, roomPassword);
        }
    }
    return roomRepository;
};
