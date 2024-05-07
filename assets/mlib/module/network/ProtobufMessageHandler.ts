import { ProtobufMessage } from "./ProtobufMessage";

export class ProtobufMessageHandler {

    private static handlerMap: Map<number, ProtobufMessage>;

    public static setHandlerMap(handlers: Map<number, ProtobufMessage>) {
        this.handlerMap = handlers;
    }

    


}