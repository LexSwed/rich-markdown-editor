import * as React from "react";
import debounce from "lodash/debounce";
import ReactDOM from "react-dom";
import Editor from "../../src";

const element = document.getElementById("root");
const savedText = localStorage.getItem("saved");
const exampleText = `
# Welcome

This is example content. It is persisted between reloads in localStorage.
`;
const defaultValue = savedText || exampleText;

const docSearchResults = [
  {
    title: "Hiring",
    subtitle: "Created by Jane",
    url: "/doc/hiring",
  },
  {
    title: "Product Roadmap",
    subtitle: "Created by Tom",
    url: "/doc/product-roadmap",
  },
  {
    title: "Finances",
    subtitle: "Created by Coley",
    url: "/doc/finances",
  },
  {
    title: "Security",
    subtitle: "Created by Coley",
    url: "/doc/security",
  },
  {
    title: "Super secret stuff",
    subtitle: "Created by Coley",
    url: "/doc/secret-stuff",
  },
  {
    title: "Supero notes",
    subtitle: "Created by Vanessa",
    url: "/doc/supero-notes",
  },
  {
    title: "Meeting notes",
    subtitle: "Created by Rob",
    url: "/doc/meeting-notes",
  },
];

class YoutubeEmbed extends React.Component {
  render() {
    const { attrs } = this.props;
    const videoId = attrs.matches[1];

    return (
      <iframe
        className={this.props.isSelected ? "ProseMirror-selectednode" : ""}
        src={`https://www.youtube.com/embed/${videoId}?modestbranding=1`}
      />
    );
  }
}

class Example extends React.Component {
  state = {
    readOnly: false,
    template: false,
    dark: localStorage.getItem("dark") === "enabled",
    value: undefined,
  };

  handleToggleReadOnly = () => {
    this.setState({ readOnly: !this.state.readOnly });
  };

  handleToggleTemplate = () => {
    this.setState({ template: !this.state.template });
  };

  handleToggleDark = () => {
    const dark = !this.state.dark;
    this.setState({ dark });
    localStorage.setItem("dark", dark ? "enabled" : "disabled");
  };

  handleUpdateValue = () => {
    const existing = localStorage.getItem("saved") || "";
    const value = `${existing}\n\nedit!`;
    localStorage.setItem("saved", value);

    this.setState({ value });
  };

  handleChange = debounce(value => {
    const text = value();
    console.log(text);
    localStorage.setItem("saved", text);
  }, 250);

  render() {
    const { body } = document;
    if (body) body.style.backgroundColor = this.state.dark ? "#181A1B" : "#FFF";

    return (
      <div>
        <div>
          <br />
          <button type="button" onClick={this.handleToggleReadOnly}>
            {this.state.readOnly ? "Switch to Editable" : "Switch to Read-only"}
          </button>{" "}
          <button type="button" onClick={this.handleToggleDark}>
            {this.state.dark ? "Switch to Light" : "Switch to Dark"}
          </button>{" "}
          <button type="button" onClick={this.handleToggleTemplate}>
            {this.state.template ? "Switch to Document" : "Switch to Template"}
          </button>{" "}
          <button type="button" onClick={this.handleUpdateValue}>
            Update value
          </button>
        </div>
        <br />
        <br />
        <Editor
          id="example"
          readOnly={this.state.readOnly}
          readOnlyWriteCheckboxes
          value={this.state.value}
          template={this.state.template}
          defaultValue={defaultValue}
          scrollTo={window.location.hash}
          handleDOMEvents={{
            focus: () => console.log("FOCUS"),
            blur: () => console.log("BLUR"),
            paste: () => console.log("PASTE"),
            touchstart: () => console.log("TOUCH START"),
          }}
          onSave={options => console.log("Save triggered", options)}
          onCancel={() => console.log("Cancel triggered")}
          onChange={this.handleChange}
          onClickLink={(href, event) =>
            console.log("Clicked link: ", href, event)
          }
          onHoverLink={event => {
            console.log("Hovered link: ", event.target.href);
            return false;
          }}
          onClickHashtag={(tag, event) =>
            console.log("Clicked hashtag: ", tag, event)
          }
          onCreateLink={title => {
            // Delay to simulate time taken for remote API request to complete
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                if (title !== "error") {
                  return resolve(
                    `/doc/${encodeURIComponent(title.toLowerCase())}`
                  );
                } else {
                  reject("500 error");
                }
              }, 1500);
            });
          }}
          onShowToast={(message, type) => window.alert(`${type}: ${message}`)}
          onSearchLink={async term => {
            console.log("Searched link: ", term);

            // Delay to simulate time taken for remote API request to complete
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(
                  docSearchResults.filter(result =>
                    result.title.toLowerCase().includes(term.toLowerCase())
                  )
                );
              }, Math.random() * 500);
            });
          }}
          uploadImage={file => {
            console.log("File upload triggered: ", file);

            // Delay to simulate time taken to upload
            return new Promise(resolve => {
              setTimeout(() => resolve("https://picsum.photos/600/600"), 1500);
            });
          }}
          embeds={[
            {
              title: "YouTube",
              keywords: "youtube video tube google",
              icon: () => (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/75/YouTube_social_white_squircle_%282017%29.svg"
                  width={24}
                  height={24}
                />
              ),
              matcher: url => {
                return url.match(
                  /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([a-zA-Z0-9_-]{11})$/i
                );
              },
              component: YoutubeEmbed,
            },
          ]}
          dark={this.state.dark}
          autoFocus
        />
      </div>
    );
  }
}

if (element) {
  ReactDOM.render(<Example />, element);
}
