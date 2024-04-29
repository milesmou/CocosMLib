declare global {
 export namespace pbroot{
 // DO NOT EDIT! This is a generated file. Edit the JSDoc in src/*.js instead and run 'npm run build:types'.

/** Properties of a PetSkill. */
export interface IPetSkill {

    /** PetSkill skill */
    skill?: (number|null);

    /** PetSkill skillBuffId */
    skillBuffId?: (number[]|null);
}

/** Represents a PetSkill. */
export class PetSkill implements IPetSkill {

    /**
     * Constructs a new PetSkill.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPetSkill);

    /** PetSkill skill. */
    public skill: number;

    /** PetSkill skillBuffId. */
    public skillBuffId: number[];

    /**
     * Creates a new PetSkill instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PetSkill instance
     */
    public static create(properties?: IPetSkill): PetSkill;

    /**
     * Encodes the specified PetSkill message. Does not implicitly {@link PetSkill.verify|verify} messages.
     * @param message PetSkill message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPetSkill, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PetSkill message, length delimited. Does not implicitly {@link PetSkill.verify|verify} messages.
     * @param message PetSkill message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPetSkill, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PetSkill message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PetSkill
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PetSkill;

    /**
     * Decodes a PetSkill message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PetSkill
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PetSkill;

    /**
     * Verifies a PetSkill message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PetSkill message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PetSkill
     */
    public static fromObject(object: { [k: string]: any }): PetSkill;

    /**
     * Creates a plain object from a PetSkill message. Also converts values to other types if specified.
     * @param message PetSkill
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PetSkill, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PetSkill to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PetSkill
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a PlayerInfo. */
export interface IPlayerInfo {

    /** PlayerInfo userId */
    userId?: (number|null);

    /** PlayerInfo gender */
    gender?: (number|null);

    /** PlayerInfo userName */
    userName?: (string|null);

    /** PlayerInfo nickName */
    nickName?: (string|null);
}

/** Represents a PlayerInfo. */
export class PlayerInfo implements IPlayerInfo {

    /**
     * Constructs a new PlayerInfo.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPlayerInfo);

    /** PlayerInfo userId. */
    public userId: number;

    /** PlayerInfo gender. */
    public gender: number;

    /** PlayerInfo userName. */
    public userName: string;

    /** PlayerInfo nickName. */
    public nickName: string;

    /**
     * Creates a new PlayerInfo instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PlayerInfo instance
     */
    public static create(properties?: IPlayerInfo): PlayerInfo;

    /**
     * Encodes the specified PlayerInfo message. Does not implicitly {@link PlayerInfo.verify|verify} messages.
     * @param message PlayerInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPlayerInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PlayerInfo message, length delimited. Does not implicitly {@link PlayerInfo.verify|verify} messages.
     * @param message PlayerInfo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPlayerInfo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PlayerInfo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PlayerInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PlayerInfo;

    /**
     * Decodes a PlayerInfo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PlayerInfo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PlayerInfo;

    /**
     * Verifies a PlayerInfo message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PlayerInfo message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PlayerInfo
     */
    public static fromObject(object: { [k: string]: any }): PlayerInfo;

    /**
     * Creates a plain object from a PlayerInfo message. Also converts values to other types if specified.
     * @param message PlayerInfo
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PlayerInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PlayerInfo to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PlayerInfo
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
 
} 
} export {}