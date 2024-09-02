const isPressed = {};

// keyCode에 대응되는 키가 눌려 있음을 처음 감지했을 때 true를 반환
export function isFirstPress(keyCode, isDown) {
    // 눌려 있음이 감지되었다면 이전에 눌려있었는지 확인해서
    if (isDown) {
        // 눌려있었다면 false 반환
        if (isPressed[keyCode]) {
            return false;
        }
        // 눌려있지 않았다면
        else {
            // 눌려있음을 기록하고 true 반환
            isPressed[keyCode] = true;
            return true;
        }
    }
    // 눌려 있음이 감지되지 않았다면
    else {
        // 눌려있음을 기록하지 않고 false 반환
        isPressed[keyCode] = false;
        return false;
    }
}
