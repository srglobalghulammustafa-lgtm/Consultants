/**
 * Custom Lottie 5.7.4 kinetic animation (60fps) for SR Global Consultants page transitions.
 * Renders concentric orbiting cyan, azure, and gold arcs around the central brand crest.
 */
export const SR_TRANSITION_LOTTIE = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 240,
  h: 240,
  nm: 'SRGlobalOrbit',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'OuterCyanArc',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 120, s: [360] },
          ],
        },
        p: { a: 0, k: [120, 120, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              d: 1,
              ty: 'el',
              s: { a: 0, k: [188, 188] },
              p: { a: 0, k: [0, 0] },
              nm: 'Ring1',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0, 0.624, 0.89, 1] },
              o: { a: 0, k: 95 },
              w: { a: 0, k: 5 },
              lc: 2,
              lj: 2,
              nm: 'Stroke1',
            },
            {
              ty: 'tm',
              s: { a: 0, k: 0 },
              e: {
                a: 1,
                k: [
                  { t: 0, s: [25], e: [72] },
                  { t: 60, s: [72], e: [25] },
                  { t: 120, s: [25] },
                ],
              },
              o: { a: 0, k: 0 },
              m: 1,
              nm: 'Trim1',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: [0] },
              o: { a: 0, k: 100 },
            },
          ],
          nm: 'Group1',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'InnerGoldArc',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [360], e: [0] },
            { t: 120, s: [0] },
          ],
        },
        p: { a: 0, k: [120, 120, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              d: 1,
              ty: 'el',
              s: { a: 0, k: [152, 152] },
              p: { a: 0, k: [0, 0] },
              nm: 'Ring2',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.984, 0.749, 0.141, 1] },
              o: { a: 0, k: 95 },
              w: { a: 0, k: 4 },
              lc: 2,
              lj: 2,
              nm: 'Stroke2',
            },
            {
              ty: 'tm',
              s: { a: 0, k: 0 },
              e: {
                a: 1,
                k: [
                  { t: 0, s: [48], e: [18] },
                  { t: 60, s: [18], e: [48] },
                  { t: 120, s: [48] },
                ],
              },
              o: { a: 0, k: 90 },
              m: 1,
              nm: 'Trim2',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: [0] },
              o: { a: 0, k: 100 },
            },
          ],
          nm: 'Group2',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'PulseGlowRing',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [45], e: [10] },
            { t: 60, s: [10], e: [45] },
            { t: 120, s: [45] },
          ],
        },
        r: { a: 0, k: [0] },
        p: { a: 0, k: [120, 120, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [88, 88, 100], e: [112, 112, 100] },
            { t: 60, s: [112, 112, 100], e: [88, 88, 100] },
            { t: 120, s: [88, 88, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              d: 1,
              ty: 'el',
              s: { a: 0, k: [198, 198] },
              p: { a: 0, k: [0, 0] },
              nm: 'PulseEllipse',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.22, 0.74, 0.97, 1] },
              o: { a: 0, k: 70 },
              w: { a: 0, k: 2 },
              lc: 2,
              lj: 2,
              nm: 'PulseStroke',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: [0] },
              o: { a: 0, k: 100 },
            },
          ],
          nm: 'PulseGroup',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
  ],
};
