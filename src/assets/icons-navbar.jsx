import { Icon } from './icons';

// ---------------------------------------------------------------------------------------------------------------------

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
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M19 11a2 2 0 0 1 1.995 1.85L21 13v6a2 2 0 0 1-1.85 1.995L19 21h-4a2 2 0 0 1-1.995-1.85L13 19v-6a2 2 0 0 1 1.85-1.995L15 11zm0-8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
        className="duoicon-secondary-layer"
        opacity="0.5"
        strokeWidth="0.5"
        stroke="currentColor"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9 3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
        className="duoicon-primary-layer"
        strokeWidth="0.5"
        stroke="currentColor"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9 15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"
        className="duoicon-secondary-layer"
        opacity="0.5"
        strokeWidth="0.5"
        stroke="currentColor"
      />
    </svg>
  );
}

export function FilaTrabalho() {
  return (
    <Icon sx={{ p: 0.15 }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
        <path
          fill="currentColor"
          d="M139.61 35.5a12 12 0 0 0-17 0L58.93 98.81l-22.7-22.12a12 12 0 0 0-17 0L3.53 92.41a12 12 0 0 0 0 17l47.59 47.4a12.78 12.78 0 0 0 17.61 0l15.59-15.62L156.52 69a12.09 12.09 0 0 0 .09-17zm0 159.19a12 12 0 0 0-17 0l-63.68 63.72l-22.7-22.1a12 12 0 0 0-17 0L3.53 252a12 12 0 0 0 0 17L51 316.5a12.77 12.77 0 0 0 17.6 0l15.7-15.69l72.2-72.22a12 12 0 0 0 .09-16.9zM64 368c-26.49 0-48.59 21.5-48.59 48S37.53 464 64 464a48 48 0 0 0 0-96m432 16H208a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h288a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16m0-320H208a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h288a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16m0 160H208a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h288a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16"
        />
      </svg>
    </Icon>
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
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54c.184-.077.417-.077.883-.077h3c.466 0 .699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883s0 .699-.076.883a1 1 0 0 1-.541.54c-.184.077-.417.077-.883.077h-3c-.466 0-.699 0-.883-.076a1 1 0 0 1-.54-.541C9 12.699 9 12.466 9 12Z" />
          <path
            strokeLinecap="round"
            d="M20.5 7v6c0 3.771 0 5.657-1.172 6.828S16.271 21 12.5 21h-1c-3.771 0-5.657 0-6.828-1.172S3.5 16.771 3.5 13V7"
            opacity="0.6"
          />
          <path d="M2 5c0-.943 0-1.414.293-1.707S3.057 3 4 3h16c.943 0 1.414 0 1.707.293S22 4.057 22 5s0 1.414-.293 1.707S20.943 7 20 7H4c-.943 0-1.414 0-1.707-.293S2 5.943 2 5Z" />
        </g>
      </svg>
    </Icon>
  );
}

export function Parametrizacao() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M8 4a1 1 0 1 0 0 2a1 1 0 0 0 0-2M5.17 4a3.001 3.001 0 0 1 5.66 0H22v2H10.83a3.001 3.001 0 0 1-5.66 0H2V4zm8 7a3.001 3.001 0 0 1 5.66 0H22v2h-3.17a3.001 3.001 0 0 1-5.66 0H2v-2zM16 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2m-8 7a1 1 0 1 0 0 2a1 1 0 0 0 0-2m-2.83 0a3.001 3.001 0 0 1 5.66 0H22v2H10.83a3.001 3.001 0 0 1-5.66 0H2v-2z"
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
