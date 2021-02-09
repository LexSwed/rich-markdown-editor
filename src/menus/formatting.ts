import type { EditorState } from 'prosemirror-state'
import isInList from '../queries/isInList'
import isMarkActive from '../queries/isMarkActive'
import type { MenuItem } from '../types'
import type baseDictionary from '../dictionary'
import { AiOutlineBold, AiOutlineItalic, AiOutlineStrikethrough } from 'react-icons/ai'
import { HiOutlineCode, HiOutlineLink, HiOutlinePencil } from 'react-icons/hi'

export default function formattingMenuItems(
  state: EditorState,
  isTemplate: boolean,
  dictionary: typeof baseDictionary
): MenuItem[] {
  const { schema } = state
  const isTable = isInTable(state)
  const isList = isInList(state)
  const allowBlocks = !isList

  return [
    {
      name: 'placeholder',
      tooltip: dictionary.placeholder,
      icon: HiOutlinePencil,
      active: isMarkActive(schema.marks.placeholder),
      visible: isTemplate,
    },
    {
      name: 'separator',
      visible: isTemplate,
    },
    {
      name: 'strong',
      tooltip: dictionary.strong,
      icon: AiOutlineBold,
      active: isMarkActive(schema.marks.strong),
    },
    {
      name: 'em',
      tooltip: dictionary.em,
      icon: AiOutlineItalic,
      active: isMarkActive(schema.marks.em),
    },
    {
      name: 'strikethrough',
      tooltip: dictionary.strikethrough,
      icon: AiOutlineStrikethrough,
      active: isMarkActive(schema.marks.strikethrough),
    },
    {
      name: 'mark',
      tooltip: dictionary.mark,
      icon: HiOutlinePencil,
      active: isMarkActive(schema.marks.mark),
      visible: !isTemplate,
    },
    {
      name: 'code_inline',
      tooltip: dictionary.codeInline,
      icon: HiOutlineCode,
      active: isMarkActive(schema.marks.code_inline),
    },
    {
      name: 'separator',
      visible: allowBlocks,
    },
    {
      name: 'separator',
    },
    {
      name: 'link',
      tooltip: dictionary.createLink,
      icon: HiOutlineLink,
      active: isMarkActive(schema.marks.link),
      attrs: { href: '' },
    },
  ]
}
