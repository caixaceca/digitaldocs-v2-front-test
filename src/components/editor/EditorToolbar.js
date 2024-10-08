import PropTypes from 'prop-types';
import { Quill } from 'react-quill';
// components
import Iconify from '../Iconify';
//
import EditorToolbarStyle from './EditorToolbarStyle';

// ----------------------------------------------------------------------

const FONT_FAMILY = ['Neo Sans Std', 'Arial', 'Tahoma', 'Georgia', 'Impact', 'Verdana'];

const FONT_SIZE = [
  '8px',
  '9px',
  '10px',
  '12px',
  '14px',
  '16px',
  '20px',
  '24px',
  '32px',
  '42px',
  '54px',
  '68px',
  '84px',
  '98px',
];
const HEADINGS = ['Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6'];

export function undoChange() {
  this.quill.history.undo();
}
export function redoChange() {
  this.quill.history.redo();
}

const Size = Quill.import('attributors/style/size');
Size.whitelist = FONT_SIZE;
Quill.register(Size, true);

const Font = Quill.import('attributors/style/font');
Font.whitelist = FONT_FAMILY;
Quill.register(Font, true);

export const formats = [
  'align',
  'background',
  'blockquote',
  'bold',
  'bullet',
  'code',
  'code-block',
  'color',
  'direction',
  'font',
  'formula',
  'header',
  'image',
  'indent',
  'italic',
  'link',
  'list',
  'script',
  'size',
  'strike',
  'table',
  'underline',
  'video',
];

EditorToolbar.propTypes = { id: PropTypes.string.isRequired, isSimple: PropTypes.bool };

export default function EditorToolbar({ id, isSimple, ...other }) {
  return (
    <EditorToolbarStyle {...other}>
      <div id={id}>
        <div className="ql-formats">
          {!isSimple && (
            <select className="ql-font" defaultValue="">
              <option value="">Font</option>
              {FONT_FAMILY.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          )}

          <select className="ql-size" defaultValue="16px">
            {FONT_SIZE.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <select className="ql-header" defaultValue="">
            {HEADINGS.map((heading, index) => (
              <option key={heading} value={index + 1}>
                {heading}
              </option>
            ))}
            <option value="">Normal</option>
          </select>
        </div>

        <div className="ql-formats">
          <button type="button" className="ql-bold">
            {' '}
          </button>
          <button type="button" className="ql-italic">
            {' '}
          </button>
          <button type="button" className="ql-underline">
            {' '}
          </button>
          {!isSimple && (
            <button type="button" className="ql-strike">
              {' '}
            </button>
          )}
        </div>

        <div className="ql-formats">
          <select className="ql-color" />
          {!isSimple && <select className="ql-background" />}
        </div>

        <div className="ql-formats">
          <button type="button" className="ql-list" value="ordered">
            {' '}
          </button>
          <button type="button" className="ql-list" value="bullet">
            {' '}
          </button>
          {!isSimple && (
            <button type="button" className="ql-indent" value="-1">
              {' '}
            </button>
          )}
          {!isSimple && (
            <button type="button" className="ql-indent" value="+1">
              {' '}
            </button>
          )}
        </div>

        {!isSimple && (
          <div className="ql-formats">
            <button type="button" className="ql-script" value="super">
              {' '}
            </button>
            <button type="button" className="ql-script" value="sub">
              {' '}
            </button>
          </div>
        )}

        {!isSimple && (
          <div className="ql-formats">
            <button type="button" className="ql-code-block">
              {' '}
            </button>
            <button type="button" className="ql-blockquote">
              {' '}
            </button>
          </div>
        )}

        <div className="ql-formats">
          <button type="button" className="ql-direction" value="rtl">
            {' '}
          </button>
          <select className="ql-align" />
        </div>

        {!isSimple && (
          <div className="ql-formats">
            <button type="button" className="ql-link">
              {' '}
            </button>
            <button type="button" className="ql-image">
              {' '}
            </button>
            <button type="button" className="ql-video">
              {' '}
            </button>
          </div>
        )}

        {!isSimple && (
          <div className="ql-formats">
            <button type="button" className="ql-formula">
              {' '}
            </button>
            <button type="button" className="ql-clean">
              {' '}
            </button>
          </div>
        )}

        {!isSimple && (
          <div className="ql-formats">
            <button type="button" className="ql-undo">
              <Iconify icon={'ic:round-undo'} width={18} height={18} />
            </button>
            <button type="button" className="ql-redo">
              <Iconify icon={'ic:round-redo'} width={18} height={18} />
            </button>
          </div>
        )}
      </div>
    </EditorToolbarStyle>
  );
}
