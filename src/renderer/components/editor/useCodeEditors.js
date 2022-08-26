import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from 'react';
import { nanoid } from 'nanoid';
import { useDispatch, useSelector } from 'react-redux';
import { createContext } from '../../hooks/context';
import { defaultOption, toggleEditorOption } from './manacoOption';
import { ipcRendererManager, useIpcRendererListener } from '../../ipc';
import { IpcEvents } from '../../../ipcEvents';
import {
  start as startWorkspace,
  stop as stopWorkspace,
} from '../../workspace/execution';

function getDefaultScript(filepath) {
  switch (filepath) {
    case 'preload.js':
    case 'memory://preload.js':
      return `/**
 *
 *  A script that will be loaded for every frame
 *
 */

// Called whenever DOM content for each frame has been loaded
function onReady({ url }) {
  console.log(\`onReady( "\${ url }" )\`);

}
`;
    case 'main.js':
    case 'memory://main.js':
      return `/**
 *
 *  A script for the main application
 *
 */

const { output }  = window.codingbrowser;

`;
  }
}

function makeId() {
  return nanoid();
}

const createTab = ({ title, filepath }) => ({
  key: makeId(),
  dirty: false,
  title: title,
  filepath: filepath,
});

export const [CodeEditorsProvider, useCodeEditorsContext] = createContext({
  name: 'CodeEditorsContext',
});

export function useCodeEditors() {
  const editorRefs = useRef({});
  const [tabs, setTabs] = useState([]);
  const [monacoOption, setMonacoOption] = useState(defaultOption);
  const [activeTabKey, setActiveTabKey] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    initializeDefaultTabs();
  }, []);

  useIpcRendererListener(IpcEvents.MONACO_TOGGLE_OPTION, (cmd) => {
    const newOption = toggleEditorOption(monacoOption, cmd);
    if (newOption) {
      setMonacoOption(newOption);
    }
  });

  const initializeDefaultTabs = () => {
    const defaultTabs = [
      createTab({
        title: 'preload.js',
        filepath: 'memory://preload.js',
      }),
      createTab({
        title: 'main.js',
        filepath: 'memory://main.js',
      }),
    ];
    setTabs(defaultTabs);
    setActiveTabKey(defaultTabs[0].key);
  };

  const setDirty = (tabKey, value) => {
    setTabs((tabs) => {
      const updated = tabs.map((tab) =>
        tab.key === tabKey ? { ...tab, dirty: value } : tab
      );
      return updated;
    });
  };

  const start = async () => {
    await saveAll();
    startWorkspace();
  };

  const stop = async () => {
    stopWorkspace();
  };

  const save = useCallback(
    async (tabKey) => {
      const tab = tabs.find((tab) => tab.key === tabKey);
      if (!tab) return;
      if (!editorRefs.current || !editorRefs.current[tabKey]) return;

      const value = editorRefs.current[tabKey].getValue();

      await ipcRendererManager.invoke(
        IpcEvents.SAVE_USER_FILE,
        tab.filepath,
        value
      );
      setDirty(tabKey, false);
    },
    [tabs]
  );

  const saveAll = useCallback(async () => {
    for (const tab of tabs) {
      await save(tab.key);
    }
  }, [tabs]);

  const load = useCallback(
    async (tabKey) => {
      const tab = tabs.find((tab) => tab.key === tabKey);
      if (!tab || !tab.filepath) return;

      let value = await ipcRendererManager.invoke(
        IpcEvents.LOAD_USER_FILE,
        tab.filepath
      );
      if (value === null) {
        value = getDefaultScript(tab.filepath);
      }
      setDirty(tabKey, false);
      return value;
    },
    [tabs]
  );

  const register = (tabKey, ref) => {
    if (!tabKey || !ref) return;
    editorRefs.current[tabKey] = ref;
  };

  const unregister = (tabKey) => {
    if (!tabKey) return;
    delete editorRefs.current[tabKey];
  };

  return {
    tabs,
    monacoOption,
    activeTabKey,
    setActiveTabKey,
    setDirty,
    start,
    stop,
    save,
    load,
    register,
    unregister,
  };
}

export function useToolbar() {
  const { tabs, activeTabKey, save, start, stop } = useCodeEditorsContext();
  const activeTab = tabs.find((tab) => tab.key === activeTabKey);
  const dirty = !!activeTab?.dirty;
  const execution = useSelector((state) => state.workspace.execution);

  const saveCallback = useCallback(() => {
    save(activeTabKey);
  }, [activeTabKey]);

  return { dirty, execution, save: saveCallback, start, stop };
}

export function useCodeEditorTabs() {
  const { tabs, setActiveTabKey } = useCodeEditorsContext();
  return { tabs, setActiveTabKey };
}

export function useCodeEditor({ tabKey, ref }) {
  const { monacoOption, setDirty, load, register, unregister } =
    useCodeEditorsContext();

  useLayoutEffect(() => {
    register(tabKey, ref);
    return () => {
      unregister(tabKey);
    };
  }, [tabKey, ref]);

  const setDirtyCallback = useCallback(
    (value) => setDirty(tabKey, value),
    [tabKey]
  );

  const loadCallback = useCallback(async () => await load(tabKey), [tabKey]);

  return {
    monacoOption,
    load: loadCallback,
    setDirty: setDirtyCallback,
  };
}