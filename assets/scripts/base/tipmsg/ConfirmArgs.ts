export interface ConfirmArgs {
    /** 确认框类型 1只有一个确认按钮 2确认按钮和取消按钮 */
    type: 1 | 2;
    /** 按下任意按钮关闭确认框 */
    autoHide?: boolean;
    /** 确认按钮回调 */
    cbOk?: () => void;
    /** 取消按钮回调 */
    cbCancel?: () => void;
    /** 标题 */
    title?: string;
    /** 确认按钮文本 */
    okText?: string;
    /** 取消按钮文本 */
    cancelText?: string;
}