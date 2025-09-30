import { HttpMisc } from "./Misc/HttpMisc";

//@ts-ignore
globalThis.mExecption = HttpMisc.execption;

declare global {
    /** 上报异常 */
    const mExecption: (data: HttpMiscModel.ReqCustExecption) => void;
}