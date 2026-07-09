declare module "vanta/dist/vanta.trunk.min" {
  interface VantaTrunkOptions {
    el: HTMLElement;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    backgroundColor?: number;
    chaos?: number;
    spacing?: number;
  }

  interface VantaEffect {
    destroy: () => void;
  }

  type VantaTrunkFactory = (options: VantaTrunkOptions) => VantaEffect;

  const vantaTrunk: VantaTrunkFactory;
  export default vantaTrunk;
}