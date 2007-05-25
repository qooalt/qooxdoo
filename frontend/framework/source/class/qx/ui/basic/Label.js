/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_basic)

************************************************************************ */

/**
 * The Label widget displays plain text or HTML text.
 *
 * Most complex qooxdoo widgets use instances of Label to display text.
 * The label supports auto sizing and internationalization.
 *
 * @appearance label
 */
qx.Class.define("qx.ui.basic.Label",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param text {String} The text of the label (see property {@link #text}).
   * @param mnemonic {String} The mnemonic of the label (see property {@link #mnemonic}).
   * @param mode {String} The mode of the label (see property {@link #mode}).
   */
  construct : function(text, mnemonic, mode)
  {
    this.base(arguments);

    if (mode != null) {
      this.setMode(mode);
    }

    if (text != null) {
      this.setText(text);
    }

    if (mnemonic != null) {
      this.setMnemonic(mnemonic);
    }

    // Property init
    this.initWidth();
    this.initHeight();
    this.initSelectable();
    this.initCursor();
    this.initWrap();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * TODOC
     * @internal
     * @type static
     * @param vId {var} TODOC
     * @return {Element} TODOC
     */
    _getMeasureNode : function()
    {
      var node = this._measureNode;

      if (!node)
      {
        node = document.createElement("div");
        var style = node.style;

        style.width = style.height = "auto";
        style.visibility = "hidden";
        style.position = "absolute";
        style.zIndex = "-1";

        document.body.appendChild(node);

        this._measureNode = node;
      }

      return node;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "label"
    },

    width :
    {
      refine : true,
      init : "auto"
    },

    height :
    {
      refine : true,
      init : "auto"
    },

    allowStretchX :
    {
      refine : true,
      init : false
    },

    allowStretchY :
    {
      refine : true,
      init : false
    },

    selectable :
    {
      refine : true,
      init : false
    },

    cursor :
    {
      refine : true,
      init : "default"
    },



    /**
     * The text of the label. How the text is interpreted depends on the value of the
     * property {@link #mode}.
     */
    text :
    {
      apply : "_applyText",
      init : "",
      dispose : true,
      event : "changeText",
      check : "Label"
    },


    /**
     * Whether the text should be automatically wrapped into the next line
     */
    wrap :
    {
      check : "Boolean",
      init : false,
      nullable : true,
      apply : "_applyWrap"
    },


    /**
     * The alignment of the text inside the box
     */
    textAlign :
    {
      check : [ "left", "center", "right", "justify" ],
      nullable : true,
      themeable : true,
      apply : "_applyTextAlign"
    },


    /**
     * Whether an ellipsis symbol should be rendered if there is not enough room for the full text.
     *
     * Please note: If enabled this conflicts with a custom overflow setting.
     */
    textOverflow :
    {
      check : "Boolean",
      init : true,
      apply : "_applyText"
    },


    /**
     * Set how the label text should be interpreted
     *
     * <ul>
     *   <li><code>text</code> will set the text verbatim. Leading and trailing white space will be reserved.</li>
     *   <li><code>html</code> will interpret the label text as html.</li>
     *   <li><code>auto</code> will try to guess whether the text represents an HTML string or plain text.
     *       This is how older qooxdoo versions treated the text.
     *   </li>
     * <ul>
     */
    mode :
    {
      check : [ "html", "text", "auto" ],
      init : "auto",
      apply : "_applyText"
    },


    /** A single character which will be underlined inside the text. */
    mnemonic :
    {
      check : "String",
      nullable : true,
      apply : "_applyMnemonic"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _content : "",
    _isHtml : false,

    /**
     * @deprecated please use {@link #setText} instead.
     */
    setHtml : function(html)
    {
      this.warn("Deprecated: please use setText() instead.");
      this.printStackTrace();
      this.setText(html);
    },


    /**
     * @deprecated please use {@link #getText} instead.
     */
    getHtml : function()
    {
      this.warn("Deprecated: please use getText() instead.");
      this.printStackTrace();
      return this.getText();
    },






    /*
    ---------------------------------------------------------------------------
      TEXTALIGN SUPPORT
    ---------------------------------------------------------------------------
    */

    _applyTextAlign : function(value, old) {
      value === null ? this.removeStyleProperty("textAlign") : this.setStyleProperty("textAlign", value);
    },




    /*
    ---------------------------------------------------------------------------
      FONT SUPPORT
    ---------------------------------------------------------------------------
    */

    _applyFont : function(value, old) {
      qx.theme.manager.Font.getInstance().connect(this._styleFont, this, value);
    },


    /**
     * @type member
     * @param value {qx.ui.core.Font}
     */
    _styleFont : function(value)
    {
      this._invalidatePreferredInnerDimensions();
      value ? value.render(this) : qx.ui.core.Font.reset(this);
    },




    /*
    ---------------------------------------------------------------------------
      TEXT COLOR SUPPORT
    ---------------------------------------------------------------------------
    */

    _applyTextColor : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleTextColor, this, value);
    },

    /**
     * @type member
     * @param value {var} any acceptable CSS color property
     */
    _styleTextColor : function(value) {
      value ? this.setStyleProperty("color", value) : this.removeStyleProperty("color");
    },




    /*
    ---------------------------------------------------------------------------
      WRAP SUPPORT
    ---------------------------------------------------------------------------
    */

    _applyWrap : function(value, old) {
      value == null ? this.removeStyleProperty("whiteSpace") : this.setStyleProperty("whiteSpace", value ? "normal" : "nowrap");
    },




    /*
    ---------------------------------------------------------------------------
      TEXT HANDLING
    ---------------------------------------------------------------------------
    */


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyText : function(value, old) {
      qx.locale.Manager.getInstance().connect(this._syncText, this, this.getText());
    },


    _syncText : function()
    {
      var text = this.getText();

      switch (this.getMode())
      {
        case "auto":
          this._isHtml = qx.util.Validation.isValidString(text) && text.match(/<.*>/) ? true : false;
          this._content = text;
          break;

        case "text":
          var escapedText = qx.xml.String.escape(text).replace(/(^ | $)/g, "&nbsp;").replace(/  /g, "&nbsp;&nbsp;");
          this._isHtml = escapedText !== text;
          this._content = escapedText;
          break;

        case "html":
          this._isHtml = true;
          this._content = text;
          break;
      }

      if (this._isCreated) {
        this._renderContent();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMnemonic : function(value, old)
    {
      this._mnemonicTest = value ? new RegExp("^(((<([^>]|" + value + ")+>)|(&([^;]|" + value + ")+;)|[^&" + value + "])*)(" + value + ")", "i") : null;

      if (this._isCreated) {
        this._renderContent();
      }
    },





    /*
    ---------------------------------------------------------------------------
      PREFERRED DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _computeObjectNeededDimensions : function()
    {
      // get node
      var element = this.self(arguments)._getMeasureNode();
      var style = element.style;

      // sync styles
      var source = this._styleProperties;
      style.fontFamily = source.fontFamily || "";
      style.fontSize = source.fontSize || "";
      style.fontWeight = source.fontWeight || "";
      style.fontStyle = source.fontStyle || "";

      // apply html
      if (this._isHtml)
      {
        element.innerHTML = this._content;
      }
      else
      {
        element.innerHTML = "";
        qx.dom.Element.setTextContent(element, this._content);
      }

      // store values
      this._cachedPreferredInnerWidth = element.scrollWidth;
      this._cachedPreferredInnerHeight = element.scrollHeight;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _computePreferredInnerWidth : function()
    {
      this._computeObjectNeededDimensions();
      return this._cachedPreferredInnerWidth;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _computePreferredInnerHeight : function()
    {
      this._computeObjectNeededDimensions();
      return this._cachedPreferredInnerHeight;
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT APPLY
    ---------------------------------------------------------------------------
    */


    _patchTextOverflow : function(html, inner) {
      return "<div style='float:left;width:" + (inner-14) + "px;overflow:hidden;white-space:nowrap'>" + html + "</div><span style='float:left'>&hellip;</span>";
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    _postApply : function()
    {
      var html = this._content;
      var element = this._getTargetNode();

      if (html == null)
      {
        element.innerHTML = "";
        return;
      }

      if (this.getMnemonic())
      {
        if (this._mnemonicTest.test(html))
        {
          html = RegExp.$1 + "<span style=\"text-decoration:underline\">" + RegExp.$7 + "</span>" + RegExp.rightContext;
          this._isHtml = true;
        }
        else
        {
          html += " (" + this.getMnemonic() + ")";
        }
      }

      var style = element.style;

      if (this.getTextOverflow())
      {
        if (this.getInnerWidth() < this.getPreferredInnerWidth())
        {
          style.overflow = "hidden";

          if (qx.core.Variant.isSet("qx.client", "mshtml|webkit"))
          {
            style.textOverflow = "ellipsis";
          }
          else if (qx.core.Variant.isSet("qx.client", "opera"))
          {
            style.OTextOverflow = "ellipsis";
          }
          else
          {
            html = this._patchTextOverflow(html, this.getInnerWidth());
            this._isHtml = true;
          }
        }
        else
        {
          style.overflow = "";

          if (qx.core.Variant.isSet("qx.client", "mshtml|webkit"))
          {
            style.textOverflow = "";
          }
          else if (qx.core.Variant.isSet("qx.client", "opera"))
          {
            style.OTextOverflow = "";
          }
        }
      }

      if (this._isHtml)
      {
        element.innerHTML = html;
      }
      else
      {
        element.innerHTML = "";
        qx.dom.Element.setTextContent(element, html);
      }
    }
  }
});
