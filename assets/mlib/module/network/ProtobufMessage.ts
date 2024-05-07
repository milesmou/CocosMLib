export type ProtobufMessage = {
    create(properties?: any): any;
    encode(message: any, writer?: any): any;
    decode(reader?: any, length?: number): any;
    verify(message?: any): any;
    fromObject(object: any): any;
    toObject(message?: any, options?: any);
    getTypeUrl(typeUrlPrefix?: string): string;
}