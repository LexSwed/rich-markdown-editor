import { toggleMark } from 'prosemirror-commands'
import markInputRule from '../lib/markInputRule'
import Mark from './Mark'

export default class Bold extends Mark {
  get name() {
    return 'strong'
  }

  get schema() {
    return {
      parseDOM: [{ tag: 'b' }, { tag: 'strong' }, { style: 'font-style', getAttrs: (value: any) => value === 'bold' }],
      toDOM: () => ['strong'],
    }
  }

  inputRules({ type }: any) {
    return [markInputRule(/(?:\*\*)([^*]+)(?:\*\*)$/, type)]
  }

  keys({ type }: any) {
    return {
      'Mod-b': toggleMark(type),
      'Mod-B': toggleMark(type),
    }
  }

  get toMarkdown() {
    return {
      open: '**',
      close: '**',
      mixable: true,
      expelEnclosingWhitespace: true,
    }
  }

  parseMarkdown() {
    return { mark: 'strong' }
  }
}
