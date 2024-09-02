package com.ssafy.a410.game.domain.game;


import com.google.gson.JsonObject;
import com.ssafy.a410.game.domain.Pos;
import lombok.Getter;

@Getter
public class GameObject {
    private final String id;
    private final Pos pos;

    public GameObject(JsonObject jsonObject) {
        this.id = jsonObject.get("id").getAsString();
        this.pos = new Pos(jsonObject);
    }
}
