import * as React from 'react'
import { setTextSelection } from 'prosemirror-utils'
import type { EditorView } from 'prosemirror-view'
import type { Mark } from 'prosemirror-model'
import { HiOutlineDocument, HiOutlineX, HiOutlinePlus, HiOutlineTrash, HiOutlineFolderOpen } from 'react-icons/hi'
import { styled, Flex, TextField, Icon } from '@fxtrot/ui'
import isUrl from '../lib/isUrl'
import ToolbarButton from './ToolbarButton'
import LinkSearchResult from './LinkSearchResult'
import type baseDictionary from '../dictionary'

export type SearchResult = {
  title: string
  subtitle?: string
  url: string
}

type Props = {
  mark?: Mark
  from: number
  to: number
  tooltip: typeof React.Component | React.FC<any>
  dictionary: typeof baseDictionary
  onRemoveLink?: () => void
  onCreateLink?: (title: string) => Promise<void>
  onSearchLink?: (term: string) => Promise<SearchResult[]>
  onSelectLink: (options: { href: string; title?: string; from: number; to: number }) => void
  onClickLink: (href: string, event: MouseEvent) => void
  onShowToast?: (message: string, code: string) => void
  view: EditorView
}

type State = {
  results: {
    [keyword: string]: SearchResult[]
  }
  value: string
  previousValue: string
  selectedIndex: number
}

class LinkEditor extends React.Component<Props, State> {
  discardInputValue = false
  initialValue = this.href
  initialSelectionLength = this.props.to - this.props.from

  state: State = {
    selectedIndex: -1,
    value: this.href,
    previousValue: '',
    results: {},
  }

  get href(): string {
    return this.props.mark ? this.props.mark.attrs.href : ''
  }

  get suggestedLinkTitle(): string {
    const { state } = this.props.view
    const { value } = this.state
    const selectionText = state.doc.cut(state.selection.from, state.selection.to).textContent

    return value.trim() || selectionText.trim()
  }

  componentWillUnmount = () => {
    // If we discarded the changes then nothing to do
    if (this.discardInputValue) {
      return
    }

    // If the link is the same as it was when the editor opened, nothing to do
    if (this.state.value === this.initialValue) {
      return
    }

    // If the link is totally empty or only spaces then remove the mark
    const href = (this.state.value || '').trim()
    if (!href) {
      return this.handleRemoveLink()
    }

    this.save(href, href)
  }

  save = (href: string, title?: string): void => {
    href = href.trim()

    if (href.length === 0) return

    this.discardInputValue = true
    const { from, to } = this.props

    // If the input doesn't start with a protocol or relative slash, make sure
    // a protocol is added to the beginning
    if (!isUrl(href) && !href.startsWith('/')) {
      href = `https://${href}`
    }

    this.props.onSelectLink({ href, title, from, to })
  }

  handleKeyDown = (event: React.KeyboardEvent): void => {
    switch (event.key) {
      case 'Enter': {
        event.preventDefault()
        const { selectedIndex, value } = this.state
        const results = this.state.results[value] || []
        const { onCreateLink } = this.props

        if (selectedIndex >= 0) {
          const result = results[selectedIndex]
          if (result) {
            this.save(result.url, result.title)
          } else if (onCreateLink && selectedIndex === results.length) {
            this.handleCreateLink(this.suggestedLinkTitle)
          }
        } else {
          // saves the raw input as href
          this.save(value, value)
        }

        if (this.initialSelectionLength) {
          this.moveSelectionToEnd()
        }

        return
      }

      case 'Escape': {
        event.preventDefault()

        if (this.initialValue) {
          this.setState({ value: this.initialValue }, this.moveSelectionToEnd)
        } else {
          this.handleRemoveLink()
        }
        return
      }

      case 'ArrowUp': {
        if (event.shiftKey) return
        event.preventDefault()
        event.stopPropagation()
        const prevIndex = this.state.selectedIndex - 1

        this.setState({
          selectedIndex: Math.max(-1, prevIndex),
        })
        return
      }

      case 'ArrowDown':
        if (event.shiftKey) return
      case 'Tab': {
        event.preventDefault()
        event.stopPropagation()
        const { selectedIndex, value } = this.state
        const results = this.state.results[value] || []
        const total = results.length
        const nextIndex = selectedIndex + 1

        this.setState({
          selectedIndex: Math.min(nextIndex, total),
        })
        return
      }
    }
  }

  handleFocusLink = (selectedIndex: number) => {
    this.setState({ selectedIndex })
  }

  handleChange = async (event: any): Promise<void> => {
    const value = event.target.value

    this.setState({
      value,
      selectedIndex: -1,
    })

    const trimmedValue = value.trim()

    if (trimmedValue && this.props.onSearchLink) {
      try {
        const results = await this.props.onSearchLink(trimmedValue)
        this.setState((state) => ({
          results: {
            ...state.results,
            [trimmedValue]: results,
          },
          previousValue: trimmedValue,
        }))
      } catch (error) {
        console.error(error)
      }
    }
  }

  handleOpenLink = (event: any): void => {
    event.preventDefault()
    this.props.onClickLink(this.href, event)
  }

  handleCreateLink = (value: string) => {
    this.discardInputValue = true
    const { onCreateLink } = this.props

    value = value.trim()
    if (value.length === 0) return

    if (onCreateLink) return onCreateLink(value)
  }

  handleRemoveLink = (): void => {
    this.discardInputValue = true

    const { from, to, mark, view, onRemoveLink } = this.props
    const { state, dispatch } = this.props.view

    if (mark) {
      dispatch(state.tr.removeMark(from, to, mark))
    }

    if (onRemoveLink) {
      onRemoveLink()
    }

    view.focus()
  }

  handleSelectLink = (url: string, title: string) => (event: any) => {
    event.preventDefault()
    this.save(url, title)

    if (this.initialSelectionLength) {
      this.moveSelectionToEnd()
    }
  }

  moveSelectionToEnd = () => {
    const { to, view } = this.props
    const { state, dispatch } = view
    dispatch(setTextSelection(to)(state.tr))
    view.focus()
  }

  render() {
    const { dictionary } = this.props
    const { value, selectedIndex } = this.state
    const results = this.state.results[value.trim()] || this.state.results[this.state.previousValue] || []

    const Tooltip = this.props.tooltip
    const looksLikeUrl = value.match(/^https?:\/\//i)

    const suggestedLinkTitle = this.suggestedLinkTitle

    const showCreateLink =
      !!this.props.onCreateLink &&
      !(suggestedLinkTitle === this.initialValue) &&
      suggestedLinkTitle.length > 0 &&
      !looksLikeUrl

    const showResults = !!suggestedLinkTitle && (showCreateLink || results.length > 0)

    return (
      <Wrapper>
        <TextField
          value={value}
          placeholder={showCreateLink ? dictionary.findOrCreateDoc : dictionary.searchOrPasteLink}
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
          autoFocus={this.href === ''}
        />

        <ToolbarButton onClick={this.handleOpenLink} disabled={!value}>
          <Tooltip tooltip={dictionary.openLink} placement="top">
            <Icon as={HiOutlineFolderOpen} />
          </Tooltip>
        </ToolbarButton>
        <ToolbarButton onClick={this.handleRemoveLink}>
          <Tooltip tooltip={dictionary.removeLink} placement="top">
            {this.initialValue ? <Icon as={HiOutlineTrash} /> : <Icon as={HiOutlineX} />}
          </Tooltip>
        </ToolbarButton>

        {showResults && (
          <SearchResults id="link-search-results">
            {results.map((result, index) => (
              <LinkSearchResult
                key={result.url}
                title={result.title}
                subtitle={result.subtitle}
                icon={<Icon as={HiOutlineDocument} />}
                onMouseOver={() => this.handleFocusLink(index)}
                onClick={this.handleSelectLink(result.url, result.title)}
                selected={index === selectedIndex}
              />
            ))}

            {showCreateLink && (
              <LinkSearchResult
                key="create"
                title={suggestedLinkTitle}
                subtitle={dictionary.createNewDoc}
                icon={<Icon as={HiOutlinePlus} />}
                onMouseOver={() => this.handleFocusLink(results.length)}
                onClick={() => {
                  this.handleCreateLink(suggestedLinkTitle)

                  if (this.initialSelectionLength) {
                    this.moveSelectionToEnd()
                  }
                }}
                selected={results.length === selectedIndex}
              />
            )}
          </SearchResults>
        )}
      </Wrapper>
    )
  }
}

const Wrapper = styled(Flex, {
  marginLeft: '-$2',
  marginRight: '-$2',
  minWidth: 336,
})

const SearchResults = styled('ol', {
  position: 'absolute',
  bc: '$surfaceStill',
  top: '100%',
  width: '100%',
  height: 'auto',
  left: 0,
  p: '$2',
  margin: 0,
  marginTop: -3,
  marginBottom: 0,
  borderRadius: '$base',
  overflowY: 'auto',
  maxHeight: '25vh',
})

export default LinkEditor
