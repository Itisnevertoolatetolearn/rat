import { clientServer } from "../..";
import StreamMessage from "../../../../shared/src/messages/stream";
import ScreenTemplate from "../../../../shared/src/templates/screen";
import WebClient from "../webClient";
import { MessageHandler } from "./index";

class ScreenHandler implements MessageHandler<ScreenTemplate> {

    public handle(client: WebClient, data: ScreenTemplate) {
        clientServer.getById(data.id).send(new StreamMessage(data));
    }
}

export default ScreenHandler;
