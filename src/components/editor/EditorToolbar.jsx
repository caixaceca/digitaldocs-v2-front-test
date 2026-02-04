import { Quill } from 'react-quill-new';
// components
import Iconify from '../Iconify';
import EditorToolbarStyle from './EditorToolbarStyle';

// ---------------------------------------------------------------------------------------------------------------------

const FONT_FAMILY = ['Neo Sans Std', 'Arial', 'Tahoma', 'Georgia', 'Impact', 'Verdana'];
const FONT_SIZE = [
  ...['8px', '9px', '10px', '12px', '14px', '16px', '18px', '20px'],
  ...['24px', '32px', '42px', '54px', '68px', '84px', '98px'],
];
const HEADINGS = ['Título 1', 'Título 2', 'Título 3', 'Título 4', 'Título 5', 'Título 6'];

const Size = Quill.import('attributors/style/size');
Size.whitelist = FONT_SIZE;
Quill.register(Size, true);

const Font = Quill.import('attributors/style/font');
Font.whitelist = FONT_FAMILY;
Quill.register(Font, true);

export const formats = [
  ...['align', 'background', 'blockquote', 'bold', 'code', 'code-block', 'color', 'direction', 'font', 'formula'],
  ...['header', 'image', 'indent', 'italic', 'link', 'list', 'script', 'size', 'strike', 'table', 'underline', 'video'],
];

const baseColor = ['#000000', '#454F5B', '#C4CDD5', '#DFE3E8', '#FFFFFF'];
const darkerColor = ['#275110', '#103399', '#005B6B', '#994F00', '#992926', '#D6D6D6'];
const darkColor = ['#3E7A1B', '#1A4FCC', '#0089A0', '#CC7700', '#CC3833', '#4D4D4D'];
const mainColor = ['#5AAA28', '#3366FF', '#00B8D9', '#FF9800', '#FF4842', '#AAAAAA'];
const ligthColor = ['#A3D98A', '#809FFF', '#66D9EB', '#FFD966', '#FF8A85', '#826AF9'];
const ligtherColor = ['#E6F4DB', '#DDE5FF', '#D2F4FA', '#FFF3CC', '#FFDADA', '#FFE700'];
const CUSTOM_COLORS = [...baseColor, ...darkerColor, ...darkColor, ...mainColor, ...ligthColor, ...ligtherColor];

// Undo/Redo handlers
export function undoChange() {
  this.quill.history.undo();
}
export function redoChange() {
  this.quill.history.redo();
}

// Custom reusable helpers
const renderSelect = (className, options, defaultValue, placeholder) => (
  <select className={className} defaultValue={defaultValue}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((value, i) => (
      <option key={value} value={className === 'ql-header' ? i + 1 : value}>
        {value}
      </option>
    ))}
  </select>
);

const renderButton = (className, value = null, icon = null) => (
  <button type="button" className={className} value={value}>
    {icon}
  </button>
);

// Main component
export default function EditorToolbar({ id, isSimple, ...other }) {
  return (
    <EditorToolbarStyle {...other}>
      <div id={id}>
        {/* Font, Size, Heading */}
        <div className="ql-formats">
          {!isSimple && renderSelect('ql-font', FONT_FAMILY, 'Neo Sans Std', 'Fonte')}
          {renderSelect('ql-size', FONT_SIZE, '16px', '16px')}
          {renderSelect('ql-header', HEADINGS, 'Normal', 'Normal')}
        </div>

        {/* Text Style */}
        <div className="ql-formats">
          {renderButton('ql-bold')}
          {renderButton('ql-italic')}
          {renderButton('ql-underline')}
          {!isSimple && renderButton('ql-strike')}
        </div>

        {/* Colors */}
        <div className="ql-formats">
          <select className="ql-color">
            <option selected />
            {CUSTOM_COLORS.map((color) => (
              <option key={color} value={color} />
            ))}
          </select>

          {!isSimple && (
            <select className="ql-background">
              <option selected />
              {CUSTOM_COLORS.map((color) => (
                <option key={color} value={color} />
              ))}
            </select>
          )}
        </div>

        {/* Lists & Indentation */}
        <div className="ql-formats">
          {renderButton('ql-list', 'ordered')}
          {renderButton('ql-list', 'bullet')}
          {!isSimple && renderButton('ql-indent', '-1')}
          {!isSimple && renderButton('ql-indent', '+1')}
        </div>

        {/* Superscript/Subscript */}
        {!isSimple && (
          <div className="ql-formats">
            {renderButton('ql-script', 'super')}
            {renderButton('ql-script', 'sub')}
          </div>
        )}

        {/* Code block & blockquote */}
        {!isSimple && (
          <div className="ql-formats">
            {renderButton('ql-code-block')}
            {renderButton('ql-blockquote')}
          </div>
        )}

        {/* Direction & Align */}
        <div className="ql-formats">
          {!isSimple && renderButton('ql-direction', 'rtl')}
          <select className="ql-align" />
        </div>

        {/* Link */}
        {!isSimple && <div className="ql-formats">{renderButton('ql-link')}</div>}

        {/* Undo/Redo */}
        {!isSimple && (
          <div className="ql-formats">
            {renderButton('ql-undo', null, <Iconify icon="ic:round-undo" width={18} height={18} />)}
            {renderButton('ql-redo', null, <Iconify icon="ic:round-redo" width={18} height={18} />)}
          </div>
        )}
      </div>
    </EditorToolbarStyle>
  );
}
