export class Constant {
    /** 构建模板的根目录名 */
    public static BuildTemplateDirName = "buildTemplate";
    /** 保存日志的文件路径 */
    public static ConfigFilePath = Editor.Project.path + "/settings/miles-editor-config.json";
    /** 保存日志的文件路径 */
    public static LogFilePath = Editor.Project.path + "/temp/logs/miles-editor.log";
    /** 和Scene操作脚本的通信文件 */
    public static SceneConnectFilePath = Editor.Project.path + "/temp/miles-scene.json";
}