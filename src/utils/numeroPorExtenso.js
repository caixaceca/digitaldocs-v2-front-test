const numero = require('numero-por-extenso');

// ----------------------------------------------------------------------

export function valorPorExtenso(valor) {
  let _valor = '';
  if (valor > 1999 || valor < 1000) {
    _valor = numero.porExtenso(valor, numero.estilo.monetario);
  } else if (valor === 1000) {
    _valor = 'mil escudos';
  } else if (
    (valor > 1000 && valor < 1101) ||
    valor === 110 ||
    valor === 1200 ||
    valor === 1300 ||
    valor === 1400 ||
    valor === 1500 ||
    valor === 1600 ||
    valor === 1700 ||
    valor === 1800 ||
    valor === 1900
  ) {
    _valor = `mil e ${numero.porExtenso(valor - 1000, numero.estilo.monetario)}`;
  } else {
    _valor = `mil ${numero.porExtenso(valor - 1000, numero.estilo.monetario)}`;
  }
  return _valor?.replace('real', 'escudo')?.replace('reais', 'escudos');
}
