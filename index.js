const { writeFileSync, readFileSync, readdirSync } = require('fs');
const { join } = require('path');
const parser = require('node-html-parser');

/* const ACTUAL_WORD_CLASS = '.c3';
const PAGE_TOP_TEXT_CLASS = '.c40'; // e.g 618
const MAIN_LETTER_TEXT_CLASS = '.c32'; // e.g Mm, Nn, Oo
const REPEATED_WORD_CLASS = '.c8'; // e.g The word 'Malawi' reappears after its definition ---Illustrations
const INCOMPLETE_DEF_CLASS = '.c1'; // Paragraphs that probably belong to the previous paragraph
const SUPERSCRIPT_CLASS = '.c15';*/

const CLASS_MAPPINGS = {
  'abwaanary1.html': {
    ACTUAL_WORD_CLASS: '.c1',
    PAGE_TOP_TEXT_CLASS: '.c12',
    MAIN_LETTER_TEXT_CLASS: '.c294',
    REPEATED_WORD_CLASS: '.c1805',
    INCOMPLETE_DEF_CLASS: '.c396',
    SUPERSCRIPT_CLASS: '.c91',
  },
  'abwaanary2.html': {
    ACTUAL_WORD_CLASS: '.c0',
    PAGE_TOP_TEXT_CLASS: '.c15',
    MAIN_LETTER_TEXT_CLASS: '.c111',
    REPEATED_WORD_CLASS: '.c9',
    INCOMPLETE_DEF_CLASS: '.c802',
    SUPERSCRIPT_CLASS: '.c23',
  },
  'abwaanary3.html': {
    ACTUAL_WORD_CLASS: '.c1',
    PAGE_TOP_TEXT_CLASS: '.c15',
    MAIN_LETTER_TEXT_CLASS: '.not-set',
    REPEATED_WORD_CLASS: '.c9',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c73',
  },
  'abwaanary4.html': {
    ACTUAL_WORD_CLASS: '.c1',
    PAGE_TOP_TEXT_CLASS: '.c32',
    MAIN_LETTER_TEXT_CLASS: '.not-set',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c11',
  },
  'abwaanary5.html': {
    ACTUAL_WORD_CLASS: '.c0',
    PAGE_TOP_TEXT_CLASS: '.c8',
    MAIN_LETTER_TEXT_CLASS: '.c1675',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c16',
  },
  'abwaanary6.html': {
    ACTUAL_WORD_CLASS: '.c1',
    PAGE_TOP_TEXT_CLASS: '.c62',
    MAIN_LETTER_TEXT_CLASS: '.c337',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c22',
  },
  'abwaanary7.html': {
    ACTUAL_WORD_CLASS: '.c1',
    PAGE_TOP_TEXT_CLASS: '.c15',
    MAIN_LETTER_TEXT_CLASS: '.c761',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c29',
  },
  'abwaanary8.html': {
    ACTUAL_WORD_CLASS: '.c5',
    PAGE_TOP_TEXT_CLASS: '.c36',
    MAIN_LETTER_TEXT_CLASS: '.c146',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c25',
  },
  'abwaanary9.html': {
    ACTUAL_WORD_CLASS: '.c10',
    PAGE_TOP_TEXT_CLASS: '.c11',
    MAIN_LETTER_TEXT_CLASS: '.c607',
    REPEATED_WORD_CLASS: '.c4',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c50',
  },
  'abwaanary10.html': {
    ACTUAL_WORD_CLASS: '.c2',
    PAGE_TOP_TEXT_CLASS: '.c4',
    MAIN_LETTER_TEXT_CLASS: '.c1028',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c217',
  },
  'abwaanary11.html': {
    ACTUAL_WORD_CLASS: '.c4',
    PAGE_TOP_TEXT_CLASS: '.c74',
    MAIN_LETTER_TEXT_CLASS: '.c1753',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c19',
  },
  'abwaanary12.html': {
    ACTUAL_WORD_CLASS: '.c2',
    PAGE_TOP_TEXT_CLASS: '.c51',
    MAIN_LETTER_TEXT_CLASS: '.c560',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c10',
  },
  'abwaanary13.html': {
    ACTUAL_WORD_CLASS: '.c1',
    PAGE_TOP_TEXT_CLASS: '.c15',
    MAIN_LETTER_TEXT_CLASS: '.c138',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c28',
  },
  'abwaanary14.html': {
    ACTUAL_WORD_CLASS: '.c6',
    PAGE_TOP_TEXT_CLASS: '.c16',
    MAIN_LETTER_TEXT_CLASS: '.c394',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c5',
  },
  'abwaanary15.html': {
    ACTUAL_WORD_CLASS: '.c0',
    PAGE_TOP_TEXT_CLASS: '.c8',
    MAIN_LETTER_TEXT_CLASS: '.c986',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c50',
  },
  'abwaanary16.html': {
    ACTUAL_WORD_CLASS: '.c1',
    PAGE_TOP_TEXT_CLASS: '.c40',
    MAIN_LETTER_TEXT_CLASS: '.c1119',
    REPEATED_WORD_CLASS: '.not-set',
    INCOMPLETE_DEF_CLASS: '.not-set',
    SUPERSCRIPT_CLASS: '.c10',
  },
};

const extract = (file) => {
  const html = parser.parse(
    readFileSync(join(__dirname, 'raw', file), { encoding: 'utf8' })
  );
  const actualWordClass = CLASS_MAPPINGS[file].ACTUAL_WORD_CLASS.replace(
    '.',
    ''
  );

  const joinParagraphs = (paragraphs) => {
    const all = [];
    let affected = 0;
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      const hasBold = paragraph[0]?.classes === actualWordClass;
      if (i > 0 && !hasBold) {
        all[all.length - 1] = [...all[all.length - 1], ...paragraph];
        affected += 1;
      } else {
        all.push(paragraph);
      }
    }

    if (affected > 0) {
      return joinParagraphs(all);
    }

    const noIrregularStarts = [];

    for (let i = 0; i < all.length; i++) {
      const paragraph = all[i];
      const firstText = paragraph[0].text;

      if (
        i > 0 &&
        firstText.startsWith('-') &&
        !paragraph[1].text.includes('dibgale')
      ) {
        noIrregularStarts[noIrregularStarts.length - 1] = [
          ...noIrregularStarts[noIrregularStarts.length - 1],
          ...paragraph,
        ];
        affected += 1;
      } else {
        noIrregularStarts.push(paragraph);
      }
    }

    if (affected > 0) {
      return joinParagraphs(noIrregularStarts);
    }

    return noIrregularStarts;
  };

  const joinContinuousMeanings = (paragraphs) => {
    const enumerators = ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
    paragraphs.forEach((p) => {
      p.forEach((span, i) => {
        if (
          i !== 0 &&
          span.classes === actualWordClass &&
          enumerators.includes(span.text?.trim())
        ) {
          p[i - 1].text += ' ' + span.text;
          p.splice(i, 1);
        }
      });
    });

    return paragraphs;
  };

  const extractEmbedded = (paragraphs) => {
    const all = [];
    let affected = 0;
    const wellTerminated = (text) => {
      if (!text.endsWith('.')) {
        return false;
      }

      const all = ['adj.', 'pl.', 'v.', '[usu.'];

      return all.every((ending) => !text.endsWith(ending));
    };

    for (const p of paragraphs) {
      const boldFaces = p.filter((span, i) => {
        const isBold = span.classes === actualWordClass;

        if (!isBold || i === 0) {
          return false;
        }

        const text = span.text;

        if (text.startsWith('-') || text.endsWith('-')) {
          return false;
        }

        const prev = p[i - 1];
        const prevText = prev.text.trim();

        return wellTerminated(prevText);
      });

      if (boldFaces.length > 0) {
        const index = p.indexOf(boldFaces[0]);
        all.push(p.slice(0, index));
        all.push(p.slice(index));
        affected += 1;
      } else {
        all.push(p);
      }
    }

    if (affected > 0) {
      return extractEmbedded(all);
    }

    return all;
  };

  const joinExamples = (paragraphs) => {
    const newParagraphs = [];
    let affected = 0;

    for (const p of paragraphs) {
      const spans = [];
      for (let i = 0; i < p.length; i++) {
        const span = p[i];
        const prev = spans[spans.length - 1];
        if (
          prev &&
          (prev.text.endsWith('e.g.') || span.text.startsWith('e.g.'))
        ) {
          prev.text = (prev.text + ' ' + span.text).trim();
          affected += 1;
        } else {
          spans.push(span);
        }
      }
      newParagraphs.push(spans);
    }

    if (affected > 0) {
      return joinExamples(newParagraphs);
    }

    return newParagraphs;
  };

  const removeMeta = (paragraphs) => {
    const clean = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const spans = paragraphs[i];
      let lastPos = -1;

      for (let j = 0; j < spans.length; j++) {
        if (
          spans[j].text === 'Second Edition' &&
          spans[j - 1].text === 'BWAANARY:'
        ) {
          lastPos = j;
          break;
        }
      }

      if (lastPos !== -1) {
        const toRemove = [];
        for (let i = lastPos; i > lastPos - 5; i--) {
          toRemove.push(i);
        }
        clean.push(spans.filter((_, i) => !toRemove.includes(i)));
      } else {
        clean.push(spans);
      }
    }

    const clean2 = [];

    clean.forEach((p) => {
      clean2.push(
        p.filter((span, i) => {
          if (p[i + 1]?.classes === CLASS_MAPPINGS[file].PAGE_TOP_TEXT_CLASS) {
            return false;
          }

          const valid = ![
            CLASS_MAPPINGS[file].SUPERSCRIPT_CLASS,
            CLASS_MAPPINGS[file].PAGE_TOP_TEXT_CLASS,
            CLASS_MAPPINGS[file].MAIN_LETTER_TEXT_CLASS,
          ].includes(`.${span.classes}`);

          return valid;
        })
      );
    });

    return clean2;
  };

  const joinContinuations = (paragraphs) => {
    const clean = [];
    let affected = 0;

    for (const p of paragraphs) {
      const spans = [];
      for (let i = 0; i < p.length; i++) {
        const span = p[i];
        const prev = spans[spans.length - 1];

        if (prev && prev.text.endsWith('[usu.')) {
          prev.text = (prev.text + ' ' + span.text).trim();
          affected += 1;
        } else if (span.text.startsWith(']')) {
          prev.text = (prev.text + span.text).trim();
          affected += 1;
        } else {
          spans.push(span);
        }
      }

      clean.push(spans);
    }

    if (affected > 0) {
      return joinContinuations(clean);
    }

    return clean;
  };

  let paragraphs = [];

  html.querySelectorAll('p').forEach((paragraph) => {
    const spans = [];
    let index = 0;

    for (const span of paragraph.childNodes) {
      if (['img'].includes(span.rawTagName.toLowerCase())) {
        continue;
      }

      if (span.rawTagName && span.rawTagName.toLowerCase() !== 'span') {
        throw new Error(
          `Not a span element at ${file}, ${paragraph.classList}, ${i + 1}`
        );
      } else {
        spans.push({
          text: span.textContent.replaceAll(/\s\s+/g, ' ').trim(),
          classes: span.rawAttrs
            ?.replace('class=', '')
            .replaceAll('"', '')
            .trim(),
        });
      }

      index += 1;
    }

    paragraphs.push(spans);
  });

  paragraphs = joinParagraphs(paragraphs);
  paragraphs = joinContinuousMeanings(paragraphs);
  paragraphs = extractEmbedded(paragraphs);
  paragraphs = joinExamples(paragraphs);
  paragraphs = removeMeta(paragraphs);
  paragraphs = joinContinuations(paragraphs);

  paragraphs = paragraphs
    .filter((item) => item.length > 0)
    .map((p) => {
      p = p.filter((t) => t.text.length > 0);
      return p;
    });

  writeFileSync(
    join(__dirname, 'spans', file + '.json'),
    JSON.stringify(paragraphs),
    { encoding: 'utf8' }
  );
};

const composeJson = (file) => {
  const paragraphs = JSON.parse(
    readFileSync(join(__dirname, 'spans', file), { encoding: 'utf8' })
  );
  const words = [];
  const remaining = [];

  const cleanObj = (obj) => {
    Object.keys(obj).forEach((key) => {
      if (!obj[key] || obj[key].length === 0) {
        delete obj[key];
      }
    });

    return obj;
  };

  /**
   *
   * @param {string} text
   */
  const getMeanings = (text, type) => {
    return ` ${text}`
      .split(/\s\d{1,2}\s/)
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .map((m) => {
        let [meaning, ...examples] = m.split('e.g.');
        meaning = meaning.trim();

        let value;
        if (type === 'Phrase') {
          const index = meaning.indexOf(',');
          value = meaning.substring(0, index);
          meaning = meaning.substring(index + 1);
        }

        return cleanObj({
          type,
          value,
          meaning: meaning.trim(),
          examples: examples[0]
            ?.trim()
            .split('.')
            .map((e) => e.trim())
            .filter((e) => e.length > 0),
        });
      });
  };

  const joinIncomplete = (spans) => {
    const newSpans = [];
    let affected = 0;

    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      if (i !== 0) {
        const prev = newSpans[newSpans.length - 1];
        const words = span.text.trim().split(' ');

        if (
          !prev.text.endsWith('.') ||
          (/\d+/.test(span.text.charAt(0)) && +span.text.charAt(0) !== 1) ||
          (prev.text.endsWith('.') && prev.text.trim().split(' ').length < 2) ||
          span.text.startsWith(',') ||
          span.text.startsWith('[') ||
          (words.length > 1 && /^[0-9]{1}\./.test(words[words.length - 1]))
        ) {
          prev.text = prev.text + ' ' + span.text;
          affected += 1;
        } else {
          newSpans.push(span);
        }
      } else {
        newSpans.push(span);
      }
    }

    if (affected > 0) {
      return joinIncomplete(newSpans);
    }

    return newSpans;
  };

  const availableTypes = [
    { type: 'adj', name: 'Adjective' },
    { type: 'adv', name: 'Adverb' },
    { type: 'conj', name: 'Conjunction' },
    { type: 'n', name: 'Noun' },
    { type: 'plural n', name: 'Noun' },
    { type: 'prep', name: 'Preposition' },
    { type: 'pron', name: 'Pronoun' },
    { type: 'v', name: 'Verb' },
    { type: 'abbr', name: 'Abbreviation' },
    { type: 'exclam', name: 'Exclamation' },
    { type: 'comb.', name: 'Prefix' },
  ];

  const getTenses = (tenses) => {
    const [pastTense, pastParticiple, presentParticiple] = tenses;
    const tenseMeanings = [];

    if (pastTense) {
      tenseMeanings.push({
        tenseType: 'Past',
        value: pastTense,
        type: 'Verb',
      });
    }

    if (pastParticiple) {
      tenseMeanings.push({
        tenseType: 'Past Participle',
        value: pastParticiple,
        type: 'Verb',
      });
    }

    if (presentParticiple) {
      tenseMeanings.push({
        tenseType: 'Present Participle',
        value: presentParticiple,
        type: 'Verb',
      });
    }

    return tenseMeanings;
  };

  const mapStatements = (p, mainType) => {
    const toRemove = [];
    const meanings = [];
    p = joinIncomplete(p);

    const typePrefixes = ['–', '-', ''];
    const typeSUffixes = ['.,', '.'];

    for (let i = 0; i < p.length; i++) {
      if (toRemove.includes(i)) {
        continue;
      }

      let textContent = p[i].text;

      if (textContent.startsWith('1 ')) {
        meanings.push(...getMeanings(textContent, mainType));
        toRemove.push(i);
        continue;
      }

      if (textContent === 'v.') {
        const tenseMeanings = getTenses(
          (p[1]?.text ?? '').split(',').map((t) => t.trim())
        );

        toRemove.push(i);
        toRemove.push(i + 1);

        meanings.push(...tenseMeanings);

        if (p[0]) {
          meanings.push(...getMeanings(textContent ?? ''));
          toRemove.push(i);
        }

        continue;
      }

      if (textContent.startsWith('–v.,') && textContent !== '–v.,') {
        textContent = textContent.replace('–v.,', '').trim();

        if (textContent.startsWith('-')) {
          const index = textContent.indexOf('.');
          const tenses = textContent
            .substring(0, index)
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
          if (tenses.every((t) => t.split(' ').length === 1)) {
            meanings.push(...getTenses(tenses));
            textContent = textContent.substring(index + 1);
          }
        }

        meanings.push(...getMeanings(textContent, 'Verb'));
        toRemove.push(i);
        continue;
      }

      if (
        textContent.startsWith('prefix (horgale)') ||
        textContent.startsWith('horgale (prefix)')
      ) {
        textContent = p
          .map((s) => s.text.trim())
          .join(' ')
          .replace('prefix (horgale)', '')
          .replace('horgale (prefix)', '')
          .trim();
        meanings.push(...getMeanings(textContent, 'Prefix'));
        toRemove.push(...p.map((_, k) => k));
        continue;
      }

      if (
        textContent.startsWith('suffix (dibgale)') ||
        textContent.startsWith('dibgale (suffix)')
      ) {
        textContent = p
          .map((s) => s.text.trim())
          .join(' ')
          .replace('suffix (dibgale)', '')
          .replace('dibgale (suffix)', '')
          .trim();
        meanings.push(...getMeanings(textContent, 'Suffix'));
        toRemove.push(...p.map((_, k) => k));
        continue;
      }

      //====================================================================
      for (const type of availableTypes) {
        let prefix;
        for (const pr of typePrefixes) {
          if (textContent.startsWith(pr + type.type)) {
            prefix = pr;
            break;
          }
        }

        let suf;

        for (const s of typeSUffixes) {
          if (textContent.startsWith(prefix + type.type + s)) {
            suf = s;
            break;
          }
        }

        if (!suf) {
          continue;
        }

        textContent = textContent.replace(prefix + type.type + suf, '').trim();
        meanings.push(...getMeanings(textContent, type.name));
        toRemove.push(i);
        break;
      }
      //====================================================================

      if (
        (textContent.startsWith('-') || textContent.startsWith('–')) &&
        textContent.split(' ').length > 2 &&
        !textContent.includes('.;')
      ) {
        textContent = textContent.replace('-', '').replace('–', '').trim();
        meanings.push(...getMeanings(textContent, 'Phrase'));
        toRemove.push(i);
      } else {
        meanings.push(...getMeanings(textContent, mainType));
        toRemove.push(i);
      }
    }

    return {
      meanings,
      toRemove,
    };
  };

  const extractWordForms = (allMeanings) => {
    const meanings = [];
    const wordForms = [];

    const toForms = (raw) => {
      const parts = raw.split(' ');
      const typ = availableTypes.find(
        (t) =>
          t.type.toLowerCase() === (parts[parts.length - 1] ?? '').toLowerCase()
      );

      return { form: parts[0], type: typ?.name };
    };

    for (let i = 0; i < allMeanings.length; i++) {
      const m = allMeanings[i];
      if (i + 1 === allMeanings.length) {
        const lastMeaning = allMeanings[i];

        if (lastMeaning.examples) {
          const examples = lastMeaning.examples.filter(
            (e) => !e.startsWith('-') && !e.startsWith(';')
          );
          const forms = lastMeaning.examples
            .filter((e) => e.startsWith('-') || e.startsWith(';'))
            .map((raw) => {
              raw = raw.replace('; -', '').replace('-', '').trim();
              return toForms(raw);
            });
          wordForms.push(...forms);
          meanings.push({ ...lastMeaning, examples });
        } else {
          const parts = (m.meaning ?? '').split('. -');
          if (parts.length === 2) {
            const [newMeaning, rawForms] = parts;
            m.meaning = newMeaning;

            const forms = rawForms
              .split('.')
              .map((r) => r.trim())
              .filter((r) => r !== '.' && r.length > 0)
              .map((f) => {
                f = f.replace('; -', '').replace(';', '').replace('-', '');
                return toForms(f);
              });
            wordForms.push(...forms);
          }

          meanings.push(m);
        }
      } else {
        meanings.push(m);
      }
    }

    return {
      meanings,
      forms: wordForms.filter(
        (f) => f.form && f.form.trim().length > 0 && f.form !== '&'
      ),
    };
  };

  for (const p of paragraphs) {
    let word;
    let pronunciation = '';
    let mainType = '';
    let plural = '';
    let abbreviation = '';
    const meanings = [];

    if (!p[0]) continue;
    let text = p[0].text;
    word = text;
    p.shift();

    if (!p[0]) continue;
    text = p[0].text;

    if (text.toLowerCase() === 'or') {
      word += ' or ' + p[1].text;
      p.shift();
      p.shift();
    }

    if (!p[0]) continue;
    text = p[0].text;

    if (text.startsWith('(')) {
      const index = text.indexOf(')');
      pronunciation = text.substring(1, index).trim();
      const remainder = text.substring(index + 1).trim();

      if (remainder) {
        p[0].text = remainder;
      } else {
        p.shift();
      }
    }

    if (!p[0]) continue;
    text = p[0].text;

    if (text === 'n., pl.') {
      mainType = 'Noun';
      plural = p[1].text;
      p.shift();
      p.shift();

      if (p[0].text.startsWith('or ')) {
        plural += ' ' + p[0].text;
        p.shift();
      }
    } else if (text === 'n. abbr.:') {
      mainType = 'Noun';
      abbreviation = p[1].text;
      p.shift();
      p.shift();
    } else if (text === 'plural n.') {
      mainType = 'Noun';
      p.shift();
    } else if (text === 'comb. form') {
      mainType = 'Prefix';
      p.shift();
    } else if (text === 'eeg') {
      // DROP FOR NOW
      const len = p.length;
      p.splice(0, len);
      continue;
    } else if (text.startsWith('astaanta') || text.startsWith('astaan')) {
      const combined = p.map((span) => span.text).join(' ');
      if (p.length > 1) {
        p.pop();
      }
      p[0].text = combined;
      mainType = 'Abbreviation';
    } else if (
      text.startsWith('naanaysta gobolka') ||
      text.startsWith('gobol') ||
      text.startsWith('waddan')
    ) {
      mainType = 'Noun';
    } else if (text.startsWith('past of')) {
      mainType = 'Verb';
      p[0].text += p[1]?.text ?? '';
      p.pop();
    } else {
      mainType = 'Noun';
    }

    if (!p[0]) continue;
    text = p[0].text;

    if (!p[0]) continue;
    text = p[0].text;

    const newElements = joinIncomplete(p);
    while (p.length > 0) {
      p.pop();
    }
    p.push(...newElements);

    for (let i = 0; i < 5; i++) {
      const { meanings: other, toRemove } = mapStatements(p, mainType);
      meanings.push(...other);
      const newP = p.filter((_, i) => !toRemove.includes(i));
      p.splice(0, p.length);
      p.push(...newP);
    }

    if (p.length === 1 && p[0].text.toLowerCase() === word.toLowerCase()) {
      // Image alt
      p.pop();
    }

    if (p.length > 0) {
      remaining.push(p);
    }

    if (!word) {
      throw new Error(`Missing word in ${file}`);
    }

    words.push(
      cleanObj({
        word,
        pronunciation,
        plural,
        abbreviation,
        mainType,
        ...extractWordForms(
          meanings.filter((m) => m.type && m.type.trim().length > 0)
        ),
      })
    );
  }

  writeFileSync(join(__dirname, 'spans', file), JSON.stringify(remaining), {
    encoding: 'utf8',
  });

  writeFileSync(join(__dirname, 'final', file), JSON.stringify(words), {
    encoding: 'utf8',
  });

  const withXKey = words.filter((word) => !word.meanings);
  if (withXKey.length > 1) {
    writeFileSync(
      join(__dirname, 'missed', file),
      JSON.stringify(withXKey.map((word) => word.word)),
      {
        encoding: 'utf8',
      }
    );
  }
};

const combineAll = () => {
  const mainDir = join(__dirname, 'final');
  const files = readdirSync(mainDir).filter((name) =>
    name.startsWith('abwaanary')
  );

  const all = [];

  files.forEach((file) => {
    const data = JSON.parse(
      readFileSync(join(__dirname, 'final', file), { encoding: 'utf8' })
    );
    const clean = data.filter((d) => Object.keys(d).length > 1);

    all.push(...clean);
  });

  console.log(`All words before joining: ${all.length}`);
  const texts = all.map((w) => w.word);
  const unique = Array.from(new Set(texts));
  console.log(`Unique words: ${unique.length}`);

  const finalOutput = [];

  for (const word of all) {
    const cleanMeanings = [];
    if (!word.meanings) {
      console.log(word);
      throw new Error();
    }
    word.meanings.forEach((m) => {
      const exist = cleanMeanings.find((om) => om.meaning === m.meaning);
      if (!exist) {
        cleanMeanings.push(m);
      }
    });
    word.meanings = cleanMeanings;

    const cleanForms = [];
    if (word.forms && word.forms.length > 0) {
      word.forms.forEach((form) => {
        const exist = cleanForms.find(
          (f) => f.form == form.form && f.type === form.type
        );
        if (!exist) {
          cleanForms.push(form);
        }
      });

      word.forms = cleanForms;
    }

    const exist = finalOutput.find((w) => w.word === word.word);
    if (exist) {
      exist.pronunciation = exist.pronunciation ?? word.pronunciation;
      exist.plural = exist.plural ?? word.plural;
      exist.meanings = [...exist.meanings, ...word.meanings];
    } else {
      finalOutput.push(word);
    }
  }
  const extractLinkedWords = (linkingWord, text = '') => {
    const linkedText = (part) =>
      part
        .replace(`${linkingWord} `, '')
        .replace('.', '')
        .split('(n.')[0]
        .split('(sense ')[0]
        .trim();
    if (!text.includes(`${linkingWord}`)) {
      return { text, words: [] };
    }

    if (text.startsWith(`${linkingWord} `)) {
      return { text: '', words: [linkedText(text)] };
    }

    if (text.split(`, ${linkingWord}`).length > 1) {
      const parts = text.split(`, ${linkingWord}`);

      return { text: parts[0].trim(), words: [linkedText(parts[1])] };
    }

    if (text.split(` (${linkingWord} `).length > 1) {
      const parts = text.split(` (${linkingWord} `);
      const [linked, ...rest] = parts[1].split(')');
      text = parts[0] + rest.join(')');

      return { text: text.trim(), words: [linkedText(linked)] };
    }

    if (text.split(` ${linkingWord} `).length > 1) {
      const parts = text.split(` ${linkingWord} `);
      const [linked, ...rest] = parts[1].split('.');
      text = parts[0] + rest.join('.');

      return { text: text.trim(), words: [linkedText(linked)] };
    }

    return { text, words: [] };
  };

  const getLinkedWords = (text = '') => {
    const joiningWords = [
      'eeg',
      'waxaa kale oo looyaqaan',
      'waxaa kale oo loogu yeeraa',
      'waxaa kale oo loo yaqaan',
      'kale loogu yeeraa',
      'barbardhig',
      'Waxaa kale oo loo yaqaan',
      'Waxaa kale oo looyaqaan',
      'Waxaa kale oo loogu yeeraa',
      'Barbardhig',
      'waxaa kale oo looyaqaan,',
      'Waxaa kale oo loo yaqaan:',
      'waxaa kale oo loo yaqaan:',
      'Barbardhig,'
    ];

    const words = [];
    let remaining = text;

    joiningWords.forEach((word) => {
      const { text: newText, words: newLinked } = extractLinkedWords(word, remaining);

      words.push(...newLinked);
      remaining = newText;
    });

    return { text: remaining, words };
  };

  finalOutput.forEach((word) => {
    word.meanings.forEach((meaning) => {
      const { words, text } = getLinkedWords(meaning.meaning);
      const linkedWords = [...words];

      meaning.meaning = text;

      const emptyExamplesIndices = [];

      meaning?.examples?.forEach((example, i) => {
        const { words, text } = getLinkedWords(example);
        linkedWords.push(...words);

        if (text) {
          meaning.examples[i] = text;
        } else {
          emptyExamplesIndices.push(i);
        }
      });

      if (meaning?.examples?.length) {
        meaning.examples = meaning.examples.filter(
          (_, i) => !emptyExamplesIndices.includes(i)
        );
      }

      if (linkedWords.length > 0) {
        meaning.linkedWords = linkedWords;
      }
    });
  });
  console.log(`Final word count: ${finalOutput.length}`);

  writeFileSync(
    join(__dirname, 'final', 'words.json'),
    JSON.stringify(finalOutput),
    {
      encoding: 'utf8',
    }
  );
};

function init() {
  const mainDir = join(__dirname, 'raw');
  const files = readdirSync(mainDir).filter((name) =>
    name.startsWith('abwaanary')
  );

  files.forEach((file) => {
    console.log(
      `===============================${file}==================================`
    );
    extract(file);

    composeJson(file + '.json');
  });

  combineAll();
}

init();
