/**
 * Window Manager - Renders all open windows
 */
import { AnimatePresence } from 'framer-motion';
import { useOSStore } from '../../state/osStore';
import { Window } from './Window';
import { FileManager } from '../../apps/FileManager';
import { TaskManager } from '../../apps/TaskManager';
import { Editor } from '../../apps/Editor';
import { Settings } from '../../apps/Settings';
import type { WindowState } from '../../types';

// Components that accept window prop
const WINDOW_AWARE_APPS: Record<string, React.ComponentType<{ window: WindowState }>> = {
  'editor': Editor,
};

// Components that don't need window prop
const SIMPLE_APPS: Record<string, React.ComponentType> = {
  'file-manager': FileManager,
  'task-manager': TaskManager,
  'settings': Settings,
};

const APP_METADATA: Record<string, { title: string; icon: string }> = {
  'file-manager': { title: 'File Manager', icon: '📁' },
  'task-manager': { title: 'Task Manager', icon: '📊' },
  'editor': { title: 'Editor', icon: '📝' },
  'settings': { title: 'Settings', icon: '⚙️' },
};

export function WindowManager() {
  const windows = useOSStore(state => state.windows);

  return (
    <AnimatePresence>
      {windows.map(win => {
        const metadata = APP_METADATA[win.app];
        
        if (!metadata) {
          console.warn(`Unknown app type: ${win.app}`);
          return null;
        }

        const { title, icon } = metadata;

        // Check if it's a window-aware component
        const WindowAwareComponent = WINDOW_AWARE_APPS[win.app];
        if (WindowAwareComponent) {
          return (
            <Window key={win.window_id} window={win} title={title} icon={icon}>
              <WindowAwareComponent window={win} />
            </Window>
          );
        }

        // Simple component
        const SimpleComponent = SIMPLE_APPS[win.app];
        if (SimpleComponent) {
          return (
            <Window key={win.window_id} window={win} title={title} icon={icon}>
              <SimpleComponent />
            </Window>
          );
        }

        return null;
      })}
    </AnimatePresence>
  );
}
