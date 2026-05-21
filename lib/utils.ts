import type { Subject } from './types';

export function apsPoints(mark: number): number {
  if (mark >= 80) return 7;
  if (mark >= 70) return 6;
  if (mark >= 60) return 5;
  if (mark >= 50) return 4;
  if (mark >= 40) return 3;
  if (mark >= 30) return 2;
  return 1;
}

export function calcAPS(subjects: Subject[]): number {
  return subjects
    .filter(s => s.subjectType !== 'life_orientation' && s.id !== 'lo')
    .map(s => apsPoints(s.mark))
    .sort((a, b) => b - a)
    .slice(0, 6)
    .reduce((a, b) => a + b, 0);
}

// Cambridge IGCSE/O-Level/AS/A-Level grade \u2192 NSC APS points
export function cambridgeGradeToPoints(grade: string): number {
  switch (grade.trim().toUpperCase()) {
    case 'A*': return 7;
    case 'A':  return 6;
    case 'B':  return 5;
    case 'C':  return 4;
    case 'D':  return 3;
    case 'E':  return 2;
    default:   return 1;
  }
}

// NC(V) Level 4 mark \u2192 NSC APS points
export function ncvMarkToPoints(mark: number): number {
  if (mark >= 80) return 7;
  if (mark >= 60) return 5;
  if (mark >= 40) return 3;
  if (mark >= 30) return 1;
  return 0;
}

// IB score (1\u20137) \u2192 NSC APS points (direct mapping)
export function ibScoreToPoints(score: number): number {
  return Math.max(1, Math.min(7, Math.round(score)));
}

// APS for any curriculum \u2014 dispatches to correct converter per subject
export function calcAPSForCurriculum(subjects: Subject[]): number {
  const scored = subjects
    .filter(s => s.subjectType !== 'life_orientation' && s.id !== 'lo')
    .map(s => {
      const c = s.curriculum;
      if (c === 'Cambridge_IGCSE' || c === 'Cambridge_AS' || c === 'Cambridge_A') {
        return s.grade ? cambridgeGradeToPoints(s.grade) : cambridgeGradeToPoints(String(s.mark));
      }
      if (c === 'NCV') return ncvMarkToPoints(s.mark);
      if (c === 'IB')  return ibScoreToPoints(s.mark);
      return apsPoints(s.mark); // NSC, IEB, default
    });
  return scored.sort((a, b) => b - a).slice(0, 6).reduce((a, b) => a + b, 0);
}

export function fmtR(n: number): string {
  return 'R\u00A0' + n.toLocaleString('en-ZA');
}

export function uniToneClass(nameOrShort: string): string {
  const u = nameOrShort.toLowerCase();
  if (u === 'uct'     || u.includes('cape town'))                      return 'uct';
  if (u === 'wits'    || u.includes('witwatersrand'))                   return 'wits';
  if (u === 'sun'     || u.includes('stellenbosch'))                   return 'sun';
  if (u === 'up'      || (u.includes('pretoria') && !u.includes('tshwane'))) return 'up';
  if (u === 'ukzn'    || u.includes('kwazulu'))                        return 'ukzn';
  if (u === 'uj'      || u.includes('johannesburg'))                   return 'uj';
  if (u === 'uwc'     || u.includes('western cape'))                   return 'uwc';
  if (u === 'ru'      || u.includes('rhodes'))                         return 'ru';
  if (u === 'unisa'   || u.includes('south africa') && u.includes('unisa')) return 'unisa';
  if (u === 'ufs'     || u.includes('free state'))                     return 'ufs';
  if (u === 'nwu'     || u.includes('north-west') || u.includes('northwest')) return 'nwu';
  if (u === 'ufh'     || u.includes('fort hare'))                      return 'ufh';
  if (u === 'ul'      || u.includes('limpopo') && u.length < 20)       return 'ul';
  if (u === 'unizulu' || u.includes('zululand'))                       return 'unizulu';
  if (u === 'nmu'     || u.includes('nelson mandela'))                 return 'nmu';
  if (u === 'ump'     || u.includes('mpumalanga'))                     return 'ump';
  if (u === 'spu'     || u.includes('sol plaatje'))                    return 'spu';
  if (u === 'univen'  || u.includes('venda'))                          return 'univen';
  if (u === 'wsu'     || u.includes('sisulu') || u.includes('walter')) return 'wsu';
  if (u === 'smu'     || u.includes('sefako') || u.includes('makgatho')) return 'smu';
  if (u === 'cput'    || u.includes('cape peninsula'))                 return 'cput';
  if (u === 'tut'     || u.includes('tshwane'))                        return 'tut';
  if (u === 'dut'     || u.includes('durban university'))              return 'dut';
  if (u === 'vut'     || u.includes('vaal'))                           return 'vut';
  if (u === 'cut'     || u.includes('central university'))             return 'cut';
  if (u === 'mut'     || u.includes('mangosuthu'))                     return 'mut';
  if (u === 'eec'     || u.includes('ekurhuleni east'))                return 'eec';
  if (u === 'sctvet'  || u.includes('south cape'))                     return 'sctvet';
  if (u === 'elg'     || u.includes('elangeni'))                       return 'elg';
  if (u === 'wbc'     || u.includes('waterberg'))                      return 'wbc';
  if (u === 'nlc'     || u.includes('northlink'))                      return 'nlc';
  if (u === 'iie-vc'  || u.includes('varsity college') || u.includes('iie')) return 'iie-vc';
  if (u === 'afda'    || u.includes('afda'))                           return 'afda';
  if (u === 'stadio'  || u.includes('stadio'))                         return 'stadio';
  return 'default-uni';
}

// Maps full university name → /logos/{short}.svg path
const UNI_LOGO_MAP: Record<string, string> = {
  'University of Cape Town':              '/logos/uct.svg',
  'University of the Witwatersrand':      '/logos/wits.svg',
  'Stellenbosch University':              '/logos/sun.svg',
  'University of Pretoria':               '/logos/up.svg',
  'University of KwaZulu-Natal':          '/logos/ukzn.svg',
  'University of Johannesburg':           '/logos/uj.svg',
  'University of the Western Cape':       '/logos/uwc.svg',
  'Rhodes University':                    '/logos/ru.svg',
  'University of South Africa':           '/logos/unisa.svg',
  'University of the Free State':         '/logos/ufs.svg',
  'North-West University':                '/logos/nwu.svg',
  'University of Fort Hare':              '/logos/ufh.svg',
  'University of Limpopo':                '/logos/ul.svg',
  'University of Zululand':               '/logos/unizulu.svg',
  'Nelson Mandela University':            '/logos/nmu.svg',
  'University of Mpumalanga':             '/logos/ump.svg',
  'Sol Plaatje University':               '/logos/spu.svg',
  'University of Venda':                  '/logos/univen.svg',
  'Walter Sisulu University':             '/logos/wsu.svg',
  'Sefako Makgatho Health Sciences Univ.':'/logos/smu.svg',
  'Cape Peninsula UoT':                   '/logos/cput.svg',
  'Tshwane University of Technology':     '/logos/tut.svg',
  'Durban University of Technology':      '/logos/dut.svg',
  'Vaal University of Technology':        '/logos/vut.svg',
  'Central University of Technology':     '/logos/cut.svg',
  'Mangosuthu University of Technology':  '/logos/mut.svg',
  'Ekurhuleni East TVET College':         '/logos/eec.svg',
  'South Cape TVET College':              '/logos/sctvet.svg',
  'Elangeni TVET College':                '/logos/elg.svg',
  'Waterberg TVET College':               '/logos/wbc.svg',
  'Northlink TVET College':               '/logos/nlc.svg',
  'IIE Varsity College':                  '/logos/iie-vc.svg',
  'AFDA Film School':                     '/logos/afda.svg',
  'STADIO Higher Education':              '/logos/stadio.svg',
};

export function uniLogoPath(uniName: string): string {
  return UNI_LOGO_MAP[uniName] ?? `/logos/${uniToneClass(uniName)}.svg`;
}
