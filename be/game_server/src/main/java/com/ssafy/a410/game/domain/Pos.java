package com.ssafy.a410.game.domain;

import com.google.gson.JsonObject;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Pos {
    private double x;
    private double y;

    public Pos(JsonObject jsonObject) {
        this(jsonObject.get("x").getAsDouble(), jsonObject.get("y").getAsDouble());
    }

    public void update(double x, double y) {
        this.x = x;
        this.y = y;
    }
}
