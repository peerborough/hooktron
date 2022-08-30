import { useState, useMemo, useEffect } from 'react';
import { createContext } from '../hooks/context';
import { ipcRendererManager, useIpcRendererListener } from '../ipc';
import { IpcEvents } from '../../ipcEvents';

export const [WorkspaceProvider, useWorkspaceContext] = createContext({
  name: 'WorkspaceContext',
});

export const activityViews = ['play', 'files'];
export const activeViewToIndex = (name) => activityViews.indexOf(name);

export function useWorkspaceProvider() {
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    (async function () {
      const workspace = await ipcRendererManager.invoke(
        IpcEvents.GET_CURRENT_WORKSPACE
      );
      if (!workspace) return;
      setWorkspace(workspace);
    })();
  }, []);

  useIpcRendererListener(IpcEvents.WORKSPACE_CHANGED, (newValue) => {
    if (workspace && newValue[workspace.id]) {
      setWorkspace(newValue[workspace.id]);
    }
  });

  const [scriptVersionId, setScriptVersionId] = useState(1);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [activityIndex, setActivityIndex] = useState(
    activeViewToIndex('files')
  );

  const addConsoleLog = (log) => {
    setConsoleLogs((logs) => [...logs, log]);
  };

  return {
    workspace,
    scriptVersionId,
    consoleLogs,
    activityIndex,
    setScriptVersionId,
    addConsoleLog,
    setActivityIndex,
  };
}
