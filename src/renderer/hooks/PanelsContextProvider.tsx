/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import React, { createContext, useEffect, useMemo, useRef } from 'react';
import AppConfig from '-/AppConfig';

type PanelType =
  | 'locationManagerPanel'
  | 'tagLibraryPanel'
  | 'searchPanel'
  | 'helpFeedbackPanel';
type PanelsContextData = {
  currentOpenedPanel: PanelType;
  showPanel: (panel: PanelType) => void;
};

export const PanelsContext = createContext<PanelsContextData>({
  currentOpenedPanel: undefined,
  showPanel: undefined,
});

export type PanelsContextProviderProps = {
  children: React.ReactNode;
};

export const PanelsContextProvider = ({
  children,
}: PanelsContextProviderProps) => {
  const currentOpenedPanel = useRef<PanelType>('locationManagerPanel');
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('panels', (arg) => {
        if (arg === 'open-location-manager-panel') {
          showPanel('locationManagerPanel');
        } else if (arg === 'open-tag-library-panel') {
          showPanel('tagLibraryPanel');
        } else if (arg === 'open-help-feedback-panel') {
          showPanel('helpFeedbackPanel');
        }
      });

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners('panels');
        }
      };
    }
  }, []);

  function showPanel(panel: PanelType) {
    currentOpenedPanel.current = panel;
    forceUpdate();
  }

  const context = useMemo(() => {
    return {
      currentOpenedPanel: currentOpenedPanel.current,
      showPanel: showPanel,
    };
  }, [currentOpenedPanel.current]);

  return (
    <PanelsContext.Provider value={context}>{children}</PanelsContext.Provider>
  );
};
