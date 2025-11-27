<template>
  <!-- FileBrowser Component -->
  <FileBrowser 
    v-if="fileBrowserOpen" 
    :isWindowsOpen="true" 
    :callbackFunction="'editor-file'"
    :allowFileType="currentFileTypes" 
    @file-browser-trigger="changeFileBrowserTrigger" 
    @file-browser-callback="selectFileBrowserTrigger" 
    style="z-index: 9999 !important;"
  />

  <div class="editor-wrapper" :class="{ 'fullscreen': isFullscreen }" ref="editorWrapper">
    <!-- Toolbar -->
    <div ref="toolbar" class="toolbar" :class="toolbarLayoutClass">
      <!-- Text Formatting -->
      <div class="toolbar-group">
        <button @click="toggleBold" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('bold') }" title="Bold">
          <i class="fas fa-bold"></i>
        </button>
        <button @click="toggleItalic" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('italic') }" title="Italic">
          <i class="fas fa-italic"></i>
        </button>
        <button @click="toggleUnderline" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('underline') }" title="Underline">
          <i class="fas fa-underline"></i>
        </button>
        <button @click="toggleStrike" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('strike') }" title="Strikethrough">
          <i class="fas fa-strikethrough"></i>
        </button>
      </div>

      <!-- Headings -->
      <div class="toolbar-group">
        <button @click="setHeading(1)" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('heading', { level: 1 }) }" title="Heading 1">
          <i class="fas fa-heading"></i>
          <span class="text-xs">1</span>
        </button>
        <button @click="setHeading(2)" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('heading', { level: 2 }) }" title="Heading 2">
          <i class="fas fa-heading"></i>
          <span class="text-xs">2</span>
        </button>
        <button @click="setHeading(3)" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('heading', { level: 3 }) }" title="Heading 3">
          <i class="fas fa-heading"></i>
          <span class="text-xs">3</span>
        </button>
      </div>

      <!-- Colors & Highlights -->
      <div class="toolbar-group">
        <button @click="toggleHighlight" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('highlight') }" title="Highlight">
          <i class="fas fa-highlighter"></i>
        </button>
        <input type="color" @input="setColor($event.target.value)" class="color-picker" title="Text Color" />
      </div>

      <!-- Font Size -->
      <div class="toolbar-group">
        <select v-model="currentFontSize" @change="setFontSize($event.target.value)" class="font-size-selector" title="ขนาดตัวอักษร">
          <option value="">ขนาด</option>
          <option value="10px">10px</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="28px">28px</option>
          <option value="32px">32px</option>
          <option value="36px">36px</option>
          <option value="48px">48px</option>
        </select>
      </div>
      
      <!-- Alignment -->
      <div class="toolbar-group">
        <button @click="setAlign('left')" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive({ textAlign: 'left' }) }" title="Align Left">
          <i class="fas fa-align-left"></i>
        </button>
        <button @click="setAlign('center')" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive({ textAlign: 'center' }) }" title="Align Center">
          <i class="fas fa-align-center"></i>
        </button>
        <button @click="setAlign('right')" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive({ textAlign: 'right' }) }" title="Align Right">
          <i class="fas fa-align-right"></i>
        </button>
      </div>

      <!-- Lists -->
      <div class="toolbar-group">
        <button @click="toggleBulletList" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('bulletList') }" title="Bullet List">
          <i class="fas fa-list-ul"></i>
        </button>
        <button @click="toggleOrderedList" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('orderedList') }" title="Numbered List">
          <i class="fas fa-list-ol"></i>
        </button>
      </div>

      <!-- Media & Files -->
      <div class="toolbar-group">
        <button @click="openImageBrowser" type="button" class="toolbar-btn" title="Insert Image">
          <i class="fas fa-image"></i>
        </button>
        <button @click="openDocumentBrowser" type="button" class="toolbar-btn" title="Attach Document">
          <i class="fas fa-paperclip"></i>
        </button>
        <button @click="setLink" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('link') }" title="Insert Link">
          <i class="fas fa-link"></i>
        </button>
      </div>

      <!-- Formatting -->
      <div class="toolbar-group">
        <button @click="insertBlockquote" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('blockquote') }" title="Quote">
          <i class="fas fa-quote-left"></i>
        </button>
        <button @click="insertHorizontalRule" type="button" class="toolbar-btn" title="Horizontal Line">
          <i class="fas fa-minus"></i>
        </button>
        <button @click="toggleCodeBlock" type="button" class="toolbar-btn" :class="{ 'active': editor?.isActive('codeBlock') }" title="Code Block">
          <i class="fas fa-code"></i>
        </button>
      </div>

      <!-- Clear Formatting -->
      <div class="toolbar-group">
        <button @click="clearFormatting" type="button" class="toolbar-btn" title="Clear Formatting">
          <i class="fas fa-eraser"></i>
        </button>
      </div>

      <!-- Find and Replace -->
      <div class="toolbar-group">
        <button @click="openFindReplace" type="button" class="toolbar-btn" :class="{ 'active': findReplaceOpen }" title="ค้นหาและแทนที่ (Ctrl+F)">
          <i class="fas fa-search"></i>
        </button>
      </div>

      <!-- Undo/Redo -->
      <div class="toolbar-group">
        <button @click="editor?.commands.undo()" type="button" class="toolbar-btn" :disabled="!editor?.can().undo()" title="Undo">
          <i class="fas fa-undo"></i>
        </button>
        <button @click="editor?.commands.redo()" type="button" class="toolbar-btn" :disabled="!editor?.can().redo()" title="Redo">
          <i class="fas fa-redo"></i>
        </button>
      </div>

      <!-- Fullscreen -->
      <div class="toolbar-group">
        <button @click="toggleFullscreen" type="button" class="toolbar-btn" :class="{ 'active': isFullscreen }" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">
          <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
        </button>
      </div>

      <!-- Block Controls Toggle -->
      <div class="toolbar-group">
        <button @click="toggleBlockControls" type="button" class="toolbar-btn" :class="{ 'active': blockControlsVisible }" title="เปิด/ปิดปุ่มจัดการบล็อก">
          <i class="fas fa-th-large"></i>
        </button>
      </div>
    </div>
    
    <!-- Editor Content -->
    <div class="editor-content" :style="{ height: editorHeight }" ref="editorContent">
      <!-- Find and Replace Popup -->
      <div v-if="findReplaceOpen" class="find-replace-popup">
        <div class="find-replace-compact">
          <div class="search-row">
            <input 
              ref="findInput"
              v-model="findText" 
              @keydown.enter.prevent="performSearch"
              @keydown.escape="closeFindReplace"
              placeholder="ค้นหา..." 
              class="search-input-compact"
            />
            <button @click="performSearch" class="search-btn-compact" title="ค้นหา" type="button">
              <i class="fas fa-search"></i>
            </button>
            <button @click="findPrevious" :disabled="searchResults.length === 0" class="nav-btn-compact" title="ก่อนหน้า" type="button">
              <i class="fas fa-chevron-up"></i>
            </button>
            <button @click="findNext" :disabled="searchResults.length === 0" class="nav-btn-compact" type="button">
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="search-count">
              <span v-if="searchResults.length > 0">
                {{ currentSearchIndex + 1 }}/{{ searchResults.length }}
              </span>
              <span v-else-if="findText && searchResults.length === 0">
                0/0
              </span>
              <span v-else>
                0/0
              </span>
            </div>
            <button @click="closeFindReplace" class="close-btn-compact" type="button">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="search-row">
            <input 
              v-model="replaceText" 
              @keydown.enter.prevent="replaceNext"
              placeholder="แทนที่ด้วย..." 
              class="search-input-compact"
            />
            <button @click="replaceNext" :disabled="searchResults.length === 0" class="replace-btn-compact" type="button">
              แทนที่
            </button>
            <button @click="replaceAll" :disabled="searchResults.length === 0" class="replace-btn-compact primary" type="button">
              ทั้งหมด
            </button>
            <div class="options-compact">
              <label class="checkbox-compact" title="คำนึงตัวพิมพ์เล็ก-ใหญ่">
                <input type="checkbox" v-model="caseSensitive" @change="performSearch">
                Aa
              </label>
              <label class="checkbox-compact" title="คำเต็มเท่านั้น">
                <input type="checkbox" v-model="wholeWord" @change="performSearch">
                Ab
              </label>
            </div>
          </div>
        </div>
      </div>

      <editor-content v-if="editorReady" :editor="editor" class="editor-body" :class="{ 'hide-block-borders': !blockControlsVisible }" />
      
      <!-- Block Controls -->
      <div 
        v-if="editor && editorReady && blockControlsVisible" 
        class="block-controls-permanent"
      >
        <div 
          v-for="(block, index) in visibleBlocks" 
          :key="`block-${index}`"
          class="block-control-set"
          :style="getBlockControlPosition(block)"
        >
          <button 
            @click="moveBlockUp(block)" 
            type="button" 
            class="block-control-btn"
            title="เลื่อนขึ้น"
          >
            <i class="fas fa-arrow-up"></i>
          </button>
          <button 
            @click="moveBlockDown(block)" 
            type="button" 
            class="block-control-btn"
            title="เลื่อนลง"
          >
            <i class="fas fa-arrow-down"></i>
          </button>
          <button 
            @click="deleteBlock(block)" 
            type="button" 
            class="block-control-btn danger"
            title="ลบบล็อก"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="editor-footer">
      <span class="char-count">{{ wordCount }} ตัวอักษร</span>
      <span class="block-controls-hint">ปุ่มจัดการบล็อกแสดงอยู่มุมขวาล่างของแต่ละบล็อก</span>
      <span v-if="isFullscreen" class="fullscreen-hint">กด ESC เพื่อออกจากโหมดเต็มจอ</span>
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import OrderedList from '@tiptap/extension-ordered-list';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import Dropcursor from '@tiptap/extension-dropcursor'
import Link from '@tiptap/extension-link'
import FileBrowser from '@/interface/modal/FileBrowser.vue'
import { Extension } from '@tiptap/core';

// Custom FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize: (fontSize) => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

export default {
  name: 'EditorComponent',
  components: { EditorContent, FileBrowser },
  props: {
    content: {
      type: String,
      default: '<p>Start editing...</p>',
    },
    height: {
      type: String,
      default: '600px',
    },
    placeholder: {
      type: String,
      default: 'เริ่มพิมพ์เนื้อหาของคุณที่นี่...',
    },
  },
  data() {
    return {
      editor: null,
      localContent: this.content, // Create a local copy of the content
      fileBrowserOpen: false,
      currentFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
      isFullscreen: false,
      escapeHandler: null,
      blockElements: [], // เก็บ DOM elements ของ blocks
      blockControlsVisible: false, // สำหรับ force update และควบคุมการแสดงผล - เริ่มต้นซ่อนไว้
      editorWidth: 0, // เพิ่มสำหรับ track ความกว้างของ editor
      resizeObserver: null, // เพิ่มสำหรับ observe การเปลี่ยนแปลงขนาด
      currentFontSize: '', // เพิ่มสำหรับ track font size ปัจจุบัน
      findReplaceOpen: false,
      findText: '',
      replaceText: '',
      caseSensitive: false,
      wholeWord: false,
      searchResults: [],
      currentSearchIndex: 0,
      searchMarks: [], // เก็บ marks ที่ highlight ไว้
      currentSearchMark: null, // mark ที่กำลัง focus อยู่
      keyboardHandler: null,
    };
  },
  watch: {
    content(newValue) {
      if (newValue !== this.localContent) {
        this.localContent = newValue;
      }
    }
  },
  computed: {
    editorReady() {
      return this.editor !== null;
    },
    wordCount() {
      return this.editor?.storage.characterCount.characters() || 0;
    },
    editorHeight() {
      return this.height;
    },
    visibleBlocks() {
      // ดึง block elements จาก ProseMirror
      if (!this.editor || !this.$refs.editorContent || !this.blockControlsVisible) return [];
      
      return this.blockElements;
    },
    toolbarLayoutClass() {
      // ถ้าความกว้างมากกว่า 800px ใช้ single-row, ถ้าไม่ใช้ two-rows
      return {
        'toolbar-single-row': this.editorWidth > 800,
        'toolbar-two-rows': this.editorWidth <= 800 && this.editorWidth > 0
      };
    },
  },
  mounted() {
    this.initEditor();
    this.setupToolbarScroll();
    this.setupResizeObserver(); // เพิ่มการ observe ขนาด
    this.setupKeyboardShortcuts(); // เพิ่ม keyboard shortcuts
    // Initialize current font size
    this.$nextTick(() => {
      this.updateCurrentFontSize();
    });
  },
  beforeUnmount() {
    this.destroyEditor();
    // Cleanup fullscreen state
    document.body.classList.remove('fullscreen-active');
    // Cleanup resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    // Cleanup window resize event listener
    window.removeEventListener('resize', this.handleWindowResize);
    // Cleanup keyboard shortcuts
    this.cleanupKeyboardShortcuts();
  },
  methods: {
    initEditor() {
      this.editor = new Editor({
        content: this.validateContent(this.localContent),
        extensions: [
          StarterKit.configure({
            // ปิด extensions ที่เราจะ configure แยก
            heading: false,
            horizontalRule: false,
            orderedList: false,
            bulletList: false,
            listItem: false,
            dropcursor: false,
          }),
          Image.configure({ inline: false, allowBase64: true }),
          TextAlign.configure({ types: ['heading', 'paragraph'] }),
          Heading.configure({ levels: [1, 2, 3] }),
          HorizontalRule,
          OrderedList,
          BulletList,
          ListItem,
          Highlight,
          Underline,
          CharacterCount.configure({ limit: null }),
          Color,
          FontFamily,
          TextStyle.configure({
            HTMLAttributes: {
              class: 'text-style',
            },
          }),
          Dropcursor,
          Link.configure({ 
            openOnClick: true,
            autolink: true,
          }),
          FontSize,
        ],
        onUpdate: ({ editor }) => {
          this.$emit('update-content', editor.getHTML());
          // Update block controls เมื่อ content เปลี่ยน (เฉพาะเมื่อเปิดใช้งาน)
          if (this.blockControlsVisible) {
            this.$nextTick(() => {
              this.updateBlockControls();
            });
          }
          // Update current font size
          this.updateCurrentFontSize();
        },
        onSelectionUpdate: () => {
          // Update current font size when selection changes
          this.updateCurrentFontSize();
        },
        onCreate: () => {
          // Update block controls เมื่อ editor สร้างเสร็จ (เฉพาะเมื่อเปิดใช้งาน)
          if (this.blockControlsVisible) {
            this.$nextTick(() => {
              setTimeout(() => {
                this.updateBlockControls();
              }, 100);
            });
          }
        },
      });
    },
    validateContent(content) {
        try {
            if (typeof content !== "string") return "<p>Start editing...</p>"; // Ensure it's valid HTML
            return content;
        } catch (e) {
            console.error("Invalid editor content:", content);
            return "<p>Start editing...</p>"; // Default content to prevent crashes
        }
    },
    destroyEditor() {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
      }
    },
    openImageBrowser() {
      this.currentFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      this.fileBrowserOpen = true;
    },
    openDocumentBrowser() {
      this.currentFileTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
      this.fileBrowserOpen = true;
    },
    changeFileBrowserTrigger(payload) {
      this.fileBrowserOpen = payload;
    },
    selectFileBrowserTrigger(payload) {
      if (payload && payload.file) {
        this.fileBrowserOpen = false;
        
        // ตรวจสอบประเภทไฟล์
        const fileExtension = payload.file.split('.').pop().toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
        
        if (imageExtensions.includes(fileExtension)) {
          // แทรกรูปภาพ
          this.editor?.chain().focus().setImage({ 
            src: payload.file,
            alt: payload.file.split('/').pop(),
            title: payload.file.split('/').pop()
          }).run();
        } else if (documentExtensions.includes(fileExtension)) {
          // แทรกไฟล์แนบแบบ link ธรรมดาเหมือน URL
          const fileName = payload.file.split('/').pop();
          const fileType = this.getFileType(fileExtension);
          
          // สร้าง link ธรรมดาที่มี text สวยงาม
          const linkText = `📎 ${fileName} (${fileType})`;
          
          this.editor?.chain().focus().setLink({ 
            href: payload.file,
            target: '_blank'
          }).insertContent(linkText).run();
        } else {
          // ไฟล์ประเภทอื่นๆ แทรกเป็นลิงก์ธรรมดา
          const fileName = payload.file.split('/').pop();
          this.editor?.chain().focus().insertContent(`<a href="${payload.file}" target="_blank">${fileName}</a>`).run();
        }
      }
    },
    getFileType(extension) {
      const typeMap = {
        'pdf': 'PDF',
        'doc': 'Word',
        'docx': 'Word',
        'xls': 'Excel',
        'xlsx': 'Excel',
        'ppt': 'PowerPoint',
        'pptx': 'PowerPoint',
        'zip': 'Archive',
        'rar': 'Archive',
        'txt': 'Text',
        'mp4': 'Video',
        'mp3': 'Audio',
        'jpg': 'Image',
        'jpeg': 'Image',
        'png': 'Image',
        'gif': 'Image'
      };
      return typeMap[extension] || 'Unknown';
    },
    toggleBold() {
      this.editor?.chain().focus().toggleBold().run();
    },
    toggleItalic() {
      this.editor?.chain().focus().toggleItalic().run();
    },
    toggleUnderline() {
      this.editor?.chain().focus().toggleUnderline().run();
    },
    toggleStrike() {
      this.editor?.chain().focus().toggleStrike().run();
    },
    toggleHighlight() {
      this.editor?.chain().focus().toggleHighlight().run();
    },
    setAlign(align) {
      this.editor?.chain().focus().setTextAlign(align).run();
    },
    toggleOrderedList() {
      this.editor?.chain().focus().toggleOrderedList().run();
    },
    toggleBulletList() {
      this.editor?.chain().focus().toggleBulletList().run();
    },
    setColor(color) {
      this.editor?.chain().focus().setColor(color).run();
    },
    setFontSize(size) {
      if (size) {
        this.editor?.chain().focus().setFontSize(size).run();
        this.currentFontSize = size;
      } else {
        this.editor?.chain().focus().unsetFontSize().run();
        this.currentFontSize = '';
      }
    },
    setLink() {
      const url = prompt('ใส่ URL:');
      if (url) {
        this.editor?.chain().focus().setLink({ href: url }).run();
      }
    },
    setHeading(level) {
      this.editor?.chain().focus().toggleHeading({ level }).run();
    },
    insertHorizontalRule() {
      this.editor?.chain().focus().setHorizontalRule().run();
    },
    toggleCodeBlock() {
      this.editor?.chain().focus().toggleCodeBlock().run();
    },
    insertBlockquote() {
      this.editor?.chain().focus().toggleBlockquote().run();
    },
    clearFormatting() {
      this.editor?.chain().focus().clearNodes().unsetAllMarks().run();
    },
    moveBlockUp(block) {
      if (!block || !block.element) return;
      
      // ใช้ TipTap commands เพื่อย้าย block ขึ้น
      this.editor?.commands.focus();
      
      // หาตำแหน่ง DOM position ของ block element
      const view = this.editor.view;
      const pos = view.posAtDOM(block.element, 0);
      
      if (pos !== null && pos !== undefined) {
        // Set selection ไปที่ block นี้
        this.editor.commands.setTextSelection(pos);
        
        const { selection } = this.editor.state;
        const { $from } = selection;
        
        if ($from.depth > 0 && $from.before($from.depth) > 0) {
          this.editor?.commands.command(({ tr }) => {
            const start = $from.before($from.depth);
            const end = $from.after($from.depth);
            const slice = tr.doc.slice(start, end);
            
            // หาตำแหน่งก่อนหน้า
            const $before = tr.doc.resolve(start - 1);
            if ($before.depth > 0) {
              const beforeStart = $before.before($before.depth);
              // ลบ block ปัจจุบัน
              tr.delete(start, end);
              // แทรกที่ตำแหน่งก่อนหน้า
              tr.insert(beforeStart, slice.content);
              return true;
            }
            return false;
          });
        }
      }
    },
    moveBlockDown(block) {
      if (!block || !block.element) return;
      
      // วิธีง่ายๆ: copy moveBlockUp แล้วเปลี่ยนทิศทาง
      try {
        this.editor?.commands.focus();
        
        // หาตำแหน่ง DOM position ของ block element
        const view = this.editor.view;
        const pos = view.posAtDOM(block.element, 0);
        
        if (pos !== null && pos !== undefined) {
          // Set selection ไปที่ block นี้
          this.editor.commands.setTextSelection(pos);
          
          const { selection } = this.editor.state;
          const { $from } = selection;
          
          if ($from.depth > 0) {
            this.editor?.commands.command(({ tr }) => {
              const start = $from.before($from.depth);
              const end = $from.after($from.depth);
              const slice = tr.doc.slice(start, end);
              
              // หาตำแหน่งถัดไป (หลัง block ปัจจุบัน)
              if (end < tr.doc.content.size - 2) {
                // หา block ถัดไป
                let nextEnd = end;
                for (let i = end + 1; i < tr.doc.content.size; i++) {
                  const $check = tr.doc.resolve(i);
                  if ($check.depth === $from.depth) {
                    nextEnd = $check.after($check.depth);
                    break;
                  }
                }
                
                if (nextEnd > end) {
                  // ลบ block ปัจจุบัน
                  tr.delete(start, end);
                  // แทรกหลัง block ถัดไป
                  tr.insert(nextEnd - (end - start), slice.content);
                  return true;
                }
              }
              return false;
            });
          }
        }
      } catch (error) {
        console.warn('moveBlockDown error:', error);
      }
    },
    deleteBlock(block) {
      if (!block || !block.element) return;
      
      // ลบ block ปัจจุบัน
      this.editor?.commands.focus();
      
      // หาตำแหน่ง DOM position ของ block element
      const view = this.editor.view;
      const pos = view.posAtDOM(block.element, 0);
      
      if (pos !== null && pos !== undefined) {
        // Set selection ไปที่ block นี้
        this.editor.commands.setTextSelection(pos);
        
        const { selection } = this.editor.state;
        const { $from } = selection;
        
        if ($from.depth > 0) {
          this.editor?.commands.command(({ tr }) => {
            const start = $from.before($from.depth);
            const end = $from.after($from.depth);
            tr.delete(start, end);
            return true;
          });
        }
      }
    },
    setupToolbarScroll() {
      this.$nextTick(() => {
        const toolbar = this.$refs.toolbar;
        if (toolbar) {
          this.checkToolbarScroll(toolbar);
          toolbar.addEventListener('scroll', () => this.checkToolbarScroll(toolbar));
          window.addEventListener('resize', () => this.checkToolbarScroll(toolbar));
        }
      });
    },
    checkToolbarScroll(toolbar) {
      // เช็ค scroll เฉพาะเมื่อเป็น single-row layout
      if (this.editorWidth > 800) {
        const hasScroll = toolbar.scrollWidth > toolbar.clientWidth;
        if (hasScroll) {
          toolbar.classList.add('has-scroll');
        } else {
          toolbar.classList.remove('has-scroll');
        }
      } else {
        // ลบ has-scroll class เมื่อเป็น two-rows layout
        toolbar.classList.remove('has-scroll');
      }
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      
      if (this.isFullscreen) {
        // เปิด fullscreen
        document.body.classList.add('fullscreen-active');
        // Focus editor
        this.$nextTick(() => {
          this.editor?.commands.focus();
        });
        
        // เพิ่ม escape key listener
        this.escapeHandler = (event) => {
          if (event.key === 'Escape') {
            this.isFullscreen = false;
            document.body.classList.remove('fullscreen-active');
            document.removeEventListener('keydown', this.escapeHandler);
          }
        };
        document.addEventListener('keydown', this.escapeHandler);
      } else {
        // ปิด fullscreen
        document.body.classList.remove('fullscreen-active');
        if (this.escapeHandler) {
          document.removeEventListener('keydown', this.escapeHandler);
        }
      }
    },
    getBlockControlPosition(block) {
      if (!block || !block.element || !this.$refs.editorContent) {
        return { display: 'none' };
      }
      
      const editorContent = this.$refs.editorContent;
      const editorRect = editorContent.getBoundingClientRect();
      const blockRect = block.element.getBoundingClientRect();
      
      // วางตำแหน่งควบคุมภายในขอบเขตของ block (มุมขวาล่างภายใน)
      const controlsWidth = 42; // ความกว้าง: 14px * 3
      const controlsHeight = 14; // ความสูงของปุ่ม
      const left = blockRect.right - editorRect.left - controlsWidth - 48; // เพิ่มระยะห่างจากขอบขวาเป็น 12px
      const top = blockRect.bottom - editorRect.top - controlsHeight - 4; // ห่างจากขอบล่างภายใน 4px
      
      return {
        position: 'absolute',
        left: `${Math.max(left, blockRect.left - editorRect.left + 4)}px`, // ไม่ให้ออกนอกขอบซ้าย
        top: `${Math.max(top, blockRect.top - editorRect.top + 4)}px`, // ไม่ให้ออกนอกขอบบน
        display: 'flex',
      };
    },
    updateBlockControls() {
      // Force update โดยการ toggle visibility
      this.blockControlsVisible = false;
      this.$nextTick(() => {
        this.blockControlsVisible = true;
        this.$nextTick(() => {
          // อัพเดต blockElements
          if (this.$refs.editorContent) {
            const proseMirrorElement = this.$refs.editorContent.querySelector('.ProseMirror');
            if (proseMirrorElement) {
              const blocks = proseMirrorElement.querySelectorAll('p, h1, h2, h3, blockquote, pre, ul, ol');
              this.blockElements = Array.from(blocks).map((element, index) => ({
                element,
                index,
                type: element.tagName.toLowerCase(),
              }));
            }
          }
        });
      });
    },
    toggleBlockControls() {
      this.blockControlsVisible = !this.blockControlsVisible;
      // เรียก updateBlockControls เมื่อเปิด block controls
      if (this.blockControlsVisible) {
        this.$nextTick(() => {
          this.updateBlockControls();
        });
      }
    },
    setupResizeObserver() {
      // ตั้งค่า ResizeObserver เพื่อ track การเปลี่ยนแปลงขนาด
      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver((entries) => {
          for (let entry of entries) {
            this.editorWidth = entry.contentRect.width;
            this.$nextTick(() => {
              this.checkToolbarLayout();
            });
          }
        });
        
        // เริ่ม observe editor wrapper
        this.$nextTick(() => {
          if (this.$refs.editorWrapper) {
            this.resizeObserver.observe(this.$refs.editorWrapper);
            // Set initial width
            this.editorWidth = this.$refs.editorWrapper.offsetWidth;
          }
        });
      } else {
        // Fallback สำหรับ browser ที่ไม่รองรับ ResizeObserver
        window.addEventListener('resize', this.handleWindowResize);
        this.$nextTick(() => {
          this.handleWindowResize();
        });
      }
    },
    handleWindowResize() {
      if (this.$refs.editorWrapper) {
        this.editorWidth = this.$refs.editorWrapper.offsetWidth;
        this.checkToolbarLayout();
      }
    },
    checkToolbarLayout() {
      // Method สำหรับ check และปรับ layout ของ toolbar
      if (this.$refs.toolbar) {
        const toolbar = this.$refs.toolbar;
        
        // Force update CSS classes
        this.$nextTick(() => {
          // ตรวจสอบการ scroll ใหม่หลังจากเปลี่ยน layout
          this.checkToolbarScroll(toolbar);
        });
      }
    },
    updateCurrentFontSize() {
      if (!this.editor) return;
      
      // ตรวจสอบ fontSize attribute ใน current selection
      const { $from } = this.editor.state.selection;
      const marks = $from.marks();
      
      // หา textStyle mark ที่มี fontSize
      const textStyleMark = marks.find(mark => mark.type.name === 'textStyle' && mark.attrs.fontSize);
      
      if (textStyleMark && textStyleMark.attrs.fontSize) {
        this.currentFontSize = textStyleMark.attrs.fontSize;
      } else {
        // ถ้าไม่มี mark ให้ reset เป็น default
        this.currentFontSize = '';
      }
    },
    openFindReplace() {
      this.findReplaceOpen = true;
      this.$nextTick(() => {
        this.$refs.findInput?.focus();
      });
    },
    closeFindReplace() {
      this.findReplaceOpen = false;
      
      // เคลียร์ highlights หลายครั้งเพื่อให้แน่ใจ
      this.clearSearchHighlights();
      this.$nextTick(() => {
        this.clearSearchHighlights();
      });
      
      // รีเซ็ต state ทั้งหมด
      this.findText = '';
      this.replaceText = '';
      this.searchResults = [];
      this.currentSearchIndex = 0;
    },
    performSearch() {
      if (!this.findText.trim()) {
        this.clearSearchHighlights();
        this.searchResults = [];
        return;
      }

      // เก็บ focus element ปัจจุบัน
      const activeElement = document.activeElement;
      const shouldRestoreFocus = activeElement && (
        activeElement === this.$refs.findInput || 
        activeElement.classList.contains('search-input-compact')
      );

      const { state } = this.editor;
      const { doc } = state;
      const searchTerm = this.findText.trim();
      const results = [];

      // Clear previous highlights
      this.clearSearchHighlights();

      // Create search regex
      let flags = 'g';
      if (!this.caseSensitive) flags += 'i';
      
      let pattern = this.wholeWord 
        ? `\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`
        : searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      const regex = new RegExp(pattern, flags);

      // Search through the document
      doc.descendants((node, pos) => {
        if (node.isText) {
          const text = node.text;
          let match;
          while ((match = regex.exec(text)) !== null) {
            const from = pos + match.index;
            const to = from + match[0].length;
            results.push({ from, to, text: match[0] });
            
            // Prevent infinite loop
            if (!regex.global) break;
          }
        }
      });

      this.searchResults = results;
      this.currentSearchIndex = 0;

      // Highlight all results
      this.highlightSearchResults();
      
      // Focus on first result if exists, but don't steal focus from search input
      if (results.length > 0) {
        this.focusSearchResultWithoutStealing(0);
      }
      
      // Restore focus to search input
      if (shouldRestoreFocus) {
        this.$nextTick(() => {
          if (activeElement && activeElement.focus) {
            activeElement.focus();
          }
        });
      }
    },
    highlightSearchResults() {
      if (this.searchResults.length === 0) return;

      const { tr } = this.editor.state;
      
      this.searchResults.forEach((result, index) => {
        // สร้าง mark สำหรับ highlight
        const mark = this.editor.schema.marks.highlight.create({
          class: index === this.currentSearchIndex ? 'search-highlight-current' : 'search-highlight'
        });
        
        tr.addMark(result.from, result.to, mark);
      });

      // Dispatch without focusing
      this.editor.view.dispatch(tr.setMeta('preventFocus', true));
    },
    clearSearchHighlights() {
      if (!this.editor) return;
      
      try {
        // วิธีที่แน่นอน: เคลียร์ highlight marks ทั้งหมด
        const { tr, doc } = this.editor.state;
        let hasChanges = false;
        
        // ใช้ nodesBetween แทน descendants เพื่อให้แน่ใจว่าครอบคลุมทั้งหมด
        doc.nodesBetween(0, doc.content.size, (node, pos) => {
          if (node.marks && node.marks.length > 0) {
            node.marks.forEach(mark => {
              if (mark.type.name === 'highlight') {
                // เคลียร์ highlight mark ทั้งหมด
                tr.removeMark(pos, pos + node.nodeSize, mark);
                hasChanges = true;
              }
            });
          }
          return true;
        });

        if (hasChanges) {
          this.editor.view.dispatch(tr);
        }
        
      } catch (error) {
        console.warn('Error clearing search highlights:', error);
        
        // วิธีสำรอง: รีเฟรช content เพื่อเคลียร์
        try {
          const currentContent = this.editor.getHTML();
          // เคลียร์ search highlight classes จาก HTML
          const cleanedContent = currentContent
            .replace(/class="[^"]*search-highlight[^"]*"/g, '')
            .replace(/mark class=""/g, 'mark')
            .replace(/<mark><\/mark>/g, '');
          
          if (currentContent !== cleanedContent) {
            this.editor.commands.setContent(cleanedContent);
          }
        } catch (backupError) {
          console.warn('Backup clear method failed:', backupError);
        }
      }
    },
    focusSearchResultWithoutStealing(index) {
      if (index < 0 || index >= this.searchResults.length) return;
      
      this.currentSearchIndex = index;
      const result = this.searchResults[index];
      
      // Re-highlight with current selection
      this.highlightSearchResults();
      
      // Just scroll to result without focusing editor
      this.$nextTick(() => {
        const { view } = this.editor;
        const coords = view.coordsAtPos(result.from);
        const editorRect = view.dom.getBoundingClientRect();
        
        if (coords.top < editorRect.top || coords.bottom > editorRect.bottom) {
          // Scroll the result into view without focusing
          const scrollContainer = this.$refs.editorContent;
          if (scrollContainer) {
            const scrollTop = coords.top - editorRect.top + scrollContainer.scrollTop - 100;
            scrollContainer.scrollTo({ top: scrollTop, behavior: 'smooth' });
          }
        }
      });
    },
    focusSearchResult(index) {
      if (index < 0 || index >= this.searchResults.length) return;
      
      this.currentSearchIndex = index;
      const result = this.searchResults[index];
      
      // Re-highlight with current selection
      this.highlightSearchResults();
      
      // Scroll to the result and focus editor
      this.editor.commands.setTextSelection(result.from);
      this.editor.commands.focus();
      
      // Scroll into view
      this.$nextTick(() => {
        const { view } = this.editor;
        const coords = view.coordsAtPos(result.from);
        const editorRect = view.dom.getBoundingClientRect();
        
        if (coords.top < editorRect.top || coords.bottom > editorRect.bottom) {
          view.dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    },
    findNext() {
      if (this.searchResults.length === 0) return;
      
      const nextIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
      this.focusSearchResult(nextIndex);
    },
    findPrevious() {
      if (this.searchResults.length === 0) return;
      
      const prevIndex = this.currentSearchIndex === 0 
        ? this.searchResults.length - 1 
        : this.currentSearchIndex - 1;
      this.focusSearchResult(prevIndex);
    },
    replaceNext() {
      if (this.searchResults.length === 0 || !this.replaceText) return;
      
      const result = this.searchResults[this.currentSearchIndex];
      const { tr } = this.editor.state;
      
      // Replace the text
      tr.replaceWith(result.from, result.to, this.editor.schema.text(this.replaceText));
      this.editor.view.dispatch(tr);
      
      // Update search after replace
      this.$nextTick(() => {
        this.performSearch();
      });
    },
    replaceAll() {
      if (this.searchResults.length === 0 || !this.replaceText) return;
      
      const { tr } = this.editor.state;
      
      // Replace from end to beginning to maintain positions
      for (let i = this.searchResults.length - 1; i >= 0; i--) {
        const result = this.searchResults[i];
        tr.replaceWith(result.from, result.to, this.editor.schema.text(this.replaceText));
      }
      
      this.editor.view.dispatch(tr);
      
      // Clear search after replace all
      this.$nextTick(() => {
        this.performSearch();
      });
    },
    setupKeyboardShortcuts() {
      // Keyboard shortcut สำหรับ Find and Replace (Ctrl+F)
      this.keyboardHandler = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
          event.preventDefault();
          this.openFindReplace();
        }
      };
      
      document.addEventListener('keydown', this.keyboardHandler);
    },
    cleanupKeyboardShortcuts() {
      if (this.keyboardHandler) {
        document.removeEventListener('keydown', this.keyboardHandler);
        this.keyboardHandler = null;
      }
    },
  },
};
</script>

<style>
/* Fullscreen Mode */
.editor-wrapper.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
  background: #ffffff !important;
  border-radius: 0 !important;
  margin: 0 !important;
  animation: fullscreenEnter 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.editor-wrapper.fullscreen .editor-content {
  height: calc(100vh - 60px - 40px) !important; /* Full height minus toolbar and footer */
  max-height: calc(100vh - 60px - 40px) !important;
}

.editor-wrapper.fullscreen .toolbar {
  position: sticky;
  top: 0;
  z-index: 10000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.editor-wrapper.fullscreen .editor-footer {
  position: sticky;
  bottom: 0;
  z-index: 10000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-wrapper.fullscreen .char-count {
  text-align: left;
}

/* Fullscreen Animation */
@keyframes fullscreenEnter {
  from {
    transform: scale(0.95);
    opacity: 0.8;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Body scroll lock when fullscreen */
body.fullscreen-active {
  overflow: hidden;
}

/* Compact Premium Editor */
.editor-wrapper {
  border: 1px solid #e2e8f0;
  border-radius: 0px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
  box-shadow: 
    0 2px 4px -1px rgba(0, 0, 0, 0.1),
    0 1px 2px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

/* Block Selection & Hover */
.ProseMirror p,
.ProseMirror h1,
.ProseMirror h2,
.ProseMirror h3,
.ProseMirror blockquote,
.ProseMirror pre,
.ProseMirror ul,
.ProseMirror ol {
  position: relative;
  border-radius: 6px;
  transition: all 0.2s ease;
  min-height: 1.5em;
  border: 1px solid rgb(148 163 184 / 16%);
  padding: 5px 6px;
  margin: 8px 0;
}

/* Hide block borders when block controls are disabled */
.hide-block-borders .ProseMirror p,
.hide-block-borders .ProseMirror h1,
.hide-block-borders .ProseMirror h2,
.hide-block-borders .ProseMirror h3,
.hide-block-borders .ProseMirror blockquote,
.hide-block-borders .ProseMirror pre,
.hide-block-borders .ProseMirror ul,
.hide-block-borders .ProseMirror ol {
  border: none !important;
  padding: 0;
  margin: 16px 0;
}

.hide-block-borders .ProseMirror p:hover,
.hide-block-borders .ProseMirror h1:hover,
.hide-block-borders .ProseMirror h2:hover,
.hide-block-borders .ProseMirror h3:hover,
.hide-block-borders .ProseMirror blockquote:hover,
.hide-block-borders .ProseMirror pre:hover,
.hide-block-borders .ProseMirror ul:hover,
.hide-block-borders .ProseMirror ol:hover {
  border: 1px solid rgba(35, 127, 255, 0.16);
}

.hide-block-borders .ProseMirror p:focus-within,
.hide-block-borders .ProseMirror h1:focus-within,
.hide-block-borders .ProseMirror h2:focus-within,
.hide-block-borders .ProseMirror h3:focus-within,
.hide-block-borders .ProseMirror blockquote:focus-within,
.hide-block-borders .ProseMirror pre:focus-within,
.hide-block-borders .ProseMirror ul:focus-within,
.hide-block-borders .ProseMirror ol:focus-within {
  background: rgba(59, 130, 246, 0.05);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(35, 127, 255, 0.16);
}

/* Special handling for certain elements that need their original styles */
.hide-block-borders .ProseMirror blockquote {
  border-left: 4px solid #3b82f6 !important;
  padding: 12px 16px !important;
  background: #f8fafc !important;
  border-radius: 0 8px 8px 0 !important;
}

.hide-block-borders .ProseMirror pre {
  background: #f1f5f9 !important;
  border-radius: 8px !important;
  padding: 16px 20px !important;
}

.hide-block-borders .ProseMirror ul,
.hide-block-borders .ProseMirror ol {
  padding-left: 22px !important;
  margin: 16px 0 !important;
  padding: 0 0 0 22px !important;
}

.ProseMirror p:hover,
.ProseMirror h1:hover,
.ProseMirror h2:hover,
.ProseMirror h3:hover,
.ProseMirror blockquote:hover,
.ProseMirror pre:hover,
.ProseMirror ul:hover,
.ProseMirror ol:hover {
  border: 1px solid rgba(35, 127, 255, 0.16);
  background: rgba(59, 130, 246, 0.03);
}

.ProseMirror p:focus-within,
.ProseMirror h1:focus-within,
.ProseMirror h2:focus-within,
.ProseMirror h3:focus-within,
.ProseMirror blockquote:focus-within,
.ProseMirror pre:focus-within,
.ProseMirror ul:focus-within,
.ProseMirror ol:focus-within {
  border: 1px solid rgba(35, 127, 255, 0.16);
  background: rgba(59, 130, 246, 0.05);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Permanent Block Controls Container */
.block-controls-permanent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
}

.block-control-set {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0;
  pointer-events: auto;
  z-index: 50;
  max-width: 100%;
  overflow: hidden;
}

.block-control-btn {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.95);
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 6px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ปุ่มแรกมีมุมโค้งซ้าย */
.block-control-btn:first-child {
  border-radius: 4px 0 0 4px;
}

/* ปุ่มสุดท้ายมีมุมโค้งขวา */
.block-control-btn:last-child {
  border-radius: 0 4px 4px 0;
}

/* ลบ border ซ้ายของปุ่มที่ไม่ใช่ปุ่มแรก */
.block-control-btn:not(:first-child) {
  border-left: none;
}

.block-control-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.block-control-btn:hover {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 
    0 3px 8px rgba(59, 130, 246, 0.3),
    0 1px 4px rgba(59, 130, 246, 0.2);
}

.block-control-btn:hover::before {
  opacity: 1;
}

.block-control-btn:active {
  transform: translateY(0px);
  box-shadow: 
    0 1px 4px rgba(59, 130, 246, 0.2),
    0 1px 2px rgba(59, 130, 246, 0.1);
}

.block-control-btn.danger:hover {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-color: #ef4444;
  box-shadow: 
    0 3px 8px rgba(239, 68, 68, 0.3),
    0 1px 4px rgba(239, 68, 68, 0.2);
}

.block-control-btn.danger:active {
  box-shadow: 
    0 1px 4px rgba(239, 68, 68, 0.2),
    0 1px 2px rgba(239, 68, 68, 0.1);
}

/* Remove old hover styles */

/* ... existing code ... */

/* เอา Floating Block Controls เก่าออก - ลบทั้งหมด */

.editor-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #3b82f6, transparent);
  opacity: 0.6;
}

.editor-wrapper:hover {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.editor-wrapper:focus-within {
  box-shadow: 
    0 0 0 2px rgba(59, 130, 246, 0.12),
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.05);
  border-color: #3b82f6;
}

/* Compact Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Toolbar Layout Variations */
.toolbar.toolbar-single-row {
  flex-wrap: nowrap;
  overflow-x: auto;
}

.toolbar.toolbar-two-rows {
  flex-wrap: wrap;
  overflow-x: visible;
  align-items: flex-start;
  align-content: flex-start;
  min-height: 52px; /* เพิ่มความสูงเพื่อรองรับสองแถว */
  padding: 6px 12px;
}

/* ปรับ toolbar groups เมื่อเป็น two-rows */
.toolbar.toolbar-two-rows .toolbar-group {
  margin-bottom: 4px;
}

/* ปรับขนาด toolbar buttons ในโหมด two-rows */
.toolbar.toolbar-two-rows .toolbar-btn {
  width: 22px;
  height: 22px;
  font-size: 10px;
}

.toolbar.toolbar-two-rows .color-picker {
  width: 23px;
  height: 23px;
}

.toolbar.toolbar-two-rows .font-size-selector {
  height: 23px;
  padding: 0 3px;
  font-size: 9px;
  min-width: 45px;
}

.toolbar::-webkit-scrollbar {
  display: none;
}

.toolbar::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20px;
  background: linear-gradient(to left, rgba(248, 250, 252, 0.9), transparent);
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* แสดง gradient เฉพาะเมื่อเป็น single-row และมี scroll */
.toolbar.toolbar-single-row.has-scroll::before {
  opacity: 1;
}

/* ซ่อน gradient เมื่อเป็น two-rows */
.toolbar.toolbar-two-rows::before {
  display: none;
}

.toolbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #cbd5e1, transparent);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 6px;
  padding: 2px;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.toolbar-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 11px;
  position: relative;
  overflow: hidden;
}

.toolbar-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.toolbar-btn:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  color: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-btn:hover::before {
  opacity: 1;
}

.toolbar-btn.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 
    0 2px 4px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.color-picker {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.color-picker:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
  box-shadow: 
    0 2px 4px rgba(59, 130, 246, 0.2),
    inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.font-size-selector {
  height: 24px;
  padding: 0 6px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  outline: none;
  text-align: center;
  line-height: 12px;
}

.font-size-selector:hover {
  border-color: #3b82f6;
  color: #1e293b;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.font-size-selector:focus {
  border-color: #3b82f6;
  box-shadow: 
    0 0 0 2px rgba(59, 130, 246, 0.12),
    0 2px 4px rgba(59, 130, 246, 0.2);
}

.font-size-selector option {
  padding: 4px;
  color: #1e293b;
}

/* Compact Editor Content */
.editor-content {
  overflow-y: auto;
  background: #ffffff;
  position: relative;
}

.editor-body {
  padding: 20px;
  min-height: 150px;
}

.ProseMirror {
  outline: none;
  font-size: 15px;
  line-height: 1.6;
  color: #1e293b;
  font-weight: 400;
  letter-spacing: 0.01em;
}

.ProseMirror:empty::before {
  content: attr(data-placeholder);
  color: #94a3b8;
  pointer-events: none;
  font-style: italic;
  font-weight: 300;
}

.ProseMirror p {
  margin: 0 0 12px 0;
}

.ProseMirror p:last-child {
  margin-bottom: 0;
}

.ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
  font-weight: 700;
  margin: 20px 0 12px 0;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.ProseMirror h1 { 
  font-size: 24px; 
  background: linear-gradient(135deg, #1e293b, #64748b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.ProseMirror h2 { 
  font-size: 20px;
  color: #334155;
}
.ProseMirror h3 { 
  font-size: 18px;
  color: #475569;
}

.ProseMirror ul, .ProseMirror ol {
  padding-left: 22px;
  margin: 16px 0;
  padding: 12px 16px 12px 32px; /* เพิ่ม padding ซ้ายเพื่อให้ list marker อยู่ในกรอบ */
}

.ProseMirror li {
  margin-bottom: 6px;
  line-height: 1.6;
  border: none !important; /* ลบ border ของ li */
  padding: 0 !important;
  background: none !important;
  box-shadow: none !important;
  position: relative;
}

.ProseMirror a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.2s ease;
}

.ProseMirror a:hover {
  text-decoration: underline;
  text-decoration-color: #3b82f6;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.ProseMirror img:hover {
  transform: scale(1.02);
}

.ProseMirror mark {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(146, 64, 14, 0.1);
}

/* Compact Footer */
.editor-footer {
  padding: 8px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 1px solid #e2e8f0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.editor-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #cbd5e1, transparent);
}

.char-count {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.025em;
}

.block-controls-hint {
  font-size: 11px;
  color: #64748b;
  font-weight: 400;
  background: rgba(100, 116, 139, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.fullscreen-hint {
  font-size: 11px;
  color: #3b82f6;
  font-weight: 500;
  margin-left: 12px;
  display: inline-block;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  animation: pulse 2s infinite;
}

/* Compact Scrollbar */
.editor-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 3px;
  border: 1px solid #e2e8f0;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}

/* Mobile File Attachments */
.ProseMirror .file-attachment-content {
  padding: 12px 16px;
}

.ProseMirror .file-attachment-content .file-icon {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  font-size: 16px;
}

.ProseMirror .file-attachment-content .file-name {
  font-size: 14px;
}

.ProseMirror .file-attachment-content .file-type {
  font-size: 11px;
}

.ProseMirror .file-attachment-content .file-open-btn {
  padding: 4px 8px;
  font-size: 11px;
}

/* Mobile Block Controls */
.ProseMirror-selectednode::before {
  left: -15px;
  font-size: 10px;
}

.ProseMirror p:hover,
.ProseMirror h1:hover,
.ProseMirror h2:hover,
.ProseMirror h3:hover {
  outline-offset: 2px;
}

/* Mobile Floating Controls */
.floating-block-controls {
  left: -50px !important;
  gap: 2px;
  padding: 4px;
}

.block-control-btn {
  width: 28px;
  height: 28px;
  font-size: 10px;
}

/* Compact Mobile */
@media (max-width: 640px) {
  .toolbar {
    flex-wrap: wrap;
    gap: 4px;
    padding: 6px 8px;
    overflow-x: visible;
    scroll-behavior: smooth;
    min-height: 48px;
    align-items: flex-start;
    align-content: flex-start;
  }
  
  /* Force two-rows layout on mobile */
  .toolbar.toolbar-single-row,
  .toolbar.toolbar-two-rows {
    flex-wrap: wrap;
    overflow-x: visible;
    min-height: 48px;
  }
  
  .toolbar-group {
    gap: 1px;
    padding: 1px;
    min-width: fit-content;
    margin-bottom: 3px;
  }
  
  .toolbar-btn {
    width: 20px;
    height: 20px;
    font-size: 10px;
    border-radius: 3px;
  }
  
  .color-picker {
    width: 18px;
    height: 18px;
  }
  
  .font-size-selector {
    height: 18px;
    padding: 0 2px;
    font-size: 8px;
    min-width: 35px;
  }
  
  .editor-body {
    padding: 16px;
  }
  
  .ProseMirror {
    font-size: 14px;
  }
  
  .ProseMirror h1 { font-size: 20px; }
  .ProseMirror h2 { font-size: 18px; }
  .ProseMirror h3 { font-size: 16px; }
  
  .editor-footer {
    padding: 6px 16px;
  }
  
  .ProseMirror pre {
    font-size: 12px;
    padding: 12px 16px;
  }

  /* Mobile File Attachments */
  .ProseMirror .file-attachment-content {
    padding: 12px 16px;
  }
  
  .ProseMirror .file-attachment-content .file-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
    font-size: 16px;
  }
  
  .ProseMirror .file-attachment-content .file-name {
    font-size: 14px;
  }
  
  .ProseMirror .file-attachment-content .file-type {
    font-size: 11px;
  }
  
  .ProseMirror .file-attachment-content .file-open-btn {
    padding: 4px 8px;
    font-size: 11px;
  }

  /* Mobile Block Controls */
  .ProseMirror-selectednode::before {
    left: -15px;
    font-size: 10px;
  }
  
  .ProseMirror p:hover,
  .ProseMirror h1:hover,
  .ProseMirror h2:hover,
  .ProseMirror h3:hover {
    outline-offset: 2px;
  }

  /* Mobile Floating Controls */
  .floating-block-controls {
    left: -50px !important;
    gap: 2px;
    padding: 4px;
  }
  
  .block-control-btn {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }
}

/* Tablet Layout */
@media (min-width: 641px) and (max-width: 1024px) {
  .toolbar {
    gap: 6px;
    padding: 7px 10px;
  }
  
  .toolbar.toolbar-two-rows {
    min-height: 50px;
    padding: 5px 10px;
  }
  
  .toolbar.toolbar-two-rows .toolbar-btn {
    width: 23px;
    height: 23px;
    font-size: 10px;
  }
  
  .toolbar.toolbar-two-rows .color-picker {
    width: 23px;
    height: 23px;
  }
}

/* Extra Small Mobile */
@media (max-width: 480px) {
  .toolbar {
    gap: 2px;
    padding: 4px 6px;
    min-height: 44px;
  }
  
  .toolbar-group {
    gap: 0;
    padding: 1px;
    margin-bottom: 2px;
  }
  
  .toolbar-btn {
    width: 18px;
    height: 18px;
    font-size: 9px;
  }
  
  .color-picker {
    width: 18px;
    height: 18px;
  }
  
  .font-size-selector {
    height: 18px;
    padding: 0 2px;
    font-size: 8px;
    min-width: 35px;
  }
  
  .editor-body {
    padding: 12px;
  }
  
  .ProseMirror {
    font-size: 13px;
  }
  
  .editor-footer {
    padding: 4px 12px;
  }
  
  .char-count {
    font-size: 11px;
  }
}

/* Compact Focus */
.toolbar-btn:focus {
  outline: none;
  box-shadow: 
    0 0 0 2px rgba(59, 130, 246, 0.12),
    0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Selection styling */
.ProseMirror ::selection {
  background: rgba(59, 130, 246, 0.15);
}

.ProseMirror ::-moz-selection {
  background: rgba(59, 130, 246, 0.15);
}

.ProseMirror:focus {
  outline: none;
}

.ProseMirror .ProseMirror-focused {
  outline: none;
}

/* Code Block Styles */
.ProseMirror pre {
  background: #f1f5f9;
  border: 2px dotted rgba(148, 163, 184, 0.9);
  border-radius: 8px;
  color: #1e293b;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  margin: 16px 0;
  padding: 16px 20px;
  white-space: pre-wrap;
  overflow-x: auto;
  position: relative;
}

.ProseMirror pre::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 8px 8px 0 0;
}

.ProseMirror code {
  background: #f1f5f9;
  border-radius: 4px;
  color: #e11d48;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  font-weight: 500;
  padding: 2px 6px;
  border: 1px solid #e2e8f0;
}

.ProseMirror blockquote {
  border-left: 4px solid #3b82f6;
  margin: 16px 0;
  padding-left: 16px;
  font-style: italic;
  color: #64748b;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
  border-top: 2px dotted rgba(148, 163, 184, 0.8);
  border-right: 2px dotted rgba(148, 163, 184, 0.8);
  border-bottom: 2px dotted rgba(148, 163, 184, 0.8);
}

.ProseMirror hr {
  border: none;
  border-top: 2px solid #e2e8f0;
  margin: 24px 0;
  position: relative;
}

.ProseMirror hr::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
}

/* Enhanced Link Styles */
.ProseMirror a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.ProseMirror a:hover {
  text-decoration: none;
  border-bottom-color: #3b82f6;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

/* File Attachment Styles */
.ProseMirror .file-attachment {
  display: inline-flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 4px 0;
  color: #1e293b;
  text-decoration: none;
  transition: all 0.2s ease;
}

.ProseMirror .file-attachment:hover {
  background: #f1f5f9;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.1);
}

.ProseMirror .file-attachment::before {
  content: '📎';
  margin-right: 6px;
  font-size: 14px;
}

/* Selection & Focus Enhancement */
.ProseMirror ::selection {
  background: rgba(59, 130, 246, 0.15);
}

.ProseMirror ::-moz-selection {
  background: rgba(59, 130, 246, 0.15);
}

.ProseMirror:focus {
  outline: none;
}

.ProseMirror .ProseMirror-focused {
  outline: none;
}

/* Font Size Support */
.ProseMirror [style*="font-size"] {
  line-height: 1.4;
}

/* Find and Replace Modal Styles */
.find-replace-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.find-replace-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.find-replace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.find-replace-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.find-replace-content {
  padding: 24px;
}

.search-section {
  margin-bottom: 20px;
}

.search-section label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
  background: white;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-results-info {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #6b7280;
  background: rgba(243, 244, 246, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  pointer-events: none;
}

.search-options {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.search-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-nav-buttons {
  display: flex;
  gap: 4px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.replace-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-color: #3b82f6;
}

.action-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Search Highlight Styles */
.ProseMirror mark.search-highlight {
  background: rgba(255, 235, 59, 0.6) !important;
  color: #1e293b !important;
  padding: 2px 0;
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgba(255, 193, 7, 0.3);
}

.ProseMirror mark.search-highlight-current {
  background: rgba(59, 130, 246, 0.3) !important;
  color: #1e293b !important;
  padding: 2px 0;
  border-radius: 3px;
  box-shadow: 0 0 0 2px #3b82f6;
  animation: searchPulse 1s ease-in-out infinite alternate;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(30px) scale(0.95);
    opacity: 0;
  }
  to { 
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes searchPulse {
  from { 
    box-shadow: 0 0 0 2px #3b82f6;
  }
  to { 
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4);
  }
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .find-replace-modal {
    width: 95%;
    margin: 20px;
  }
  
  .find-replace-header {
    padding: 16px 20px 12px;
  }
  
  .find-replace-header h3 {
    font-size: 16px;
  }
  
  .find-replace-content {
    padding: 20px;
  }
  
  .search-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .replace-buttons {
    justify-content: stretch;
  }
  
  .replace-buttons .action-btn {
    flex: 1;
  }
  
  .search-options {
    flex-direction: column;
    gap: 12px;
  }
}

/* Find and Replace Popup Styles */
.find-replace-popup {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 320px;
  font-size: 13px;
}

.find-replace-compact {
  padding: 12px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.search-row:last-child {
  margin-bottom: 0;
}

.search-input-compact {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input-compact:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.nav-btn-compact,
.replace-btn-compact,
.close-btn-compact {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s ease;
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn-compact:hover:not(:disabled),
.replace-btn-compact:hover:not(:disabled),
.close-btn-compact:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.nav-btn-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.replace-btn-compact.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.replace-btn-compact.primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.close-btn-compact:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.search-count {
  font-size: 11px;
  color: #6b7280;
  background: #f9fafb;
  padding: 4px 6px;
  border-radius: 3px;
  min-width: 35px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.options-compact {
  display: flex;
  gap: 8px;
}

.checkbox-compact {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #6b7280;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.checkbox-compact:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.checkbox-compact input[type="checkbox"] {
  display: none;
}

.checkbox-compact input[type="checkbox"]:checked + span {
  color: #3b82f6;
  font-weight: 600;
}

.checkbox-compact input[type="checkbox"]:checked {
  background: #3b82f6;
}

.checkbox-compact:has(input[type="checkbox"]:checked) {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #3b82f6;
  font-weight: 600;
}

/* Responsive adjustments for popup */
@media (max-width: 640px) {
  .find-replace-popup {
    right: 5px;
    left: 5px;
    min-width: auto;
    width: calc(100% - 10px);
  }
  
  .search-row {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .search-input-compact {
    min-width: 120px;
  }
  
  .options-compact {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 4px;
  }
}

.search-btn-compact {
  padding: 6px 8px;
  border: 1px solid #3b82f6;
  background: #3b82f6;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s ease;
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn-compact:hover {
  background: #2563eb;
  border-color: #2563eb;
}
</style>