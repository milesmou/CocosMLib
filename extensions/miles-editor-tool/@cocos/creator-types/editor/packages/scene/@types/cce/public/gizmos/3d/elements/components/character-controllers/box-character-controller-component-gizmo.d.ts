import Gizmo from '../../gizmo-base';
declare class BoxCharacterControllerComponentGizmo extends Gizmo {
    private _controller;
    private _size;
    private _scale;
    private _propPath;
    init(): void;
    onShow(): void;
    onHide(): void;
    createController(): void;
    onControllerMouseDown(): void;
    onControllerMouseMove(): void;
    onControllerMouseUp(): void;
    updateDataFromController(): void;
    updateControllerTransform(): void;
    updateControllerData(): void;
    onTargetUpdate(): void;
    onNodeChanged(): void;
}
export default BoxCharacterControllerComponentGizmo;
//# sourceMappingURL=box-character-controller-component-gizmo.d.ts.map