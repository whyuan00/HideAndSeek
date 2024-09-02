package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.game.item.ItemUseReq;
import com.ssafy.a410.game.domain.game.message.request.InteractSeekReq;
import com.ssafy.a410.game.domain.game.message.request.InteractHideReq;

public interface InteractService {

    void hideOnHPObject(InteractHideReq interactHideReq);

    void seekObject(InteractSeekReq interactSeekReq);

    void useItem(ItemUseReq itemUseReq);
}