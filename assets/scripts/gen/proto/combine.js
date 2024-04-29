/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(window || global).pbroot = (function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.PetSkill = (function() {
    
        /**
         * Properties of a PetSkill.
         * @exports IPetSkill
         * @interface IPetSkill
         * @property {number|null} [skill] PetSkill skill
         * @property {Array.<number>|null} [skillBuffId] PetSkill skillBuffId
         */
    
        /**
         * Constructs a new PetSkill.
         * @exports PetSkill
         * @classdesc Represents a PetSkill.
         * @implements IPetSkill
         * @constructor
         * @param {IPetSkill=} [properties] Properties to set
         */
        function PetSkill(properties) {
            this.skillBuffId = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * PetSkill skill.
         * @member {number} skill
         * @memberof PetSkill
         * @instance
         */
        PetSkill.prototype.skill = 0;
    
        /**
         * PetSkill skillBuffId.
         * @member {Array.<number>} skillBuffId
         * @memberof PetSkill
         * @instance
         */
        PetSkill.prototype.skillBuffId = $util.emptyArray;
    
        /**
         * Creates a new PetSkill instance using the specified properties.
         * @function create
         * @memberof PetSkill
         * @static
         * @param {IPetSkill=} [properties] Properties to set
         * @returns {PetSkill} PetSkill instance
         */
        PetSkill.create = function create(properties) {
            return new PetSkill(properties);
        };
    
        /**
         * Encodes the specified PetSkill message. Does not implicitly {@link PetSkill.verify|verify} messages.
         * @function encode
         * @memberof PetSkill
         * @static
         * @param {IPetSkill} message PetSkill message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PetSkill.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.skill != null && Object.hasOwnProperty.call(message, "skill"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.skill);
            if (message.skillBuffId != null && message.skillBuffId.length) {
                writer.uint32(/* id 2, wireType 2 =*/18).fork();
                for (var i = 0; i < message.skillBuffId.length; ++i)
                    writer.int32(message.skillBuffId[i]);
                writer.ldelim();
            }
            return writer;
        };
    
        /**
         * Encodes the specified PetSkill message, length delimited. Does not implicitly {@link PetSkill.verify|verify} messages.
         * @function encodeDelimited
         * @memberof PetSkill
         * @static
         * @param {IPetSkill} message PetSkill message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PetSkill.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a PetSkill message from the specified reader or buffer.
         * @function decode
         * @memberof PetSkill
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {PetSkill} PetSkill
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PetSkill.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PetSkill();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.skill = reader.int32();
                        break;
                    }
                case 2: {
                        if (!(message.skillBuffId && message.skillBuffId.length))
                            message.skillBuffId = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.skillBuffId.push(reader.int32());
                        } else
                            message.skillBuffId.push(reader.int32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };
    
        /**
         * Decodes a PetSkill message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof PetSkill
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {PetSkill} PetSkill
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PetSkill.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a PetSkill message.
         * @function verify
         * @memberof PetSkill
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PetSkill.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.skill != null && message.hasOwnProperty("skill"))
                if (!$util.isInteger(message.skill))
                    return "skill: integer expected";
            if (message.skillBuffId != null && message.hasOwnProperty("skillBuffId")) {
                if (!Array.isArray(message.skillBuffId))
                    return "skillBuffId: array expected";
                for (var i = 0; i < message.skillBuffId.length; ++i)
                    if (!$util.isInteger(message.skillBuffId[i]))
                        return "skillBuffId: integer[] expected";
            }
            return null;
        };
    
        /**
         * Creates a PetSkill message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof PetSkill
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {PetSkill} PetSkill
         */
        PetSkill.fromObject = function fromObject(object) {
            if (object instanceof $root.PetSkill)
                return object;
            var message = new $root.PetSkill();
            if (object.skill != null)
                message.skill = object.skill | 0;
            if (object.skillBuffId) {
                if (!Array.isArray(object.skillBuffId))
                    throw TypeError(".PetSkill.skillBuffId: array expected");
                message.skillBuffId = [];
                for (var i = 0; i < object.skillBuffId.length; ++i)
                    message.skillBuffId[i] = object.skillBuffId[i] | 0;
            }
            return message;
        };
    
        /**
         * Creates a plain object from a PetSkill message. Also converts values to other types if specified.
         * @function toObject
         * @memberof PetSkill
         * @static
         * @param {PetSkill} message PetSkill
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PetSkill.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.skillBuffId = [];
            if (options.defaults)
                object.skill = 0;
            if (message.skill != null && message.hasOwnProperty("skill"))
                object.skill = message.skill;
            if (message.skillBuffId && message.skillBuffId.length) {
                object.skillBuffId = [];
                for (var j = 0; j < message.skillBuffId.length; ++j)
                    object.skillBuffId[j] = message.skillBuffId[j];
            }
            return object;
        };
    
        /**
         * Converts this PetSkill to JSON.
         * @function toJSON
         * @memberof PetSkill
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PetSkill.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for PetSkill
         * @function getTypeUrl
         * @memberof PetSkill
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PetSkill.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/PetSkill";
        };
    
        return PetSkill;
    })();
    
    $root.PlayerInfo = (function() {
    
        /**
         * Properties of a PlayerInfo.
         * @exports IPlayerInfo
         * @interface IPlayerInfo
         * @property {number|null} [userId] PlayerInfo userId
         * @property {number|null} [gender] PlayerInfo gender
         * @property {string|null} [userName] PlayerInfo userName
         * @property {string|null} [nickName] PlayerInfo nickName
         */
    
        /**
         * Constructs a new PlayerInfo.
         * @exports PlayerInfo
         * @classdesc Represents a PlayerInfo.
         * @implements IPlayerInfo
         * @constructor
         * @param {IPlayerInfo=} [properties] Properties to set
         */
        function PlayerInfo(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * PlayerInfo userId.
         * @member {number} userId
         * @memberof PlayerInfo
         * @instance
         */
        PlayerInfo.prototype.userId = 0;
    
        /**
         * PlayerInfo gender.
         * @member {number} gender
         * @memberof PlayerInfo
         * @instance
         */
        PlayerInfo.prototype.gender = 0;
    
        /**
         * PlayerInfo userName.
         * @member {string} userName
         * @memberof PlayerInfo
         * @instance
         */
        PlayerInfo.prototype.userName = "";
    
        /**
         * PlayerInfo nickName.
         * @member {string} nickName
         * @memberof PlayerInfo
         * @instance
         */
        PlayerInfo.prototype.nickName = "";
    
        /**
         * Creates a new PlayerInfo instance using the specified properties.
         * @function create
         * @memberof PlayerInfo
         * @static
         * @param {IPlayerInfo=} [properties] Properties to set
         * @returns {PlayerInfo} PlayerInfo instance
         */
        PlayerInfo.create = function create(properties) {
            return new PlayerInfo(properties);
        };
    
        /**
         * Encodes the specified PlayerInfo message. Does not implicitly {@link PlayerInfo.verify|verify} messages.
         * @function encode
         * @memberof PlayerInfo
         * @static
         * @param {IPlayerInfo} message PlayerInfo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerInfo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.userId);
            if (message.gender != null && Object.hasOwnProperty.call(message, "gender"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.gender);
            if (message.userName != null && Object.hasOwnProperty.call(message, "userName"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.userName);
            if (message.nickName != null && Object.hasOwnProperty.call(message, "nickName"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.nickName);
            return writer;
        };
    
        /**
         * Encodes the specified PlayerInfo message, length delimited. Does not implicitly {@link PlayerInfo.verify|verify} messages.
         * @function encodeDelimited
         * @memberof PlayerInfo
         * @static
         * @param {IPlayerInfo} message PlayerInfo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerInfo.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a PlayerInfo message from the specified reader or buffer.
         * @function decode
         * @memberof PlayerInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {PlayerInfo} PlayerInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerInfo.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PlayerInfo();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.userId = reader.int32();
                        break;
                    }
                case 2: {
                        message.gender = reader.int32();
                        break;
                    }
                case 3: {
                        message.userName = reader.string();
                        break;
                    }
                case 4: {
                        message.nickName = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };
    
        /**
         * Decodes a PlayerInfo message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof PlayerInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {PlayerInfo} PlayerInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerInfo.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a PlayerInfo message.
         * @function verify
         * @memberof PlayerInfo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PlayerInfo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (!$util.isInteger(message.userId))
                    return "userId: integer expected";
            if (message.gender != null && message.hasOwnProperty("gender"))
                if (!$util.isInteger(message.gender))
                    return "gender: integer expected";
            if (message.userName != null && message.hasOwnProperty("userName"))
                if (!$util.isString(message.userName))
                    return "userName: string expected";
            if (message.nickName != null && message.hasOwnProperty("nickName"))
                if (!$util.isString(message.nickName))
                    return "nickName: string expected";
            return null;
        };
    
        /**
         * Creates a PlayerInfo message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof PlayerInfo
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {PlayerInfo} PlayerInfo
         */
        PlayerInfo.fromObject = function fromObject(object) {
            if (object instanceof $root.PlayerInfo)
                return object;
            var message = new $root.PlayerInfo();
            if (object.userId != null)
                message.userId = object.userId | 0;
            if (object.gender != null)
                message.gender = object.gender | 0;
            if (object.userName != null)
                message.userName = String(object.userName);
            if (object.nickName != null)
                message.nickName = String(object.nickName);
            return message;
        };
    
        /**
         * Creates a plain object from a PlayerInfo message. Also converts values to other types if specified.
         * @function toObject
         * @memberof PlayerInfo
         * @static
         * @param {PlayerInfo} message PlayerInfo
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PlayerInfo.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.userId = 0;
                object.gender = 0;
                object.userName = "";
                object.nickName = "";
            }
            if (message.userId != null && message.hasOwnProperty("userId"))
                object.userId = message.userId;
            if (message.gender != null && message.hasOwnProperty("gender"))
                object.gender = message.gender;
            if (message.userName != null && message.hasOwnProperty("userName"))
                object.userName = message.userName;
            if (message.nickName != null && message.hasOwnProperty("nickName"))
                object.nickName = message.nickName;
            return object;
        };
    
        /**
         * Converts this PlayerInfo to JSON.
         * @function toJSON
         * @memberof PlayerInfo
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PlayerInfo.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for PlayerInfo
         * @function getTypeUrl
         * @memberof PlayerInfo
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PlayerInfo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/PlayerInfo";
        };
    
        return PlayerInfo;
    })();

    return $root;
})(protobuf);
