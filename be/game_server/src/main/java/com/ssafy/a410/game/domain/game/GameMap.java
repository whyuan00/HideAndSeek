package com.ssafy.a410.game.domain.game;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.ssafy.a410.game.domain.Pos;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;
import lombok.Getter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;

import java.awt.*;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;
import java.util.*;

@Getter
public class GameMap {
    private static final String TYPE_KEY = "type";
    private static final String NAME_KEY = "name";
    private static final String LAYER_KEY = "layers";
    private static final String OBJECTS_KEY = "objects";
    private static final String OBJECT_GROUP_KEY = "objectgroup";

    private static final String HP_LAYER_KEY = "HP";
    private static final String RACOON_START_LAYER_KEY = "Racoon-Start";
    private static final String FOX_START_LAYER_KEY = "Fox-Start";

    // 맵 파일의 이름 (경로 및 확장자 제외)
    private final String mapFileName;
    // HP 정보
    private final Map<String, HPObject> hpObjects = new HashMap<>();
    // 너구리 팀이 시작할 수 있는 초기 위치 정보
    private final List<Pos> racoonStartPos = new ArrayList<>();
    // 여우 팀이 시작할 수 있는 초기 위치 정보
    private final List<Pos> foxStartPos = new ArrayList<>();
    // 안전구역
    private final Rectangle safeZone;
    // 최종 안전구역
    private Rectangle finalSafeZone;
    // 읽어서 파싱해 놓은 원본 JSON 객체
    private JsonObject rawJsonObject;

    public GameMap(String mapFileName) throws IOException {
        this.mapFileName = mapFileName;
        setRawJsonObject();
        setFromLayers();
        this.safeZone = new Rectangle(0, 0, 1600, 1600);
        setRandomFinalSafeZone();
    }

    // 정적 파일로부터 맵 정보를 읽어와서 파싱
    private void setRawJsonObject() throws IOException {
        InputStream inputStream = new ClassPathResource(this.getMapFilePath()).getInputStream();
        String rawJson = FileCopyUtils.copyToString(new InputStreamReader(inputStream));
        this.rawJsonObject = JsonParser.parseString(rawJson).getAsJsonObject();
    }

    private void setFromLayers() {
        JsonArray layers = rawJsonObject.getAsJsonArray(LAYER_KEY);
        for (int layerIdx = 0; layerIdx < layers.size(); layerIdx++) {
            JsonObject layer = layers.get(layerIdx).getAsJsonObject();
            setFromLayerObject(layer);
        }
    }

    // 각 layer에 대해, 각각의 조건을 만족하면 해당 정보를 저장
    private void setFromLayerObject(JsonObject layer) {
        if (isHPLayer(layer)) {
            setHPObjects(layer);
        } else if (isRacoonStartPosLayer(layer)) {
            setRacoonStartPos(layer);
        } else if (isFoxStartPosLayer(layer)) {
            setFoxStartPos(layer);
        }
    }

    // 맵 파일의 경로를 반환
    private String getMapFilePath() {
        return String.format("static/game/maps/%s.json", mapFileName);
    }

    // 주어진 객체가 `objectgroup`인지 확인
    private boolean isObjectGroup(JsonObject layer) {
        return layer.get(TYPE_KEY).getAsString().equals(OBJECT_GROUP_KEY);
    }

    // 해당 layer의 `name` 프로퍼티가 주어진 `name`과 일치하는지 확인
    private boolean hasName(JsonObject layer, String name) {
        return layer.get(NAME_KEY).getAsString().equals(name);
    }

    // HP 정보가 담긴 layer인지 확인
    private boolean isHPLayer(JsonObject layer) {
        return isObjectGroup(layer) && hasName(layer, HP_LAYER_KEY);
    }

    // HP layer 정보를 읽어 HPObject로 변환, 저장
    private void setHPObjects(JsonObject layer) {
        for (JsonElement element : layer.getAsJsonArray(OBJECTS_KEY)) {
            HPObject gameObject = new HPObject(element.getAsJsonObject());
            hpObjects.put(gameObject.getId(), gameObject);
        }
    }

    // 너구리 팀이 시작할 수 있는 초기 위치 정보가 담긴 layer인지 확인
    private boolean isRacoonStartPosLayer(JsonObject layer) {
        return isObjectGroup(layer) && hasName(layer, RACOON_START_LAYER_KEY);
    }

    // 너구리 팀이 시작할 수 있는 초기 위치 정보를 읽어 저장
    private void setRacoonStartPos(JsonObject layer) {
        for (JsonElement element : layer.getAsJsonArray(OBJECTS_KEY)) {
            racoonStartPos.add(new Pos(element.getAsJsonObject()));
        }
    }

    // 여우 팀이 시작할 수 있는 초기 위치 정보가 담긴 layer인지 확인
    private boolean isFoxStartPosLayer(JsonObject layer) {
        return isObjectGroup(layer) && hasName(layer, FOX_START_LAYER_KEY);
    }

    // 여우 팀이 시작할 수 있는 초기 위치 정보를 읽어 저장
    private void setFoxStartPos(JsonObject layer) {
        for (JsonElement element : layer.getAsJsonArray(OBJECTS_KEY)) {
            foxStartPos.add(new Pos(element.getAsJsonObject()));
        }
    }

    public List<Pos> getStartPosBy(Team team) {
        return team.getCharacter() == Team.Character.RACOON ? racoonStartPos : foxStartPos;
    }

    public void setGameToHpObjects(Game game) {
        hpObjects.values().forEach(hpObject -> hpObject.setGame(game));
    }

    // 최종 안전구역 랜덤설정
    private void setRandomFinalSafeZone() {
        Random rand = new Random();
        int finalSafeZoneX = 320 + rand.nextInt(1280 - 320 - 320 + 1);
        int finalSafeZoneY = 160 + rand.nextInt(1440 - 160 - 320 + 1);
        this.finalSafeZone = new Rectangle(finalSafeZoneX, finalSafeZoneY, 320, 320);
    }

    // 라운드마다 안전구역 축소
    public void reduceSafeArea(int totalRounds, int currentRound) {
        // 초기 안전구역 설정
        int initialX = 0;
        int initialY = 0;
        int initialWidth = 1600;
        int initialHeight = 1600;

        if (currentRound < totalRounds) {
            double ratio = 1.0 - ((double) currentRound / totalRounds);

            // x, y 좌표와 width, height를 각 라운드마다 줄어들게 계산
            int newX = (int) (initialX * ratio + finalSafeZone.x * (1 - ratio));
            int newY = (int) (initialY * ratio + finalSafeZone.y * (1 - ratio));
            int newWidth = (int) (initialWidth * ratio + finalSafeZone.width * (1 - ratio));
            int newHeight = (int) (initialHeight * ratio + finalSafeZone.height * (1 - ratio));

            safeZone.setBounds(newX, newY, newWidth, newHeight);
        } else
            safeZone.setBounds(finalSafeZone);
    }

    // 안전구역의 네 꼭짓점 구하기
    public List<Integer> getSafeZoneCorners() {
        return List.of(
                safeZone.x, safeZone.y, // 왼쪽 위
                safeZone.x + safeZone.width, safeZone.y + safeZone.height // 오른쪽 아래
        );
    }

    // 안전구역 안에 플레이어가 있는지 계산
    public boolean isInSafeZone(Player player) {
        return safeZone.contains(player.getPos().getX(), player.getPos().getY());
    }
}
