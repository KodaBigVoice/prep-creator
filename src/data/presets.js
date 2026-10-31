// Starter presets. They ship with the app and cannot be overwritten (use "Make my own copy" to change one).
// A preset question is a list of part rules, or { versions: [list, list] } for a question that is one of several shapes.
// A part rule is { mode:'fixed', pick }, { mode:'query', topics, level, marks, lines } or { mode:'pool', label, poolId?, choices }.
// This one is Tanmay's Y7 Additional recipe (Michaelmas 2026).
export const STARTER_PRESETS = [
{
 "id": "user-smvvmt9304479",
 "set": "Y7 Additional",
 "name": "26 Mich - Year 7E",
 "minutes": 30,
 "rubricText": "I’m looking for 30 minutes of good work. Make sure you show full working on all questions. Enjoy!",
 "questions": [
  {
   "versions": [
    [
     {
      "mode": "query",
      "topics": [
       "Order of operations (BIDMAS)"
      ],
      "level": "Core",
      "marks": [
       2
      ],
      "lines": [
       4
      ]
     },
     {
      "mode": "query",
      "topics": [
       "Order of operations (BIDMAS)"
      ],
      "level": "Core",
      "marks": [
       2
      ],
      "lines": [
       4
      ]
     }
    ],
    [
     {
      "mode": "query",
      "topics": [
       "Substitution"
      ],
      "level": "Additional"
     }
    ]
   ]
  },
  [
   {
    "mode": "fixed",
    "pick": "fractions-mixed:sub-overlap",
    "marks": [
     2
    ],
    "lines": [
     4
    ]
   },
   {
    "mode": "fixed",
    "pick": "fractions-divide:cancel",
    "marks": [
     2
    ],
    "lines": [
     4
    ]
   }
  ],
  [
   {
    "mode": "pool",
    "label": "Expanding brackets",
    "choices": [
     {
      "topic": "Expanding brackets",
      "levels": [
       "Additional"
      ],
      "off": [
       "expand-number:pos",
       "expand-powers-high:num",
       "expand-number:neg",
       "expand-number:two",
       "expand-letter:x",
       "expand-number:three",
       "expand-letter:nx",
       "expand-letter:neg",
       "expand-simplify-add:num",
       "expand-letter:two",
       "expand-simplify-add:neg",
       "expand-simplify-subtract:lin",
       "expand-simplify-add:letter",
       "expand-simplify-subtract:bare",
       "expand-simplify-subtract:two"
      ],
      "add": []
     }
    ],
    "marks": [
     2
    ],
    "lines": [
     3
    ]
   },
   {
    "mode": "pool",
    "label": "Expanding brackets",
    "choices": [
     {
      "topic": "Expanding brackets",
      "levels": [
       "Additional"
      ],
      "off": [
       "expand-number:pos",
       "expand-number:neg",
       "expand-number:two",
       "expand-powers-high:two",
       "expand-letter:x",
       "expand-number:three",
       "expand-letter:nx",
       "expand-letter:neg",
       "expand-simplify-add:num",
       "expand-letter:two",
       "expand-simplify-add:neg",
       "expand-powers:pure",
       "expand-powers-high:num",
       "expand-powers-high:pure",
       "expand-powers:two",
       "expand-powers:num",
       "expand-simplify-add:letter"
      ],
      "add": []
     }
    ],
    "marks": [
     3
    ],
    "lines": [
     5
    ]
   }
  ],
  [
   {
    "mode": "pool",
    "label": "Factorising",
    "choices": [
     {
      "topic": "Factorising",
      "levels": [
       "Additional"
      ],
      "off": [
       "factorise-number:two",
       "factorise-number:xy",
       "factorise-number:three",
       "factorise-letter:sq",
       "factorise-letter:mix",
       "factorise-two-letters:shared",
       "factorise-powers-high:two",
       "factorise-two-letters:three",
       "factorise-powers-high:pure",
       "factorise-powers-high:num",
       "factorise-powers:pure",
       "factorise-powers:num",
       "factorise-powers:two"
      ],
      "add": []
     }
    ],
    "marks": [
     2
    ],
    "lines": [
     3
    ]
   },
   {
    "mode": "pool",
    "label": "Factorising",
    "choices": [
     {
      "topic": "Factorising",
      "levels": [
       "Additional"
      ],
      "off": [
       "factorise-number:two",
       "factorise-number:xy",
       "factorise-number:three",
       "factorise-letter:sq",
       "factorise-letter:mix",
       "factorise-number-letter:std",
       "factorise-number-letter:three",
       "factorise-two-letters:shared",
       "factorise-two-letters:xy",
       "factorise-two-letters:three",
       "factorise-powers:num",
       "factorise-powers-high:pure"
      ],
      "add": []
     }
    ],
    "marks": [
     2
    ],
    "lines": [
     5
    ]
   }
  ],
  [
   {
    "mode": "pool",
    "label": "Pool",
    "choices": [
     {
      "topic": "Equations",
      "levels": [
       "Additional"
      ],
      "off": [
       "equations-two-fractions:diff",
       "equations-both-sides:pos",
       "equations-both-sides:neg",
       "equations-brackets:one",
       "equations-both-sides-right:pos",
       "equations-brackets:both",
       "equations-two-fractions:sum",
       "equations-fraction:eq",
       "equations-two-fractions:coef",
       "equations-two-fractions:cross",
       "expand-then-solve:single",
       "equations-quadratic-simple:pure",
       "expand-then-solve:std",
       "equations-quadratic-simple:coef",
       "equations-quadratic-simple:const",
       "equations-denominator:num",
       "equations-denominator:add",
       "equations-quadratic-simple:full",
       "equations-quadratic-simple:sub",
       "equations-denominator:plus",
       "simultaneous:opp-y",
       "simultaneous:same-x",
       "simultaneous:multiply",
       "simultaneous:both"
      ],
      "add": [
       "equations-two-step:neg"
      ]
     }
    ],
    "marks": [
     2
    ],
    "lines": [
     4
    ]
   },
   {
    "mode": "pool",
    "label": "Pool",
    "choices": [
     {
      "topic": "Equations",
      "levels": [
       "Additional"
      ],
      "off": [
       "equations-both-sides:pos",
       "equations-both-sides:neg",
       "equations-brackets:one",
       "equations-both-sides-right:pos",
       "equations-brackets:both",
       "expand-then-solve:single",
       "equations-quadratic-simple:pure",
       "expand-then-solve:std",
       "equations-quadratic-simple:const",
       "equations-denominator:num",
       "equations-denominator:add",
       "equations-quadratic-simple:sub",
       "equations-denominator:plus",
       "simultaneous:opp-y",
       "simultaneous:same-x",
       "simultaneous:multiply",
       "simultaneous:both",
       "equations-both-sides-right:neg",
       "equations-both-sides-negative:one",
       "equations-both-sides-negative:both",
       "equations-brackets:neg",
       "equations-brackets:xside",
       "equations-fraction:split",
       "equations-brackets:sub",
       "equations-fraction:top",
       "equations-two-fractions:cross"
      ],
      "add": []
     }
    ],
    "marks": [
     2
    ],
    "lines": [
     4
    ]
   }
  ],
  [
   {
    "mode": "pool",
    "poolId": "pool-w0aaf0d",
    "label": "Mixed Late Qs",
    "marks": [
     2,
     1
    ],
    "lines": [
     3,
     2
    ]
   }
  ],
  [
   {
    "mode": "pool",
    "poolId": "pool-w0aaf0d",
    "label": "Mixed Late Qs",
    "marks": [
     2,
     2
    ],
    "lines": [
     3,
     3
    ]
   }
  ],
  [
   {
    "mode": "pool",
    "poolId": "pool-w0aaf0d",
    "label": "Mixed Late Qs",
    "marks": [
     1,
     2,
     2
    ],
    "lines": [
     3,
     3,
     3
    ]
   }
  ],
  [
   {
    "mode": "pool",
    "poolId": "pool-w0aaf0d",
    "label": "Mixed Late Qs",
    "marks": [
     2
    ],
    "lines": [
     3
    ]
   }
  ],
  [
   {
    "mode": "pool",
    "label": "Pool",
    "choices": [
     {
      "topic": "Problem solving",
      "levels": [
       "Foundation",
       "Core"
      ],
      "off": [],
      "add": []
     }
    ],
    "marks": [
     4
    ],
    "lines": [
     8
    ]
   }
  ],
  [
   {
    "mode": "pool",
    "label": "Pool",
    "choices": [
     {
      "topic": "Problem solving",
      "levels": [
       "Additional",
       "Further"
      ],
      "off": [],
      "add": []
     }
    ],
    "marks": [
     4
    ],
    "lines": [
     8
    ]
   }
  ]
 ],
 "pools": [
  {
   "id": "pool-w0aaf0d",
   "name": "Mixed Late Qs",
   "choices": [
    {
     "topic": "HCF and LCM",
     "levels": [
      "Additional"
     ],
     "off": [],
     "add": []
    },
    {
     "topic": "Indices",
     "levels": [
      "Additional"
     ],
     "off": [],
     "add": []
    },
    {
     "topic": "Substitution",
     "levels": [
      "Additional"
     ],
     "off": [],
     "add": []
    },
    {
     "topic": "Ratio and proportion",
     "levels": [
      "Additional"
     ],
     "off": [],
     "add": []
    },
    {
     "topic": "Percentages: problem solving",
     "levels": [
      "Additional"
     ],
     "off": [],
     "add": []
    },
    {
     "topic": "Decimals",
     "levels": [
      "Additional"
     ],
     "off": [],
     "add": []
    },
    {
     "topic": "Fractions, decimals and percentages (FDP)",
     "levels": [
      "Additional"
     ],
     "off": [],
     "add": []
    }
   ]
  }
 ],
 "starter": true
}
];
