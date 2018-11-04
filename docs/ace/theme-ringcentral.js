define("ace/theme/ringcentral",["require","exports","module","ace/lib/dom"], function (require, exports, module) {

    exports.isDark = true;
    exports.cssClass = "ace-ringcentral";
    exports.cssText = ".ace-ringcentral {\
background-color: #FFFFFF;\
color: #F8F8F2\
}\
.ace-ringcentral .ace_gutter {\
background: #FFFFFF;\
color: #8F908A;\
}\
.ace-ringcentral .ace_gutter-layer {\
background: #FFFFFF;\
border-right: 1px solid #e8e8e8;\
}\
.ace-ringcentral .ace_content {\
background-color: #FFFFFF;\
color: #585858;\
}\
.ace-ringcentral .ace_scroller.ace_scroll-left {\
box-shadow: none;\
}\
::-webkit-scrollbar-track {\
background-color: #FFFFFF;\
}\
::-webkit-scrollbar-thumb {\
background-color: #DDDDDD;\
}\
.ace-ringcentral .ace_scrollbar {\
scrollbar-track-color: #FFFFFF;\
scrollbar-face-color: #DDDDDD;\
scrollbar-shadow-color: #DDDDDD;\
}\
.ace-ringcentral .ace_print-margin {\
width: 1px;\
background: #555651\
}\
.ace-ringcentral .ace_line {\
color: #0073ae\
}\
.ace-ringcentral .ace_cursor {\
color: #F8F8F0\
}\
.ace-ringcentral .ace_marker-layer .ace_selection {\
background: #49483E\
}\
.ace-ringcentral.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #272822;\
}\
.ace-ringcentral .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-ringcentral .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #49483E\
}\
.ace-ringcentral .ace_marker-layer .ace_active-line {\
background: #202020\
}\
.ace-ringcentral .ace_gutter-active-line {\
background-color: #272727\
}\
.ace-ringcentral .ace_marker-layer .ace_selected-word {\
border: 1px solid #49483E\
}\
.ace-ringcentral .ace_invisible {\
color: #52524d\
}\
.ace-ringcentral .ace_entity.ace_name.ace_tag,\
.ace-ringcentral .ace_keyword,\
.ace-ringcentral .ace_meta.ace_tag,\
.ace-ringcentral .ace_storage {\
color: #F92672\
}\
.ace-ringcentral .ace_punctuation,\
.ace-ringcentral .ace_punctuation.ace_tag {\
color: #1f1f1f\
}\
.ace-ringcentral .ace_constant.ace_character,\
.ace-ringcentral .ace_constant.ace_language,\
.ace-ringcentral .ace_constant.ace_numeric,\
.ace-ringcentral .ace_constant.ace_other {\
color: #AE81FF\
}\
.ace-ringcentral .ace_invalid {\
color: #F8F8F0;\
background-color: #F92672\
}\
.ace-ringcentral .ace_invalid.ace_deprecated {\
color: #F8F8F0;\
background-color: #AE81FF\
}\
.ace-ringcentral .ace_support.ace_constant,\
.ace-ringcentral .ace_support.ace_function {\
color: #0073ae\
}\
.ace-ringcentral .ace_fold {\
background-color: #A6E22E;\
border-color: #F8F8F2\
}\
.ace-ringcentral .ace_storage.ace_type,\
.ace-ringcentral .ace_support.ace_class,\
.ace-ringcentral .ace_support.ace_type {\
font-style: italic;\
color: #ff8800\
}\
.ace-ringcentral .ace_entity.ace_name.ace_function,\
.ace-ringcentral .ace_entity.ace_other,\
.ace-ringcentral .ace_entity.ace_other.ace_attribute-name,\
.ace-ringcentral .ace_variable,\
.ace-ringcentral .ace_string {\
color: #585858;\
background-color: transparent;\
}\
.ace-ringcentral .ace_variable.ace_parameter {\
font-style: italic;\
color: #FD971F\
}\
.ace-ringcentral .ace_comment {\
color: #75715E\
}\
.ace-ringcentral .ace_scrollbar-v {\
background-color: #FFFFFF;\
}\
.ace-ringcentral .ace_marker-layer .ace_selection {\
background: #B5D5FF;\
}\
.ace-ringcentral .ace_marker-layer .ace_active-line {\
background: #E8F2FE;\
}\
.ace-ringcentral .ace_marker-layer .ace_selected-word {\
border: 1px solid #B5D5FF;\
background: #FAFAFF;\
}\
.ace-ringcentral .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC) right repeat-y;\
opacity: 0.2;\
}";

    var dom = require("../lib/dom");
    dom.importCssString(exports.cssText, exports.cssClass);
});
