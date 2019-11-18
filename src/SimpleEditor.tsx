import React, { PureComponent, RefObject } from 'react';
import { PanelEditorProps, PanelOptionsGroup } from '@grafana/ui';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/addon/display/fullscreen';
import 'codemirror/addon/display/fullscreen.css';
import { SimpleOptions } from './types';
import './style.css';

export interface SimpleEditor {
  editorRef: RefObject<HTMLElement> | any;
  cm: CodeMirror.EditorFromTextArea;
}

function fullscreenToggleGen() {
  let state = false;
  function setFullscreen(cm: CodeMirror.Editor) {
    const wrap = cm.getWrapperElement();
    cm.state.fullScreenRestore = {
      scrollTop: window.pageYOffset,
      scrollLeft: window.pageXOffset,
      width: wrap.style.width,
      height: wrap.style.height,
    };
    wrap.style.width = '';
    wrap.style.height = 'auto';
    wrap.className += ' CodeMirror-fullscreen';
    document.documentElement.style.overflow = 'hidden';
    cm.refresh();
  }

  function setNormal(cm: CodeMirror.Editor) {
    const wrap = cm.getWrapperElement();
    wrap.className = wrap.className.replace(/\s*CodeMirror-fullscreen\b/, '');
    document.documentElement.style.overflow = '';
    const info = cm.state.fullScreenRestore;
    wrap.style.width = info.width;
    wrap.style.height = info.height;
    window.scrollTo(info.scrollLeft, info.scrollTop);
    cm.refresh();
  }

  return (cm: CodeMirror.Editor) => {
    state = !state;
    if (state) {
      setFullscreen(cm);
    } else {
      setNormal(cm);
    }
  };
}

export class SimpleEditor extends PureComponent<PanelEditorProps<SimpleOptions>> {
  fullscreenToggle: any;
  constructor(props: any) {
    super(props);

    this.editorRef = React.createRef();
  }

  componentDidMount() {
    const fullscreenToggle = fullscreenToggleGen();
    this.cm = CodeMirror.fromTextArea(this.editorRef.current, {
      theme: 'darcula',
      mode: 'javascript',
      tabSize: 2,
      extraKeys: {
        'Ctrl-Enter': cm => {
          fullscreenToggle(cm);
          // cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
      },
    });

    this.cm.on('blur', (cm: any) => {
      this.props.onOptionsChange({ ...this.props.options, getOption: cm.doc.getValue() });
    });

    // bad hack: try to fix Fix display problems when CodeMoirror is initialized
    setTimeout(() => this.cm.refresh(), 0);
  }

  componentWillUnmount() {
    if (this.cm) {
      this.cm.toTextArea();
    }
  }

  render() {
    const funcStart = 'function (data) {';
    const funcEnd = '}';
    return (
      <PanelOptionsGroup title="Echarts Option">
        <p style={{ opacity: '0.5' }}>// This function should return the options called by echarts.setOption</p>
        <h5>{funcStart}</h5>
        <textarea ref={this.editorRef} value={this.props.options.getOption} />
        <h5>{funcEnd}</h5>
      </PanelOptionsGroup>
    );
  }
}
