import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "seed");
const W = 1200;
const H = 1500;

const C = {
  paper: "#F5F1E8",
  paperDeep: "#EDE7DB",
  surface: "#FBF8F1",
  ink: "#1D1C19",
  ink2: "#56534B",
  ink3: "#6E6A5F",
  line: "#E1DBCE",
  accent: "#C05B3C",
  accentDeep: "#A94C30",
  accentSoft: "#E8C9B9",
  deep: "#23211C",
  deep2: "#2E2B25",
  sand: "#D8C7AF",
  sandDeep: "#C2AB8E",
  clay: "#B9704E",
  olive: "#6E6A4E",
};

const grain = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.055"/></feComponentTransfer>
  </filter>
`;

function doc(body, bg = C.paper, w = W, h = H) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>${grain}</defs>
    <rect width="${w}" height="${h}" fill="${bg}"/>
    ${body}
    <rect width="${w}" height="${h}" fill="#fff" filter="url(#grain)" opacity=".55"/>
  </svg>`;
}

const works = {};

works["work-01"] = doc(`
  <defs>
    <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F0E4D2"/><stop offset=".55" stop-color="#E7D3BB"/><stop offset="1" stop-color="#DFC3A6"/>
    </linearGradient>
    <linearGradient id="sea1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C97A55"/><stop offset=".45" stop-color="#A95436"/><stop offset="1" stop-color="#5E2D21"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="890" fill="url(#sky1)"/>
  <circle cx="710" cy="470" r="168" fill="${C.accent}"/>
  <circle cx="710" cy="470" r="250" fill="none" stroke="${C.accent}" stroke-opacity=".28" stroke-width="1.5"/>
  <circle cx="710" cy="470" r="340" fill="none" stroke="${C.accent}" stroke-opacity=".16" stroke-width="1.5"/>
  <circle cx="710" cy="470" r="440" fill="none" stroke="${C.accent}" stroke-opacity=".10" stroke-width="1.5"/>
  <path d="M0 900 C 190 810, 350 960, 540 890 S 900 820, 1200 900 L1200 1500 L0 1500Z" fill="#C88A64"/>
  <path d="M0 1020 C 210 930, 390 1090, 610 1000 S 960 930, 1200 1010 L1200 1500 L0 1500Z" fill="#B76E4C"/>
  <path d="M0 1140 C 230 1060, 420 1200, 650 1120 S 980 1050, 1200 1130 L1200 1500 L0 1500Z" fill="url(#sea1)"/>
  <path d="M0 1280 C 250 1200, 480 1330, 720 1250 S 1020 1190, 1200 1260 L1200 1500 L0 1500Z" fill="#4A241C"/>
  <path d="M120 1110 C 300 1080, 430 1145, 610 1105" fill="none" stroke="#F1D9C2" stroke-opacity=".55" stroke-width="3"/>
  <path d="M760 1210 C 900 1180, 1010 1230, 1140 1200" fill="none" stroke="#F1D9C2" stroke-opacity=".32" stroke-width="2"/>
`, C.paper);

works["work-02"] = doc(`
  <defs>
    <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F4EEE2"/><stop offset="1" stop-color="#E4D6C2"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1500" fill="url(#sky2)"/>
  <circle cx="880" cy="330" r="86" fill="${C.accent}" opacity=".9"/>
  <path d="M0 980 L250 650 L420 830 L610 560 L820 850 L980 690 L1200 960 L1200 1500 L0 1500Z" fill="#CBB79C"/>
  <path d="M0 1080 L220 790 L400 980 L590 720 L790 1010 L960 840 L1200 1090 L1200 1500 L0 1500Z" fill="#B79C7E"/>
  <path d="M0 1200 L260 950 L460 1120 L680 880 L900 1150 L1060 1000 L1200 1170 L1200 1500 L0 1500Z" fill="#9A7B60"/>
  <path d="M0 1330 L300 1130 L520 1270 L760 1060 L980 1300 L1200 1180 L1200 1500 L0 1500Z" fill="#6F5544"/>
  <g stroke="#F4E9DA" stroke-opacity=".35" stroke-width="1.5">
    <path d="M0 1030 L1200 980"/><path d="M0 1120 L1200 1060"/><path d="M0 1240 L1200 1160"/>
  </g>
`);

works["work-03"] = doc(`
  <rect width="1200" height="1500" fill="#E9DFD0"/>
  <rect y="1050" width="1200" height="450" fill="#D9C6AC"/>
  <ellipse cx="640" cy="1240" rx="260" ry="34" fill="#8F7258" opacity=".28"/>
  <path d="M480 760 C 455 900, 445 1040, 500 1200 C 560 1300, 760 1300, 815 1195 C 862 1085, 840 900, 800 760 C 760 700, 520 700, 480 760Z" fill="${C.accentDeep}"/>
  <path d="M505 780 C 490 910, 490 1040, 532 1170 C 575 1240, 700 1250, 750 1170 C 785 1095, 785 920, 770 785Z" fill="#C96B47"/>
  <ellipse cx="600" cy="980" rx="46" ry="120" fill="#E9A47F" opacity=".55"/>
  <path d="M640 720 C 645 620, 650 540, 662 470" fill="none" stroke="#4D4438" stroke-width="6" stroke-linecap="round"/>
  <path d="M660 560 C 720 520, 770 500, 820 505" fill="none" stroke="#4D4438" stroke-width="5" stroke-linecap="round"/>
  <path d="M664 500 C 690 430, 716 390, 760 350" fill="none" stroke="#4D4438" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="760" cy="344" rx="58" ry="26" fill="#6E6A4E" transform="rotate(-38 760 344)"/>
  <ellipse cx="836" cy="492" rx="52" ry="22" fill="#7D7657" transform="rotate(-12 836 492)"/>
  <ellipse cx="706" cy="466" rx="42" ry="20" fill="#8A8160" transform="rotate(24 706 466)"/>
  <rect x="120" y="120" width="1" height="210" fill="${C.accent}" opacity=".55"/>
  <rect x="120" y="120" width="34" height="1" fill="${C.accent}" opacity=".55"/>
`);

works["work-04"] = doc(`
  <defs>
    <radialGradient id="night" cx=".62" cy=".28" r=".8">
      <stop offset="0" stop-color="#34302A"/><stop offset="1" stop-color="#181714"/>
    </radialGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4A4238"/><stop offset="1" stop-color="#0F0E0D"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1500" fill="url(#night)"/>
  <circle cx="790" cy="420" r="150" fill="#E8DCC6"/>
  <circle cx="850" cy="380" r="20" fill="#C9BBA2" opacity=".5"/>
  <circle cx="735" cy="465" r="13" fill="#C9BBA2" opacity=".4"/>
  <path d="M0 960 C 260 900, 420 1000, 640 960 S 980 900, 1200 960 L1200 1500 L0 1500Z" fill="#24211C"/>
  <path d="M420 1500 L560 980 L640 980 L760 1500Z" fill="url(#road)"/>
  <path d="M590 1500 L602 1300 L614 1500Z" fill="#C9A46E" opacity=".55"/>
  <path d="M606 1500 L612 1370 L620 1500Z" fill="#C9A46E" opacity=".35"/>
  <g fill="#D8B27B">
    <circle cx="330" cy="1080" r="4"/><circle cx="300" cy="1140" r="3"/><circle cx="880" cy="1040" r="4"/><circle cx="930" cy="1120" r="3"/>
  </g>
  <path d="M0 900 L1200 840" stroke="#7A6B58" stroke-opacity=".28" stroke-width="1.5"/>
  <path d="M0 950 L1200 900" stroke="#7A6B58" stroke-opacity=".18" stroke-width="1.5"/>
`, C.deep);

works["work-05"] = doc(`
  <rect width="1200" height="1500" fill="#E8DECE"/>
  <circle cx="850" cy="460" r="210" fill="#D9B28E" opacity=".55"/>
  <g fill="#B8A58D">
    <rect x="80" y="760" width="160" height="740"/>
    <rect x="260" y="620" width="130" height="880"/>
    <rect x="410" y="860" width="180" height="640"/>
    <rect x="610" y="700" width="150" height="800"/>
    <rect x="780" y="820" width="120" height="680"/>
    <rect x="920" y="640" width="200" height="860"/>
  </g>
  <g fill="#8F7A63" opacity=".55">
    <rect x="100" y="800" width="16" height="640"/><rect x="150" y="800" width="8" height="640"/>
    <rect x="290" y="670" width="14" height="760"/><rect x="340" y="670" width="8" height="760"/>
    <rect x="440" y="910" width="16" height="540"/><rect x="500" y="910" width="10" height="540"/>
    <rect x="640" y="750" width="14" height="700"/><rect x="700" y="750" width="8" height="700"/>
  </g>
  <path d="M0 1180 C 260 1120, 520 1220, 780 1160 S 1060 1110, 1200 1160 L1200 1500 L0 1500Z" fill="#D8C4AC" opacity=".8"/>
  <path d="M0 980 C 300 940, 620 1000, 900 960" stroke="#F5EBDD" stroke-opacity=".5" stroke-width="2"/>
`);

works["work-06"] = doc(`
  <rect width="1200" height="1500" fill="#F2EBDD"/>
  <circle cx="600" cy="560" r="250" fill="#E7D6BE"/>
  <path d="M0 990 L180 760 L330 900 L480 700 L640 920 L800 740 L980 920 L1200 780 L1200 1500 L0 1500Z" fill="#D7C2A7"/>
  <path d="M0 1090 L210 870 L380 1010 L560 820 L740 1030 L920 860 L1200 1010 L1200 1500 L0 1500Z" fill="#C2A788"/>
  <g fill="#FBF6EC">
    <path d="M150 1130 L210 1050 L270 1130Z"/><path d="M300 1160 L350 1090 L400 1160Z"/>
    <path d="M470 1120 L530 1040 L590 1120Z"/><path d="M640 1170 L690 1100 L740 1170Z"/>
  </g>
  <g stroke="#8C7259" stroke-opacity=".5" stroke-width="1.5">
    <path d="M0 1010 L1200 950"/><path d="M0 1060 L1200 1000"/><path d="M0 1140 L1200 1080"/>
  </g>
`);

works["work-07"] = doc(`
  <defs>
    <linearGradient id="sea7" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3A2A24"/><stop offset="1" stop-color="#151311"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1500" fill="url(#sea7)"/>
  <circle cx="600" cy="470" r="190" fill="${C.accent}"/>
  <circle cx="600" cy="470" r="270" fill="none" stroke="${C.accent}" stroke-opacity=".2"/>
  <path d="M0 900 C 200 840, 380 940, 580 880 S 940 820, 1200 900 L1200 1500 L0 1500Z" fill="#2A211C"/>
  <path d="M0 1010 C 240 940, 430 1060, 650 990 S 980 930, 1200 1010 L1200 1500 L0 1500Z" fill="#3B2A21"/>
  <path d="M0 1140 C 260 1060, 470 1180, 700 1100 S 1010 1050, 1200 1120 L1200 1500 L0 1500Z" fill="#513526"/>
  <path d="M0 1290 C 280 1210, 520 1330, 760 1250 S 1040 1200, 1200 1270 L1200 1500 L0 1500Z" fill="#2A1D17"/>
  <path d="M120 1120 C 300 1090, 430 1150, 610 1110" stroke="#E7B48F" stroke-opacity=".35" stroke-width="2"/>
  <path d="M720 1240 C 880 1210, 1010 1260, 1140 1230" stroke="#E7B48F" stroke-opacity=".22" stroke-width="2"/>
`, C.deep);

works["work-08"] = doc(`
  <defs>
    <radialGradient id="low" cx=".5" cy=".42" r=".65">
      <stop offset="0" stop-color="#3A3630"/><stop offset="1" stop-color="#1B1916"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1500" fill="url(#low)"/>
  <g fill="none" stroke="${C.accent}" stroke-opacity=".75">
    <ellipse cx="600" cy="600" rx="90" ry="90" stroke-width="2"/>
    <ellipse cx="600" cy="600" rx="180" ry="180" stroke-width="1.5" stroke-opacity=".55"/>
    <ellipse cx="600" cy="600" rx="280" ry="280" stroke-width="1.2" stroke-opacity=".4"/>
    <ellipse cx="600" cy="600" rx="390" ry="390" stroke-width="1" stroke-opacity=".26"/>
    <ellipse cx="600" cy="600" rx="510" ry="510" stroke-width="1" stroke-opacity=".15"/>
  </g>
  <path d="M0 1060 C 60 1010, 120 1010, 180 1060 S 300 1110, 360 1060 S 480 1010, 540 1060 S 660 1110, 720 1060 S 840 1010, 900 1060 S 1020 1110, 1080 1060 S 1170 1020, 1200 1050" fill="none" stroke="#E8D7C4" stroke-width="3" stroke-opacity=".85"/>
  <path d="M0 1120 C 60 1070, 120 1070, 180 1120 S 300 1170, 360 1120 S 480 1070, 540 1120 S 660 1170, 720 1120 S 840 1070, 900 1120 S 1020 1170, 1080 1120 S 1170 1080, 1200 1110" fill="none" stroke="#E8D7C4" stroke-width="1.5" stroke-opacity=".4"/>
  <rect x="598" y="600" width="1" height="300" fill="${C.accent}" opacity=".4"/>
`, C.deep);

works["work-09"] = doc(`
  <rect width="1200" height="1500" fill="#E7DDCE"/>
  <g fill="none" stroke="#8E745C" stroke-opacity=".38">
    ${Array.from({ length: 16 }, (_, i) => `<circle cx="600" cy="680" r="${90 + i * 28}" stroke-width="${i === 0 ? 2 : 1}"/>`).join("")}
  </g>
  <circle cx="600" cy="680" r="120" fill="${C.accentDeep}"/>
  <circle cx="600" cy="680" r="34" fill="#E7DDCE"/>
  <circle cx="600" cy="680" r="10" fill="#4A3B2D"/>
  <path d="M0 1120 L1200 1080 L1200 1500 L0 1500Z" fill="#D2BFA6"/>
  <g stroke="#6F5743" stroke-opacity=".5" stroke-width="1.2">
    <path d="M90 1180 L1110 1140"/><path d="M90 1230 L1110 1190"/><path d="M90 1280 L1110 1240"/>
  </g>
  <circle cx="1020" cy="1240" r="9" fill="${C.accent}"/>
`);

works["work-10"] = doc(`
  <rect width="1200" height="1500" fill="#F7F2E7"/>
  <g stroke="${C.line}" stroke-width="1.5">
    ${Array.from({ length: 9 }, (_, i) => `<path d="M120 ${260 + i * 130} L1080 ${260 + i * 130}"/>`).join("")}
  </g>
  <g fill="${C.ink2}">
    <rect x="120" y="300" width="300" height="8" opacity=".3"/><rect x="120" y="430" width="220" height="8" opacity=".22"/>
    <rect x="120" y="560" width="380" height="8" opacity=".26"/><rect x="120" y="690" width="180" height="8" opacity=".2"/>
    <rect x="120" y="820" width="340" height="8" opacity=".24"/><rect x="120" y="950" width="260" height="8" opacity=".18"/>
  </g>
  <circle cx="930" cy="350" r="44" fill="${C.accent}" opacity=".9"/>
  <rect x="120" y="1120" width="1" height="150" fill="${C.accent}"/>
  <rect x="120" y="1120" width="26" height="1" fill="${C.accent}"/>
`);

works["work-11"] = doc(`
  <rect width="1200" height="1500" fill="#EFE7D8"/>
  <text x="70" y="740" font-family="'Noto Serif SC','Songti SC',serif" font-size="760" fill="${C.ink}" opacity=".96">永</text>
  <text x="740" y="760" font-family="'Noto Serif SC','Songti SC',serif" font-size="120" fill="${C.accent}" opacity=".9">字</text>
  <g stroke="${C.ink3}" stroke-opacity=".35" stroke-width="1">
    <path d="M0 880 L1200 880"/><path d="M0 900 L1200 900"/>
    <path d="M120 0 L120 1500" stroke-opacity=".18"/>
    <path d="M1080 0 L1080 1500" stroke-opacity=".18"/>
  </g>
  <rect x="70" y="920" width="520" height="10" fill="${C.ink}" opacity=".16"/>
  <rect x="70" y="950" width="360" height="8" fill="${C.ink}" opacity=".1"/>
`);

works["work-12"] = doc(`
  <rect width="1200" height="1500" fill="#211F1B"/>
  <g stroke="#4A463D" stroke-opacity=".8" stroke-width="1">
    ${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${180 + i * 100} L1200 ${180 + i * 100}" opacity=".22"/>`).join("")}
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${150 + i * 130} 0 L${150 + i * 130} 1500" opacity=".12"/>`).join("")}
  </g>
  <circle cx="600" cy="650" r="180" fill="none" stroke="${C.accent}" stroke-width="1.5" stroke-opacity=".7"/>
  <circle cx="600" cy="650" r="110" fill="${C.accent}" opacity=".16"/>
  <circle cx="600" cy="650" r="46" fill="${C.accent}"/>
  <path d="M470 980 L520 930 L570 980 L620 920 L670 980 L720 930" fill="none" stroke="#E8D7C4" stroke-opacity=".55" stroke-width="2"/>
  <rect x="470" y="1060" width="260" height="1" fill="#E8D7C4" opacity=".3"/>
  <text x="470" y="1120" font-family="Consolas,monospace" font-size="24" fill="#E8D7C4" opacity=".55">agent / editing</text>
`, C.deep);

const details = {
  "detail-01": ["work-01", 1600, 1000],
  "detail-02": ["work-03", 1600, 1000],
  "detail-03": ["work-04", 1600, 1000],
  "detail-04": ["work-06", 1600, 1000],
  "detail-05": ["work-08", 1600, 1000],
  "detail-06": ["work-11", 1600, 1000],
};

async function write(name, svg) {
  await sharp(Buffer.from(svg)).webp({ quality: 88, effort: 5 }).toFile(path.join(OUT, `${name}.webp`));
}

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const [name, svg] of Object.entries(works)) await write(name, svg);
  for (const [name, [source, w, h]] of Object.entries(details)) {
    const sourceSvg = works[source].replace(/width="1200" height="1500"/, `width="${w}" height="${h}"`).replace(/viewBox="0 0 1200 1500"/, `viewBox="0 0 1200 1500" preserveAspectRatio="xMidYMid slice"`);
    await write(name, sourceSvg);
  }
  const portrait = doc(`
    <rect width="1200" height="1500" fill="#E9DFD0"/>
    <rect y="1010" width="1200" height="490" fill="#D8C5AB"/>
    <ellipse cx="600" cy="1210" rx="250" ry="30" fill="#8F7258" opacity=".25"/>
    <path d="M450 760 C 435 900, 440 1030, 500 1180 C 560 1270, 750 1270, 800 1170 C 845 1080, 830 900, 795 760 C 760 700, 490 700, 450 760Z" fill="${C.accentDeep}"/>
    <path d="M480 780 C 470 900, 480 1020, 525 1150 C 565 1215, 690 1220, 730 1145 C 760 1080, 760 910, 748 785Z" fill="#C96B47"/>
    <ellipse cx="560" cy="960" rx="40" ry="110" fill="#E9A47F" opacity=".5"/>
    <path d="M625 720 C 630 620, 636 540, 648 470" fill="none" stroke="#4D4438" stroke-width="6" stroke-linecap="round"/>
    <path d="M646 560 C 706 520, 756 500, 806 505" fill="none" stroke="#4D4438" stroke-width="5" stroke-linecap="round"/>
    <path d="M650 500 C 676 430, 702 390, 746 350" fill="none" stroke="#4D4438" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="746" cy="344" rx="56" ry="24" fill="#6E6A4E" transform="rotate(-38 746 344)"/>
    <ellipse cx="822" cy="492" rx="50" ry="21" fill="#7D7657" transform="rotate(-12 822 492)"/>
    <ellipse cx="692" cy="466" rx="40" ry="19" fill="#8A8160" transform="rotate(24 692 466)"/>
    <rect x="90" y="100" width="1" height="190" fill="${C.accent}" opacity=".5"/>
    <rect x="90" y="100" width="30" height="1" fill="${C.accent}" opacity=".5"/>
  `);
  await write("portrait", portrait);
  const og = doc(`
    <rect width="1200" height="630" fill="${C.paper}"/>
    <rect x="80" y="110" width="1" height="360" fill="${C.accent}"/>
    <text x="120" y="250" font-family="'Noto Serif SC','Songti SC',serif" font-size="92" fill="${C.ink}">留白集</text>
    <text x="124" y="310" font-family="Consolas,monospace" font-size="17" letter-spacing="8" fill="${C.ink3}">AIGC PORTFOLIO</text>
    <text x="124" y="420" font-family="'Noto Serif SC','Songti SC',serif" font-size="34" fill="${C.ink2}">把生成模型当作笔，画一些安静的东西。</text>
    <circle cx="980" cy="300" r="150" fill="${C.accent}" opacity=".9"/>
    <circle cx="980" cy="300" r="210" fill="none" stroke="${C.accent}" stroke-opacity=".25"/>
  `, C.paper, 1200, 630);
  await sharp(Buffer.from(og)).png().toFile(path.join(OUT, "og-default.png"));
  const avatar = doc(`
    <rect width="1200" height="1200" fill="#E9DFD0"/>
    <circle cx="600" cy="520" r="260" fill="#D8C5AB"/>
    <path d="M340 1200 C 360 980, 440 880, 600 880 C 760 880, 840 980, 860 1200Z" fill="${C.ink}"/>
    <circle cx="600" cy="560" r="180" fill="#C96B47"/>
    <path d="M460 470 C 480 360, 560 320, 650 340 C 730 360, 760 430, 740 500 C 700 440, 640 420, 580 440 C 540 450, 500 470, 460 470Z" fill="#3B332A"/>
    <circle cx="540" cy="560" r="12" fill="#2B241D"/><circle cx="660" cy="560" r="12" fill="#2B241D"/>
    <path d="M560 640 C 590 660, 620 660, 650 640" fill="none" stroke="#2B241D" stroke-width="5" stroke-linecap="round"/>
  `, C.paper, 1200, 1200);
  await sharp(Buffer.from(avatar)).webp({ quality: 90 }).toFile(path.join(OUT, "avatar.webp"));
  console.log("generated", Object.keys(works).length, "works + details + portrait + og + avatar");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
