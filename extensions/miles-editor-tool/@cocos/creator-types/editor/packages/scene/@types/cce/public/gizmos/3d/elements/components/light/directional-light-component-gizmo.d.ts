import Gizmo from '../../gizmo-base';
declare class DirectionalLightComponentGizmo extends Gizmo {
    private _controller;
    private _frustumCtrl;
    private _lightGizmoColor;
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
export default DirectionalLightComponentGizmo;
//# sourceMappingURL=directional-light-component-gizmo.d.ts.map