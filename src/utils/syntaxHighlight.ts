import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-http';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';

export function highlightCode(code: string, language: string): string {
  const lang = (language || '').toLowerCase().trim();
  let grammar: Prism.Grammar | undefined;
  let prismLang = 'markup';

  if (lang === 'json') {
    grammar = Prism.languages.json;
    prismLang = 'json';
  } else if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'curl') {
    grammar = Prism.languages.bash;
    prismLang = 'bash';
  } else if (lang === 'http') {
    grammar = Prism.languages.http;
    prismLang = 'http';
  } else if (lang === 'yaml' || lang === 'yml') {
    grammar = Prism.languages.yaml;
    prismLang = 'yaml';
  } else if (lang === 'javascript' || lang === 'js') {
    grammar = Prism.languages.javascript;
    prismLang = 'javascript';
  } else if (lang === 'typescript' || lang === 'ts') {
    grammar = Prism.languages.typescript || Prism.languages.javascript;
    prismLang = 'typescript';
  } else if (Prism.languages[lang]) {
    grammar = Prism.languages[lang];
    prismLang = lang;
  }

  if (!grammar) {
    grammar = Prism.languages.markup;
    prismLang = 'markup';
  }

  try {
    return Prism.highlight(code, grammar, prismLang);
  } catch (err) {
    return code;
  }
}
