/**
应当在工程settings目录保存ali_oss_config.json文件，格式为
{
    "accessKeyId": "",
    "accessKeySecret": "",
    "region": "",
    "bucket": ""
}
*/
import OSS from "ali-oss";
import fs from "fs-extra";
import path from "path";
import { BuildLogger } from "../../builder/BuildLogger";
import { Constant } from "../../tools/Constant";
import { Utils } from "../../tools/Utils";

/** 上传文件时 在元数据保留最后修改时间 方便上传时比较 */
const mTimeKey = "x-oss-meta-last-modified";

const tag = "[AliOSS]";

/** 上传并发数量 */
const concurrent = 10;

/** 文件上传失败重试次数 */
const retry = 3;

let endResolve: Function;


/** 阿里云oss上传工具 */
export class AliOSS {

    /** OSS客户端 */
    private client: OSS = null;

    private localDir: string = "";
    private ossDir: string = "";

    /** 剩余文件 */
    private remainFiles: string[];

    /** 文件重试次数 */
    private retryCnt: Map<string, number> = new Map();



    private startTimeMS = 0;
    private totalCnt = 0;//总共数量
    private succCnt = 0;//成功数量
    private failCnt = 0;//失败数量
    private skipCnt = 0;//跳过数量

    /**
     * 上传本地资源目录到oss指定目录
     * @param localDir 本地资源目录地址
     * @param ossDir OSS目录地址 例：需要上传到(oss://bucketName/Test/) 此时应该填(Test/) 不需要包含前面的部分
     */
    constructor(localDir: string, ossDir: string) {
        this.localDir = Utils.toUniSeparator(localDir);
        this.ossDir = ossDir;
    }


    /**
     * 上传资源
     * @param taskName 构建任务名字(可能不同的构建任务需要上传到不同的OSS)
     * @param files 需要上传的文件
     */
    public async upload(taskName: string, files: string[]) {

        let p = new Promise<void>((resolve, reject) => {
            let configPath = taskName + "_" + Constant.AliOSSConfigFilePath;
            if (!fs.existsSync(configPath)) {
                configPath = Constant.AliOSSConfigFilePath;
            }
            if (!fs.existsSync(configPath)) {
                BuildLogger.info(tag, "ali_oss_config.json文件不存在,跳过上传");
                return;
            }
            try {
                let config = fs.readJSONSync(configPath);
                let ossDirPrefix = config['ossDirPrefix'];
                if (ossDirPrefix) this.ossDir = Utils.toUniSeparator(path.join(ossDirPrefix, this.ossDir));
                this.client = new OSS(config);
            } catch (e) {
                BuildLogger.error(e);
                resolve();
                return;
            }

            BuildLogger.info(tag, `LocalDir=${this.localDir} OSSDir=${this.ossDir}`);
            this.remainFiles = files;

            this.totalCnt = this.remainFiles.length;
            this.startTimeMS = Date.now();

            BuildLogger.info(tag, `正在上传中 请耐心等待 文件数量:${this.totalCnt}`);

            for (let i = 0; i < concurrent; i++) {
                if (this.remainFiles.length > 0) {
                    this.uploadFile(this.remainFiles.pop());
                }
            }

            endResolve = resolve;
        });

        return p;
    }

    /** 文件是否已经存在OSS中 */
    public async isFileExistsInOss(localPath: string) {
        let remotePath = this.localToOssPath(localPath);
        BuildLogger.info(tag, localPath, remotePath)
        try {
            const result = await this.client.head(remotePath);
            return true;
        } catch (e) {
            return false;
        }
    }


    private localToOssPath(file: string) {
        let dirName = path.basename(this.localDir);
        let suffix = file.replace(this.localDir, dirName);
        let remotePath = Utils.toUniSeparator(path.join(this.ossDir, suffix));
        return remotePath;
    }

    private async uploadFile(localPath: string) {
        let remotePath = this.localToOssPath(localPath);
        const stat = fs.statSync(localPath);
        const mTimeMS = stat.mtime.getTime();
        try {
            const result = await this.client.head(remotePath);
            let timeMS: number = result.res.headers[mTimeKey];
            let size: number = result.res.headers["content-length"];
            if (size == stat.size && timeMS == mTimeMS) {
                this.uploadEnded(localPath, 2);
                return;
            }
        } catch (e) { }

        try {
            const headers = { [mTimeKey]: mTimeMS }
            await this.client.put(remotePath, localPath, { headers: headers });
            this.uploadEnded(localPath, 1);
        } catch (err) {
            this.uploadEnded(localPath, 0, err);
        }
    }

    private percent = 0.1;
    private uploadEnded(file: string, code: number, err?: Error) {
        if (code == 0) {//失败重试检测
            let re = this.retryCnt.has(file) ? this.retryCnt.get(file) : retry;
            if (re > 0) {
                this.uploadFile(file);
                this.retryCnt.set(file, re - 1);
                return;
            } else {
                console.error(tag, `上传失败 ${file} `, err.message);
            }
        }

        if (code == 1) this.succCnt += 1;
        else if (code == 2) this.skipCnt += 1;
        else this.failCnt += 1;

        this.checkComplete();
    }

    private checkComplete() {
        let complete = this.succCnt + this.failCnt + this.skipCnt;

        if (complete == Math.floor(this.totalCnt * this.percent)) {//达到某个进度时打印
            BuildLogger.info(tag, `上传进度:${Math.round(this.percent * 100)}%`);
            this.percent += 0.1;
        }

        if (complete != this.totalCnt) {//未上传完成
            if (this.remainFiles.length > 0) {
                this.uploadFile(this.remainFiles.pop());//继续上传
            }
            return;
        }

        //全部上传完成
        let dtTimeMS = Math.floor((Date.now() - this.startTimeMS) / 1000);
        if (this.failCnt > 0) {
            BuildLogger.error(tag, `上传失败 总共:${this.totalCnt} 失败:${this.failCnt} 耗时:${dtTimeMS}秒`);
        } else {
            BuildLogger.info(tag, `上传成功 总共:${this.totalCnt} 上传:${this.succCnt} 跳过:${this.skipCnt} 耗时:${dtTimeMS}秒`);
        }
        endResolve();
    }

}
