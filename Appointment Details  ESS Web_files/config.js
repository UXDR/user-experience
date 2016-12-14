/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
    // config.uiColor = '#AADC6E';
    config.contentsCss = CKEDITOR.basePath + "contents.css";
    config.language = "en";
    config.ignoreEmptyParagraph = true;
    config.removePlugins = 'scayt,tabletools,contextmenu,liststyle';
    config.disableNativeSpellChecker = false;
    // Paste from word.
    config.pasteFromWordRemoveStyles = true;
    config.pasteFromWordRemoveFontStyles = true; 
    config.forcePasteAsPlainText = false;
    // Hide 'Advanced' and 'Target' tab for link dialog.
    config.linkShowAdvancedTab = false;
    config.linkShowTargetTab = false;
    //config.baseFloatZIndex = 1090;
    //config.startupFocus = true;
    //config.startupMode = 'source';
    //config["data-cke-resizable"] = CKEDITOR.DIALOG_RESIZE_NONE;
    //config.resize_enabled = false;
    //config.disableObjectResizing = true;
};
