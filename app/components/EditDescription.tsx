import React, { useRef, useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { MilkdownEditor, MilkdownRef } from '@tagspaces/tagspaces-md';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getDirectoryPath, OpenedEntry } from '-/reducers/app';
import { useDescriptionContext } from '-/hooks/useDescriptionContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import EditDescriptionButtons from '-/components/EditDescriptionButtons';

const PREFIX = 'EditDescription';

const classes = {
  mdHelpers: `${PREFIX}-mdHelpers`,
  formControl: `${PREFIX}-formControl`
};

const Root = styled('div')(({ theme }) => ({
  height: '90%',
  [`& .${classes.mdHelpers}`]: {
    borderRadius: '0.25rem',
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
    backgroundColor: '#bcc0c561'
  },
  [`& .${classes.formControl}`]: {
    marginLeft: theme.spacing(0),
    width: '100%'
  }
}));

function EditDescription() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { openedEntries } = useOpenedEntryContext();
  const openedFile: OpenedEntry = openedEntries[0];
  const currentFolder = useSelector(getDirectoryPath);
  const fileDescriptionRef = useRef<MilkdownRef>(null);
  const { description, setDescription } = useDescriptionContext();

  const [editMode, setEditMode] = useState<boolean>(false);
  const descriptionFocus = useRef<boolean>(false);
  const descriptionButtonsRef = useRef(null);

  useEffect(() => {
    fileDescriptionRef.current?.setDarkMode(theme.palette.mode === 'dark');
  }, [theme]);

  /*const keyBindingHandlers = {
    saveDocument: () => {
      //setEditMode(!editMode);
      toggleEditDescriptionField();
    } /!*dispatch(AppActions.openNextFile())*!/
  };*/

  const milkdownOnFocus = React.useCallback(
    () => (descriptionFocus.current = true),
    []
  );
  const milkdownListener = React.useCallback((markdown: string) => {
    if (descriptionFocus.current && markdown !== description) {
      setDescription(markdown);
      descriptionButtonsRef.current.setDescriptionChanged(true);
    }
    // update codeMirror
    /*const { current } = codeMirrorRef;
      if (!current) return;
      current.update(markdown);*/
  }, []);

  const noDescription = !description || description.length < 1;
  return (
    <Root>
      <span style={{ verticalAlign: 'sub', paddingLeft: 5 }}>
        <Typography
          variant="caption"
          style={{
            color: theme.palette.text.primary
          }}
        >
          Markdown help: <i className={classes.mdHelpers}>_italic_</i>{' '}
          <b className={classes.mdHelpers}>**bold**</b>{' '}
          <span className={classes.mdHelpers}>* list item</span>{' '}
          <span className={classes.mdHelpers}>[Link text](http://...)</span>
        </Typography>
        {/*<Typography
          style={{ color: theme.palette.text.primary }}
          variant="caption"
        >
          {t('core:filePropertiesDescription')}
        </Typography>*/}
      </span>
      {!openedFile.editMode && (
        <EditDescriptionButtons
          buttonsRef={descriptionButtonsRef}
          editMode={editMode}
          setEditMode={setEditMode}
        />
      )}
      <div
        data-tid="descriptionTID"
        onDoubleClick={() => {
          if (!editMode && !openedFile.editMode) {
            setEditMode(true);
          }
        }}
        style={{
          border: '1px solid lightgray',
          borderRadius: 5,
          //minHeight: 150,
          //maxHeight: 200,
          // maxHeight: noDescription && !editMode ? 100 : 250,
          height: '100%',
          width: 'calc(100% - 8px)',
          overflowY: 'auto'
        }}
      >
        {noDescription && !editMode ? (
          <Typography
            variant="caption"
            style={{
              color: theme.palette.text.primary,
              padding: 10,
              lineHeight: 4
            }}
          >
            {t(
              openedFile.editMode
                ? 'core:editDisabled'
                : 'core:addMarkdownDescription'
            )}
          </Typography>
        ) : (
          <>
            <style>
              {`
        .prose a {
             color: ${theme.palette.primary.main};
        }
        .prose img {
             max-width: 99%;
        }
        `}
            </style>
            <MilkdownEditor
              ref={fileDescriptionRef}
              content={description || ''}
              onChange={milkdownListener}
              onFocus={milkdownOnFocus}
              readOnly={!editMode}
              lightMode={false}
              excludePlugins={!editMode ? ['menu', 'upload'] : []}
              currentFolder={currentFolder}
            />
          </>
        )}
      </div>
    </Root>
  );
}

export default EditDescription;
