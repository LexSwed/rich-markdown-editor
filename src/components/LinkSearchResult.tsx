import { styled } from '@fxtrot/ui'
import * as React from 'react'
import scrollIntoView from 'smooth-scroll-into-view-if-needed'

type Props = {
  onClick: (event: React.MouseEvent) => void
  onMouseOver: (event: React.MouseEvent) => void
  icon: React.ReactNode
  selected: boolean
  title: string
  subtitle?: string
}

function LinkSearchResult({ title, subtitle, selected, icon, ...rest }: Props) {
  const ref = React.useCallback(
    (node: HTMLElement) => {
      if (selected && node) {
        scrollIntoView(node, {
          scrollMode: 'if-needed',
          block: 'center',
          boundary: (parent) => {
            // All the parent elements of your target are checked until they
            // reach the #link-search-results. Prevents body and other parent
            // elements from being scrolled
            return parent.id !== 'link-search-results'
          },
        })
      }
    },
    [selected]
  )

  return (
    <ListItem ref={ref as any} compact={!subtitle} selected={selected} {...rest}>
      <IconWrapper>{icon}</IconWrapper>
      <div>
        <Title>{title}</Title>
        {subtitle ? <Subtitle selected={selected}>{subtitle}</Subtitle> : null}
      </div>
    </ListItem>
  )
}

const IconWrapper = styled('span', {
  flexShrink: 0,
  marginRight: 4,
  opacity: 0.8,
})

const ListItem = styled('li', {
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  borderRadius: 2,
  textDecoration: 'none',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  userSelect: 'none',

  variants: {
    selected: {
      true: {
        bc: '$surfaceActive',
      },
      false: {
        bc: 'transparent',
      },
    },
    compact: {
      true: {
        lineHeight: 'inherit',
        height: 28,
      },
      false: {
        lineHeight: 1.2,
        height: 'auto',
      },
    },
  },
})

const Title = styled('div', {
  fontSize: 14,
  fontWeight: 500,
})``

const Subtitle = styled('div', {
  fontSize: 13,
  variants: {
    selected: {
      true: {
        opacity: 0.75,
      },
      false: {
        opacity: 0.5,
      },
    },
  },
})

export default LinkSearchResult
