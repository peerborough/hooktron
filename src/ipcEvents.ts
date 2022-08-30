export enum IpcEvents {
  NEW_BROWSER_TAB = 'NEW_BROWSER_TAB',
  RELOAD_BROWSER_TAB = 'RELOAD_BROWSER_TAB',
  STOP_BROWSER_TAB = 'STOP_BROWSER_TAB',
  SET_MENU_ITEM_OPTIONS = 'SET_MENU_ITEM_OPTIONS',
  MONACO_TOGGLE_OPTION = 'MONACO_TOGGLE_OPTION',
  MONACO_SAVE_FILE = 'MONACO_SAVE_FILE',
  TOGGLE_DEV_TOOLS = 'TOGGLE_DEV_TOOLS',
  RELOAD_WINDOW = 'RELOAD_WINDOW',
  SELECT_ALL_IN_EDITOR = 'SELECT_ALL_IN_EDITOR',
  SAVE_TEXT_FILE = 'SAVE_TEXT_FILE',
  LOAD_TEXT_FILE = 'LOAD_TEXT_FILE',
  GET_CURRENT_WORKSPACE = 'GET_CURRENT_WORKSPACE',
  WORKSPACE_CHANGED = 'WORKSPACE_CHANGED',
  ENABLE_WORKSPACE = 'ENABLE_WORKSPACE',
  OPEN_SETTINGS = 'OPEN_SETTINGS',
  WEBCONTENTS_READY_FOR_IPC_SIGNAL = 'WEBCONTENTS_READY_FOR_IPC_SIGNAL',
}

export const ipcMainEvents = [
  IpcEvents.RELOAD_WINDOW,
  IpcEvents.SET_MENU_ITEM_OPTIONS,
  IpcEvents.SAVE_TEXT_FILE,
  IpcEvents.LOAD_TEXT_FILE,
  IpcEvents.GET_CURRENT_WORKSPACE,
  IpcEvents.ENABLE_WORKSPACE,
];

export const ipcRendererEvents = [
  IpcEvents.NEW_BROWSER_TAB,
  IpcEvents.MONACO_SAVE_FILE,
  IpcEvents.RELOAD_BROWSER_TAB,
  IpcEvents.STOP_BROWSER_TAB,
  IpcEvents.MONACO_TOGGLE_OPTION,
  IpcEvents.TOGGLE_DEV_TOOLS,
  IpcEvents.SELECT_ALL_IN_EDITOR,
  IpcEvents.OPEN_SETTINGS,
  IpcEvents.WORKSPACE_CHANGED,
];
