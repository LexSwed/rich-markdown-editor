import isNodeActive from '../queries/isNodeActive'
import type { MenuItem } from '../types'
import type baseDictionary from '../dictionary'
import type { EditorState } from 'prosemirror-state'
import { AiOutlineAlignCenter, AiOutlineAlignLeft, AiOutlineAlignRight } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'

export default function imageMenuItems(state: EditorState, dictionary: typeof baseDictionary): MenuItem[] {
  const { schema } = state
  const isLeftAligned = isNodeActive(schema.nodes.image, {
    layoutClass: 'left-50',
  })
  const isRightAligned = isNodeActive(schema.nodes.image, {
    layoutClass: 'right-50',
  })

  return [
    {
      name: 'alignLeft',
      tooltip: dictionary.alignLeft,
      icon: AiOutlineAlignLeft,
      visible: true,
      active: isLeftAligned,
    },
    {
      name: 'alignCenter',
      tooltip: dictionary.alignCenter,
      icon: AiOutlineAlignCenter,
      visible: true,
      active: (state) => isNodeActive(schema.nodes.image)(state) && !isLeftAligned(state) && !isRightAligned(state),
    },
    {
      name: 'alignRight',
      tooltip: dictionary.alignRight,
      icon: AiOutlineAlignRight,
      visible: true,
      active: isRightAligned,
    },
    {
      name: 'separator',
      visible: true,
    },
    {
      name: 'deleteImage',
      tooltip: dictionary.deleteImage,
      icon: HiOutlineTrash,
      visible: true,
      active: () => false,
    },
  ]
}
