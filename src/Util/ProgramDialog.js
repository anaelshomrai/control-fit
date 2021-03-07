import React, { useEffect, useState } from "react";
import { makeStyles, Slide,useTheme,Button,Dialog,AppBar,Toolbar,IconButton,Typography, } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import "./css/quill.css";
import ReactQuill from "react-quill";
import "../../node_modules/react-quill/dist/quill.snow.css";
import { Editor } from "draft-js";
import "../../node_modules/draft-js/dist/Draft.css";
import { useTranslation } from "react-i18next";
import DragAndDropModule from 'quill-drag-and-drop-module';



const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ProgramDialog({ index,open, close, html,saveProgram, title }) {
  const classes = useStyles();
  const [htmlThis,setHtml] = useState('');
  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    if (theme.direction === "rtl") {
      require("./css/rtl.css");
    } else {
      require("./css/ltr.css");
    }
  },[theme.direction,theme.chosenLang])

  useEffect(() => {
    setHtml(html);
  },[html])

  const handleChange = (e) => {
    setHtml(e);
  }

  const save = () => {
    saveProgram(htmlThis,index);
    close();
  }



  var toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction
    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ["clean"], // remove formatting button
  ];

  /*
   * Quill modules to attach to editor
   * See https://quilljs.com/docs/modules/ for complete options
   */
  Editor.modules = {
    toolbar: toolbarOptions,
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },

    dragAndDrop: {
      draggables: [
        {
          content_type_pattern: "^image/", // Any file with matching type will result in ...
          tag: "img", // ... an 'img' tag ...
          attr: "src", // ... with 'src' equal to the file's base64 (or the result of `onDrop` [see below]).
        },
      ],
    },
  };
  const quilstyle = {
    height: "80%",
    //direction: "ltr",
  };

  /*
   * Quill editor formats
   * See https://quilljs.com/docs/formats/
   */
  Editor.formats = [
    "header",
    "font",
    "size",
    "direction",
    "align",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
  ];

  return (
    <div>
      <Dialog
        fullScreen
        open={open}
        onClose={close}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={close}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {title}
            </Typography>
            <Button autoFocus color="inherit" onClick={save}>
              {t("SAVE")}
            </Button>
          </Toolbar>
        </AppBar>
        <ReactQuill 
        style={quilstyle}
        theme={"snow"}
        onChange={handleChange}
        value={htmlThis}
        modules={Editor.modules}
        formats={Editor.formats}
        bounds={'.app'}
        placeholder={t("TRAINEE_PROGRAM_PLACEHOLDER")}
       />
      </Dialog>
    </div>
  );
}
