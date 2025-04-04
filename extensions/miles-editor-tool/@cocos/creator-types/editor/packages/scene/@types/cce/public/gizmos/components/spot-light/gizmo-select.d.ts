import { SpotLight } from 'cc';
import { SelectGizmo } from '../base';
declare class SpotLightComponentGizmo extends SelectGizmo<SpotLight> {
    private _lightGizmoColor;
    private _lightCtrlHoverColor;
    private _range;
    private _angle;
    private _baseSize;
    private _glowSize;
    private _controller;
    private _sizeSphereCtrl;
    private _rangePropPath;
    private _anglePropPath;
    private _rangeChanged;
    private _angleChanged;
    private _coneTopPos;
    init(): void;
    onShow(): void;
    onHide(): void;
    createController(): void;
    onControllerMouseDown(): void;
    onControllerMouseMove(): void;
    onControllerMouseUp(): void;
    getConeRadius(angle: number, height: number): number;
    updateDataFromController(): void;
    updateControllerTransform(): void;
    updateControllerData(): void;
    onTargetUpdate(): void;
    onNodeChanged(): void;
}
export default SpotLightComponentGizmo;
//# sourceMappingURL=gizmo-select.d.ts.map