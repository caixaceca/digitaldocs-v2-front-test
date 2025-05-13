import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export function Home() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
      <path
        fill="currentColor"
        d="M33 19a1 1 0 0 1-.71-.29L18 4.41L3.71 18.71A1 1 0 0 1 2.3 17.3l15-15a1 1 0 0 1 1.41 0l15 15A1 1 0 0 1 33 19"
        className="clr-i-solid clr-i-solid-path-1"
      />
      <path
        fill="currentColor"
        d="M18 7.79L6 19.83V32a2 2 0 0 0 2 2h7V24h6v10h7a2 2 0 0 0 2-2V19.76Z"
        className="clr-i-solid clr-i-solid-path-2"
      />
      <path fill="none" d="M0 0h36v36H0z" />
    </svg>
  );
}

export function Dashboard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M14 21a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1zM4 13a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1zm5-2V5H5v6zM4 21a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1zm1-2h4v-2H5zm10 0h4v-6h-4zM13 4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1zm2 1v2h4V5z"
      />
    </svg>
  );
}

export function FilaTrabalho() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 14 14">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.719 12.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1h5.586a1 1 0 0 1 .707.293l3.414 3.414a1 1 0 0 1 .293.707zM6.777 6.375h2.5m-2.5 3.469h2.5" />
        <path d="m2.91 9.787l.838.838L5.145 8.67M2.91 6.256l.838.838l1.397-1.955" />
      </g>
    </svg>
  );
}

export function Controle() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <path fill="currentColor" d="M6 7h8v2H6zm0 4h12v2H6zm0 4h2.99v2H6z" />
      <path
        fill="currentColor"
        d="m14 3l-3-3v2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4v-2H4V4h7v2Zm-4 18l3 3v-2h7a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-4v2h4v16h-7v-2Z"
      />
    </svg>
  );
}

export function Arquivo({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M3 10H2V4.003C2 3.449 2.455 3 2.992 3h18.016A.99.99 0 0 1 22 4.003V10h-1v10.002a.996.996 0 0 1-.993.998H3.993A.996.996 0 0 1 3 20.002zm16 0H5v9h14zM4 5v3h16V5zm5 7h6v2H9z"
        />
      </svg>
    </Icon>
  );
}

export function Parametrizacao() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M21 5h-3m-4.25-2v4M13 5H3m4 7H3m7.75-2v4M21 12H11m10 7h-3m-4.25-2v4M13 19H3"
      />
    </svg>
  );
}

export function Portal() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1.13em" height="1em" viewBox="0 0 576 512">
      <path
        fill="currentColor"
        d="M528 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h480c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48m0 400H303.2c.9-4.5.8 3.6.8-22.4c0-31.8-30.1-57.6-67.2-57.6c-10.8 0-18.7 8-44.8 8c-26.9 0-33.4-8-44.8-8c-37.1 0-67.2 25.8-67.2 57.6c0 26-.2 17.9.8 22.4H48V144h480zm-168-80h112c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8H360c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8m0-64h112c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8H360c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8m0-64h112c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8H360c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8m-168 96c35.3 0 64-28.7 64-64s-28.7-64-64-64s-64 28.7-64 64s28.7 64 64 64"
      />
    </svg>
  );
}

export function Contrato() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
      <path
        fill="currentColor"
        d="M8 8.2h16v1.6H8zm0 8h8.086v1.6H8zm15.378-4H8v1.6h13.779zM12.794 29.072a2.47 2.47 0 0 0 2.194.824h7.804a.7.7 0 0 0 0-1.4h-7.804c-.911-.016-.749-.807-.621-1.052a4 4 0 0 0 .387-.915a1.18 1.18 0 0 0-.616-1.322a1.9 1.9 0 0 0-2.24.517c-.344.355-.822.898-1.28 1.426c.283-1.109.65-2.532 1.01-3.92a1.315 1.315 0 0 0-.755-1.626a1.425 1.425 0 0 0-1.775.793c-.432.831-3.852 6.562-3.886 6.62a.7.7 0 1 0 1.202.718c.128-.215 2.858-4.788 3.719-6.315c-.648 2.5-1.362 5.282-1.404 5.532a.87.87 0 0 0 .407.969a.92.92 0 0 0 1.106-.224c.126-.114.362-.385.957-1.076a62 62 0 0 1 1.703-1.921c.218-.23.35-.128.222.098a2.29 2.29 0 0 0-.33 2.274"
      />
      <path
        fill="currentColor"
        d="M28 21.695V32H4V4h24v4.993l1.33-1.33a4.3 4.3 0 0 1 .67-.54V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v30a1 1 0 0 0 1 1h26a1 1 0 0 0 1-1V21.427a2.9 2.9 0 0 1-2 .268"
      />
      <path
        fill="currentColor"
        d="m34.128 11.861l-.523-.523a1.9 1.9 0 0 0-.11-2.423a1.956 1.956 0 0 0-2.75.162L18.22 21.6l-.837 3.142a.234.234 0 0 0 .296.294l3.131-.847l11.692-11.692l.494.495a.37.37 0 0 1 0 .525l-4.917 4.917a.8.8 0 0 0 1.132 1.131l4.917-4.917a1.97 1.97 0 0 0 0-2.788"
      />
    </svg>
  );
}

export function Todos({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48">
        <defs>
          <mask id="ipTDataAll0">
            <g fill="#555" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
              <ellipse cx="24" cy="11" rx="20" ry="6" />
              <path d="M10.77 15.5C6.62 16.6 4 18.208 4 20c0 3.314 8.954 6 20 6s20-2.686 20-6c0-1.792-2.619-3.4-6.77-4.5c-3.526.933-8.158 1.5-13.23 1.5c-5.072 0-9.703-.567-13.23-1.5" />
              <path d="M10.77 24.5C6.62 25.6 4 27.208 4 29c0 3.314 8.954 6 20 6s20-2.686 20-6c0-1.792-2.619-3.4-6.77-4.5c-3.526.933-8.158 1.5-13.23 1.5c-5.072 0-9.703-.567-13.23-1.5" />
              <path d="M10.77 33.5C6.62 34.6 4 36.208 4 38c0 3.314 8.954 6 20 6s20-2.686 20-6c0-1.792-2.619-3.4-6.77-4.5c-3.526.934-8.158 1.5-13.23 1.5c-5.072 0-9.703-.566-13.23-1.5" />
            </g>
          </mask>
        </defs>
        <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipTDataAll0)" />
      </svg>
    </Icon>
  );
}

export function Media({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12"
          opacity="0.5"
        />
        <path
          fill="currentColor"
          d="M17.576 10.48a.75.75 0 0 0-1.152-.96l-1.797 2.156c-.37.445-.599.716-.786.885a.764.764 0 0 1-.163.122l-.011.005l-.008-.004l-.003-.001a.764.764 0 0 1-.164-.122c-.187-.17-.415-.44-.786-.885l-.292-.35c-.328-.395-.625-.75-.901-1c-.301-.272-.68-.514-1.18-.514c-.5 0-.878.242-1.18.514c-.276.25-.572.605-.9 1l-1.83 2.194a.75.75 0 0 0 1.153.96l1.797-2.156c.37-.445.599-.716.786-.885a.769.769 0 0 1 .163-.122l.007-.003l.004-.001c.003 0 .006.002.011.004a.768.768 0 0 1 .164.122c.187.17.415.44.786.885l.292.35c.329.395.625.75.901 1c.301.272.68.514 1.18.514c.5 0 .878-.242 1.18-.514c.276-.25.572-.605.9-1z"
        />
      </svg>
    </Icon>
  );
}

export function Maximo({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12"
          opacity="0.5"
        />
        <path
          fill="currentColor"
          d="M22 5a3 3 0 1 1-6 0a3 3 0 0 1 6 0m-7.5 5.75a.75.75 0 0 1 0-1.5H17a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-.69l-2.013 2.013a1.75 1.75 0 0 1-2.474 0l-1.586-1.586a.25.25 0 0 0-.354 0L7.53 14.53a.75.75 0 0 1-1.06-1.06l2.293-2.293a1.75 1.75 0 0 1 2.474 0l1.586 1.586a.25.25 0 0 0 .354 0l2.012-2.013z"
        />
      </svg>
    </Icon>
  );
}

export function Seguimento({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M14.676 1.054a1 1 0 0 1 1.113.332l7 9a1 1 0 0 1 0 1.228l-7 9A1 1 0 0 1 14 20v-3.99c-5.379.112-7.963 1.133-9.261 2.243c-1.234 1.055-1.46 2.296-1.695 3.596l-.061.335a1 1 0 0 1-1.981-.122c-.172-2.748.086-6.73 2.027-10.061C4.913 8.768 8.305 6.282 14 6.022V2a1 1 0 0 1 .675-.946"
          clipRule="evenodd"
        />
      </svg>
    </Icon>
  );
}

export function Libertar({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M6 8c0-2.21 1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4s-4-1.79-4-4m6 10.2c0-.96.5-1.86 1.2-2.46V14.5c0-.05.02-.11.02-.16c-.99-.22-2.07-.34-3.22-.34c-4.42 0-8 1.79-8 4v2h10zm10 .1v3.5c0 .6-.6 1.2-1.3 1.2h-5.5c-.6 0-1.2-.6-1.2-1.3v-3.5c0-.6.6-1.2 1.2-1.2v-2.5c0-1.4 1.4-2.5 2.8-2.5s2.8 1.1 2.8 2.5v.5h-1.3v-.5c0-.8-.7-1.3-1.5-1.3s-1.5.5-1.5 1.3V17h4.3c.6 0 1.2.6 1.2 1.3"
        />
      </svg>
    </Icon>
  );
}

export function Editar({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
        <path
          fill="currentColor"
          d="M28 30H6V8h13.22l2-2H6a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V15l-2 2Z"
          className="clr-i-outline clr-i-outline-path-1"
        />
        <path
          fill="currentColor"
          d="m33.53 5.84l-3.37-3.37a1.61 1.61 0 0 0-2.28 0L14.17 16.26l-1.11 4.81A1.61 1.61 0 0 0 14.63 23a1.7 1.7 0 0 0 .37 0l4.85-1.07L33.53 8.12a1.61 1.61 0 0 0 0-2.28M18.81 20.08l-3.66.81l.85-3.63L26.32 6.87l2.82 2.82ZM30.27 8.56l-2.82-2.82L29 4.16L31.84 7Z"
          className="clr-i-outline clr-i-outline-path-2"
        />
        <path fill="none" d="M0 0h36v36H0z" />
      </svg>
    </Icon>
  );
}

export function Resgatar({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 8H5V3m.291 13.357a8 8 0 1 0 .188-8.991"
        />
      </svg>
    </Icon>
  );
}

export function Atribuir({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
        <circle cx="17.99" cy="10.36" r="6.81" fill="currentColor" className="clr-i-solid clr-i-solid-path-1" />
        <path
          fill="currentColor"
          d="M12 26.65a2.8 2.8 0 0 1 4.85-1.8L20.71 29l6.84-7.63A16.8 16.8 0 0 0 18 18.55A16.13 16.13 0 0 0 5.5 24a1 1 0 0 0-.2.61V30a2 2 0 0 0 1.94 2h8.57l-3.07-3.3a2.8 2.8 0 0 1-.74-2.05"
          className="clr-i-solid clr-i-solid-path-2"
        />
        <path
          fill="currentColor"
          d="M28.76 32a2 2 0 0 0 1.94-2v-3.76L25.57 32Z"
          className="clr-i-solid clr-i-solid-path-3"
        />
        <path
          fill="currentColor"
          d="M33.77 18.62a1 1 0 0 0-1.42.08l-11.62 13l-5.2-5.59a1 1 0 0 0-1.41-.11a1 1 0 0 0 0 1.42l6.68 7.2L33.84 20a1 1 0 0 0-.07-1.38"
          className="clr-i-solid clr-i-solid-path-4"
        />
        <path fill="none" d="M0 0h36v36H0z" />
      </svg>
    </Icon>
  );
}

export function Detalhes({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2M4 19V5h16l.002 14z"
        />
        <path fill="currentColor" d="M6 7h12v2H6zm0 4h12v2H6zm0 4h6v2H6z" />
      </svg>
    </Icon>
  );
}

export function Eliminar({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <g fill="none">
          <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
          <path
            fill="currentColor"
            d="M14.28 2a2 2 0 0 1 1.897 1.368L16.72 5H20a1 1 0 1 1 0 2l-.003.071l-.867 12.143A3 3 0 0 1 16.138 22H7.862a3 3 0 0 1-2.992-2.786L4.003 7.07A1.01 1.01 0 0 1 4 7a1 1 0 0 1 0-2h3.28l.543-1.632A2 2 0 0 1 9.721 2zm3.717 5H6.003l.862 12.071a1 1 0 0 0 .997.929h8.276a1 1 0 0 0 .997-.929zM10 10a1 1 0 0 1 .993.883L11 11v5a1 1 0 0 1-1.993.117L9 16v-5a1 1 0 0 1 1-1m4 0a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1m.28-6H9.72l-.333 1h5.226z"
          />
        </g>
      </svg>
    </Icon>
  );
}

export function Contraste({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m1-2.075q2.975-.375 4.988-2.613T20 12t-2.013-5.312T13 4.075z"
        />
      </svg>
    </Icon>
  );
}

export function ContrasteAlt({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48">
        <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="4">
          <path strokeLinecap="round" d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20z" clipRule="evenodd" />
          <path d="M24 4c11.046 0 20 8.954 20 20s-8.954 20-20 20z" />
          <path strokeLinecap="round" d="M24 36H9m15-8H5m19-8H5m19-8H9" />
        </g>
      </svg>
    </Icon>
  );
}

export function AddAnexo({ ...other }) {
  return (
    <Icon {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M16 11V6h2v5zm-5 6.9q-.875-.25-1.437-.975T9 15.25V6h2zm.75 4.1q-2.6 0-4.425-1.825T5.5 15.75V6.5q0-1.875 1.313-3.187T10 2t3.188 1.313T14.5 6.5V14h-2V6.5q-.025-1.05-.737-1.775T10 4t-1.775.725T7.5 6.5v9.25q-.025 1.775 1.225 3.013T11.75 20q.625 0 1.188-.162T14 19.35v2.225q-.525.2-1.088.313T11.75 22M16 21v-3h-3v-2h3v-3h2v3h3v2h-3v3z"
        />
      </svg>
    </Icon>
  );
}

// ----------------------------------------------------------------------

Icon.propTypes = { children: PropTypes.node };

export function Icon({ children, ...other }) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': { width: '100%', height: '100%', ...other?.sx },
      }}
    >
      {children}
    </Box>
  );
}
