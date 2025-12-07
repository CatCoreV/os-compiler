class EventEmitter {
  readonly constructor()
  readonly prependListener(eventName: string, listener: Function): this
  readonly prependOnceListener(eventName: string, listener: Function): this
  readonly eventNames(): string[]
  readonly listeners(eventName: string): Function[]
  readonly listenerCount(eventName: string, listener?: Function): number
  readonly rawListeners(eventName: string): Function[]
  readonly on(eventName: string, listener: Function): this
  readonly once(eventName: string, listener: Function): this
  readonly off(eventName: string, listener: Function): this
  readonly removeListener(eventName: string, listener: Function): this
  readonly removeAllListeners(eventName?: string): this
  readonly getMaxListeners(): number
  readonly setMaxListener(n: number): this
  readonly addListener(eventName: string, listener: Function): this
  readonly emit(eventName: string, ...args: any[]): boolean
};

const ProcessType: {
  readonly DUMMY: 0,
  readonly KERNEL: 1,
  readonly APP: 2,
  readonly JAVASCRIPT: 3,
  readonly PYTHON: 4,
  readonly PHP: 5,
  readonly RUBY: 6
};

const ProcessState: {
  readonly CREATED: 0,
  readonly RUNNING: 1,
  readonly STOPPED: 2,
  readonly CRASHED: 3
};

const ProcessPermissions: {
  readonly Procceses?: boolean
  readonly SpawnProcess?: boolean
  readonly TextMode?: boolean
  readonly CursorTracking?: boolean
  readonly Keyboard?: boolean
  readonly Overlay?: boolean
  readonly Graphics?: boolean
  readonly GetDevices?: boolean
  readonly ScanDevices?: boolean
  readonly FileSystem?: boolean
  readonly System?: boolean
};

const ProcessOptions: {
  readonly type: ProcessType.DUMMY,
  readonly path?: string,
  readonly args?: string[],
  readonly permissions?: ProcessPermissions,
  readonly critical?: boolean,
  readonly parent?: number
} | {
  readonly type: ProcessType.KERNEL | ProcessType.APP | ProcessType.JAVASCRIPT | ProcessType.PYTHON | ProcessType.PHP | ProcessType.RUBY,
  readonly path: string,
  readonly args?: string[],
  readonly permissions?: ProcessPermissions,
  readonly critical?: boolean,
  readonly parent?: number
};

const Calculatable: (string | number);

class Process extends EventEmitter {
  readonly constructor({ type, path, args, permissions, critical, parent } : ProcessOptions)
  readonly pid: number
  readonly type: typeof ProcessType[keyof typeof ProcessType]
  readonly state: typeof ProcessState[keyof typeof ProcessState]
  readonly path: string
  readonly args: string[]
  readonly permissions: ProcessPermissions
  readonly critical: boolean
  readonly parent?: number
  readonly run(): Promise<undefined>
  readonly stop(): undefined
  readonly sendMessage(data: (object | number | string)): boolean
};

class Window extends EventEmitter {
  readonly constructor()
  readonly wid: number
  readonly isOpened(): boolean
  readonly open(): Window
  readonly close(): Window
  readonly setUI(ui?: Layer): Window
  readonly render(): Window
  readonly forceRender(): Window
  readonly x(): Calculatable
  readonly x(value: Calculatable): Window
  readonly y(): Calculatable
  readonly y(value: Calculatable): Window
  readonly width(): Calculatable
  readonly width(value: Calculatable): Window
  readonly height(): Calculatable
  readonly height(value: Calculatable): Window
  readonly icon(): string
  readonly icon(value: string): Window
  readonly title(): string
  readonly title(value: string): Window
  readonly titlePosition(): string
  readonly titlePosition(value: string): Window
  readonly titleColor(): string
  readonly titleColor(value: string): Window
  readonly buttons(): WindowButton[]
  readonly buttons(value: WindowButton[]): Window
  readonly buttonsPosition(): ("left" | "right")
  readonly buttonsPosition(value: ("left" | "right")): Window
  readonly buttonsStyle(): ("Windows" | "MacOS")
  readonly buttonsStyle(value: ("Windows" | "MacOS")): Window
  readonly color(): string
  readonly color(value: string): Window
  readonly radius(): Calculatable
  readonly radius(value: Calculatable): Window
  readonly rotate(): number
  readonly rotate(value: number): Window
  readonly layer(): number
  readonly layer(value: number): Window
  readonly headless(): boolean
  readonly headless(value: boolean): Window
  readonly minimize(): boolean
  readonly minimize(value: boolean): Window
  readonly minimizeDirection(): ("top" | "right" | "bottom" | "left" | "center")
  readonly minimizeDirection(value: ("top" | "right" | "bottom" | "left" | "center")): Window
  readonly fullScreen(): boolean
  readonly fullScreen(value: boolean): Window
  readonly fullX(): Calculatable
  readonly fullx(value: Calculatable): Window
  readonly fullY(): Calculatable
  readonly fullY(value: Calculatable): Window
  readonly fullWidth(): Calculatable
  readonly fullWidth(value: Calculatable): Window
  readonly fullHeight(): Calculatable
  readonly fullHeight(value: Calculatable): Window
  readonly transparent(): number
  readonly transparent(value: number): Window
  readonly blur(): number
  readonly blur(value: number): Window
  readonly moveable(): boolean
  readonly moveable(value: boolean): Window
  readonly resizable(): boolean
  readonly resizable(value: boolean): Window
  readonly scrollX(): boolean
  readonly scrollX(value: boolean): Window
  readonly scrollY(): boolean
  readonly scrollY(value: boolean): Window
  readonly minWidth(): Calculatable
  readonly minWidth(value: Calculatable): Window
  readonly minHeight(): Calculatable
  readonly minHeight(value: Calculatable): Window
  readonly maxWidth(): Calculatable
  readonly maxWidth(value: Calculatable): Window
  readonly maxHeight(): Calculatable
  readonly maxHeight(value: Calculatable): Window
};

class Ticket {
  readonly constructor(...data: any)
  readonly data: any[]
}

class UIBase extends EventEmitter {
  readonly constructor(ticket: Ticket)
};

class Layer extends UIBase {
  readonly constructor()
  readonly list(): UIBase[]
  readonly add(element: UIBase): Layer
  readonly has(element: UIBase): boolean
  readonly remove(element: UIBase): Layer
  readonly clear(): Layer
};

class Text extends UIBase {
  readonly constructor()
  readonly render(): Text
  readonly x(): Calculatable
  readonly x(value: Calculatable): Text
  readonly y(): Calculatable
  readonly y(value: Calculatable): Text
  readonly content(): string
  readonly content(value: string): Text
  readonly background(): string
  readonly background(value: string): Text
  readonly color(): string
  readonly color(value: string): Text
  readonly transparent(): number
  readonly transparent(value: number): Text
  readonly rotate(): number
  readonly rotate(value: number): Text
  readonly font(): string
  readonly font(value: string): Text
  readonly size(): Calculatable
  readonly size(value: Calculatable): Text
}

class Button extends UIBase {
  readonly constructor()
  readonly render(): Button
  readonly x(): Calculatable
  readonly x(value: Calculatable): Button
  readonly y(): Calculatable
  readonly y(value: Calculatable): Button
  readonly label(): string
  readonly label(value: string): Button
  readonly background(): string
  readonly background(value: string): Button
  readonly color(): string
  readonly color(value: string): Button
  readonly transparent(): number
  readonly transparent(value: number): Button
  readonly rotate(): number
  readonly rotate(value: number): Button
  readonly size(): Calculatable
  readonly size(value: Calculatable): Button
  readonly radius(): Calculatable
  readonly radius(value: Calculatable): Button
  readonly disabled(): boolean
  readonly disabled(value: boolean): Button
}

class Checkbox extends UIBase {
  readonly constructor()
  readonly render(): Checkbox
  readonly x(): Calculatable
  readonly x(value: Calculatable): Checkbox
  readonly y(): Calculatable
  readonly y(value: Calculatable): Checkbox
  readonly transparent(): number
  readonly transparent(value: number): Checkbox
  readonly rotate(): number
  readonly rotate(value: number): Checkbox
  readonly disabled(): boolean
  readonly disabled(value: boolean): Checkbox
}

class Image extends UIBase {
  readonly constructor()
  readonly render(): Image
  readonly x(): Calculatable
  readonly x(value: Calculatable): Image
  readonly y(): Calculatable
  readonly y(value: Calculatable): Image
  readonly width(): Calculatable
  readonly width(value: Calculatable): Image
  readonly height(): Calculatable
  readonly height(value: Calculatable): Image
  readonly file(): string
  readonly file(value: string): Image
  readonly transparent(): number
  readonly transparent(value: number): Image
  readonly rotate(): number
  readonly rotate(value: number): Image
  readonly radius(): Calculatable
  readonly radius(value: Calculatable): Image
  readonly blur(): Calculatable
  readonly blur(value: Calculatable): Image
  readonly clickable(): boolean
  readonly clickable(value: boolean): Image
}

class Color extends UIBase {
  readonly constructor()
  readonly render(): Color
  readonly x(): Calculatable
  readonly x(value: Calculatable): Color
  readonly y(): Calculatable
  readonly y(value: Calculatable): Color
  readonly width(): Calculatable
  readonly width(value: Calculatable): Color
  readonly height(): Calculatable
  readonly height(value: Calculatable): Color
  readonly color(): string
  readonly color(value: string): Color
  readonly transparent(): number
  readonly transparent(value: number): Color
  readonly rotate(): number
  readonly rotate(value: number): Color
}

class VNC extends UIBase {
  readonly constructor()
  readonly render(): VNC
  readonly x(): Calculatable
  readonly x(value: Calculatable): VNC
  readonly y(): Calculatable
  readonly y(value: Calculatable): VNC
  readonly width(): Calculatable
  readonly width(value: Calculatable): VNC
  readonly height(): Calculatable
  readonly height(value: Calculatable): VNC
  readonly transparent(): number
  readonly transparent(value: number): VNC
  readonly rotate(): number
  readonly rotate(value: number): VNC
  readonly address(): string
  readonly address(value: string): VNC
  readonly password(): string
  readonly password(value: string): VNC
  readonly reconnect(): boolean
  readonly reconnect(value: boolean): VNC
  readonly reconnectDelay(): number
  readonly reconnectDelay(value: number): VNC
}

const FSType: {
  readonly ROOT: 0
  readonly DIRECTORY: 1
  readonly FILE: 2
  readonly MOUNT: 3
  readonly SYMLINK: 4
  readonly DEVICE: 5
};

const FSInfo: {
  readonly type: FSType
  readonly size: (number | null)
  readonly createdAt: Date
  readonly modifiedAt: Date
};

class Handle {
  readonly constructor(ticket: Ticket)
  readonly descriptor(): number
  readonly path(): string
  readonly mode(): number
  readonly opened(): boolean
  readonly read(): Promise<Buffer>
  readonly readString(): Promise<string>
  readonly readJSON(): Promise<object>
  readonly write(data: (Buffer | string)): Promise<undefined>
  readonly close(): undefined
};

interface KeyboardEventData {
  key: string
  letter: string
};

interface KeyboardEvents {
  hold: [KeyboardEventData];
  release: [KeyboardEventData];
}

interface TEventEmitter<T> {
  on<K extends keyof T>(
    eventName: K,
    listener: (...args: T[K]) => void
  ): void;
  once<K extends keyof T>(
    eventName: K,
    listener: (...args: T[K]) => void
  ): void;
  off<K extends keyof T>(
    eventName: K,
    listener: (...args: T[K]) => void
  ): void;
  emit<K extends keyof T>(eventName: K, ...args: T[K]): void;
}

const DeviceTree: {
  readonly deviceData: {
    readonly brand: (string | null)
    readonly model: (string | null)
    readonly serial: (string | null)
    readonly assetTag: (string | null)
    readonly sku: (string | null)
  }
  readonly motherboard: {
    readonly brand: string
    readonly model: string
    readonly version: string
    readonly serial: string
    readonly maximumMemory: {
      readonly slots: number
      readonly TB: number
      readonly GB: number
      readonly MB: number
      readonly KB: number
      readonly B: number
    }
    readonly BIOS: {
      readonly vendor: string
      readonly version: string
      readonly releaseDate: string
    }
  }
  readonly processors: {
    readonly brand: string
    readonly model: string
    readonly cores: number
    readonly threads: number
    readonly arch: ("arm" | "arm64" | "ia32" | "loong64" | "mips" | "mipsel" | "ppc64" | "riscv64" | "s390" | "s390x" | "x64")
    readonly socket: string
    readonly speed: {
      readonly THz: number
      readonly GHz: number
      readonly MHz: number
      readonly KHz: number
      readonly Hz: number
    }
    readonly virtualization: boolean
    readonly flags: string
    readonly cache: {
      readonly L1D: {
        readonly TB: number
        readonly GB: number
        readonly MB: number
        readonly KB: number
        readonly B: number
      }
      readonly L1I: {
        readonly TB: number
        readonly GB: number
        readonly MB: number
        readonly KB: number
        readonly B: number
      }
      readonly L2: {
        readonly TB: number
        readonly GB: number
        readonly MB: number
        readonly KB: number
        readonly B: number
      }
      readonly L3: {
        readonly TB: number
        readonly GB: number
        readonly MB: number
        readonly KB: number
        readonly B: number
      }
    }
    readonly temperature: {
      readonly C: (number | null)
      readonly F: (number | null)
    }
  }[]
  readonly memory: {
    readonly modules: {
      readonly type: string
      readonly socket: string
      readonly size: {
        readonly TB: number
        readonly GB: number
        readonly MB: number
        readonly KB: number
        readonly B: number
      }
      readonly speed: {
        readonly THz: number
        readonly GHz: number
        readonly MHz: number
        readonly KHz: number
        readonly Hz: number
      }
      readonly ecc: boolean
      readonly brand: string
      readonly partNum: string
      readonly serialNum: string
    }[]
    readonly capacity: {
      readonly TB: number
      readonly GB: number
      readonly MB: number
      readonly KB: number
      readonly B: number
    }
    readonly free: {
      readonly TB: number
      readonly GB: number
      readonly MB: number
      readonly KB: number
      readonly B: number
    }
    readonly used: {
      readonly TB: number
      readonly GB: number
      readonly MB: number
      readonly KB: number
      readonly B: number
    }
  }
  readonly swap: {
    readonly capacity: {
      readonly TB: number
      readonly GB: number
      readonly MB: number
      readonly KB: number
      readonly B: number
    }
    readonly free: {
      readonly TB: number
      readonly GB: number
      readonly MB: number
      readonly KB: number
      readonly B: number
    }
    readonly used: {
      readonly TB: number
      readonly GB: number
      readonly MB: number
      readonly KB: number
      readonly B: number
    }
  }
  readonly battery?: {
    readonly brand: string
    readonly model: string
    readonly type: string
    readonly cycleCount: number
    readonly charging: boolean
    readonly charge: number
    readonly voltage: number
    readonly serial: string
  }
  readonly videocards: {
    readonly chipBrand: string
    readonly videocardBrand: string
    readonly model: string
    readonly memory: {
      readonly TB: number
      readonly GB: number
      readonly MB: number
      readonly KB: number
      readonly B: number
    }
  }[]
  readonly screens: {
    readonly brand: string
    readonly model: string
    readonly primary: boolean
    readonly internal: boolean
    readonly width: number
    readonly height: number
    readonly colorDepth: number
    readonly refreshRate: {
      readonly THz: number
      readonly GHz: number
      readonly MHz: number
      readonly KHz: number
      readonly Hz: number
    }
    readonly serial: (string | null)
  }[]
  readonly drives: {
    readonly brand: string
    readonly model: string
    readonly type: ("HDD" | "SSD")
    readonly connection: string
    readonly size: {
      readonly TB: number
      readonly GB: number
      readonly MB: number
      readonly KB: number
      readonly B: number
    }
    readonly serial: string
  }[]
  readonly network: {
    readonly type: string
    readonly controller: string
    readonly localIp: {
      readonly IPv4: string
      readonly IPv6: string
    }
    readonly subnet: {
      readonly IPv4: string
      readonly IPv6: string
    }
    readonly MAC: string
    readonly maxSpeed: {
      readonly Gbps: number
      readonly Mbps: number
      readonly Kbps: number
      readonly bps: number
    }
  }
  readonly bluetooth: {
    readonly supported: boolean
  }
};

declare const CatCore: {
  readonly ProcessType: typeof ProcessType
  readonly ProcessState: typeof ProcessState
  readonly processList(): Process[]
  readonly Process: typeof Process
  readonly loadProgress(percent?: number): undefined
  readonly text(text: string): undefined
  readonly textOffset(offset: number): undefined
  readonly textFont(font: string): undefined
  readonly textSize(size: number): undefined
  readonly textColor(color: string): undefined
  readonly backgroundColor(color: string): undefined
  readonly delay(ms: number): Promise<undefined>
  readonly MILLISECOND: 1
  readonly SECOND: 1000
  readonly MINUTE: 60000
  readonly HOUR: 3600000
  readonly DAY: 86400000
  readonly WEEK: 604800000
  readonly version: string
  readonly systemName: string
  readonly systemVersion: string
  readonly time(): number
  readonly kernelBootTime: number
  readonly cursor: {
    readonly X?: number,
    readonly Y?: number
  }
  readonly keyboard: TEventEmitter<KeyboardEvents>
  readonly nightMode(status?: boolean): (boolean | undefined)
  readonly windowslist(): _Window[]
  readonly Graphics: {
    readonly Window: typeof Window,
    readonly Layer: typeof Layer
    readonly Text: typeof Text,
    readonly Button: typeof Button,
    readonly Checkbox: typeof Checkbox,
    readonly Image: typeof Image,
    readonly Color: typeof Color,
    readonly VNC: typeof VNC
  }
  readonly getDevices(): typeof DeviceTree
  readonly scanDevices(): Promise<undefined>
  readonly FS: {
    readonly Type: typeof FSType,
    readonly normalizePath(path: string): string
    readonly info(path: string, follow?: boolean): Promise<FSInfo>
    readonly exists(path: string, follow?: boolean): Promise<boolean>
    readonly mkdir(path: string): Promise<undefined>
    readonly rmdir(path: string, recursive?: boolean): Promise<undefined>
    readonly readdir(path: string): Promise<string[]>
    readonly open(path: string, mode: number): Promise<Handle>
    readonly readFile(path: string): Promise<Buffer>
    readonly readFileString(path: string): Promise<string>
    readonly readFileJSON(path: string): Promise<object>
    readonly writeFile(path: string, data: Buffer | string): Promise<undefined>
    readonly deleteFile(path: string, follow?: boolean): Promise<undefined>
    readonly link(src: string, dest: string): Promise<undefined>
    readonly Handle: typeof Handle
  }
  readonly Base64: {
    readonly encode(data: string): string
    readonly decode(data: string): string
  }
  readonly ApplicationFlag: {
    readonly SIGNED: 1
  }
  readonly parseApplication(app: Buffer): object
  readonly bootTime: number
};