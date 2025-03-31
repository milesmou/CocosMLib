export class Constant {
    /** 构建模板的根目录名 */
    public static BuildConfigDirName = "buildConfig";
    /** 构建模板的根目录名 */
    public static BuildTemplateDirName = "template";
    /** 保存插件配置的文件路径 */
    public static ConfigFilePath = Editor.Project.path + "/settings/miles-editor-config.json";
    /** 和Scene操作脚本的通信文件 */
    public static SceneConnectFilePath = Editor.Project.path + "/temp/miles-scene.json";
    /** 阿里云OSS配置文件 */
    public static AliOSSConfigFilePath = Editor.Project.path + "/settings/ali_oss_config.json";
}