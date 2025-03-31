阿里云oss资源上传工具

配置文件名字 ali_oss_config.json(公共配置)  [TaskName]_ali_oss_config.json(指定构建任务专属配置)

参数1 配置文件地址，文件内容为Json格式，包含4个配置，参考oss_config.json文件
accessKeyId: 'accessKeyId',
accessKeySecret: 'accessKeySecret',
// yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
region: 'yourRegion',
// yourBucketName填写Bucket名称。
bucket: 'yourBucketName',
//(可选参数) oss的目录前缀，用于拼接工程中配置上传目录
ossDirPrefix: '',