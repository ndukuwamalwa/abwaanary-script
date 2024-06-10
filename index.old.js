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
    PAGE_TOP_TEXT_CLASS: '.c35',
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
    MAIN_LETTER_TEXT_CLASS: '.c100',
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
    SUPERSCRIPT_CLASS: '.c194',
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

const extractFile = (name) => {
  const writeRemaining = (wordElements) => {
    writeFileSync(
      `./clean/${name}`,
      `<body>${wordElements
        .map((elem) => `<p>${elem.innerHTML}</p>`)
        .join('')}</body>`
    );
  };

  /**
   *
   * @param {parser.HTMLElement} wordElement
   */
  const removeEmptyNodes = (wordElement) => {
    if (!wordElement) return;

    wordElement.childNodes.forEach((node) => {
      if (node.textContent && node.textContent.trim().length === 0) {
        wordElement.removeChild(node);
      }
    });
  };

  /**
   *
   * @param {Array<parser.HTMLElement>} wordElements
   */
  const joinInconsistentStarts = (wordElements) => {
    const inconsistentStarts = [wordElements[0]];
    inconsistentStarts.pop();

    let affected = 0;

    const isConsistentWithNext = (prevCharCode, nextIndex) => {
      const nextIndexes = wordElements
        .slice(nextIndex, nextIndex + 4)
        .map((wordElement) => {
          removeEmptyNodes(wordElement);
          return wordElement.childNodes[0];
        })
        .map((firstChild) => {
          if (
            !firstChild ||
            !firstChild.textContent ||
            firstChild.textContent.trim().length === 0
          ) {
            return -1;
          }
          return firstChild.textContent.trim().charCodeAt(0);
        });

      return nextIndexes.includes(prevCharCode);
    };

    for (let i = 0; i < wordElements.length; i++) {
      const previous = wordElements.at(i - 1);
      const current = wordElements.at(i);
      const next = wordElements.at(i + 1);

      removeEmptyNodes(previous);
      removeEmptyNodes(current);
      removeEmptyNodes(next);

      const previousFirstChildText = previous?.childNodes[0]?.textContent
        ?.trim()
        .toLowerCase();
      const currentFirstChildText = current.childNodes[0]?.textContent
        ?.trim()
        .toLowerCase();
      const nextFirstChildText = next?.childNodes[0]?.textContent
        ?.trim()
        .toLowerCase();

      if (
        previousFirstChildText &&
        currentFirstChildText &&
        previousFirstChildText.charCodeAt(0) !==
          currentFirstChildText.charCodeAt(0)
      ) {
        if (nextFirstChildText) {
          if (
            isConsistentWithNext(previousFirstChildText.charCodeAt(0), i + 1)
          ) {
            const lastPushed =
              inconsistentStarts[inconsistentStarts.length - 1];
            lastPushed.innerHTML = lastPushed.innerHTML + current.innerHTML;
            affected += 1;
          } else {
            inconsistentStarts.push(current);
          }
        } else {
          inconsistentStarts.push(current);
        }
      } else {
        inconsistentStarts.push(current);
      }
    }

    if (affected > 0) {
      return joinInconsistentStarts(inconsistentStarts);
    }

    return inconsistentStarts;
  };

  const cleanUpExtraction = () => {
    const doc = parser.parse(readFileSync(`./raw/${name}`));
    const body = doc.querySelector('body');
    let wordElements = body.querySelectorAll('p');
    console.log(`All word elements: ${wordElements.length}`);

    const missed = [];

    wordElements = wordElements.filter((wordElement) => {
      let passes = true;
      for (const child of wordElement.childNodes) {
        passes = child.innerText.trim().length > 0;
      }
      return passes;
    });
    console.log(`After removing empty: ${wordElements.length}`);

    wordElements = wordElements.filter((wordElement) => {
      let passes =
        wordElement.querySelectorAll(CLASS_MAPPINGS[name].PAGE_TOP_TEXT_CLASS)
          .length === 0 &&
        wordElement.querySelectorAll(
          CLASS_MAPPINGS[name].MAIN_LETTER_TEXT_CLASS
        ).length === 0 &&
        wordElement.querySelectorAll(CLASS_MAPPINGS[name].REPEATED_WORD_CLASS)
          .length === 0;

      if (
        wordElement.querySelectorAll(CLASS_MAPPINGS[name].INCOMPLETE_DEF_CLASS)
          .length > 0
      ) {
        // Remove paragraphs with empty text
        passes =
          passes &&
          wordElement
            .querySelector(CLASS_MAPPINGS[name].INCOMPLETE_DEF_CLASS)
            .innerText.trim().length > 0;
      }

      return passes;
    });

    console.log(
      `After removing unprocessable paragraphs: ${wordElements.length}`
    );

    const joinedElements = [wordElements[0]];
    joinedElements.pop();

    for (let i = 0; i < wordElements.length; i++) {
      const elem = wordElements.at(i);
      removeEmptyNodes(elem);
      const previous = joinedElements[joinedElements.length - 1];
      if (
        elem.childNodes.length === 1 &&
        elem.querySelectorAll(CLASS_MAPPINGS[name].INCOMPLETE_DEF_CLASS)
          .length > 0 &&
        previous
      ) {
        elem
          .querySelectorAll(CLASS_MAPPINGS[name].INCOMPLETE_DEF_CLASS)
          .forEach((span) => {
            previous.appendChild(span);
          });
      } else {
        joinedElements.push(elem);
      }
    }

    const noneLetterStarts = [wordElements[0]];
    noneLetterStarts.pop();

    for (let i = 0; i < wordElements.length; i++) {
      const elem = wordElements.at(i);
      removeEmptyNodes(elem);
      const previous = noneLetterStarts[noneLetterStarts.length - 1];

      const firstChild = elem.childNodes[0];
      if (
        firstChild &&
        firstChild.textContent &&
        !/[a-z]/i.test(firstChild.textContent.trim()[0]) &&
        previous
      ) {
        previous.innerHTML = previous.innerHTML + elem.innerHTML;
      } else {
        noneLetterStarts.push(elem);
      }
    }
    wordElements = joinInconsistentStarts(noneLetterStarts);
    console.log(`After joining incomplete: ${wordElements.length}`);

    for (const wordElement of wordElements) {
      const wordSpans = wordElement.querySelectorAll(
        CLASS_MAPPINGS[name].ACTUAL_WORD_CLASS
      );

      if (wordSpans.length === 0) {
        missed.push(wordElement.innerHTML);
      }

      if (
        wordElement.querySelectorAll(CLASS_MAPPINGS[name].SUPERSCRIPT_CLASS)
          .length > 0
      ) {
        wordElement
          .querySelectorAll(CLASS_MAPPINGS[name].SUPERSCRIPT_CLASS)
          .forEach((sup) => wordElement.removeChild(sup));
      }
    }

    writeFileSync(`./missed/${name}.txt`, missed.join('\n'), {
      encoding: 'utf8',
    });

    writeRemaining(wordElements);
  };

  const processFile = () => {
    cleanUpExtraction();
    const doc = parser.parse(readFileSync(`./clean/${name}`));
    const wordElements = doc.querySelectorAll('p');
    const words = [];
    const failedWordExtraction = [];

    for (const wordElement of wordElements) {
      let word = '';
      {
        // Extract word
        const [firstBold, ...otherBold] = wordElement.querySelectorAll(
          CLASS_MAPPINGS[name].ACTUAL_WORD_CLASS
        );

        if (!firstBold) {
          failedWordExtraction.push(`<p>${wordElement.innerHTML}</p>`);
          continue;
        }

        word = firstBold.innerText.trim();
        wordElement.removeChild(firstBold);

        if (otherBold && otherBold.length > 0) {
          const sameWordDiffCase = otherBold.find(
            (bold) =>
              bold.innerText &&
              bold.innerText.trim().toLowerCase() === word.toLowerCase()
          );

          if (sameWordDiffCase) {
            const index = otherBold.indexOf(sameWordDiffCase);

            otherBold.forEach((bold, i) => {
              if (i <= index) {
                wordElement.removeChild(bold);
              }
            });
          }
        }
        removeEmptyNodes(wordElement);
        if (
          wordElement.childNodes[0]?.textContent &&
          wordElement.childNodes[0].textContent.trim().toLowerCase() === 'or'
        ) {
          wordElement.removeChild(wordElement.childNodes[0]);
        }
        removeEmptyNodes(wordElement);
      }

      let pronunciation = '';
      {
        // Extract pronunciation
        const firstNode = wordElement.firstChild;
        if (
          firstNode &&
          firstNode.textContent &&
          firstNode.textContent.trim().length > 0 &&
          firstNode.textContent.trim().startsWith('(')
        ) {
          let text = firstNode.textContent.trim();
          const [first, ...rest] = text.split(')');
          pronunciation = first.replace('(', '').trim();

          firstNode.textContent = rest ? rest.join('').trim() : '';
        }
        removeEmptyNodes(wordElement);
      }

      let plural = '';
      {
        // Extract plural
        const firstNode = wordElement.firstChild;
        if (
          firstNode &&
          firstNode.textContent &&
          firstNode.textContent.trim().length > 0 &&
          firstNode.textContent.trim().endsWith('pl.')
        ) {
          const nextSibling = wordElement.childNodes[1];
          if (
            nextSibling.classList.contains(
              CLASS_MAPPINGS[name].ACTUAL_WORD_CLASS.replace('.', '')
            )
          ) {
            plural = nextSibling.textContent.trim();
            wordElement.removeChild(nextSibling);
            firstNode.textContent = firstNode.textContent
              .trim()
              .replace('pl.', '')
              .trim();
          }
        }
        removeEmptyNodes(wordElement);
      }

      // Combine remaining nodes
      const remaining =
        wordElement.childNodes
          .map((node) => node.textContent?.trim())
          .join(' ')
          .replaceAll('\r\n            ', '') + '';

      words.push({
        word,
        pronunciation,
        plural,
        remaining,
      });
    }

    wordElements.forEach((wordElement) => {
      wordElement.childNodes.forEach((child) => {
        if (
          child.innerText &&
          child.innerText.replace('&nbsp;', '').trim().length === 0
        ) {
          wordElement.removeChild(child);
        }
      });
    });

    writeFileSync(`./missed/${name}.txt`, failedWordExtraction.join('\n'), {
      encoding: 'utf8',
    });

    writeRemaining(wordElements);

    return words;
  };

  const TYPE_MAPS = {
    Noun: ['n.,', 'n.', 'n., .', 'n. [informal]'],
    Adjective: ['adj.'],
    Abbreviation: ['abbr.'],
    Pronoun: ['pron.'],
    Adverb: ['adv.'],
    Verb: ['v.'],
    Preposition: ['prep.'],
  };

  const processWords = () => {
    const allWords = processFile();

    /**
     *
     * @param {typeof allWords} rawWords
     * @returns {typeof allWords}
     */
    const removeIncomplete = (rawWords) => {
      const words = [rawWords[0]];
      words.pop();

      let affected = 0;

      for (let i = 0; i < rawWords.length; i++) {
        const prev = rawWords[i - 1];
        const current = rawWords[i];
        const diff = Math.abs(
          prev?.word.toLowerCase().charCodeAt(0) -
            current.word.toLowerCase().charCodeAt(0)
        );

        if (prev && diff >= 1) {
          if (diff === 1) {
            const next = rawWords[i + 1];
            if (
              next &&
              next.word.charCodeAt(0) === current.word.charCodeAt(0)
            ) {
              words.push(current);
              continue;
            }
          }

          const lastPushed = words[words.length - 1];
          lastPushed.remaining +=
            ' ' +
            current.word +
            ' ' +
            (current.plural ? current.plural + ' ' : '') +
            current.remaining;
          affected += 1;
        } else {
          words.push(current);
        }
      }

      if (affected > 0) {
        return removeIncomplete(words);
      }

      return words;
    };

    /**
     *
     * @param {string} value
     */
    const mapType = (value) => {
      let mainType;
      value = value.trim();
      let remaining = value;
      for (const key of Object.keys(TYPE_MAPS)) {
        for (const delimiter of TYPE_MAPS[key]) {
          if (value.startsWith(delimiter) || value.includes(` ${delimiter}`)) {
            mainType = key;
            remaining = remaining.replace(delimiter, '').trim();
            break;
          }
        }

        if (mainType) {
          break;
        }
      }

      if (!/[a-z]{1,}/i.test(remaining)) {
        remaining = undefined;
      }

      return {
        mainType,
        remaining,
      };
    };

    const words = removeIncomplete(allWords).map((word) => {
      const other = {};

      if (
        word.remaining.includes('1') &&
        word.remaining.includes('2') &&
        word.remaining.trim().charAt(0) !== '1'
      ) {
        const parts = word.remaining.split('1');
        other.meta = parts[0];
        word.remaining = word.remaining.replace(other.meta, '').trim();
        other.meta = other.meta.trim();

        const { remaining, mainType } = mapType(other.meta);
        if (mainType) {
          other.mainType = mainType;
        }

        other.meta = remaining;

        if (
          /^v\.\,*\s\-*[a-z]{1,},\s*-*[a-z]{1,}\s*\.{0,}$/i.test(other.meta)
        ) {
          other.mainType = 'Verb';
          other.tenses = other.meta
            .replace('v.', '')
            .trim()
            .split(',')
            .map((t) => t.trim());
          delete other.meta;
        }

        if (/^adj\.\s\-*[a-z]{1,},\s*-*[a-z]{1,}\s*\.{0,}$/i.test(other.meta)) {
          other.mainType = 'Adjective';
          other.adjectives = other.meta
            .replace('adj.', '')
            .trim()
            .split(',')
            .map((t) => t.trim());
          delete other.meta;
        }

        if (/^adv\.\s\-*[a-z]{1,},\s*-*[a-z]{1,}\s*\.{0,}$/i.test(other.meta)) {
          other.mainType = 'Adverb';
          other.adverbs = other.meta
            .replace('adv.', '')
            .trim()
            .split(',')
            .map((t) => t.trim());
          delete other.meta;
        }

        if (/^[a-z]{1,}\s\(‘*,*\w+\)\s[a-z]{1}\.,*$/i.test(other.meta)) {
          const parts = other.meta.split(' ');
          other.mainType = 'Noun';
          word.word += ' or ' + parts[0];
          word.pronunciation = parts[1].replace('(', '').replace(')', '');
          delete other.meta;
        }

        if (other.meta?.split('or').length === 2) {
          const value = ' or ' + other.meta.split('or')[1].trim();
          if (word.plural) {
            word.plural += value;
          } else {
            word.word += value;
          }
          delete other.meta;
        }

        if (other.meta?.startsWith(',') && other.meta.endsWith('(')) {
          word.word += other.meta;
          delete other.meta;
        }
      }

      const meanings = (word.remaining + ' ')
        .split(/\s\d{1,2}\s/)
        .filter((meaning) => meaning.trim().length > 0)
        .map((meaning) => {
          if (meaning.startsWith(1)) {
            meaning = meaning.replace('1', '');
          }
          return meaning.trim();
        })
        .map((m) => {
          const [meaning, ...examples] = m.split('e.g.');
          const payload = {
            meaning: meaning.trim(),
            examples: examples
              .map((example) => example.trim())
              .filter((example) => example.length > 0),
          };

          if (payload.examples.length === 0) {
            delete payload.examples;
          }

          return payload;
        })
        .map((m) => {
          const { mainType: type, remaining } = mapType(m.meaning);

          if (type) {
            m.meaning = remaining;

            return {
              ...m,
              type,
            };
          }

          if (!other.mainType) {
            other.mainType = 'Noun';
          }

          return {
            ...m,
            type: other.mainType,
          };
        })
        .map((m) => {
          const examples = [];

          if (m.examples && m.examples.length > 0) {
            for (const example of m.examples) {
              examples.push(
                ...example
                  .split('.')
                  .map((e) => e.trim())
                  .filter((e) => e.length > 0)
              );
            }
            m.examples = examples;
          } else {
            delete m.examples;
          }

          return m;
        });

      delete word.remaining;

      return {
        ...word,
        ...other,
        meanings,
      };
    });

    writeFileSync(
      `./meta/${name}.txt`,
      words
        .filter((word) => word.meta && word.meta.trim().length > 0)
        .map((word) => word.meta)
        .join('\n')
    );

    for (let i = 0; i < words.length; i++) {
      const prev = words[i - 1];
      const current = words[i];

      if (prev) {
        const num = prev.word.replace(current.word, '').trim();

        if (prev.word === current.word) {
          prev.word += 1;
          current.word += 2;
        }

        if (/^\d$/.test(num)) {
          current.word += +num + 1;
        }
      }
    }

    console.log(`After compression: ${words.length}`);

    writeFileSync(`./json/${name}.json`, JSON.stringify(words), {
      encoding: 'utf8',
    });
  };

  processWords();
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
    extractFile(file);
  });

  console.log('=====================Whole================================');
  
  const arr = [];
  files.forEach((file) => {
    const contents = readFileSync(join(__dirname, 'json', file + '.json'), { encoding: 'utf8' });
    arr.push(...JSON.parse(contents));
  });
  const text = `export const EXTRACTED_WORDS = ${JSON.stringify(arr)};`;
  writeFileSync(join(__dirname, 'json', 'words.ts'), text, { encoding: 'utf8' });
}

init();
